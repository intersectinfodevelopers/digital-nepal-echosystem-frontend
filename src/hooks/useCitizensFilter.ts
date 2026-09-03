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
  const [registered] = useState<Citizen[]>(() => {
    try {
      const raw = localStorage.getItem("citizens_registered");
      if (raw) return (JSON.parse(raw) as unknown[]).map(normalizeRegistered);
    } catch {
      // ignore
    }
    return [];
  });

  const wardCitizens = useMemo(() => {
    return [...STATIC_CITIZENS, ...registered].filter(
      (c) => c.ward_id === WARD_ID,
    );
  }, [registered]);

  const [search, setSearch] = useState("");
  const [nidSearch, setNidSearch] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");

  const filtered = useMemo(() => {
    return wardCitizens.filter((c: Citizen) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.name_np.toLowerCase().includes(q) &&
          !c.name_en.toLowerCase().includes(q)
        ) {
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

  return {
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
  };
}
