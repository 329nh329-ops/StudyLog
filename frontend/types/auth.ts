export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface RegisterRequest {
  username: string;
  password: string;
  password_confirmation: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
