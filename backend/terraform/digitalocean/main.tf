terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

# 1. Create an SSH Key resource so we can access the redirector
resource "digitalocean_ssh_key" "c2_key" {
  name       = "c2-infra-key-${var.node_name}"
  public_key = var.ssh_public_key
}

# 2. Spin up the actual Redirector Droplet
resource "digitalocean_droplet" "redirector" {
  image    = "ubuntu-22-04-x64"
  name     = var.node_name
  region   = var.region
  size     = "s-1vcpu-1gb" # The cheapest $4/mo node, perfect for proxies
  ssh_keys = [digitalocean_ssh_key.c2_key.fingerprint]
  
  tags = ["c2-redirector", var.role_tag]
}

# 3. Secure the node with a Cloud Firewall (OPSEC: Only open what we need)
resource "digitalocean_firewall" "redirector_fw" {
  name = "firewall-${var.node_name}"

  droplet_ids = [digitalocean_droplet.redirector.id]

  # Allow HTTP (80) and HTTPS (443) from anywhere for payloads/beacons
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Allow SSH (22) ONLY from the operator's IP (Strong OPSEC)
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = [var.operator_ip]
  }

  # Allow all outbound traffic so the redirector can forward to the Teamserver
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
  
  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

# 4. Output the new IP Address so FastAPI can save it to the database
output "droplet_ip_address" {
  value = digitalocean_droplet.redirector.ipv4_address
}
