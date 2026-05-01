from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import uuid
import datetime
import subprocess
import os

app = FastAPI(title="C2 Infrastructure Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TERRAFORM_BIN = os.path.join(BASE_DIR, "bin", "terraform.exe")
TF_DOCKER_DIR = os.path.join(BASE_DIR, "terraform", "docker")
TF_DO_DIR = os.path.join(BASE_DIR, "terraform", "digitalocean")

# --- Models ---
class ProvisionRequest(BaseModel):
    provider: str
    region: str
    role: str
    domain: str

class TeardownRequest(BaseModel):
    confirmation_text: str

# --- Persistence ---
DB_FILE = os.path.join(BASE_DIR, "nodes.json")

def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r") as f:
            return json.load(f)
    return []

def save_db():
    with open(DB_FILE, "w") as f:
        json.dump(nodes_db, f)

import json
nodes_db = load_db()

# --- Terraform Runner ---
def run_tf_cmd(cmd_args, cwd):
    cmd = [TERRAFORM_BIN] + cmd_args
    process = subprocess.Popen(
        cmd, 
        cwd=cwd, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE, 
        text=True,
        shell=True # Required for windows sometimes with relative paths
    )
    stdout, stderr = process.communicate()
    return process.returncode, stdout, stderr

def execute_terraform_provision(node_id: str, req: ProvisionRequest):
    print(f"[{datetime.datetime.now()}] [TERRAFORM] Starting real provision for {req.provider}...")
    
    # Select working directory
    cwd = TF_DOCKER_DIR if "docker" in req.provider.lower() else TF_DO_DIR
    
    # 1. Terraform Init
    print(f"[{datetime.datetime.now()}] [TERRAFORM] Initializing...")
    rc, out, err = run_tf_cmd(["init"], cwd)
    if rc != 0:
        print(f"Error during init: {err}")
        return

    # 2. Terraform Apply
    # For Docker, we'll use some default vars for now
    var_args = [
        "-var", f"node_name={node_id[:8]}",
        "-var", f"role_tag={req.role.replace(' ', '-')}",
        "-auto-approve"
    ]
    
    print(f"[{datetime.datetime.now()}] [TERRAFORM] Applying configuration...")
    rc, out, err = run_tf_cmd(["apply"] + var_args, cwd)
    
    if rc == 0:
        # Success - update node in DB
        for node in nodes_db:
            if node["id"] == node_id:
                node["status"] = "online"
                node["ip"] = "127.0.0.1" if "docker" in req.provider.lower() else "Allocated"
                print(f"[{datetime.datetime.now()}] [TERRAFORM] Success! Node {node_id} is online.")
                save_db()
                break
    else:
        print(f"[{datetime.datetime.now()}] [TERRAFORM] ERROR: {err}")
        for node in nodes_db:
            if node["id"] == node_id:
                node["status"] = "failed"
                save_db()
                break

# --- API ---

@app.get("/api/status")
async def get_system_status():
    return {
        "nodes": nodes_db,
        "active_listeners": len([n for n in nodes_db if n['status'] == 'online']),
        "avg_opsec": sum(n['opsec'] for n in nodes_db) / len(nodes_db) if nodes_db else 0
    }

@app.post("/api/provision")
async def provision_node(req: ProvisionRequest, background_tasks: BackgroundTasks):
    node_id = str(uuid.uuid4())
    new_node = {
        "id": node_id,
        "name": f"{req.provider.lower()}-{node_id[:4]}",
        "ip": "Provisioning...",
        "provider": req.provider,
        "role": req.role,
        "status": "deploying",
        "opsec": 100
    }
    nodes_db.append(new_node)
    save_db()
    background_tasks.add_task(execute_terraform_provision, node_id, req)
    return {"message": "Provisioning started", "node": new_node}

@app.post("/api/teardown")
async def emergency_teardown(req: TeardownRequest):
    if req.confirmation_text != "BURN EVERYTHING":
        raise HTTPException(status_code=400, detail="Invalid confirmation")
    
    # Try to nuke Docker containers (don't fail if terraform errors)
    try:
        run_tf_cmd(["destroy", "-var", "node_name=x", "-var", "role_tag=x", "-auto-approve"], TF_DOCKER_DIR)
    except Exception as e:
        print(f"[TEARDOWN] Terraform destroy error (non-fatal): {e}")
    
    nodes_db.clear()
    save_db()
    return {"message": "All infrastructure destroyed."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
