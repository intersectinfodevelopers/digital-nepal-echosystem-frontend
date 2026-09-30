"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Add,
  Search,
  RestartAlt,
  VisibilityOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircle,
  MaleOutlined,
  FemaleOutlined,
  GroupsOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import Modal from "@/components/ui/Modal";
import { useCitizensFilter } from "@/hooks/useCitizensFilter";
import { EMPLOYMENT_CATEGORIES, SEXES } from "@/types/citizen";
import { EMPLOYMENT_CATEGORY_LABELS } from "@/constants";
import { Pagination } from "@/components/ui/Pagination";

type SexKey = "MALE" | "FEMALE" | "OTHER";

const SEX_CONFIG: Record<
  SexKey,
  { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  MALE: { label: "Male", icon: MaleOutlined, classes: "bg-[#DCE8F8] text-[#2A4D9B]" },
  FEMALE: { label: "Female", icon: FemaleOutlined, classes: "bg-[#E7C5EC] text-[#7B2D80]" },
  OTHER: { label: "Other", icon: PersonOutlined, classes: "bg-[#FDEED8] text-[#8A5A16]" },
};

const titleCase = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

export default function CitizensPage() {
  const {
    citizens,
    filtered,
    search,
    setSearch,
    nidSearch,
    setNidSearch,
    employmentFilter,
    setEmploymentFilter,
    sexFilter,
    setSexFilter,
    verifiedFilter,
    setVerifiedFilter,
    clearFilters,
    deleteCitizen,
  } = useCitizensFilter();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  void citizens;
  void nidSearch;
  void setNidSearch;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const stats = useMemo(() => {
    return filtered.reduce(
      (acc, c) => {
        if (c.sex === "MALE") acc.male += 1;
        else if (c.sex === "FEMALE") acc.female += 1;
        else acc.other += 1;
        return acc;
      },
      { male: 0, female: 0, other: 0 },
    );
  }, [filtered]);

  const verifiedCount = useMemo(
    () => filtered.filter((c) => c.nid_verified).length,
    [filtered],
  );

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteCitizen(deleteTarget.id);
    setDeleteTarget(null);
    setPage(1);
  }, [deleteCitizen, deleteTarget]);

  const employmentLabel = (value: string): string =>
    EMPLOYMENT_CATEGORY_LABELS[value] ?? titleCase(value);

  return (
    <div className="pb-6">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#101828]">Citizens</h1>
          <p className="mt-1.5 text-lg font-normal text-[#667085]">
            Manage and view all registered citizens in this ward
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              clearFilters();
              setVerifiedFilter("verified");
              setPage(1);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#138A42] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0F6E36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#138A42]/40"
          >
            <CheckCircle className="text-base" />
            Verified Records
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold">
              {verifiedCount}
            </span>
          </button>
          <Link
            href="/ward/dashboard/registercitizen"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4174C8] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2F5FAF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4174C8]/40"
          >
            <Add className="text-base" />
            Register Citizen
          </Link>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Citizens"
          value={filtered.length}
          bgClass="bg-[#F0F0F8]"
          iconBg="bg-[#DCE8F8]"
          icon={<GroupsOutlined className="text-lg text-[#2A4D9B]" />}
        />
        <StatCard
          label="Male"
          value={stats.male}
          bgClass="bg-[#EEF4EF]"
          iconBg="bg-[#CFE4D6]"
          icon={<MaleOutlined className="text-lg text-[#168A45]" />}
        />
        <StatCard
          label="Female"
          value={stats.female}
          bgClass="bg-[#F5E3E7]"
          iconBg="bg-[#F3D7E4]"
          icon={<FemaleOutlined className="text-lg text-[#B0357B]" />}
        />
        <StatCard
          label="Others"
          value={stats.other}
          bgClass="bg-[#F2E5D8]"
          iconBg="bg-[#EAD3B8]"
          icon={<PersonOutlined className="text-lg text-[#8A5A16]" />}
        />
      </div>

      {/* Table container */}
      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
        {/* Filter toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E1E6ED] bg-[#FAFBFC] p-4">
          <div className="relative min-w-[240px] flex-1 sm:max-w-[414px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-[#8B8F96]" />
            <input
              type="text"
              placeholder="Search by name, NID, or mobile number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-full border border-[#DCE3EC] bg-white pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#8B8F96] focus:border-[#4174C8] focus:outline-none focus:ring-2 focus:ring-[#4174C8]/20"
            />
          </div>

          <select
            value={employmentFilter}
            onChange={(e) => {
              setEmploymentFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-full border border-[#DCE3EC] bg-white px-4 text-sm text-[#8B8F96] focus:border-[#4174C8] focus:outline-none focus:ring-2 focus:ring-[#4174C8]/20"
          >
            <option value="">All Employment</option>
            {EMPLOYMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {employmentLabel(cat)}
              </option>
            ))}
          </select>

          <select
            value={sexFilter}
            onChange={(e) => {
              setSexFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-full border border-[#DCE3EC] bg-white px-4 text-sm text-[#8B8F96] focus:border-[#4174C8] focus:outline-none focus:ring-2 focus:ring-[#4174C8]/20"
          >
            <option value="">Gender</option>
            {SEXES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>

          <select
            value={verifiedFilter}
            onChange={(e) => {
              setVerifiedFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-full border border-[#DCE3EC] bg-white px-4 text-sm text-[#8B8F96] focus:border-[#4174C8] focus:outline-none focus:ring-2 focus:ring-[#4174C8]/20"
          >
            <option value="">NID Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>

          <button
            type="button"
            onClick={() => {
              clearFilters();
              setPage(1);
            }}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#DCE3EC] bg-white px-4 text-sm text-[#8B8F96] transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4174C8]/20"
          >
            <RestartAlt className="text-base" />
            Clear Filters
          </button>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="ml-auto h-10 rounded-full border border-[#DCE3EC] bg-white px-4 text-sm text-[#8B8F96] focus:border-[#4174C8] focus:outline-none focus:ring-2 focus:ring-[#4174C8]/20"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="h-[52px] bg-[#D9D9D9] text-left text-[13px] font-semibold text-[#111827]">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 accent-[#4176C8]"
                    aria-label="Select all citizens"
                  />
                </th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">NID/Citizenship</th>
                <th className="px-4 py-3">Employment</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => {
                const created = c.created_at ? String(c.created_at) : "";
                const createdDate = created.slice(0, 10).replaceAll("-", "/");
                const createdTime = created.slice(11, 16);
                const sexKey = String(c.sex ?? "OTHER").toUpperCase() as SexKey;
                const badge = SEX_CONFIG[sexKey] ?? SEX_CONFIG.OTHER;
                const BadgeIcon = badge.icon;
                return (
                  <tr key={c.id} className="border-b border-[#EAECF0] hover:bg-[#FAFAFA]">
                    <td className="px-4 py-8">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 accent-[#4174C8]"
                        aria-label={`Select ${c.name_en || c.name_np}`}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[13px] font-medium text-[#101828]">
                        {c.name_en || c.name_np || "—"}
                      </div>
                      {c.name_np && c.name_en ? (
                        <div className="text-xs text-[#667085]">{c.name_np}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-[13px] text-[#111827]">
                        {c.nid_masked || "—"}
                        <VisibilityOutlined className="text-[15px] text-[#8B8F96]" />
                      </div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-[#8B8F96]">
                        NID
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#475467]">
                      {c.employment_category ? employmentLabel(c.employment_category) : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${badge.classes}`}
                      >
                        <BadgeIcon className="text-[13px]" />
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[13px] text-[#101828]">{createdDate || "—"}</div>
                      {createdTime ? (
                        <div className="text-xs text-[#667085]">{createdTime}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      {c.nid_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#CBE8D6] px-2.5 py-1 text-xs font-medium text-[#27854A]">
                          <CheckCircle className="text-[13px]" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-[#FDE2E6] px-2.5 py-1 text-xs font-medium text-[#C0392B]">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/ward/citizens/${c.id}`}
                          className="inline-flex h-8 items-center gap-1 rounded-md bg-[#E8F0FB] px-2.5 text-xs font-medium text-[#2A4D9B] transition-colors hover:bg-[#D3E2F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4174C8]/30"
                        >
                          <VisibilityOutlined className="text-[15px]" />
                          View
                        </Link>
                        <Link
                          href={`/ward/dashboard/registercitizen?edit=${encodeURIComponent(c.id)}`}
                          className="inline-flex h-8 items-center gap-1 rounded-md bg-[#E8F0FB] px-2.5 text-xs font-medium text-[#2A4D9B] transition-colors hover:bg-[#D3E2F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4174C8]/30"
                        >
                          <EditOutlined className="text-[15px]" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({ id: c.id, name: c.name_en || c.name_np })
                          }
                          className="inline-flex h-8 items-center gap-1 rounded-md bg-[#FDE2E6] px-2.5 text-xs font-medium text-[#C0392B] transition-colors hover:bg-[#F9C8D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C0392B]/30"
                        >
                          <DeleteOutlined className="text-[15px]" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-[#667085]">
                    No citizens found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm text-[#667085]">
            Showing{" "}
            <span className="font-medium text-[#101828]">
              {filtered.length === 0
                ? 0
                : Math.min((page - 1) * pageSize + 1, filtered.length)}
              –{Math.min(page * pageSize, filtered.length)}
            </span>{" "}
            of {filtered.length} citizens
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Citizen?"
        size="sm"
      >
        <p className="text-sm text-[#475467]">
          Are you sure you want to delete this citizen record?
          {deleteTarget && (
            <>
              {" "}
              <span className="font-medium text-[#101828]">{deleteTarget.name}</span> will be
              removed from this ward&apos;s registry.
            </>
          )}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="h-10 rounded-lg border border-[#D9E1EC] bg-white px-5 text-sm font-medium text-[#344054] transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-10 rounded-lg bg-[#D92D20] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#B42318]"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({
  label,
  value,
  bgClass,
  iconBg,
  icon,
}: {
  label: string;
  value: number;
  bgClass: string;
  iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-xl px-5 py-4 ${bgClass}`}>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[15px] text-[#475467]">{label}</p>
        <p className="text-xl font-bold text-[#101828]">{value}</p>
      </div>
    </div>
  );
}
