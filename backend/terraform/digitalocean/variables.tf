variable "do_token" {
  description = "DigitalOcean API Token"
  type        = string
  sensitive   = true
}

variable "node_name" {
  description = "Name of the redirector node"
  type        = string
}

variable "region" {
  description = "DigitalOcean region (e.g., nyc1, lon1)"
  type        = string
}

variable "role_tag" {
  description = "Role of the node for tagging (e.g., https-redirector)"
  type        = string
}

variable "ssh_public_key" {
  description = "Public SSH key to inject into the droplet"
  type        = string
}

variable "operator_ip" {
  description = "The IP address of the C2 Manager / Operator to whitelist for SSH"
  type        = string
  default     = "0.0.0.0/0" # In production, this should be restricted
}
