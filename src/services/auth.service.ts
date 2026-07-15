import users from "../../data/users.json";
import { LoginSession, User } from "@/types/auth";

const STORAGE_KEY = "digital_nepal_auth";

export function loginUser(
  username: string,
  password: string,
): LoginSession | null {
  const user = (users as User[]).find(
    (u) =>
      u.username === username &&
      u.password === password &&
      u.is_active,
  );

  if (!user) return null;

  const session: LoginSession = {
    token: "mock-jwt-token",
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    jurisdiction_type: user.jurisdiction_type,
    jurisdiction_id: user.jurisdiction_id,
    loginTime: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

  return session;
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentSession(): LoginSession | null {
  const session = localStorage.getItem(STORAGE_KEY);

  if (!session) return null;

  return JSON.parse(session) as LoginSession;
}

export function isLoggedIn() {
  return getCurrentSession() !== null;
}