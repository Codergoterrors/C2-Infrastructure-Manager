# CLAN NXT — C2 Infrastructure Manager

A Command & Control (C2) infrastructure orchestration tool for Red Team operations. Automates the provisioning, management, and teardown of redirector nodes using Terraform — available as both a **terminal CLI** and a **web dashboard**.

> **⚠ Disclaimer:** This tool is intended strictly for **authorized security testing and educational purposes**. Unauthorized use against systems you do not own or have explicit permission to test is illegal.

---

## Features

- **Automated Infrastructure Provisioning** — Spin up Docker containers or cloud droplets (DigitalOcean, AWS, etc.) with one command using Terraform
- **Fleet Management** — Monitor all active nodes, their IPs, roles, OPSEC scores, and live status
- **Emergency Teardown** — Instantly destroy all infrastructure and wipe state files (burn protocol)
- **Domain Fronting Registry** — Track CDN-fronted domains, TTLs, and expiration dates
- **OPSEC Scoring** — Per-node operational security health tracking
- **Alerts & Health Monitoring** — Latency warnings and heartbeat loss detection
- **Dual Interface** — Use the interactive terminal CLI or the React web dashboard

---

## Project Structure

```
C2-Infrastructure-Manager/
├── backend/
│   ├── cli.py                  # Terminal CLI tool
│   ├── main.py                 # FastAPI backend server
│   ├── nodes.json              # Persistent node database (auto-generated)
│   ├── bin/
│   │   └── terraform.exe       # Terraform binary (user-provided)
│   └── terraform/
│       ├── docker/
│       │   ├── main.tf         # Docker container provisioning
│       │   └── variables.tf
│       └── digitalocean/
│           ├── main.tf         # DigitalOcean droplet provisioning
│           └── variables.tf
├── src/
│   ├── App.jsx                 # React frontend (all pages)
│   ├── index.css               # Design system (hacker-vibe theme)
│   └── main.jsx                # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## Terminal CLI (Recommended)

The CLI is the primary interface — lightweight, no browser needed, works on **Windows**, **Linux**, and **Kali**.

### Prerequisites

- **Python 3.10+**
- **Docker Desktop** (running) — for Docker provisioning
- **Terraform** binary — place it at `backend/bin/terraform` (Linux) or `backend/bin/terraform.exe` (Windows)

### Setup

```bash
# Clone the repository
git clone https://github.com/Codergoterrors/C2-Infrastructure-Manager.git
cd C2-Infrastructure-Manager/backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate        # Linux/Kali
venv\Scripts\activate            # Windows

# Install dependencies
pip install fastapi uvicorn pydantic
```

### Launch

```bash
python3 cli.py          # Linux/Kali
python cli.py           # Windows
```

### CLI Commands

| Command     | Description                              |
|-------------|------------------------------------------|
| `status`    | Show fleet infrastructure status         |
| `provision` | Deploy a new redirector node             |
| `teardown`  | Initiate emergency burn sequence         |
| `help`      | Show available commands                  |
| `clear`     | Clear terminal screen                    |
| `exit`      | Close CLAN NXT                           |

### Example Session

```
   ██████╗██╗      █████╗ ███╗   ██╗    ███╗   ██╗██╗  ██╗████████╗
  ██╔════╝██║     ██╔══██╗████╗  ██║    ████╗  ██║╚██╗██╔╝╚══██╔══╝
  ██║     ██║     ███████║██╔██╗ ██║    ██╔██╗ ██║ ╚███╔╝    ██║
  ██║     ██║     ██╔══██║██║╚██╗██║    ██║╚██╗██║ ██╔██╗    ██║
  ╚██████╗███████╗██║  ██║██║ ╚████║    ██║ ╚████║██╔╝ ██╗   ██║
   ╚═════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝    ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝
  ──────────────────────────────────────────────────────────
   C2 Infrastructure Manager v3.0  │  Red Team Operations Framework
  ──────────────────────────────────────────────────────────

  [22:43:50] [SYS] Initializing C2 Infrastructure Manager...
  [22:43:50] [OK] Local environment verified.
  [22:43:50] [OK] Ready. Type "help" for commands.

  #𝐂𝐋𝐀𝐍 𝐍𝐗𝐓 $ status

  NODE                      IP                 ROLE                   OPSEC    STATUS
  ───────────────────────────────────────────────────────────────────────────────────
  docker-9e65               127.0.0.1          Payload Hosting        100%    ONLINE

  1/1 nodes online  │  OPSEC avg: 100%
```

---

## Web Dashboard (Optional)

A React-based GUI for visual infrastructure management.

### Prerequisites

- **Node.js 18+** and **npm**
- All CLI prerequisites above
- Backend server must be running alongside

### Setup & Launch

```bash
# From the project root
npm install

# Terminal 1: Start the backend API server
cd backend
source venv/bin/activate
python3 main.py              # Runs on http://localhost:8000

# Terminal 2: Start the frontend dev server
npm run dev                  # Runs on http://localhost:5173
```

### Dashboard Pages

| Page                 | Description                                      |
|----------------------|--------------------------------------------------|
| **Command Center**   | Fleet overview, live stats, traffic graph, syslog |
| **Infrastructure**   | Node topology with status cards                  |
| **Domain Fronting**  | CDN-fronted domain registry                      |
| **Provision Node**   | Deploy new nodes via Terraform                   |
| **Alerts & Health**  | Latency warnings and heartbeat monitoring        |
| **Emergency Teardown** | Destroy all infrastructure (burn protocol)     |

---

## Tech Stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| CLI            | Python 3 (zero external dependencies for core) |
| Backend API    | FastAPI + Uvicorn                       |
| Provisioning   | Terraform (Docker / DigitalOcean)       |
| Frontend       | React + Vite                            |
| Charts         | Recharts                                |
| Icons          | Lucide React                            |
| State          | JSON file-based persistence             |
| Styling        | Custom CSS (hacker-vibe dark theme)     |

---

## How It Works

1. **Provision** — You select a cloud provider and node role. The backend calls `terraform init` + `terraform apply` to create real infrastructure (Docker containers locally, or cloud VMs with API keys configured).

2. **Monitor** — The dashboard/CLI polls the backend API to show real-time node status. Nodes transition from `DEPLOYING` → `ONLINE` or `FAILED`.

3. **Teardown** — When an operation is compromised, the burn protocol runs `terraform destroy` across all providers and wipes the local state database.

---

## Cloud Provider Setup

### Docker (Free — Local)
Works out of the box. Just ensure Docker Desktop is running.

### DigitalOcean
1. Get an API token from [DigitalOcean](https://cloud.digitalocean.com/account/api/tokens)
2. Set the environment variable:
   ```bash
   export DIGITALOCEAN_TOKEN="your-token-here"
   ```
3. Add your SSH key fingerprint in `backend/terraform/digitalocean/variables.tf`

### AWS / Linode / Azure
Terraform configs can be added under `backend/terraform/<provider>/`. The provisioning engine auto-detects the correct directory based on provider name.

---

## License

MIT License — use freely for authorized security research and education.
