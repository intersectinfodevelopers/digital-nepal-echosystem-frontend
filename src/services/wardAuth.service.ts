"use client";

import wardAdminsRaw from "../../data/ward-admins.json";
import type { WardAdmin, WardAdminSession } from "@/types/ward-admin";

const STORAGE_KEY = "digital_nepal_ward_session";

const WARD_ADMINS = wardAdminsRaw as WardAdmin[];

export function getWardAdmins(): WardAdmin[] {
  return WARD_ADMINS;
}

export function loginWardAdmin(
  identifier: string,
  password: string,
): WardAdminSession | null {
  const normalized = identifier.trim().toLowerCase();

  const admin = WARD_ADMINS.find(
    (a) =>
      a.is_active &&
      (a.username.toLowerCase() === normalized ||
        a.email.toLowerCase() === normalized) &&
      a.password === password,
  );

  if (!admin) return null;

  const session: WardAdminSession = {
    token: "mock-ward-jwt-token",
    ward_id: admin.ward_id,
    ward_name: admin.ward_name,
    municipality: admin.municipality,
    district: admin.district,
    province: admin.province,
    admin_name: admin.admin_name,
    email: admin.email,
    username: admin.username,
    role: admin.role,
    loginTime: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

  return session;
}

export function persistWardSession(session: WardAdminSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function logoutWardAdmin(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getWardAdminSession(): WardAdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WardAdminSession) : null;
  } catch {
    return null;
  }
}

export function isWardAdminLoggedIn(): boolean {
  return getWardAdminSession() !== null;
}

/**
 * Subscribes to ward session changes. Catches both cross-tab updates (the
 * native `storage` event, fired when another tab clears localStorage) and
 * same-tab clears (`localStorage.clear()` fires no storage event in the
 * current tab), via a lightweight poll.
 */
export function subscribeWardSession(
  callback: (session: WardAdminSession | null) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  let current = getWardAdminSession();
  const notify = () => {
    const next = getWardAdminSession();
    if (JSON.stringify(next) !== JSON.stringify(current)) {
      current = next;
      callback(next);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === STORAGE_KEY) notify();
  };

  window.addEventListener("storage", handleStorage);
  const pollId = window.setInterval(notify, 750);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.clearInterval(pollId);
  };
}

export function getWardDashboardPath(): string {
  return "/ward/dashboard";
}