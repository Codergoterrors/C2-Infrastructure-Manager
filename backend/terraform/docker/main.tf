terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {
  host = "npipe:////./pipe/docker_engine"
}

# Pulls the image
resource "docker_image" "ubuntu" {
  name         = "ubuntu:latest"
  keep_locally = true
}

# Create a container
resource "docker_container" "redirector" {
  image = docker_image.ubuntu.image_id
  name  = var.node_name
  
  # Keep it running
  command = ["tail", "-f", "/dev/null"]
  
  # Ports removed to prevent collision when spinning up multiple containers
  publish_all_ports = true

  labels {
    label = "role"
    value = var.role_tag
  }
}

output "container_id" {
  value = docker_container.redirector.id
}

output "container_ip" {
  value = "127.0.0.1" # In Docker Desktop for Windows, we access via localhost
}
