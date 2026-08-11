"use client";

import { nanoid } from "nanoid";
import type { Citizen } from "@/types/citizen";
import citizensSeed from "../../data/citizens.json";
import type {
  ApprovalItem,
  DashboardStats,
  IdCardRequest,
  SyncHistoryEntry,
  WardActivityEntry,
  WardNotification,
  WardProfile,
  WardService,
  WardSettings,
} from "@/types/ward";

const citizensStatic = citizensSeed as unknown as Citizen[];

type StoreKey =
  | "ward_admin_dashboard"
  | "ward_admin_citizens"
  | "ward_admin_pending_sync"
  | "ward_admin_approval_queue"
  | "ward_admin_id_requests"
  | "ward_admin_notifications"
  | "ward_admin_recent_activity"
  | "ward_admin_profile"
  | "ward_admin_settings"
  | "ward_admin_services"
  | "ward_admin_sync_history";

const STORE_KEYS: StoreKey[] = [
  "ward_admin_dashboard",
  "ward_admin_citizens",
  "ward_admin_pending_sync",
  "ward_admin_approval_queue",
  "ward_admin_id_requests",
  "ward_admin_notifications",
  "ward_admin_recent_activity",
  "ward_admin_profile",
  "ward_admin_settings",
  "ward_admin_services",
  "ward_admin_sync_history",
];

const EVT = "ward-admin:change";

function key(wardId: string, storeKey: StoreKey): string {
  return `${storeKey}:${wardId}`;
}

const listeners = new Set<() => void>();

function emit(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVT));
  listeners.forEach((cb) => cb());
}

export function subscribeWardAdmin(cb: () => void): () => void {
  listeners.add(cb);
  if (typeof window !== "undefined") {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("ward_admin_")) cb();
    };
    window.addEventListener(EVT, cb);
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener(EVT, cb);
      window.removeEventListener("storage", onStorage);
    };
  }
  return () => {
    listeners.delete(cb);
  };
}

function read<T>(wardId: string, storeKey: StoreKey, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key(wardId, storeKey));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(wardId: string, storeKey: StoreKey, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(wardId, storeKey), JSON.stringify(value));
    emit();
  } catch {
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}


function seedCitizens(wardId: string): Citizen[] {
  return citizensStatic.filter((c) => c.ward_id === wardId);
}

function seedApprovals(wardId: string): ApprovalItem[] {
  const wardNum = wardId.replace("ward-", "");
  const names = [
    { n: "Sita Rimal", t: "Citizen Registration" },
    { n: "Bishnu Koirala", t: "Birth Registration" },
    { n: "Krishna Adhikari", t: "Disability" },
    { n: "Gita Sharma", t: "Senior Citizen" },
    { n: "Mohan Rai", t: "Migration" },
    { n: "Sunita Tamang", t: "House Registration" },
  ];
  return names.map((item, i) => ({
    id: `appr-${i + 1}`,
    application_type: item.t as ApprovalItem["application_type"],
    citizen_name: item.n,
    ward_number: wardNum,
    application_number: `AP-${wardNum}-${String(1000 + i)}`,
    submitted_date: new Date(Date.now() - (i + 1) * 3 * 3600_000).toISOString(),
    status: i === 4 ? "approved" : ("pending" as ApprovalItem["status"]),
    remarks: i === 4 ? "Verified during field visit" : undefined,
  }));
}

function seedIdRequests(wardId: string): IdCardRequest[] {
  const wardNum = wardId.replace("ward-", "");
  return [
    {
      id: "idr-1",
      citizen_name: "Ram Bahadur Thapa",
      application_number: `ID-${wardNum}-201`,
      ward: wardNum,
      submitted_date: new Date(Date.now() - 2 * 3600_000).toISOString(),
      status: "pending",
    },
    {
      id: "idr-2",
      citizen_name: "Bishnu Koirala",
      application_number: `ID-${wardNum}-202`,
      ward: wardNum,
      submitted_date: new Date(Date.now() - 5 * 3600_000).toISOString(),
      status: "pending",
    },
    {
      id: "idr-3",
      citizen_name: "Sita Rimal",
      application_number: `ID-${wardNum}-203`,
      ward: wardNum,
      submitted_date: new Date(Date.now() - 26 * 3600_000).toISOString(),
      status: "approved",
    },
  ];
}

function seedNotifications(wardId: string): WardNotification[] {
  return [
    {
      id: "not-1",
      type: "approval",
      title: "New Approval Request",
      message: "Birth Registration for Bishnu Koirala awaits review",
      time: nowIso(),
      read: false,
    },
    {
      id: "not-2",
      type: "id_card_ready",
      title: "ID Card Ready",
      message: "Ram Bahadur Thapa's ID card is ready for collection",
      time: new Date(Date.now() - 4 * 3600_000).toISOString(),
      read: false,
    },
    {
      id: "not-3",
      type: "citizen_registered",
      title: "Citizen Registered",
      message: "Sita Rimal was registered in Ward " + wardId.replace("ward-", ""),
      time: new Date(Date.now() - 8 * 3600_000).toISOString(),
      read: true,
    },
  ];
}

function seedActivity(): WardActivityEntry[] {
  return [
    {
      id: "act-1",
      icon: "user",
      description: "Sita Rimal was registered",
      time: new Date(Date.now() - 1 * 3600_000).toISOString(),
    },
    {
      id: "act-2",
      icon: "sync",
      description: "Data synced to central server",
      time: new Date(Date.now() - 3 * 3600_000).toISOString(),
    },
  ];
}

function seedProfile(wardId: string): WardProfile {
  return {
    ward_id: wardId,
    ward_name: `Ward ${wardId.replace("ward-", "")}`,
    municipality: "Kummayak Rural Municipality",
    district: "Panchthar",
    province: "Koshi Province",
    admin_name: "Ward Admin",
    email: "ward.admin@kummayak.gov.np",
    phone: "+977 9800000000",
    role: "Ward Administrator",
    photo: null,
  };
}

function seedSettings(): WardSettings {
  return {
    theme: "light",
    language: "en",
    notifications: true,
    auto_sync: true,
  };
}

function seedServices(wardId: string): WardService[] {
  const suffix = wardId.replace("ward-", "");
  const base: Omit<WardService, "id">[] = [
    { name: "Citizen Registration", icon: "person_add", description: "Register a new citizen in this ward", enabled: true },
    { name: "Birth Registration", icon: "celebration", description: "Register births and issue certificates", enabled: true },
    { name: "Death Registration", icon: "hotel", description: "Register deaths and issue certificates", enabled: true },
    { name: "Migration", icon: "map", description: "Manage in/out migration records", enabled: true },
    { name: "Disability", icon: "accessible", description: "Disability certificates and applications", enabled: true },
    { name: "Senior Citizen", icon: "elderly", description: "Senior citizen registrations", enabled: true },
    { name: "Tax", icon: "receipt_long", description: "Local tax and revenue collection", enabled: true },
    { name: "Recommendation Letter", icon: "mark_email_read", description: "Issue recommendation letters", enabled: true },
    { name: "ID Card", icon: "badge", description: "National ID card requests", enabled: true },
    { name: "Certificates", icon: "workspace_premium", description: "Issue certified documents", enabled: true },
  ];
  return base.map((s, i) => ({ ...s, id: `${suffix}-service-${i + 1}` }));
}

const initialized = new Set<string>();

function ensureInit(wardId: string): void {
  if (initialized.has(wardId)) return;

  if (!read(wardId, "ward_admin_citizens", null as unknown as Citizen[])) {
    write(wardId, "ward_admin_citizens", seedCitizens(wardId));
  }
  if (!read(wardId, "ward_admin_approval_queue", null as unknown as ApprovalItem[])) {
    write(wardId, "ward_admin_approval_queue", seedApprovals(wardId));
  }
  if (!read(wardId, "ward_admin_id_requests", null as unknown as IdCardRequest[])) {
    write(wardId, "ward_admin_id_requests", seedIdRequests(wardId));
  }
  if (!read(wardId, "ward_admin_notifications", null as unknown as WardNotification[])) {
    write(wardId, "ward_admin_notifications", seedNotifications(wardId));
  }
  if (!read(wardId, "ward_admin_recent_activity", null as unknown as WardActivityEntry[])) {
    write(wardId, "ward_admin_recent_activity", seedActivity());
  }
  if (!read(wardId, "ward_admin_pending_sync", null as unknown as string[])) {
    write(wardId, "ward_admin_pending_sync", [] as string[]);
  }
  if (!read(wardId, "ward_admin_profile", null as unknown as WardProfile)) {
    write(wardId, "ward_admin_profile", seedProfile(wardId));
  }
  if (!read(wardId, "ward_admin_settings", null as unknown as WardSettings)) {
    write(wardId, "ward_admin_settings", seedSettings());
  }
  if (!read(wardId, "ward_admin_services", null as unknown as WardService[])) {
    write(wardId, "ward_admin_services", seedServices(wardId));
  }
  if (!read(wardId, "ward_admin_sync_history", null as unknown as SyncHistoryEntry[])) {
    write(wardId, "ward_admin_sync_history", [] as SyncHistoryEntry[]);
  }
  if (!read(wardId, "ward_admin_dashboard", null as unknown as DashboardStats)) {
    refreshDashboard(wardId);
  }

  initialized.add(wardId);
}


export function refreshDashboard(wardId: string): DashboardStats {
  const citizens = read(wardId, "ward_admin_citizens", [] as Citizen[]);
  const approvals = read(wardId, "ward_admin_approval_queue", [] as ApprovalItem[]);
  const idRequests = read(wardId, "ward_admin_id_requests", [] as IdCardRequest[]);
  const pendingSyncCz = read(wardId, "ward_admin_pending_sync", [] as string[]);

  const stats: DashboardStats = {
    registered_today: citizens.filter((c) => isToday(c.created_at)).length,
    pending_sync: citizens.filter((c) => c.sync_status === "pending").length + pendingSyncCz.length,
    pending_approvals: approvals.filter((a) => a.status === "pending").length,
    id_card_requests: idRequests.filter((r) => r.status === "pending").length,
  };
  write(wardId, "ward_admin_dashboard", stats);
  return stats;
}

export function getDashboardStats(wardId: string): DashboardStats {
  ensureInit(wardId);
  return read(wardId, "ward_admin_dashboard", { registered_today: 0, pending_sync: 0, pending_approvals: 0, id_card_requests: 0 });
}


export function getWardCitizens(wardId: string): Citizen[] {
  ensureInit(wardId);
  return read(wardId, "ward_admin_citizens", [] as Citizen[]);
}

export function getWardCitizen(wardId: string, idOrNid: string): Citizen | undefined {
  return getWardCitizens(wardId).find(
    (c) => c.id === idOrNid || c.nid_masked === idOrNid,
  );
}

export function registerCitizenToWard(wardId: string, data: Partial<Citizen>): Citizen {
  ensureInit(wardId);
  const citizen: Citizen = {
    id: `cit-${nanoid(8)}`,
    ward_id: wardId,
    household_id: null,
    name_np: data.name_np ?? "",
    name_en: data.name_en ?? "",
    nid_masked: data.nid_masked ?? "**********",
    sex: data.sex ?? "OTHER",
    dob: data.dob ?? "",
    tole: data.tole ?? "",
    digital_literacy: data.digital_literacy ?? "NONE",
    has_smartphone: data.has_smartphone ?? false,
    consent_recorded_at: data.consent_recorded_at ?? nowIso(),
    consent_channel: data.consent_channel ?? "WARD_OFFICE",
    sync_status: "pending",
    nid_verified: data.nid_verified ?? false,
    is_active: true,
    employment_category: data.employment_category,
    created_at: nowIso(),
    latitude: data.latitude,
    longitude: data.longitude,
    place_name: data.place_name,
  };

  const citizens = getWardCitizens(wardId);
  citizens.unshift(citizen);
  write(wardId, "ward_admin_citizens", citizens);

  const sync = read(wardId, "ward_admin_pending_sync", [] as string[]);
  sync.unshift(citizen.id);
  write(wardId, "ward_admin_pending_sync", sync);

  addActivity(wardId, { icon: "offline", description: `${citizen.name_en} registered (offline)`, time: nowIso() });
  addNotification(wardId, {
    type: "citizen_registered",
    title: "Citizen Registered",
    message: `${citizen.name_en} was registered successfully`,
  });

  refreshDashboard(wardId);
  return citizen;
}

export function updateWardCitizen(wardId: string, id: string, patch: Partial<Citizen>): void {
  const citizens = getWardCitizens(wardId).map((c) =>
    c.id === id ? { ...c, ...patch, sync_status: "pending" as const } : c,
  );
  write(wardId, "ward_admin_citizens", citizens);
  const sync = read(wardId, "ward_admin_pending_sync", [] as string[]);
  if (!sync.includes(id)) write(wardId, "ward_admin_pending_sync", [id, ...sync]);
  addActivity(wardId, { icon: "user", description: `Citizen record updated`, time: nowIso() });
  refreshDashboard(wardId);
}

export function deleteWardCitizen(wardId: string, id: string): void {
  const citizens = getWardCitizens(wardId).filter((c) => c.id !== id);
  write(wardId, "ward_admin_citizens", citizens);
  const sync = read(wardId, "ward_admin_pending_sync", [] as string[]).filter((s) => s !== id);
  write(wardId, "ward_admin_pending_sync", sync);
  addActivity(wardId, { icon: "close", description: `Citizen record removed`, time: nowIso() });
  refreshDashboard(wardId);
}

// ------------------------------------------------ approval queue

export function getApprovalQueue(wardId: string): ApprovalItem[] {
  ensureInit(wardId);
  return read(wardId, "ward_admin_approval_queue", [] as ApprovalItem[]);
}

export function getApprovalItem(wardId: string, id: string): ApprovalItem | undefined {
  return getApprovalQueue(wardId).find((a) => a.id === id);
}

export function updateApprovalStatus(
  wardId: string,
  id: string,
  status: "approved" | "rejected",
  remarks?: string,
): void {
  const queue = getApprovalQueue(wardId).map((a) =>
    a.id === id ? { ...a, status, remarks: remarks ?? a.remarks } : a,
  );
  write(wardId, "ward_admin_approval_queue", queue);
  const item = queue.find((a) => a.id === id);
  if (item) {
    addActivity(wardId, {
      icon: status === "approved" ? "check" : "close",
      description: `${item.application_type} ${status} for ${item.citizen_name}`,
      time: nowIso(),
    });
    addNotification(wardId, {
      type: status === "approved" ? "application_approved" : "rejection",
      title: status === "approved" ? "Application Approved" : "Application Rejected",
      message: `${item.application_type} for ${item.citizen_name} was ${status}`,
    });
  }
  refreshDashboard(wardId);
}

export function addApprovalItem(wardId: string, item: Omit<ApprovalItem, "id">): void {
  const queue = getApprovalQueue(wardId);
  queue.unshift({ ...item, id: `appr-${nanoid(8)}` });
  write(wardId, "ward_admin_approval_queue", queue);
  refreshDashboard(wardId);
}

export function getIdCardRequests(wardId: string): IdCardRequest[] {
  ensureInit(wardId);
  return read(wardId, "ward_admin_id_requests", [] as IdCardRequest[]);
}

export function updateIdCardStatus(
  wardId: string,
  id: string,
  status: "approved" | "rejected",
  photo?: string | null,
): void {
  const requests = getIdCardRequests(wardId).map((r) =>
    r.id === id ? { ...r, status, photo: photo !== undefined ? photo : r.photo } : r,
  );
  write(wardId, "ward_admin_id_requests", requests);
  const item = requests.find((r) => r.id === id);
  if (item) {
    addActivity(wardId, {
      icon: status === "approved" ? "card" : "close",
      description: `ID card request ${status} for ${item.citizen_name}`,
      time: nowIso(),
    });
    if (status === "approved") {
      addNotification(wardId, {
        type: "id_card_ready",
        title: "ID Card Ready",
        message: `ID card approved for ${item.citizen_name}`,
      });
    }
  }
  refreshDashboard(wardId);
}

export function addIdCardRequest(wardId: string, item: Omit<IdCardRequest, "id">): void {
  const requests = getIdCardRequests(wardId);
  requests.unshift({ ...item, id: `idr-${nanoid(8)}` });
  write(wardId, "ward_admin_id_requests", requests);
  addActivity(wardId, { icon: "card", description: `ID card request created for ${item.citizen_name}`, time: nowIso() });
  refreshDashboard(wardId);
}


export function getNotifications(wardId: string): WardNotification[] {
  ensureInit(wardId);
  return read(wardId, "ward_admin_notifications", [] as WardNotification[]);
}

export function getUnreadCount(wardId: string): number {
  return getNotifications(wardId).filter((n) => !n.read).length;
}

export function markAllNotificationsRead(wardId: string): void {
  const items = getNotifications(wardId).map((n) => ({ ...n, read: true }));
  write(wardId, "ward_admin_notifications", items);
}

export function addNotification(
  wardId: string,
  n: { type: WardNotification["type"]; title: string; message: string },
): void {
  const items = getNotifications(wardId);
  items.unshift({ id: `not-${nanoid(8)}`, ...n, time: nowIso(), read: false });
  write(wardId, "ward_admin_notifications", items.slice(0, 30));
}



export function getRecentActivity(wardId: string): WardActivityEntry[] {
  ensureInit(wardId);
  return read(wardId, "ward_admin_recent_activity", [] as WardActivityEntry[]);
}

export function addActivity(
  wardId: string,
  a: Omit<WardActivityEntry, "id">,
): void {
  const items = getRecentActivity(wardId);
  items.unshift({ id: `act-${nanoid(8)}`, ...a });
  write(wardId, "ward_admin_recent_activity", items.slice(0, 30));
}



export function getPendingSync(wardId: string): string[] {
  ensureInit(wardId);
  return read(wardId, "ward_admin_pending_sync", [] as string[]);
}

export function getSyncHistory(wardId: string): SyncHistoryEntry[] {
  ensureInit(wardId);
  return read(wardId, "ward_admin_sync_history", [] as SyncHistoryEntry[]);
}


export function syncWardData(wardId: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const online = typeof navigator === "undefined" ? true : navigator.onLine;
      const succeeded = online && Math.random() > 0.08;
      if (succeeded) {
        const citizens = getWardCitizens(wardId).map((c) =>
          c.sync_status === "pending" ? { ...c, sync_status: "synced" as const } : c,
        );
        write(wardId, "ward_admin_citizens", citizens);
        write(wardId, "ward_admin_pending_sync", [] as string[]);
        addActivity(wardId, { icon: "sync", description: "All records synced to central server", time: nowIso() });
        const history = read(wardId, "ward_admin_sync_history", [] as SyncHistoryEntry[]);
        write(wardId, "ward_admin_sync_history", [
          { id: `sync-${nanoid(8)}`, time: nowIso(), status: "success", records: citizens.filter((c) => c.sync_status === "synced").length },
          ...history,
        ].slice(0, 20));
      } else {
        addActivity(wardId, { icon: "sync", description: "Sync failed — no internet connection", time: nowIso() });
        addNotification(wardId, {
          type: "sync_failed",
          title: "Sync Failed",
          message: "Unable to sync records. Internet unavailable.",
        });
        const history = read(wardId, "ward_admin_sync_history", [] as SyncHistoryEntry[]);
        write(wardId, "ward_admin_sync_history", [
          { id: `sync-${nanoid(8)}`, time: nowIso(), status: "failed", records: 0 },
          ...history,
        ].slice(0, 20));
      }
      refreshDashboard(wardId);
      resolve(succeeded);
    }, 2200);
  });
}



export function getWardProfile(wardId: string): WardProfile {
  ensureInit(wardId);
  return read(wardId, "ward_admin_profile", seedProfile(wardId));
}

export function updateWardProfile(wardId: string, patch: Partial<WardProfile>): void {
  const profile = { ...getWardProfile(wardId), ...patch };
  write(wardId, "ward_admin_profile", profile);
}

export function getWardSettings(wardId: string): WardSettings {
  ensureInit(wardId);
  return read(wardId, "ward_admin_settings", seedSettings());
}

export function updateWardSettings(wardId: string, patch: Partial<WardSettings>): void {
  const settings = { ...getWardSettings(wardId), ...patch };
  write(wardId, "ward_admin_settings", settings);
}

export function getWardServices(wardId: string): WardService[] {
  ensureInit(wardId);
  return read(wardId, "ward_admin_services", seedServices(wardId));
}



export function resetWardData(wardId: string): void {
  STORE_KEYS.forEach((k) => {
    try {
      localStorage.removeItem(key(wardId, k));
    } catch {
      // ignore
    }
  });
  initialized.delete(wardId);
  ensureInit(wardId);
  refreshDashboard(wardId);
}

export function storageUsage(wardId: string): number {
  let total = 0;
  try {
    STORE_KEYS.forEach((k) => {
      const raw = localStorage.getItem(key(wardId, k));
      if (raw) total += raw.length * 2; // approximate bytes
    });
  } catch {
    // ignore
  }
  return total;
}