import { useState, useMemo } from "react";
import type { Citizen } from "@/types/citizen";
import citizensStatic from "../../data/citizens.json";
import { WARD_ID } from "@/constants";

const STATIC_CITIZENS = citizensStatic as unknown as Citizen[];

const EMP_LABEL_TO_CATEGORY: Record<string, string> = {
  "Government": "GOVERNMENT",
  "Public enterprise / Semi-government": "GOVERNMENT",
  "Private sector": "PRIVATE",
  "Self-employed / Business owner": "BUSINESS",
  "Freelance / Contract": "PRIVATE",
  "Daily wage / Labour": "OTHER",
  "Agriculture / Farming": "FARMER",
  "Foreign employment": "FOREIGN_ABROAD",
  "Unemployed": "UNEMPLOYED",
  "Student": "STUDENT",
  "Homemaker": "HOMEMAKER",
  "Retired": "RETIRED",
};

// Records saved by the unified registration wizard may be missing the
// list-shaped fields (name_np, nid_masked, employment_category). Backfill them
// from the embedded `registration` payload so the table renders and filters.
function normalizeRegistered(raw: unknown): Citizen {
  const c = raw as Record<string, unknown>;
  const reg = (c.registration ?? {}) as Record<string, unknown>;
  const nidNumber = String(c.nid_number ?? reg.nidNumber ?? "");
  const citizenshipNumber = String(c.citizenship_number ?? reg.citizenshipNumber ?? "");
  const empStatus = String(
    (Array.isArray(reg.employmentRecords) && (reg.employmentRecords[0] as Record<string, unknown> | undefined)?.status) || "",
  );
  return {
    ...(c as unknown as Citizen),
    name_en: String(c.name_en ?? reg.fullName ?? ""),
    name_np: String(c.name_np ?? reg.fullNameDevnagari ?? c.name_en ?? reg.fullName ?? ""),
    sex: (String(c.sex ?? reg.gender ?? "OTHER").toUpperCase() as Citizen["sex"]),
    nid_masked: String(
      c.nid_masked ??
        (nidNumber ? `****${nidNumber.slice(-4)}` : citizenshipNumber ? `CTZ ${citizenshipNumber}` : "**********"),
    ),
    employment_category: (c.employment_category ??
      EMP_LABEL_TO_CATEGORY[empStatus] ??
      "OTHER") as Citizen["employment_category"],
    nid_verified: Boolean(c.nid_verified),
  };
}

export function useCitizensFilter() {
  const [registered, setRegistered] = useState<Citizen[]>(() => {
    try {
      const raw = localStorage.getItem("citizens_registered");
      if (raw) return (JSON.parse(raw) as unknown[]).map(normalizeRegistered);
    } catch {
      // ignore
    }
    return [];
  });

  // Static seed records are read-only, so deletions are tracked as tombstones.
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("citizens_deleted");
      if (raw) return new Set(JSON.parse(raw) as string[]);
    } catch {
      // ignore
    }
    return new Set();
  });

  const wardCitizens = useMemo(() => {
    return [...STATIC_CITIZENS, ...registered].filter(
      (c) => c.ward_id === WARD_ID && !deletedIds.has(c.id),
    );
  }, [registered, deletedIds]);

  const [search, setSearch] = useState("");
  const [nidSearch, setNidSearch] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");

  const filtered = useMemo(() => {
    return wardCitizens.filter((c: Citizen) => {
      if (search) {
        const q = search.toLowerCase();
        const haystack = [
          c.name_np,
          c.name_en,
          c.nid_masked,
          c.citizenship_number ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) {
          return false;
        }
      }
      if (nidSearch && !c.nid_masked.endsWith(nidSearch)) {
        return false;
      }
      if (employmentFilter && c.employment_category !== employmentFilter) {
        return false;
      }
      if (sexFilter && c.sex !== sexFilter) {
        return false;
      }
      if (verifiedFilter === "verified" && !c.nid_verified) {
        return false;
      }
      if (verifiedFilter === "unverified" && c.nid_verified) {
        return false;
      }
      return true;
    });
  }, [
    wardCitizens,
    search,
    nidSearch,
    employmentFilter,
    sexFilter,
    verifiedFilter,
  ]);

  const clearFilters = () => {
    setSearch("");
    setNidSearch("");
    setEmploymentFilter("");
    setSexFilter("");
    setVerifiedFilter("");
  };

  const deleteCitizen = (id: string) => {
    const isRegistered = registered.some((c) => c.id === id);
    if (isRegistered) {
      try {
        const raw = localStorage.getItem("citizens_registered");
        const list = raw ? (JSON.parse(raw) as unknown[]) : [];
        localStorage.setItem(
          "citizens_registered",
          JSON.stringify(
            list.filter((c) => (c as { id?: string }).id !== id),
          ),
        );
      } catch {
        // ignore
      }
      setRegistered((prev) => prev.filter((c) => c.id !== id));
    } else {
      try {
        const raw = localStorage.getItem("citizens_deleted");
        const ids: string[] = raw ? (JSON.parse(raw) as string[]) : [];
        if (!ids.includes(id)) {
          localStorage.setItem("citizens_deleted", JSON.stringify([...ids, id]));
        }
      } catch {
        // ignore
      }
      setDeletedIds((prev) => new Set(prev).add(id));
    }
  };

  return {
    citizens: wardCitizens,
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
  };
}
