import { useState, useMemo } from "react";
import type { Citizen } from "@/types/citizen";
import citizensStatic from "../../data/citizens.json";
import { WARD_ID } from "@/constants";

const STATIC_CITIZENS = citizensStatic as unknown as Citizen[];

export function useCitizensFilter() {
  const [registered] = useState<Citizen[]>(() => {
    try {
      const raw = localStorage.getItem("citizens_registered");
      if (raw) return JSON.parse(raw) as Citizen[];
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
