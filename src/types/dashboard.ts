export type StatTone = "blue" | "orange" | "red";

export interface StatItem {
  label: string;
  value: number;
  tone: StatTone;
}

export type ActivityStatus = "Pending";

export interface RecentActivityItem {
  name: string;
  nid: string;
  time: string;
  action: string;
  status: ActivityStatus;
}

export interface AlertItem {
  label: string;
}
