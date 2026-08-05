export type UserRole =
  | "WARD_ADMIN"
  | "LOCAL_BODY_ADMIN"
  | "PROVINCE_ADMIN"
  | "CENTRAL_ADMIN";

export interface User {
  id: string;
  username: string;
  password: string;
  full_name: string;
  phone: string;
  role: UserRole;
  jurisdiction_type: string;
  jurisdiction_id: string;
  is_active: boolean;
  failed_logins: number;
  last_login: string | null;
  lat: number;
  lng: number;
}

export interface LoginSession {
  token: string;
  username: string;
  full_name: string;
  role: UserRole;
  jurisdiction_type: string;
  jurisdiction_id: string;
  loginTime: string;
}