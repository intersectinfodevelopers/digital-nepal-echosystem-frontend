import type { AlertItem, RecentActivityItem, StatItem } from "@/types/dashboard";

export const WARD_NAME = "Ward 03";
export const WARD_MUNICIPALITY = "Kummayak Rural Municipality, Panchthar";
export const LAST_SYNCED = "Today, 10:42AM";

export const stats: StatItem[] = [
  { label: "Registrations Today", value: 12, tone: "blue" },
  { label: "Pending Sync", value: 3, tone: "orange" },
  { label: "Offline Records", value: 4, tone: "red" },
];

export const activities: RecentActivityItem[] = [
  {
    name: "Hari Thapa",
    nid: "12***-6****-8****",
    time: "10:22 AM",
    action: "Registration",
    status: "Pending",
  },
  {
    name: "Ram Karki",
    nid: "43***-6****-2****",
    time: "12:08 AM",
    action: "Registration",
    status: "Pending",
  },
  {
    name: "Sanu Gurung",
    nid: "23***-3****-1****",
    time: "01:22 PM",
    action: "Registration",
    status: "Pending",
  },
];

export const alerts: AlertItem[] = [
  { label: "Pending Approvals" },
  { label: "Sync failures" },
  { label: "New grievances" },
];
