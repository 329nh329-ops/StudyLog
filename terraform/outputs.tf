output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.app.public_ip
}

output "frontend_url" {
  description = "URL to access the frontend"
  value       = "http://${aws_instance.app.public_ip}:3000"
}

output "backend_url" {
  description = "URL to access the backend API"
  value       = "http://${aws_instance.app.public_ip}:8000"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ${path.module}/studylog-key.pem ec2-user@${aws_instance.app.public_ip}"
}

output "seed_admin_username" {
  value = var.seed_admin_username
}

output "seed_admin_password" {
  value     = local.seed_admin_password
  sensitive = true
}
