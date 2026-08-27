import type { ReactNode } from "react";

export type WardViewId =
  | "dashboard"
  | "analytics"
  | "citizens"
  | "map"
  | "national-map"
  | "services"
  | "profile"
  | "approvals"
  | "idcards";

export type WardNavSection =
  | { type: "group"; label: string; items: WardNavItem[] }
  | { type: "divider" };

export interface WardNavItem {
  id: WardViewId;
  label: string;
  icon?: ReactNode;
}

export interface AdminNavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  hasMapTree?: boolean;
  mapHref?: string;
}

export type AdminNavSection =
  | { type: "group"; label: string; items: AdminNavItem[] }
  | { type: "divider" };
