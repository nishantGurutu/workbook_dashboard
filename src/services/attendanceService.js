import { apiGet } from "./apiClient";

export async function fetchMyAttendance() {
  return apiGet("/api/attendance/my") || [];
}

export async function fetchCompanyAttendance() {
  return apiGet("/api/attendance") || [];
}

export async function fetchTodayAttendance() {
  return apiGet("/api/attendance/today") || [];
}

export async function checkIn({ latitude, longitude, locationAddress, faceImage }) {
  const formData = new FormData();
  if (latitude != null) formData.append("latitude", latitude);
  if (longitude != null) formData.append("longitude", longitude);
  if (locationAddress) formData.append("locationAddress", locationAddress);
  if (faceImage) formData.append("faceImage", faceImage);

  const { apiFetch, getAccessToken, withBase } = await import("./apiClient");
  const token = getAccessToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await apiFetch("/api/attendance/check-in", {
    method: "POST",
    body: faceImage ? formData : JSON.stringify({}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || data?.error || "Check-in failed");
  return data.data;
}

export async function fetchAttendanceByDate(date) {
  const { apiGet } = await import("./apiClient");
  return apiGet(`/api/attendance/date/${date}`) || [];
}
