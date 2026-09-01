import { apiFetch, getCsrfTokenFromCookie } from "@/lib/api";
import type { Category, CategoryRequest } from "@/types/category";

export function listCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

export function createCategory(payload: CategoryRequest): Promise<Category> {
  return apiFetch<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify(payload),
    csrfToken: getCsrfTokenFromCookie(),
  });
}

export function updateCategory(id: number, payload: CategoryRequest): Promise<Category> {
  return apiFetch<Category>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    csrfToken: getCsrfTokenFromCookie(),
  });
}

export function deleteCategory(id: number): Promise<void> {
  return apiFetch<void>(`/api/categories/${id}`, {
    method: "DELETE",
    csrfToken: getCsrfTokenFromCookie(),
  });
}
