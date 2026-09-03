variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-northeast-1"
}

variable "instance_type" {
  description = "EC2 instance type (free tier eligible)"
  type        = string
  default     = "t3.micro"
}

variable "repo_url" {
  description = "Git repository URL to clone on the instance"
  type        = string
  default     = "https://github.com/329nh329-ops/StudyLog.git"
}

variable "repo_branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "main"
}

variable "ssh_allowed_cidr" {
  description = "CIDR block allowed to SSH into the instance"
  type        = string
  default     = "0.0.0.0/0"
}

variable "jwt_secret_key" {
  description = "JWT secret key for the backend (leave empty to auto-generate)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "seed_admin_username" {
  description = "Seed admin username"
  type        = string
  default     = "admin"
}

variable "seed_admin_password" {
  description = "Seed admin password (leave empty to auto-generate)"
  type        = string
  default     = ""
  sensitive   = true
}
