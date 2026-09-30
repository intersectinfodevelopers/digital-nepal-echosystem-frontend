"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  KeyboardArrowDown,
  RestartAlt,
  ChevronLeft,
  ChevronRight,
  GroupOutlined,
  Male,
  Female,
  PersonOutlineOutlined,
  FolderOffOutlined,
} from "@mui/icons-material";
import {
  getWardCitizens,
  getWardCitizen,
  updateWardCitizen,
  deleteWardCitizen,
} from "@/services/mockWardAdmin";
import { useWardAdminStore } from "@/hooks/useWardAdminStore";
import type { Citizen } from "@/types/citizen";

const EMPLOYMENT_LABELS: Record<string, string> = {
  FARMER: "Farmer",
  GOVERNMENT: "Government",
  PRIVATE: "Private",
  BUSINESS: "Business",
  STUDENT: "Student",
  UNEMPLOYED: "Unemployed",
  FOREIGN_ABROAD: "Foreign Employment",
  HOMEMAKER: "Homemaker",
  RETIRED: "Retired",
  OTHER: "Other",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  let h = d.getHours();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`;
}

function GenderPill({ sex }: { sex: Citizen["sex"] }) {
  if (sex === "MALE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#DCE8FA] px-2.5 py-1 text-[11px] font-semibold text-[#2A5FB8]">
        <Male sx={{ fontSize: 13 }} /> Male
      </span>
    );
  }
  if (sex === "FEMALE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#E9C8E8] px-2.5 py-1 text-[11px] font-semibold text-[#A03BA0]">
        <Female sx={{ fontSize: 13 }} /> Female
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF0F4] px-2.5 py-1 text-[11px] font-semibold text-[#667085]">
      <PersonOutlineOutlined sx={{ fontSize: 13 }} /> Other
    </span>
  );
}

function StatusPill({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#D9F1E3] px-2.5 py-1 text-[11px] font-semibold text-[#168A45]">
      <CheckCircle sx={{ fontSize: 13 }} /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF0C7] px-2.5 py-1 text-[11px] font-semibold text-[#B54708]">
      Pending
    </span>
  );
}

const filterControlClass =
  "h-10 w-full appearance-none rounded-full border border-[#D9E1EC] bg-white pl-3.5 pr-8 text-[13px] text-[#667085] outline-none transition-colors focus:border-[#4176C8] focus:ring-2 focus:ring-[#4176C8]/15";

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="relative w-[150px] max-w-full">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={filterControlClass}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <KeyboardArrowDown
        sx={{ fontSize: 18 }}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3]"
      />
    </div>
  );
}

export default function CitizensTab({ wardId }: { wardId: string }) {
  useWardAdminStore();
  const citizens = getWardCitizens(wardId);

  const [search, setSearch] = useState("");
  const [employment, setEmployment] = useState("");
  const [gender, setGender] = useState("");
  const [verification, setVerification] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState("");
  const [nameNp, setNameNp] = useState("");
  const [nid, setNid] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return citizens.filter((c) => {
      if (q) {
        const matches =
          c.name_en.toLowerCase().includes(q) ||
          c.name_np.toLowerCase().includes(q) ||
          c.nid_masked.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (employment && (c.employment_category ?? "OTHER") !== employment) return false;
      if (gender && c.sex !== gender) return false;
      if (verification === "verified" && !c.nid_verified) return false;
      if (verification === "unverified" && c.nid_verified) return false;
      if (verifiedOnly && !c.nid_verified) return false;
      return true;
    });
  }, [citizens, search, employment, gender, verification, verifiedOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const stats = useMemo(() => {
    const male = citizens.filter((c) => c.sex === "MALE").length;
    const female = citizens.filter((c) => c.sex === "FEMALE").length;
    return {
      total: citizens.length,
      male,
      female,
      others: citizens.length - male - female,
    };
  }, [citizens]);

  const allPageSelected =
    pageRows.length > 0 && pageRows.every((c) => selected.has(c.id));

  const toggleAllOnPage = () => {
    const next = new Set(selected);
    if (allPageSelected) {
      pageRows.forEach((c) => next.delete(c.id));
    } else {
      pageRows.forEach((c) => next.add(c.id));
    }
    setSelected(next);
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleReveal = (id: string) => {
    const next = new Set(revealed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealed(next);
  };

  const clearFilters = () => {
    setSearch("");
    setEmployment("");
    setGender("");
    setVerification("");
    setVerifiedOnly(false);
    setPage(0);
  };

  const viewCitizen = viewId ? getWardCitizen(wardId, viewId) : undefined;
  const editCitizen = editId ? getWardCitizen(wardId, editId) : undefined;
  const deleteCitizen = deleteId ? getWardCitizen(wardId, deleteId) : undefined;

  const handleEdit = () => {
    if (!editCitizen) return;
    updateWardCitizen(wardId, editCitizen.id, {
      name_en: nameEn || editCitizen.name_en,
      name_np: nameNp || editCitizen.name_np,
      nid_masked: nid ? `****${nid.slice(-4)}` : editCitizen.nid_masked,
    });
    setEditId(null);
  };

  const statsCards = [
    {
      label: "Total Citizens",
      value: stats.total,
      bg: "bg-[#EEEEF6]",
      iconBg: "bg-white",
      iconColor: "#4176C8",
      icon: <GroupOutlined sx={{ fontSize: 20 }} />,
    },
    {
      label: "Male",
      value: stats.male,
      bg: "bg-[#EAF0EC]",
      iconBg: "bg-white",
      iconColor: "#168A45",
      icon: <Male sx={{ fontSize: 20 }} />,
    },
    {
      label: "Female",
      value: stats.female,
      bg: "bg-[#F1D9DE]",
      iconBg: "bg-white",
      iconColor: "#C2507B",
      icon: <Female sx={{ fontSize: 20 }} />,
    },
    {
      label: "Others",
      value: stats.others,
      bg: "bg-[#EBDAC8]",
      iconBg: "bg-white",
      iconColor: "#A9713A",
      icon: <PersonOutlineOutlined sx={{ fontSize: 20 }} />,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold leading-tight text-[#101828]">Citizens</h1>
          <p className="mt-1 text-[15px] font-normal text-[#98A2B3]">
            Manage and view all registered citizens in this ward
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            aria-pressed={verifiedOnly}
            onClick={() => {
              setVerifiedOnly((v) => !v);
              setPage(0);
            }}
            className={`flex h-10 items-center gap-1.5 rounded-[7px] px-4 text-sm font-semibold text-white transition-colors ${
              verifiedOnly
                ? "bg-[#0F6B33] hover:bg-[#0C592B]"
                : "bg-[#138A43] hover:bg-[#0F6B33]"
            }`}
          >
            <CheckCircle sx={{ fontSize: 18 }} /> Verified Records
          </button>
          <Link
            href="/ward/dashboard/registercitizen"
            className="flex h-10 items-center gap-1.5 rounded-[7px] bg-[#4176C8] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#3565AE]"
          >
            <Add sx={{ fontSize: 18 }} /> Register Citizen
          </Link>
        </div>
      </div>

      {/* Statistic cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className={`flex h-[86px] items-center gap-3 rounded-xl px-4 shadow-[0_1px_3px_rgba(16,24,40,0.06)] ${card.bg}`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}
              style={{ color: card.iconColor }}
            >
              {card.icon}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-[#475467]">
                {card.label}
              </span>
              <span className="block text-xl font-bold text-[#101828]">{card.value}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Citizen table container */}
      <section className="overflow-hidden rounded-t-xl rounded-b-xl border border-[#EAECF0] bg-white shadow-[0_1px_3px_rgba(16,24,40,0.08)]">
        {/* Filter toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 p-4">
          <div className="relative w-full lg:w-[415px]">
            <input
              type="search"
              placeholder="Search by name,NID,or mobile number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="h-10 w-full rounded-full border border-[#D9E1EC] bg-white py-2.5 pl-10 pr-3 text-sm text-[#344054] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#4176C8] focus:ring-2 focus:ring-[#4176C8]/15"
            />
            <Search
              sx={{ fontSize: 18 }}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]"
            />
          </div>

          <FilterSelect
            ariaLabel="Filter by employment"
            value={employment}
            onChange={(v) => {
              setEmployment(v);
              setPage(0);
            }}
            placeholder="All Employment"
            options={Object.entries(EMPLOYMENT_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <FilterSelect
            ariaLabel="Filter by gender"
            value={gender}
            onChange={(v) => {
              setGender(v);
              setPage(0);
            }}
            placeholder="Gender"
            options={[
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
              { value: "OTHER", label: "Other" },
            ]}
          />
          <FilterSelect
            ariaLabel="Filter by NID verification"
            value={verification}
            onChange={(v) => {
              setVerification(v);
              setPage(0);
            }}
            placeholder="NID Verification"
            options={[
              { value: "verified", label: "Verified" },
              { value: "unverified", label: "Unverified" },
            ]}
          />
          <button
            type="button"
            onClick={clearFilters}
            className="flex h-10 items-center gap-1.5 rounded-full border border-[#D9E1EC] bg-white px-4 text-[13px] font-medium text-[#667085] transition-colors hover:bg-[#F5F7FB] hover:text-[#344054]"
          >
            <RestartAlt sx={{ fontSize: 17 }} /> Clear Filters
          </button>
          <div className="relative ml-auto w-[110px]">
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className={filterControlClass}
            >
              {[5, 10, 25].map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
            <KeyboardArrowDown
              sx={{ fontSize: 18 }}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#D9D9D9] text-[13px] font-semibold text-[#101828]">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all on page"
                    checked={allPageSelected}
                    onChange={toggleAllOnPage}
                    className="h-4 w-4 cursor-pointer accent-[#4176C8]"
                  />
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">NID/Citizenship</th>
                <th className="px-4 py-3">Employment</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F4]">
              {pageRows.map((c) => {
                const isRevealed = revealed.has(c.id);
                const nidText = isRevealed && c.citizenship_number ? c.citizenship_number : c.nid_masked;
                return (
                  <tr key={c.id} className="transition-colors hover:bg-[#F8F9FC]">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${c.name_en}`}
                        checked={selected.has(c.id)}
                        onChange={() => toggleRow(c.id)}
                        className="h-4 w-4 cursor-pointer accent-[#4176C8]"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF1FD] text-[11px] font-bold text-[#4176C8]">
                          {c.name_en.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-[#101828]">
                            {c.name_en}
                          </span>
                          <span className="block truncate text-[11px] text-[#98A2B3]">{c.name_np}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="flex items-center gap-1.5">
                        <span className="font-mono text-[12px] text-[#344054]">{nidText}</span>
                        <button
                          type="button"
                          aria-label={isRevealed ? "Hide NID" : "Show NID"}
                          onClick={() => toggleReveal(c.id)}
                          className="text-[#98A2B3] transition-colors hover:text-[#4176C8]"
                        >
                          <Visibility sx={{ fontSize: 15 }} />
                        </button>
                      </span>
                      <span className="mt-0.5 block text-[10px] text-[#98A2B3]">
                        {isRevealed && c.citizenship_number ? "Citizenship" : "NID"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[12px] text-[#475467]">
                      {EMPLOYMENT_LABELS[c.employment_category ?? "OTHER"] ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <GenderPill sex={c.sex} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="block text-[12px] text-[#344054]">{fmtDate(c.created_at)}</span>
                      <span className="block text-[10px] text-[#98A2B3]">{fmtTime(c.created_at)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill verified={c.nid_verified} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`View ${c.name_en}`}
                          onClick={() => setViewId(c.id)}
                          className="flex h-[30px] items-center gap-1 rounded-lg bg-[#EAF1FD] px-2.5 text-[11px] font-semibold text-[#4176C8] transition-colors hover:bg-[#D7E5FA]"
                        >
                          <Visibility sx={{ fontSize: 14 }} /> View
                        </button>
                        <button
                          type="button"
                          aria-label={`Edit ${c.name_en}`}
                          onClick={() => {
                            setEditId(c.id);
                            setNameEn(c.name_en);
                            setNameNp(c.name_np);
                          }}
                          className="flex h-[30px] items-center gap-1 rounded-lg bg-[#EAF1FD] px-2.5 text-[11px] font-semibold text-[#4176C8] transition-colors hover:bg-[#D7E5FA]"
                        >
                          <Edit sx={{ fontSize: 14 }} /> Edit
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${c.name_en}`}
                          onClick={() => setDeleteId(c.id)}
                          className="flex h-[30px] items-center gap-1 rounded-lg bg-[#FDE2E6] px-2.5 text-[11px] font-semibold text-[#E5484D] transition-colors hover:bg-[#FBCFD6]"
                        >
                          <Delete sx={{ fontSize: 14 }} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <FolderOffOutlined sx={{ fontSize: 40, color: "#98A2B3" }} />
                    <p className="mt-2 text-sm font-medium text-[#344054]">No citizens found</p>
                    <p className="text-[13px] text-[#98A2B3]">
                      Try a different search or clear the filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#EAECF0] px-4 py-3.5 sm:flex-row">
          <p className="text-[12px] text-[#98A2B3]">
            {filtered.length === 0
              ? "No citizens to show"
              : `Showing ${safePage * pageSize + 1}-${Math.min(
                  (safePage + 1) * pageSize,
                  filtered.length,
                )} of ${filtered.length} citizens`}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous page"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D9E1EC] bg-white text-[#667085] transition-colors hover:bg-[#F5F7FB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft sx={{ fontSize: 18 }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
              <button
                key={p}
                type="button"
                aria-current={p === safePage ? "page" : undefined}
                onClick={() => setPage(p)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[13px] font-medium transition-colors ${
                  p === safePage
                    ? "bg-[#4176C8] text-white"
                    : "border border-[#D9E1EC] bg-white text-[#667085] hover:bg-[#F5F7FB]"
                }`}
              >
                {p + 1}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D9E1EC] bg-white text-[#667085] transition-colors hover:bg-[#F5F7FB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </section>

      {/* View dialog */}
      <Dialog
        open={viewCitizen !== undefined}
        onClose={() => setViewId(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: "18px" } } }}
      >
        <DialogContent>
          {viewCitizen && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF1FD] text-lg font-bold text-[#4176C8]">
                  {viewCitizen.name_en.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-lg font-bold text-[#101828]">{viewCitizen.name_en}</p>
                  <p className="text-sm text-[#667085]">{viewCitizen.name_np}</p>
                </div>
                <span className="ml-auto">
                  <StatusPill verified={viewCitizen.nid_verified} />
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#F8F9FC] p-3">
                  <p className="text-[11px] uppercase text-[#98A2B3]">NID</p>
                  <p className="mt-0.5 font-medium text-[#344054]">{viewCitizen.nid_masked}</p>
                </div>
                <div className="rounded-xl bg-[#F8F9FC] p-3">
                  <p className="text-[11px] uppercase text-[#98A2B3]">Tole</p>
                  <p className="mt-0.5 font-medium text-[#344054]">{viewCitizen.tole || "—"}</p>
                </div>
                <div className="rounded-xl bg-[#F8F9FC] p-3">
                  <p className="text-[11px] uppercase text-[#98A2B3]">DOB</p>
                  <p className="mt-0.5 font-medium text-[#344054]">{viewCitizen.dob || "—"}</p>
                </div>
                <div className="rounded-xl bg-[#F8F9FC] p-3">
                  <p className="text-[11px] uppercase text-[#98A2B3]">Employment</p>
                  <p className="mt-0.5 font-medium text-[#344054]">
                    {EMPLOYMENT_LABELS[viewCitizen.employment_category ?? "OTHER"] ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setViewId(null)} sx={{ textTransform: "none", color: "#4176C8" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={editCitizen !== undefined}
        onClose={() => setEditId(null)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: "18px" } } }}
      >
        <DialogContent>
          <p className="text-base font-bold text-[#344054]">Edit Citizen</p>
          <div className="mt-4 space-y-3">
            <TextField
              label="Full name (English)"
              fullWidth
              size="small"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
            <TextField
              label="पूरा नाम (नेपाली)"
              fullWidth
              size="small"
              value={nameNp}
              onChange={(e) => setNameNp(e.target.value)}
            />
            <TextField
              label="NID (last 4 shown)"
              fullWidth
              size="small"
              value={nid}
              onChange={(e) => setNid(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditId(null)} sx={{ textTransform: "none", color: "#667085" }}>
            Cancel
          </Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            sx={{ textTransform: "none", borderRadius: "10px", bgcolor: "#4176C8", ":hover": { bgcolor: "#3565AE" } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        slotProps={{ paper: { sx: { borderRadius: "16px", width: 360 } } }}
      >
        <DialogContent sx={{ textAlign: "center", py: 3.5 }}>
          <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#FDE2E6]">
            <Delete sx={{ fontSize: 22, color: "#E5484D" }} />
          </span>
          <p className="text-base font-semibold text-[#101828]">Delete Citizen?</p>
          <p className="mt-1 text-sm text-[#667085]">
            Are you sure you want to delete this citizen record?
          </p>
          {deleteCitizen ? (
            <p className="mt-2 text-[12px] font-medium text-[#98A2B3]">
              {deleteCitizen.name_en} · {deleteCitizen.nid_masked}
            </p>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteId(null)}
            sx={{ textTransform: "none", color: "#667085", borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (deleteId) deleteWardCitizen(wardId, deleteId);
              setDeleteId(null);
            }}
            variant="contained"
            sx={{ textTransform: "none", borderRadius: "8px", bgcolor: "#E5484D", ":hover": { bgcolor: "#D6363B" } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
