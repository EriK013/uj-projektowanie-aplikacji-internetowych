import { request } from "./client";

export function createEnvelope(
  monthId: number,
  categoryId: number,
  planned: string,
  spent: string,
): Promise<unknown> {
  return request("/envelopes", {
    method: "POST",
    body: { month_id: monthId, category_id: categoryId, planned, spent },
  });
}

export function updateEnvelope(
  id: number,
  planned: string,
  spent: string,
): Promise<unknown> {
  return request(`/envelopes/${id}`, {
    method: "PUT",
    body: { planned, spent },
  });
}

export function deleteEnvelope(id: number): Promise<void> {
  return request<void>(`/envelopes/${id}`, { method: "DELETE" });
}
