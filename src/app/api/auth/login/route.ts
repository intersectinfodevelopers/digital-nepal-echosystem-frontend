import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface LoginUserRecord {
  id: string;
  username: string;
  password: string;
  role: string;
  jurisdiction_id: string | null;
  is_active?: boolean;
}

const ROLE_ROUTES = {
  CENTRAL_ADMIN: '/central/analytics',
  PROVINCE_ADMIN: '/province/dashboard',
  DISTRICT_ADMIN: '/district/dashboard',
  WARD_ADMIN: '/ward/dashboard',
  LOCAL_BODY_ADMIN: '/municipality/dashboard',
} as const;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const filePath = path.join(process.cwd(), 'data', 'users.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Database resource file not found on server.' },
        { status: 500 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(fileContent);
    const users = Array.isArray(parsedData) ? parsedData : parsedData.users;

    if (!Array.isArray(users)) {
      return NextResponse.json(
        { success: false, error: 'Invalid database format.' },
        { status: 500 }
      );
    }

    const user = users.find(
      (u: LoginUserRecord) => u.username && u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: 'Account deactivated.' },
        { status: 403 }
      );
    }

    const userRole = user.role as keyof typeof ROLE_ROUTES;
    const redirectTo = ROLE_ROUTES[userRole] || '/unauthorized';

    return NextResponse.json({
      success: true,
      redirectTo,
      user: {
        id: user.id,
        role: user.role,
        username: user.username,
        jurisdiction_id: user.jurisdiction_id,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal database processing error.' },
      { status: 500 }
    );
  }
}