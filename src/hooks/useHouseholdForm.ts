"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HOUSEHOLD_OWNERSHIP_OPTIONS } from "@/constants";
import type { HouseholdFormData, StoredDraft, HouseholdErrors, SaveStatus } from "@/types/household";

const STORAGE_KEY = "prapti_household_draft_v1";
const AUTO_SAVE_DELAY_MS = 600;
const SC_DIGITS = 8;

export const DEFAULT_GPS = {
  latitude: "27.7172",
  longitude: "85.3240",
};

export function createDefaultHouseholdData(): HouseholdFormData {
  return {
    address: "",
    ownershipStatus: "",
    yearsAtResidence: "",
    roomCount: "",
    electricityScNumber: "",
    latitude: DEFAULT_GPS.latitude,
    longitude: DEFAULT_GPS.longitude,
  };
}

export function formatScNumber(digits: string): string {
  return digits ? `SC-${digits}` : "";
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function toStored(data: HouseholdFormData): StoredDraft {
  return {
    address: data.address,
    ownershipStatus: data.ownershipStatus,
    yearsAtResidence: data.yearsAtResidence,
    roomCount: data.roomCount,
    electricityScNumber: data.electricityScNumber,
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

function mergeDraft(
  stored: Partial<StoredDraft>,
  fallback: HouseholdFormData,
): HouseholdFormData {
  const statuses = HOUSEHOLD_OWNERSHIP_OPTIONS.map((o) => o.value);
  return {
    address: typeof stored.address === "string" ? stored.address : "",
    ownershipStatus: statuses.includes(String(stored.ownershipStatus))
      ? String(stored.ownershipStatus)
      : fallback.ownershipStatus,
    yearsAtResidence:
      typeof stored.yearsAtResidence === "string"
        ? stored.yearsAtResidence
        : "",
    roomCount: typeof stored.roomCount === "string" ? stored.roomCount : "",
    electricityScNumber:
      typeof stored.electricityScNumber === "string"
        ? stored.electricityScNumber
        : "",
    latitude:
      typeof stored.latitude === "string"
        ? stored.latitude
        : DEFAULT_GPS.latitude,
    longitude:
      typeof stored.longitude === "string"
        ? stored.longitude
        : DEFAULT_GPS.longitude,
  };
}

function loadDraft(): HouseholdFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return mergeDraft(
      JSON.parse(raw) as Partial<StoredDraft>,
      createDefaultHouseholdData(),
    );
  } catch {
    return null;
  }
}

function persist(stored: StoredDraft) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    return;
  }
}

export function useHouseholdForm() {
  const [data, setData] = useState<HouseholdFormData>(() => {
    const draft = loadDraft();
    return draft || createDefaultHouseholdData();
  });
  const [errors, setErrors] = useState<HouseholdErrors>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const saveTimerRef = useRef<number | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!dirtyRef.current) return;
    setSaveStatus("saving");
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      persist(toStored(data));
      setSaveStatus("saved");
      setLastSaved(formatTime(new Date()));
    }, AUTO_SAVE_DELAY_MS);
  }, [data]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const setAddress = useCallback((value: string) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, address: value.slice(0, 200) }));
    setErrors((prev) =>
      prev.address ? { ...prev, address: undefined } : prev,
    );
  }, []);

  const setOwnership = useCallback((value: string) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, ownershipStatus: value }));
    setErrors((prev) =>
      prev.ownershipStatus ? { ...prev, ownershipStatus: undefined } : prev,
    );
  }, []);

  const setYearsAtResidence = useCallback((raw: string) => {
    dirtyRef.current = true;
    const digits = raw.replace(/\D/g, "").slice(0, 3);
    setData((prev) => ({ ...prev, yearsAtResidence: digits }));
    setErrors((prev) =>
      prev.yearsAtResidence
        ? { ...prev, yearsAtResidence: undefined }
        : prev,
    );
  }, []);

  const setRoomCount = useCallback((raw: string) => {
    dirtyRef.current = true;
    const digits = raw.replace(/\D/g, "").slice(0, 3);
    setData((prev) => ({ ...prev, roomCount: digits }));
    setErrors((prev) =>
      prev.roomCount ? { ...prev, roomCount: undefined } : prev,
    );
  }, []);

  const setElectricitySc = useCallback((raw: string) => {
    dirtyRef.current = true;
    const digits = raw.replace(/\D/g, "").slice(0, SC_DIGITS);
    setData((prev) => ({ ...prev, electricityScNumber: digits }));
    setErrors((prev) =>
      prev.electricityScNumber
        ? { ...prev, electricityScNumber: undefined }
        : prev,
    );
  }, []);

  const setGps = useCallback((latitude: string, longitude: string) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, latitude, longitude }));
  }, []);

  const validate = useCallback((): HouseholdErrors => {
    const errs: HouseholdErrors = {};
    if (!data.address.trim()) {
      errs.address = "Primary residence address is required.";
    }
    if (!data.ownershipStatus) {
      errs.ownershipStatus = "Ownership status is required.";
    }
    if (!data.yearsAtResidence) {
      errs.yearsAtResidence = "Years at residence is required.";
    } else if (!/^\d+$/.test(data.yearsAtResidence)) {
      errs.yearsAtResidence = "Enter a valid number of years.";
    }
    if (!data.roomCount) {
      errs.roomCount = "Number of rooms is required.";
    } else if (!/^\d+$/.test(data.roomCount)) {
      errs.roomCount = "Enter a valid number of rooms.";
    }
    if (data.electricityScNumber && data.electricityScNumber.length !== SC_DIGITS) {
      errs.electricityScNumber = "SC number must be 8 digits after SC-.";
    }
    return errs;
  }, [data]);

  const attemptProceed = useCallback((): boolean => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      return false;
    }
    persist(toStored(data));
    setSaveStatus("saved");
    setLastSaved(formatTime(new Date()));
    return true;
  }, [data, validate]);

  return {
    data,
    errors,
    saveStatus,
    lastSaved,
    setAddress,
    setOwnership,
    setYearsAtResidence,
    setRoomCount,
    setElectricitySc,
    setGps,
    validate,
    attemptProceed,
  };
}
