"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AFFECTED_AREA_OPTIONS,
  DISABILITY_TYPE_OPTIONS,
  SEVERITY_LEVELS,
} from "@/constants";
import type { SaveStatus } from "@/types/common";
import type {
  DisabilityErrors,
  DisabilityFormData,
  StoredDraft,
} from "@/types/disability";

const STORAGE_KEY = "prapti_disability_draft_v1";
const AUTO_SAVE_DELAY_MS = 600;
const CERTIFICATE_NUMBER_MAX = 40;
const AUTHORITY_MAX = 120;

export function createDefaultDisabilityData(): DisabilityFormData {
  return {
    disabilityType: "",
    severityLevel: 0,
    affectedAreas: [],
    certificateIssued: true,
    certificateNumber: "",
    issuingAuthority: "",
    issueDate: "",
    certificateFileName: "",
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function toStored(data: DisabilityFormData): StoredDraft {
  return {
    disabilityType: data.disabilityType,
    severityLevel: data.severityLevel,
    affectedAreas: [...data.affectedAreas],
    certificateIssued: data.certificateIssued,
    certificateNumber: data.certificateNumber,
    issuingAuthority: data.issuingAuthority,
    issueDate: data.issueDate,
    certificateFileName: data.certificateFileName,
  };
}

function mergeDraft(
  stored: Partial<StoredDraft>,
  fallback: DisabilityFormData,
): DisabilityFormData {
  const types = DISABILITY_TYPE_OPTIONS.map((o) => o.value);
  const severityValues = SEVERITY_LEVELS.map((l) => l.value);
  const areaValues = AFFECTED_AREA_OPTIONS.map((o) => o.value);

  const severityLevel = Number(stored.severityLevel);
  const affectedAreas = Array.isArray(stored.affectedAreas)
    ? stored.affectedAreas.filter((area) => areaValues.includes(area))
    : [];

  return {
    disabilityType: types.includes(String(stored.disabilityType))
      ? String(stored.disabilityType)
      : fallback.disabilityType,
    severityLevel: Number.isInteger(severityLevel) &&
      severityValues.includes(severityLevel)
      ? severityLevel
      : fallback.severityLevel,
    affectedAreas: affectedAreas,
    certificateIssued:
      typeof stored.certificateIssued === "boolean"
        ? stored.certificateIssued
        : fallback.certificateIssued,
    certificateNumber:
      typeof stored.certificateNumber === "string"
        ? stored.certificateNumber.slice(0, CERTIFICATE_NUMBER_MAX)
        : fallback.certificateNumber,
    issuingAuthority:
      typeof stored.issuingAuthority === "string"
        ? stored.issuingAuthority.slice(0, AUTHORITY_MAX)
        : fallback.issuingAuthority,
    issueDate:
      typeof stored.issueDate === "string" ? stored.issueDate : "",
    certificateFileName:
      typeof stored.certificateFileName === "string"
        ? stored.certificateFileName
        : "",
  };
}

function loadDraft(): DisabilityFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return mergeDraft(
      JSON.parse(raw) as Partial<StoredDraft>,
      createDefaultDisabilityData(),
    );
  } catch {
    return null;
  }
}

function persist(stored: StoredDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    return;
  }
}

export function useDisabilityForm() {
  const [data, setData] = useState<DisabilityFormData>(() => {
    const draft = loadDraft();
    return draft || createDefaultDisabilityData();
  });
  const [errors, setErrors] = useState<DisabilityErrors>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const saveTimerRef = useRef<number | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!dirtyRef.current) return;
    setSaveStatus("saving");
    if (saveTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = typeof window !== "undefined" ? window.setTimeout(() => {
      persist(toStored(data));
      setSaveStatus("saved");
      setLastSaved(formatTime(new Date()));
    }, AUTO_SAVE_DELAY_MS) : null;
  }, [data]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const setDisabilityType = useCallback((value: string) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, disabilityType: value }));
    setErrors((prev) =>
      prev.disabilityType ? { ...prev, disabilityType: undefined } : prev,
    );
  }, []);

  const setSeverityLevel = useCallback((value: number) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, severityLevel: value }));
    setErrors((prev) =>
      prev.severityLevel ? { ...prev, severityLevel: undefined } : prev,
    );
  }, []);

  const toggleAffectedArea = useCallback((value: string) => {
    dirtyRef.current = true;
    setData((prev) => {
      const has = prev.affectedAreas.includes(value);
      const affectedAreas = has
        ? prev.affectedAreas.filter((area) => area !== value)
        : [...prev.affectedAreas, value];
      return { ...prev, affectedAreas };
    });
    setErrors((prev) =>
      prev.affectedAreas ? { ...prev, affectedAreas: undefined } : prev,
    );
  }, []);

  const setCertificateIssued = useCallback((issued: boolean) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, certificateIssued: issued }));
    setErrors((prev) =>
      prev.certificateIssued ? { ...prev, certificateIssued: undefined } : prev,
    );
  }, []);

  const setCertificateNumber = useCallback((raw: string) => {
    dirtyRef.current = true;
    setData((prev) => ({
      ...prev,
      certificateNumber: raw.slice(0, CERTIFICATE_NUMBER_MAX),
    }));
  }, []);

  const setIssuingAuthority = useCallback((raw: string) => {
    dirtyRef.current = true;
    setData((prev) => ({
      ...prev,
      issuingAuthority: raw.slice(0, AUTHORITY_MAX),
    }));
  }, []);

  const setIssueDate = useCallback((raw: string) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, issueDate: raw }));
  }, []);

  const setCertificateFileName = useCallback((fileName: string) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, certificateFileName: fileName }));
  }, []);

  const validate = useCallback((): DisabilityErrors => {
    const errs: DisabilityErrors = {};
    if (!data.disabilityType) {
      errs.disabilityType = "Please select a primary disability.";
    }
    if (data.affectedAreas.length === 0) {
      errs.affectedAreas = "Please select at least one affected area.";
    }
    if (data.certificateIssued && !data.certificateNumber.trim()) {
      errs.certificateNumber = "Please enter the certificate number.";
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

  const saveDraftNow = useCallback(() => {
    persist(toStored(data));
    setSaveStatus("saved");
    setLastSaved(formatTime(new Date()));
  }, [data]);

  return {
    data,
    errors,
    saveStatus,
    lastSaved,
    setDisabilityType,
    setSeverityLevel,
    toggleAffectedArea,
    setCertificateIssued,
    setCertificateNumber,
    setIssuingAuthority,
    setIssueDate,
    setCertificateFileName,
    validate,
    attemptProceed,
    saveDraftNow,
  };
}
