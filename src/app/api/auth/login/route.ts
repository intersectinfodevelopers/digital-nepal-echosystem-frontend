import { NextResponse } from "next/server";
import usersData from "../../../../../data/users.json";
import type { User } from "@/types/auth";

type ApiUser = {
  id?: string;
  email?: string;
  username?: string;
  role?: string;
  jurisdiction_id?: string | null;
};

export async function POST(request: Request) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  const useMockData =
    process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === "true" ||
    (!apiBaseUrl && process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA !== "false");

  const { email, password } = await request.json();

  if (useMockData) {
    const user = (usersData as User[]).find(
      (candidate) =>
        candidate.email.toLowerCase() === String(email).trim().toLowerCase() &&
        candidate.password === password &&
        candidate.is_active,
    );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 },
      );
    }

    const { password: _password, ...publicUser } = user;
    return createLoginResponse(publicUser, "mock-token");
  }

  if (!apiBaseUrl) {
    return NextResponse.json(
      { message: "Login API URL is not configured." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message ?? data.error ?? "Invalid credentials." },
        { status: response.status },
      );
    }

    const user = data.user as ApiUser | undefined;
    if (!user?.role) {
      return NextResponse.json(
        { message: "Login API response does not contain a user role." },
        { status: 502 },
      );
    }

    const sessionPayload = Buffer.from(
      JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        jurisdiction_id: user.jurisdiction_id ?? null,
      }),
    ).toString("base64");

    return createLoginResponse(user, data.token ?? "", sessionPayload);
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the login API." },
      { status: 502 },
    );
  }
}

function createLoginResponse(
  user: ApiUser | User,
  token: string,
  sessionPayload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      jurisdiction_id: user.jurisdiction_id ?? null,
    }),
  ).toString("base64"),
) {
  const result = NextResponse.json({ user, token });
  result.cookies.set("auth_token", sessionPayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return result;
}
