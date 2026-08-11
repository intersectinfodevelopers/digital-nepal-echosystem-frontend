import usersData from "../../data/users.json";
import wardsData from "../../data/wards.json";
import municipalitiesData from "../../data/municipalities.json";
import districtsData from "../../data/district.json";
import provincesData from "../../data/provinces.json";
import { LoginSession, User } from "@/types/auth";

const STORAGE_KEY = "digital_nepal_session";

const users = usersData as User[];
const wards = wardsData as { id: string; municipality_id: string; name_en: string }[];
const municipalities = municipalitiesData as { id: string; district_id: string; name_en: string }[];
const districts = districtsData as { id: string; province_id: string; name_en: string }[];
const provinces = provincesData as { id: string; name_en: string }[];

export const ROLE_HOME_ROUTE = {
  WARD_ADMIN: "/ward/dashboard",
  LOCAL_BODY_ADMIN: "/municipality/dashboard",
  PROVINCE_ADMIN: "/province/dashboard",
  CENTRAL_ADMIN: "/central/dashboard",
} as const;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveSessionDetails(user: User) {
  const denorm = user.denorm;

  let ward_id: string | null = null;
  let ward_name: string | null = null;
  let municipality_id: string | null = null;
  let municipality_name: string | null = null;
  let province_id: string | null = null;
  let province_name: string | null = null;

  if (user.role === "WARD_ADMIN") {
    const wardLookupId = denorm?.ward_id ?? user.jurisdiction_id;
    if (wardLookupId) {
      ward_id = denorm?.ward_id ?? user.jurisdiction_id ?? null;
      ward_name = denorm?.ward_name ?? null;
      municipality_id = denorm?.municipality_id ?? null;
      municipality_name = denorm?.municipality_name ?? null;
      province_id = denorm?.province_id ?? null;
      province_name = denorm?.province_name ?? null;
    }

    if (!denorm && wardLookupId) {
      const ward = wards.find((entry) => entry.id === wardLookupId);
      ward_id = ward?.id ?? null;
      ward_name = ward ? ward.id : null;
      municipality_id = ward?.municipality_id ?? null;
      const municipality = municipalities.find((entry) => entry.id === municipality_id);
      municipality_name = municipality?.name_en ?? null;
      const district_id = municipality?.district_id ?? null;
      const district = districts.find((entry) => entry.id === district_id);
      province_id = district?.province_id ?? null;
      const province = provinces.find((entry) => entry.id === province_id);
      province_name = province?.name_en ?? null;
    }
  }

  if (user.role === "LOCAL_BODY_ADMIN") {
    municipality_id = denorm?.municipality_id ?? user.jurisdiction_id ?? null;
    municipality_name = denorm?.municipality_name ?? null;
    province_id = denorm?.province_id ?? null;
    province_name = denorm?.province_name ?? null;

    if (!denorm && municipality_id) {
      const municipality = municipalities.find((entry) => entry.id === municipality_id);
      municipality_name = municipality?.name_en ?? null;
      const district_id = municipality?.district_id ?? null;
      const district = districts.find((entry) => entry.id === district_id);
      province_id = district?.province_id ?? null;
      const province = provinces.find((entry) => entry.id === province_id);
      province_name = province?.name_en ?? null;
    }
  }

  if (user.role === "PROVINCE_ADMIN") {
    province_id = denorm?.province_id ?? user.jurisdiction_id ?? null;
    province_name = denorm?.province_name ?? null;

    if (!denorm && province_id) {
      const province = provinces.find((entry) => entry.id === province_id);
      province_name = province?.name_en ?? null;
    }
  }

  return {
    ward_id,
    ward_name,
    municipality_id,
    municipality_name,
    province_id,
    province_name,
  };
}

export function loginUser(email: string, password: string): LoginSession | null {
  const normalizedEmail = normalizeEmail(email);

  const user = users.find(
    (u) =>
      normalizeEmail(u.email) === normalizedEmail &&
      u.password === password &&
      u.is_active,
  );

  if (!user) return null;

  const session: LoginSession = {
    token: "mock-jwt-token",
    id: user.id,
    email: user.email,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    jurisdiction_type: user.jurisdiction_type,
    jurisdiction_id: user.jurisdiction_id,
    ...resolveSessionDetails(user),
    loginTime: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    try {
      const payload = {
        id: session.id,
        role: session.role,
        email: session.email,
        jurisdiction_id: session.jurisdiction_id ?? null,
      };
      const cookieVal = typeof btoa !== "undefined" ? btoa(JSON.stringify(payload)) : Buffer.from(JSON.stringify(payload)).toString("base64");
      // set a cookie so middleware can detect a session on server-side
      document.cookie = `auth_token=${cookieVal}; path=/; max-age=${60 * 60};`;
    } catch {
      // ignore cookie set errors
    }
  }
  return session;
}

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    try {
      document.cookie = `auth_token=; path=/; max-age=0`;
    } catch {}
  }
}

export function getCurrentSession(): LoginSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoginSession) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getCurrentSession() !== null;
}

export function subscribeSession(callback: (session: LoginSession | null) => void): () => void {
  if (typeof window === "undefined") return () => {};

  let current = getCurrentSession();
  const notify = () => {
    const next = getCurrentSession();
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
