import { apiFetch } from "@/lib/api";
import type { Dashboard } from "@/types/dashboard";

export function getDashboard(): Promise<Dashboard> {
  return apiFetch<Dashboard>("/api/dashboard");
}
