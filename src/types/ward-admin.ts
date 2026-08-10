export type WardAdminRole = "ward_admin";

export interface WardAdmin {
  id: string;
  ward_id: string;
  ward_name: string;
  municipality: string;
  district: string;
  province: string;
  admin_name: string;
  email: string;
  username: string;
  password: string;
  role: WardAdminRole;
  is_active: boolean;
}

export interface WardAdminSession {
  token: string;
  ward_id: string;
  ward_name: string;
  municipality: string;
  district: string;
  province: string;
  admin_name: string;
  email: string;
  username: string;
  role: WardAdminRole;
  loginTime: string;
}