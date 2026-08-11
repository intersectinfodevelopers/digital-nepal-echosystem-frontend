"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  TextField,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Logout,
  StorageOutlined,
  HistoryOutlined,
  DarkModeOutlined,
  LanguageOutlined,
  EditOutlined,
  NotificationsOutlined,
  AccountBalanceOutlined,
  BadgeOutlined,
  EmailOutlined,
  PhoneOutlined,
} from "@mui/icons-material";
import {
  getWardProfile,
  getWardSettings,
  updateWardSettings,
  updateWardProfile,
  storageUsage,
  resetWardData,
  getDashboardStats,
} from "@/services/mockWardAdmin";
// logout handled via unified auth.service
import { logoutUser } from "@/services/auth.service";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";

export default function ProfileTab({ wardId }: { wardId: string }) {
  useWardAdminStore();
  const router = useRouter();
  const profile = getWardProfile(wardId);
  const settings = getWardSettings(wardId);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showStorage, setShowStorage] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editPhone, setEditPhone] = useState(profile.phone);

  const usage = storageUsage(wardId);
  const stats = getDashboardStats(wardId);

  const toggle = (key: "notifications") => {
    updateWardSettings(wardId, { [key]: !settings[key] });
  };

  const saveProfile = () => {
    updateWardProfile(wardId, { phone: editPhone });
    setEditOpen(false);
  };

  const handleLogout = async () => {
    try {
      logoutUser();
    } catch {}
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.replace("/login");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A3E9E]">Profile</h1>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          Ward administrator account and office information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Ward Administrator */}
        <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#f0f1f4] px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#374151]">Ward Administrator</h2>
            <IconButton size="small" onClick={() => { setEditPhone(profile.phone); setEditOpen(true); }} sx={{ color: "#0A3E9E" }} aria-label="Edit profile">
              <EditOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          </div>
          <div className="flex items-center gap-4 px-5 py-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0A3E9E] text-2xl font-bold text-white">
              {profile.admin_name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>
            <div>
              <p className="text-xl font-bold text-[#0A3E9E]">{profile.admin_name}</p>
              <p className="text-sm text-[#6B7280]">{profile.role}</p>
              <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#374151]">
                <EmailOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} /> {profile.email}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#374151]">
                <PhoneOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} /> {profile.phone || "—"}
              </p>
            </div>
          </div>
        </section>
        <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
          <div className="border-b border-[#f0f1f4] px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#374151]">Office Information</h2>
          </div>
          <div className="divide-y divide-[#f0f1f4]">
            {[
              { icon: <AccountBalanceOutlined sx={{ fontSize: 17 }} />, label: "Municipality", value: profile.municipality },
              { icon: <BadgeOutlined sx={{ fontSize: 17 }} />, label: "Ward", value: `Ward ${profile.ward_id.replace("ward-", "")}` },
              { icon: <HistoryOutlined sx={{ fontSize: 17 }} />, label: "District", value: profile.district },
              { icon: <AccountBalanceOutlined sx={{ fontSize: 17 }} />, label: "Province", value: profile.province },
              { icon: <BadgeOutlined sx={{ fontSize: 17 }} />, label: "Role", value: profile.role },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
                <span className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <span className="text-[#9CA3AF]">{row.icon}</span> {row.label}
                </span>
                <span className="text-sm font-medium text-[#374151]">{row.value}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
          <div className="border-b border-[#f0f1f4] px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#374151]">Preferences</h2>
          </div>
          <div className="divide-y divide-[#f0f1f4]">
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="flex items-center gap-3 text-sm font-medium text-[#374151]">
                <NotificationsOutlined sx={{ fontSize: 20, color: "#0A3E9E" }} /> Notifications
              </span>
              <Switch checked={settings.notifications} onChange={() => toggle("notifications")} color="primary" />
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="flex items-center gap-3 text-sm font-medium text-[#374151]">
                <LanguageOutlined sx={{ fontSize: 20, color: "#0A3E9E" }} /> Language
              </span>
              <Button
                size="small"
                onClick={() => updateWardSettings(wardId, { language: settings.language === "en" ? "np" : "en" })}
                sx={{ textTransform: "none", color: "#0A3E9E", fontSize: 13 }}
              >
                {settings.language === "en" ? "English" : "नेपाली"}
              </Button>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="flex items-center gap-3 text-sm font-medium text-[#374151]">
                <DarkModeOutlined sx={{ fontSize: 20, color: "#0A3E9E" }} /> Theme
              </span>
              <Button
                size="small"
                onClick={() => updateWardSettings(wardId, { theme: settings.theme === "light" ? "dark" : "light" })}
                sx={{ textTransform: "none", color: "#0A3E9E", fontSize: 13 }}
              >
                {settings.theme === "light" ? "Light" : "Dark"}
              </Button>
            </div>
          </div>
        </section>

        {/* Storage */}
        <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
          <div className="border-b border-[#f0f1f4] px-5 py-4">
            <h2 className="text-[15px] font-bold text-[#374151]">Storage & Data</h2>
          </div>
          <div className="divide-y divide-[#f0f1f4]">
            <button type="button" onClick={() => setShowStorage(true)} className="flex w-full items-center justify-between px-5 py-3.5 hover:bg-[#F8F9FA]">
              <span className="flex items-center gap-3 text-sm font-medium text-[#374151]">
                <StorageOutlined sx={{ fontSize: 20, color: "#0A3E9E" }} /> Storage Usage
              </span>
              <span className="text-sm font-medium text-[#6B7280]">{(usage / 1024).toFixed(1)} KB</span>
            </button>
          </div>

          <Divider />
          <div className="flex flex-col gap-2 p-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="flex h-10 flex-1 items-center justify-center rounded-xl border border-[#EF4444]/40 bg-white text-sm font-semibold text-[#EF4444] transition-colors hover:bg-[#FEF2F2]"
            >
              Reset demo data
            </button>
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#EF4444] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#DC2626]"
            >
              <Logout sx={{ fontSize: 18 }} /> Logout
            </button>
          </div>
        </section>
      </div>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs" slotProps={{ paper: { sx: { borderRadius: "18px" } } }}>
        <DialogContent>
          <p className="text-base font-bold text-[#374151]">Edit Profile</p>
          <div className="mt-4 space-y-3">
            <TextField label="Full name" fullWidth size="small" value={profile.admin_name} disabled />
            <TextField label="Email" fullWidth size="small" value={profile.email} disabled />
            <TextField label="Phone" fullWidth size="small" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ textTransform: "none", color: "#6B7280" }}>Cancel</Button>
          <Button variant="contained" onClick={saveProfile} sx={{ textTransform: "none", borderRadius: "10px", bgcolor: "#0A3E9E", ":hover": { bgcolor: "#083078" } }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showStorage} onClose={() => setShowStorage(false)} slotProps={{ paper: { sx: { borderRadius: "16px", width: 340 } } }}>
        <DialogContent>
          <p className="text-base font-bold text-[#374151]">Storage Usage</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E6E8EE]">
            <div className="h-full rounded-full bg-[#0A3E9E]" style={{ width: `${Math.min((usage / 10240) * 100, 100)}%` }} />
          </div>
          <p className="mt-2 text-sm text-[#6B7280]">{(usage / 1024).toFixed(1)} KB used of ~10 MB budget (estimated)</p>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="rounded-xl bg-[#F8F9FA] p-3 text-center">
              <p className="text-xl font-bold text-[#0A3E9E]">{stats.registered_today}</p>
              <p className="text-[11px] text-[#6B7280]">Registered today</p>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowStorage(false)} sx={{ textTransform: "none", color: "#0A3E9E" }}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)} slotProps={{ paper: { sx: { borderRadius: "16px", width: 320 } } }}>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <p className="text-base font-semibold text-[#374151]">Reset demo data?</p>
          <p className="mt-1 text-sm text-[#6B7280]">All local changes will be discarded and re-seeded from the mock source.</p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmReset(false)} sx={{ textTransform: "none", color: "#6B7280" }}>Cancel</Button>
          <Button
            onClick={() => { resetWardData(wardId); setConfirmReset(false); }}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", borderRadius: "10px" }}
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout confirmation */}
      <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)} slotProps={{ paper: { sx: { borderRadius: "16px", width: 320 } } }}>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <p className="text-base font-semibold text-[#374151]">Log out of Ward {wardId.replace("ward-", "")}?</p>
          <p className="mt-1 text-sm text-[#6B7280]">Your local data stays on this device.</p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setConfirmLogout(false)} sx={{ textTransform: "none", color: "#6B7280" }}>Cancel</Button>
          <Button onClick={handleLogout} variant="contained" color="error" sx={{ textTransform: "none", borderRadius: "10px" }}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}