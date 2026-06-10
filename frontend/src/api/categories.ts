import { request } from "./client";

export type Category = {
  id: number;
  name: string;
  kind: "income" | "expense";
};

export function listCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export function createCategory(name: string, kind: "income" | "expense"): Promise<Category> {
  return request<Category>("/categories", {
    method: "POST",
    body: { name, kind },
  });
}

export function deleteCategory(id: number): Promise<void> {
  return request<void>(`/categories/${id}`, { method: "DELETE" });
}
