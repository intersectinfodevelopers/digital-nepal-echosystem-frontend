import type { WardNavItem, WardNavSection, WardViewId } from "@/types/navigation";

export type { WardNavItem, WardNavSection, WardViewId };


export const WARD_NAV: WardNavSection[] = [
  {
    type: "group",
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard" },
      { id: "citizens", label: "Citizens" },
      { id: "map", label: "Map" },
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
};