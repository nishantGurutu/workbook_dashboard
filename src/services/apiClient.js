import { withBase } from "../config/apiConfig";

const REFRESH_TOKEN_KEY = "hr_dashboard_refresh";
const ACCESS_TOKEN_KEY = "hr_dashboard_token";
const USER_KEY = "hr_dashboard_user";
const EXPIRES_KEY = "hr_dashboard_expires";

let refreshPromise = null;

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveTokens(accessToken, refreshToken, expiresAt) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (expiresAt) localStorage.setItem(EXPIRES_KEY, String(expiresAt));
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  // Legacy keys from old auth system
  localStorage.removeItem("hr_dashboard_token");
  localStorage.removeItem("hr_dashboard_user");
  localStorage.removeItem("user");
}

function isTokenExpired() {
  const expiresAt = parseInt(localStorage.getItem(EXPIRES_KEY) || "0", 10);
  return expiresAt && Date.now() > expiresAt - 60000;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(withBase("/api/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();
  saveTokens(data.token, data.refreshToken, data.expiresAt);

  const storedUser = getStoredUser();
  if (storedUser) {
    storedUser.token = data.token;
    localStorage.setItem(USER_KEY, JSON.stringify(storedUser));
  }

  return data.token;
}

export async function apiFetch(url, options = {}) {
  let token = getAccessToken();

  if (token && isTokenExpired()) {
    try {
      token = await refreshAccessToken();
    } catch {
      clearTokens();
      window.dispatchEvent(new CustomEvent("auth:logout"));
      throw new Error("Session expired. Please login again.");
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // For FormData, remove Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(withBase(url), {
    ...options,
    headers,
  });

  if (response.status === 401 && getRefreshToken()) {
    try {
      token = await refreshAccessToken();
      headers["Authorization"] = `Bearer ${token}`;
      return await fetch(withBase(url), {
        ...options,
        headers,
      });
    } catch {
      clearTokens();
      window.dispatchEvent(new CustomEvent("auth:logout"));
      throw new Error("Session expired. Please login again.");
    }
  }

  return response;
}

/**
 * Same as apiFetch but also parses JSON and throws on error.
 * Returns the data from { success, data, message } envelope.
 */
export async function apiGet(url) {
  const res = await apiFetch(url);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
  return data?.data !== undefined ? data.data : data;
}

export async function apiPost(url, body) {
  const res = await apiFetch(url, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
  return data?.data !== undefined ? data.data : data;
}
