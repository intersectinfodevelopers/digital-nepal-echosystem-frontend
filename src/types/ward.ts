import type { Citizen } from "@/types/citizen";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type ApplicationType =
  | "Citizen Registration"
  | "Disability"
  | "Senior Citizen"
  | "Birth Registration"
  | "Death Registration"
  | "Migration"
  | "House Registration"
  | "Business";

export interface ApprovalItem {
  id: string;
  application_type: ApplicationType;
  citizen_name: string;
  ward_number: string;
  application_number: string;
  submitted_date: string;
  status: ApplicationStatus;
  remarks?: string;
  citizen?: Partial<Citizen>;
  documents?: { name: string; url?: string }[];
}

export interface IdCardRequest {
  id: string;
  citizen_name: string;
  application_number: string;
  ward: string;
  submitted_date: string;
  status: ApplicationStatus;
  photo?: string | null;
}

export type NotificationType =
  | "approval"
  | "sync_failed"
  | "citizen_registered"
  | "application_approved"
  | "id_card_ready"
  | "rejection"
  | "info";

export interface WardNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface WardActivityEntry {
  id: string;
  icon: "user" | "check" | "close" | "card" | "sync" | "offline";
  description: string;
  time: string;
}

export interface DashboardStats {
  registered_today: number;
  pending_sync: number;
  pending_approvals: number;
  id_card_requests: number;
}

export interface GenderTone {
  tone: "blue" | "orange" | "red" | "green";
}

export interface SyncHistoryEntry {
  id: string;
  time: string;
  status: "success" | "failed";
  records: number;
}

export interface WardService {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
}

export interface WardSettings {
  theme: "light" | "dark";
  language: "en" | "np";
  notifications: boolean;
  auto_sync: boolean;
}

export interface WardProfile {
  ward_id: string;
  ward_name: string;
  municipality: string;
  district: string;
  province: string;
  admin_name: string;
  email: string;
  phone: string;
  role: string;
  photo: string | null;
}