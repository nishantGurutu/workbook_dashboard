import { apiGet, apiPost, apiFetch } from "./apiClient";

export async function fetchHolidays() {
  return apiGet("/api/holidays") || [];
}

export async function createHoliday(payload) {
  return apiPost("/api/holidays", payload);
}

export async function updateHoliday(id, payload) {
  return apiPost(`/api/holidays/${id}`, payload);
}

export async function deleteHoliday(id) {
  const res = await apiFetch(`/api/holidays/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Failed to delete holiday");
  return data;
}
