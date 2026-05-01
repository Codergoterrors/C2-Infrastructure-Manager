variable "node_name" {
  description = "Name of the redirector container"
  type        = string
}

variable "role_tag" {
  description = "Role of the node (e.g., https-redirector)"
  type        = string
}

variable "external_port" {
  description = "External port to map to 80"
  type        = number
  default     = 9090
}
