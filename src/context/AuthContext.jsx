// @refresh reset
import React, { createContext, useContext, useEffect, useState } from "react";
import { AUTH_LOGIN } from "../config/endpoints";
import { saveTokens, clearTokens, getStoredUser } from "../services/apiClient";

const AuthContext = createContext();

const USER_STORAGE_KEY = "hr_dashboard_user";

const normalizeRole = (role) => {
  if (!role) return "user";
  const normalized = String(role).trim().toLowerCase();
  if (
    normalized === "master_admin" ||
    normalized === "master admin" ||
    normalized === "masteradmin" ||
    normalized === "superadmin" ||
    normalized === "super_admin"
  ) return "superadmin";
  if (
    normalized === "companyadmin" ||
    normalized === "company admin" ||
    normalized === "company_admin"
  ) return "companyadmin";
  return normalized;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = getStoredUser();
    // Only auto-login if user exists AND has a valid access token
    if (saved && saved.token) {
      setUser({ ...saved, role: normalizeRole(saved.role) });
    } else {
      // Clean up stale data
      clearTokens();
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  // Listen for forced logout from apiClient (token refresh failure)
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: "Please enter both email and password." };
    }

    try {
      const response = await fetch(AUTH_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return { success: false, message: data?.message || data?.error || "Login failed" };
      }

      saveTokens(data.token, data.refreshToken, data.expiresAt);

      const userData = {
        id: data.id,
        email: data.email || email,
        role: normalizeRole(data.role),
        name: data.name || data.email || "User",
        token: data.token || null,
        companyId: data.companyId || null,
        faceRegistered: data.faceRegistered || false,
      };

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch {
      return { success: false, message: "Unable to connect. Please try again later." };
    }
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token: user?.token, companyId: user?.companyId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
