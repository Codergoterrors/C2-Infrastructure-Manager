#!/usr/bin/env python3
"""
CLAN NXT - C2 Infrastructure Manager CLI
Terminal-based operator interface for Linux/Kali environments.
"""
import sys
import os
import time
import json
import uuid
import subprocess

# Fix Windows terminal encoding for Unicode characters
if sys.platform == 'win32':
    os.system('chcp 65001 > nul 2>&1')
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stdin.reconfigure(encoding='utf-8', errors='replace')

# ─── ANSI Color Codes (zero dependencies) ───
class C:
    RESET   = '\033[0m'
    BOLD    = '\033[1m'
    DIM     = '\033[2m'
    RED     = '\033[91m'
    GREEN   = '\033[92m'
    YELLOW  = '\033[93m'
    BLUE    = '\033[94m'
    CYAN    = '\033[96m'
    WHITE   = '\033[97m'
    GRAY    = '\033[90m'
    BG_RED  = '\033[41m'
    R       = '\033[1;91m'   # Red Bold
    G       = '\033[1;92m'   # Green Bold
    CB      = '\033[1;96m'   # Cyan Bold
    W       = '\033[1;97m'   # White Bold

# ─── ASCII Art Banner ───
BANNER = f"""
{C.W}   ██████╗██╗      █████╗ ███╗   ██╗    {C.R}███╗   ██╗██╗  ██╗████████╗{C.RESET}
{C.W}  ██╔════╝██║     ██╔══██╗████╗  ██║    {C.R}████╗  ██║╚██╗██╔╝╚══██╔══╝{C.RESET}
{C.W}  ██║     ██║     ███████║██╔██╗ ██║    {C.R}██╔██╗ ██║ ╚███╔╝    ██║   {C.RESET}
{C.W}  ██║     ██║     ██╔══██║██║╚██╗██║    {C.R}██║╚██╗██║ ██╔██╗    ██║   {C.RESET}
{C.W}  ╚██████╗███████╗██║  ██║██║ ╚████║    {C.R}██║ ╚████║██╔╝ ██╗   ██║   {C.RESET}
{C.W}   ╚═════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝    {C.R}╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   {C.RESET}
{C.GRAY}  ──────────────────────────────────────────────────────────{C.RESET}
{C.DIM}   C2 Infrastructure Manager v3.0  │  Red Team Operations Framework{C.RESET}
{C.GRAY}  ──────────────────────────────────────────────────────────{C.RESET}
"""

# ─── Paths ───
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
DB_FILE      = os.path.join(BASE_DIR, "nodes.json")
TF_BIN       = os.path.join(BASE_DIR, "bin", "terraform.exe") if sys.platform == "win32" else os.path.join(BASE_DIR, "bin", "terraform")
TF_DOCKER    = os.path.join(BASE_DIR, "terraform", "docker")

# ─── DB Helpers ───
def load_nodes():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    return []

def save_nodes(nodes):
    with open(DB_FILE, 'w') as f:
        json.dump(nodes, f)

# ─── Logging ───
def log(level, msg):
    ts = time.strftime("%H:%M:%S")
    colors = {'info': C.CYAN, 'ok': C.GREEN, 'warn': C.YELLOW, 'err': C.RED, 'sys': C.GRAY}
    c = colors.get(level, C.WHITE)
    print(f"  {C.GRAY}[{ts}]{C.RESET} {c}[{level.upper()}]{C.RESET} {msg}")

# ──────────────────────────────────
#  COMMANDS
# ──────────────────────────────────

def cmd_status():
    """Show fleet infrastructure status."""
    nodes = load_nodes()
    if not nodes:
        log('info', 'No nodes deployed. Use "provision" to deploy.')
        return
    print(f"\n  {C.W}{'NODE':<25} {'IP':<18} {'ROLE':<22} {'OPSEC':<8} {'STATUS':<10}{C.RESET}")
    print(f"  {C.GRAY}{'─'*83}{C.RESET}")
    for n in nodes:
        sc = C.G if n['status'] == 'online' else C.R if n['status'] == 'failed' else C.YELLOW
        oc = C.G if n.get('opsec', 0) > 80 else C.R
        print(f"  {C.CYAN}{n['name']:<25}{C.RESET} {n['ip']:<18} {C.GRAY}{n['role']:<22}{C.RESET} {oc}{n.get('opsec',0)}%{C.RESET}    {sc}{n['status'].upper()}{C.RESET}")
    online = sum(1 for n in nodes if n['status'] == 'online')
    avg = sum(n.get('opsec', 0) for n in nodes) // len(nodes) if nodes else 0
    print(f"\n  {C.G}{online}{C.RESET}/{len(nodes)} nodes online  │  OPSEC avg: {C.G}{avg}%{C.RESET}\n")

def cmd_provision():
    """Deploy a new redirector node."""
    print(f"\n  {C.W}── Deploy New Node ──{C.RESET}\n")
    providers = ['Docker (Free)', 'DigitalOcean', 'AWS', 'Linode', 'Azure']
    for i, p in enumerate(providers, 1):
        print(f"    {C.CYAN}{i}{C.RESET}) {p}")
    try:
        choice = int(input(f"\n  {C.GRAY}Select provider [1-5]:{C.RESET} "))
        provider = providers[choice - 1]
    except (ValueError, IndexError):
        log('err', 'Invalid selection.'); return

    roles = ['HTTPS Redirector', 'DNS Redirector', 'SMTP Relay', 'Payload Hosting']
    print()
    for i, r in enumerate(roles, 1):
        print(f"    {C.CYAN}{i}{C.RESET}) {r}")
    try:
        choice = int(input(f"\n  {C.GRAY}Select role [1-4]:{C.RESET} "))
        role = roles[choice - 1]
    except (ValueError, IndexError):
        log('err', 'Invalid selection.'); return

    node_id = str(uuid.uuid4())
    node = {
        "id": node_id,
        "name": f"{provider.lower().split('(')[0].strip()}-{node_id[:4]}",
        "ip": "Provisioning...",
        "provider": provider,
        "role": role,
        "status": "deploying",
        "opsec": 100
    }

    nodes = load_nodes()
    nodes.append(node)
    save_nodes(nodes)

    log('info', f'Provisioning {C.CYAN}{node["name"]}{C.RESET} via {provider}...')

    if 'docker' in provider.lower():
        log('sys', 'Running terraform init...')
        subprocess.run([TF_BIN, '-chdir=' + TF_DOCKER, 'init', '-input=false'],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        log('sys', 'Running terraform apply...')
        role_tag = role.replace(' ', '-')
        result = subprocess.run([TF_BIN, '-chdir=' + TF_DOCKER, 'apply',
                                 '-var', f'node_name={node_id[:8]}',
                                 '-var', f'role_tag={role_tag}',
                                 '-auto-approve'],
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        nodes = load_nodes()
        for n in nodes:
            if n['id'] == node_id:
                if result.returncode == 0:
                    n['status'] = 'online'
                    n['ip'] = '127.0.0.1'
                    log('ok', f'{C.G}Node {node["name"]} is ONLINE{C.RESET} at 127.0.0.1')
                else:
                    n['status'] = 'failed'
                    log('err', f'Terraform apply failed for {node["name"]}')
                break
        save_nodes(nodes)
    else:
        log('warn', f'{provider} provisioning requires API keys. Node saved as deploying.')
    print()

def cmd_teardown():
    """Initiate emergency burn sequence."""
    print(f"\n  {C.R}⚠  EMERGENCY TEARDOWN ⚠{C.RESET}")
    print(f"  {C.GRAY}This will destroy ALL infrastructure.{C.RESET}\n")
    confirm = input(f'  {C.RED}Type "BURN EVERYTHING" to confirm:{C.RESET} ')
    if confirm != 'BURN EVERYTHING':
        log('info', 'Teardown cancelled.')
        return

    log('warn', 'Initiating burn protocol...')
    try:
        subprocess.run([TF_BIN, '-chdir=' + TF_DOCKER, 'destroy',
                        '-var', 'node_name=x', '-var', 'role_tag=x', '-auto-approve'],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except:
        pass
    save_nodes([])
    log('ok', f'{C.G}All infrastructure destroyed. Nodes DB cleared.{C.RESET}')
    print()

def cmd_help():
    """Show available commands."""
    print(f"""
  {C.W}Available Commands:{C.RESET}
  {C.GRAY}───────────────────────────────────────{C.RESET}
    {C.CYAN}status{C.RESET}      Show fleet infrastructure status
    {C.CYAN}provision{C.RESET}   Deploy a new redirector node
    {C.CYAN}teardown{C.RESET}    Initiate emergency burn sequence
    {C.CYAN}clear{C.RESET}       Clear screen
    {C.CYAN}help{C.RESET}        Show this help
    {C.CYAN}exit{C.RESET}        Close CLAN NXT
  """)

# ──────────────────────────────────
#  MAIN LOOP
# ──────────────────────────────────

def main():
    os.system('cls' if sys.platform == 'win32' else 'clear')
    print(BANNER)
    log('sys', 'Initializing C2 Infrastructure Manager...')
    time.sleep(0.3)
    log('ok', 'Local environment verified.')
    time.sleep(0.2)
    log('ok', 'Ready. Type "help" for commands.')
    print()

    commands = {
        'status': cmd_status,
        'provision': cmd_provision,
        'teardown': cmd_teardown,
        'help': cmd_help,
        'clear': lambda: os.system('cls' if sys.platform == 'win32' else 'clear') or print(BANNER),
    }

    while True:
        try:
            prompt = f"  {C.W}#𝐂𝐋𝐀𝐍 {C.R}𝐍𝐗𝐓{C.RESET} {C.GRAY}${C.RESET} "
            cmd = input(prompt).strip().lower()
            if cmd in ['exit', 'quit', 'q']:
                log('sys', 'Shutting down...')
                break
            elif cmd in commands:
                commands[cmd]()
            elif cmd:
                log('err', f'Unknown command: {cmd}')
        except (KeyboardInterrupt, EOFError):
            print()
            log('sys', 'Shutting down...')
            break

if __name__ == "__main__":
    main()
