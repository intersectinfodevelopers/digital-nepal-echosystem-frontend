export type UserRole =
  | "WARD_ADMIN"
  | "LOCAL_BODY_ADMIN"
  | "PROVINCE_ADMIN"
  | "CENTRAL_ADMIN";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: UserRole;
  jurisdiction_type: string;
  jurisdiction_id: string | null;
  is_active: boolean;
  failed_logins?: number;
  last_login?: string | null;
  lat?: number;
  lng?: number;
  denorm?: {
    ward_id?: string;
    ward_name?: string;
    municipality_id?: string;
    municipality_name?: string;
    district_id?: string;
    district_name?: string;
    province_id?: string;
    province_name?: string;
  };
}

export interface LoginSession {
  token: string;
  id?: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  jurisdiction_type: string;
  jurisdiction_id: string | null;
  ward_id?: string | null;
  ward_name?: string | null;
  municipality_id?: string | null;
  municipality_name?: string | null;
  province_id?: string | null;
  province_name?: string | null;
  loginTime: string;
}
