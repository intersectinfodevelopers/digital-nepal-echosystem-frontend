"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
} from "@mui/material";
import { Add, Search, Edit, Delete, Visibility, Download, FolderOffOutlined } from "@mui/icons-material";
import {
  getWardCitizens,
  getWardCitizen,
  updateWardCitizen,
  deleteWardCitizen,
} from "@/services/mockWardAdmin";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";

export default function CitizensTab({ wardId }: { wardId: string }) {
  useWardAdminStore();
  const citizens = getWardCitizens(wardId);

  const [search, setSearch] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState("");
  const [nameNp, setNameNp] = useState("");
  const [nid, setNid] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return citizens.filter((c) => {
      if (!q) return true;
      return (
        c.name_en.toLowerCase().includes(q) ||
        c.name_np.toLowerCase().includes(q) ||
        c.nid_masked.includes(q)
      );
    });
  }, [citizens, search]);

  const viewCitizen = viewId ? getWardCitizen(wardId, viewId) : undefined;
  const editCitizen = editId ? getWardCitizen(wardId, editId) : undefined;

  const handleEdit = () => {
    if (!editCitizen) return;
    updateWardCitizen(wardId, editCitizen.id, {
      name_en: nameEn || editCitizen.name_en,
      name_np: nameNp || editCitizen.name_np,
      nid_masked: nid ? `****${nid.slice(-4)}` : editCitizen.nid_masked,
    });
    setEditId(null);
  };

  const exportCsv = () => {
    const header = ["Name", "Name (Nepali)", "NID", "Ward", "Registered"];
    const rows = filtered.map((c) => [
      c.name_en,
      c.name_np,
      c.nid_masked,
      c.ward_id?.replace("ward-", "") ?? "",
      c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `citizens-ward-${wardId.replace("ward-", "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3E9E]">Citizens</h1>
          <p className="mt-0.5 text-[13px] text-[#6B7280]">
            Manage citizens registered within Ward {wardId.replace("ward-", "")}. {citizens.length} records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#0A3E9E] px-4 text-sm font-semibold text-[#0A3E9E] transition-colors hover:bg-[#E8EFFC]"
          >
            <Download sx={{ fontSize: 18 }} /> Export
          </button>
          <Link
            href="/portal/personal"
            className="flex h-10 items-center gap-1.5 rounded-xl bg-[#0A3E9E] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#083078]"
          >
            <Add sx={{ fontSize: 18 }} /> Register Citizen
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e6e8ee] bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            placeholder="Search by name or NID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#e6e8ee] bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-[#0A3E9E] focus:ring-2 focus:ring-[#0A3E9E]/15"
          />
          <Search sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        </div>
        <span className="text-xs text-[#9CA3AF]">{filtered.length} shown</span>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e6e8ee] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F8F9FA] text-[11px] uppercase tracking-wide text-[#6B7280]">
                <th className="px-5 py-3 font-semibold">Citizen</th>
                <th className="px-5 py-3 font-semibold">NID</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Ward</th>
                <th className="hidden px-5 py-3 font-semibold lg:table-cell">Registered</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f1f4]">
              {filtered.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-[#F8F9FA]">
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8EFFC] text-xs font-bold text-[#0A3E9E]">
                        {c.name_en.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </span>
                      <span>
                        <span className="block font-semibold text-[#374151]">{c.name_en}</span>
                        <span className="block text-xs text-[#9CA3AF]">{c.name_np}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-[#6B7280]">{c.nid_masked}</td>
                  <td className="hidden px-5 py-3.5 text-[#6B7280] md:table-cell">
                    {c.ward_id ? `Ward ${c.ward_id.replace("ward-", "")}` : "—"}
                  </td>
                  <td className="hidden px-5 py-3.5 text-[#6B7280] lg:table-cell">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <IconButton size="small" aria-label="View" onClick={() => setViewId(c.id)} sx={{ color: "#0A3E9E" }}>
                        <Visibility sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Edit"
                        onClick={() => { setEditId(c.id); setNameEn(c.name_en); setNameNp(c.name_np); }}
                        sx={{ color: "#F97316" }}
                      >
                        <Edit sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton size="small" aria-label="Delete" onClick={() => setDeleteId(c.id)} sx={{ color: "#EF4444" }}>
                        <Delete sx={{ fontSize: 18 }} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <FolderOffOutlined sx={{ fontSize: 40, color: "#9CA3AF" }} />
                    <p className="mt-2 text-sm font-medium text-[#374151]">No citizens found</p>
                    <p className="text-[13px] text-[#9CA3AF]">Try a different search or register a new citizen</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={viewCitizen !== undefined} onClose={() => setViewId(null)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "18px" } } }}>
        <DialogContent>
          {viewCitizen && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E8EFFC] text-lg font-bold text-[#0A3E9E]">
                  {viewCitizen.name_en.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-lg font-bold text-[#0A3E9E]">{viewCitizen.name_en}</p>
                  <p className="text-sm text-[#6B7280]">{viewCitizen.name_np}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#F8F9FA] p-3">
                  <p className="text-[11px] uppercase text-[#9CA3AF]">NID</p>
                  <p className="mt-0.5 font-medium text-[#374151]">{viewCitizen.nid_masked}</p>
                </div>
                <div className="rounded-xl bg-[#F8F9FA] p-3">
                  <p className="text-[11px] uppercase text-[#9CA3AF]">Tole</p>
                  <p className="mt-0.5 font-medium text-[#374151]">{viewCitizen.tole || "—"}</p>
                </div>
                <div className="rounded-xl bg-[#F8F9FA] p-3">
                  <p className="text-[11px] uppercase text-[#9CA3AF]">DOB</p>
                  <p className="mt-0.5 font-medium text-[#374151]">{viewCitizen.dob || "—"}</p>
                </div>
                <div className="rounded-xl bg-[#F8F9FA] p-3">
                  <p className="text-[11px] uppercase text-[#9CA3AF]">Phone</p>
                  <p className="mt-0.5 font-medium text-[#374151]">{viewCitizen.has_smartphone ? "Registered" : "—"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setViewId(null)} sx={{ textTransform: "none", color: "#0A3E9E" }}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editCitizen !== undefined} onClose={() => setEditId(null)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: "18px" } } }}>
        <DialogContent>
          <p className="text-base font-bold text-[#374151]">Edit Citizen</p>
          <div className="mt-4 space-y-3">
            <TextField label="Full name (English)" fullWidth size="small" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
            <TextField label="पूरा नाम (नेपाली)" fullWidth size="small" value={nameNp} onChange={(e) => setNameNp(e.target.value)} />
            <TextField label="NID (last 4 shown)" fullWidth size="small" value={nid} onChange={(e) => setNid(e.target.value)} />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditId(null)} sx={{ textTransform: "none", color: "#6B7280" }}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit} sx={{ textTransform: "none", borderRadius: "10px", bgcolor: "#0A3E9E", ":hover": { bgcolor: "#083078" } }}>Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} slotProps={{ paper: { sx: { borderRadius: "16px", width: 320 } } }}>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          <p className="text-base font-semibold text-[#374151]">Delete this citizen record?</p>
          <p className="mt-1 text-sm text-[#6B7280]">This action cannot be undone.</p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: "none", color: "#6B7280" }}>Cancel</Button>
          <Button
            onClick={() => { if (deleteId) deleteWardCitizen(wardId, deleteId); setDeleteId(null); }}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", borderRadius: "10px" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}