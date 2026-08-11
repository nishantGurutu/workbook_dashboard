import { apiGet, apiPost, apiFetch } from "./apiClient";

export async function fetchShifts() {
  return apiGet("/api/shifts") || [];
}

export async function createShift({ name, startTime, endTime, days, description }) {
  return apiPost("/api/shifts", { name, startTime, endTime, days, description });
}

export async function updateShift(id, { name, startTime, endTime, days, description }) {
  return apiPost(`/api/shifts/${id}`, { name, startTime, endTime, days, description });
}

export async function deleteShift(id) {
  const res = await apiFetch(`/api/shifts/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Failed to delete shift");
  return data;
}
