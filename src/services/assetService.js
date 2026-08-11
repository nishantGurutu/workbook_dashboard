import { apiGet, apiPost } from "./apiClient";

export async function fetchAssets() {
  return apiGet("/api/assets") || [];
}

export async function createAsset(payload) {
  return apiPost("/api/assets", payload);
}

export async function updateAsset(id, payload) {
  return apiPost(`/api/assets/${id}`, payload);
}

export async function deleteAsset(id) {
  const { apiFetch } = await import("./apiClient");
  const res = await apiFetch(`/api/assets/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Failed to delete asset");
  return data;
}

export async function assignAsset(assetId, userId) {
  return apiPost(`/api/assets/${assetId}/assign`, { userId });
}

export async function unassignAsset(assetId) {
  return apiPost(`/api/assets/${assetId}/unassign`, {});
}

export async function fetchEmployees() {
  return apiGet("/api/company-admin/users") || [];
}

export async function fetchUserAssets(userId) {
  return apiGet(`/api/assets/user/${userId}`) || [];
}
