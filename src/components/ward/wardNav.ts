import type { ReactNode } from "react";

export type WardViewId =
  | "dashboard"
  | "citizens"
  | "map"
  | "services"
  | "profile"
  | "approvals"
  | "idcards"
  | "national-map";

export type WardNavSection =
  | { type: "group"; label: string; items: WardNavItem[] }
  | { type: "divider" };

export interface WardNavItem {
  id: WardViewId;
  label: string;
  icon?: ReactNode;
  /** Marker that the sidebar should render a hierarchical province → district → local body dropdown for this item. */
  hasMapTree?: boolean;
  /** Optional target href to navigate to when a node inside the dropdown is selected. Defaults to "/central/national-map". */
  mapHref?: string;
}

export const WARD_NAV: WardNavSection[] = [
  {
    type: "group",
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard" },
      { id: "citizens", label: "Citizens" },
      {
        id: "national-map",
        label: "National Map",
        hasMapTree: true,
        mapHref: "/central/national-map",
      },
      { id: "services", label: "Services" },
      { id: "profile", label: "Profile" },
    ],
  },
  { type: "divider" },
  {
    type: "group",
    label: "Operations",
    items: [
      { id: "approvals", label: "Approval Queue" },
      { id: "idcards", label: "ID Card Requests" },
    ],
  },
];

export const WARD_VIEW_TITLES: Record<WardViewId, string> = {
  dashboard: "Dashboard",
  citizens: "Citizens",
  map: "Map",
  services: "Services",
  profile: "Profile",
  approvals: "Approval Queue",
  idcards: "ID Card Requests",
  "national-map": "National Map",
};