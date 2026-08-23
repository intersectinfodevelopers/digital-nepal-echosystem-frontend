"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EMPLOYER_REQUIRED_STATUSES,
  EMPLOYMENT_STATUS_OPTIONS,
  PAN_FORMAT,
  UploadStatus,
} from "@/constants";

import {
EMPTY_EMPLOYMENT_PROOF,
useEmploymentUpload
} from "./useEmploymentUpload"
import type {EmploymentFormData, PanStatus, StoredDraft, EmploymentErrors, SaveStatus} from "@/types/employment"

const STORAGE_KEY = "prapti_employment_draft_v1";
const PAN_SERVICE_UNAVAILABLE_VALUES = ["999999999"];
const PAN_VERIFY_DELAY_MS = 900;
const AUTO_SAVE_DELAY_MS = 600;

const PAN_STATUSES: PanStatus[] = [
  "idle",
  "loading",
  "verified",
  "invalid",
  "unavailable",
];


export function createDefaultEmploymentData(): EmploymentFormData {
  return {
    employmentStatus: EMPLOYMENT_STATUS_OPTIONS[0].value,
    monthlyIncome: "",
    employerName: "",
    panNumber: "",
    panStatus: "idle",
    proof: { ...EMPTY_EMPLOYMENT_PROOF },
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNpr(raw: string): string {
  if (!raw) return "";
  const n = Number(raw);
  if (Number.isNaN(n)) return raw;
  return new Intl.NumberFormat("en-IN").format(n);
}

function isValidPanStatus(value: unknown): value is PanStatus {
  return typeof value === "string" && PAN_STATUSES.includes(value as PanStatus);
}

function toStored(data: EmploymentFormData): StoredDraft {
  const proof =
    data.proof.status === UploadStatus.VERIFIED
      ? {
          name: data.proof.name ?? "document.pdf",
          type: data.proof.type ?? "",
          size: data.proof.size ?? 0,
          status: UploadStatus.VERIFIED,
        }
      : null;
  return {
    employmentStatus: data.employmentStatus,
    monthlyIncome: data.monthlyIncome,
    employerName: data.employerName,
    panNumber: data.panNumber,
    panStatus: data.panStatus,
    proof,
  };
}

function mergeDraft(
  stored: Partial<StoredDraft>,
  fallback: EmploymentFormData,
): EmploymentFormData {
  const statuses = EMPLOYMENT_STATUS_OPTIONS.map((o) => o.value);
  const employmentStatus = statuses.includes(String(stored.employmentStatus))
    ? String(stored.employmentStatus)
    : fallback.employmentStatus;
  const proof = stored.proof && stored.proof.status === UploadStatus.VERIFIED
    ? {
        status: UploadStatus.VERIFIED,
        name: stored.proof.name,
        type: stored.proof.type,
        size: stored.proof.size,
        previewUrl: null,
        progress: 100,
        error: null,
      }
    : { ...EMPTY_EMPLOYMENT_PROOF };
  return {
    employmentStatus,
    monthlyIncome:
      typeof stored.monthlyIncome === "string" ? stored.monthlyIncome : "",
    employerName:
      typeof stored.employerName === "string" ? stored.employerName : "",
    panNumber: typeof stored.panNumber === "string" ? stored.panNumber : "",
    panStatus: isValidPanStatus(stored.panStatus) ? stored.panStatus : "idle",
    proof,
  };
}

function loadDraft(): EmploymentFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    return mergeDraft(parsed, createDefaultEmploymentData());
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

export function useEmploymentForm() {
  const [data, setData] = useState<EmploymentFormData>(
    createDefaultEmploymentData,
  );
  const [errors, setErrors] = useState<EmploymentErrors>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const panTimerRef = useRef<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const dirtyRef = useRef(false);
  const hydratedRef = useRef(false);

  const upload = useEmploymentUpload(data.proof, (next) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, proof: next }));
  });

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const draft = loadDraft();
    if (draft) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(draft);
    }
  }, []);

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
      if (panTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(panTimerRef.current);
      }
      if (saveTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const updateStatus = useCallback((value: string) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, employmentStatus: value }));
    setErrors((prev) =>
      prev.employmentStatus || prev.employerName
        ? { ...prev, employmentStatus: undefined, employerName: undefined }
        : prev,
    );
  }, []);

  const setMonthlyIncome = useCallback((raw: string) => {
    dirtyRef.current = true;
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    setData((prev) => ({ ...prev, monthlyIncome: digits }));
    setErrors((prev) =>
      prev.monthlyIncome ? { ...prev, monthlyIncome: undefined } : prev,
    );
  }, []);

  const updateEmployer = useCallback((value: string) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, employerName: value }));
    setErrors((prev) =>
      prev.employerName ? { ...prev, employerName: undefined } : prev,
    );
  }, []);

  const setPanNumber = useCallback((raw: string) => {
    dirtyRef.current = true;
    if (panTimerRef.current !== null) {
      if (typeof window !== "undefined") {
        window.clearTimeout(panTimerRef.current);
      }
      panTimerRef.current = null;
    }
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    setData((prev) => ({
      ...prev,
      panNumber: digits,
      panStatus:
        digits.length === 0
          ? "idle"
          : digits.length === 9
            ? "loading"
            : "invalid",
    }));
    if (digits.length === 9) {
      panTimerRef.current = window.setTimeout(() => {
        setData((prev) =>
          prev.panNumber === digits
            ? {
                ...prev,
                panStatus: PAN_SERVICE_UNAVAILABLE_VALUES.includes(digits)
                  ? "unavailable"
                  : "verified",
              }
            : prev,
        );
      }, PAN_VERIFY_DELAY_MS);
    }
    setErrors((prev) =>
      prev.panNumber ? { ...prev, panNumber: undefined } : prev,
    );
  }, []);

  const isEmployerRequired = EMPLOYER_REQUIRED_STATUSES.includes(
    data.employmentStatus,
  );

  const formattedIncome = formatNpr(data.monthlyIncome);

  const validate = useCallback((): EmploymentErrors => {
    const errs: EmploymentErrors = {};
    if (!data.employmentStatus) {
      errs.employmentStatus = "Employment status is required.";
    }
    if (!data.monthlyIncome) {
      errs.monthlyIncome = "Monthly income is required.";
    } else if (!/^\d+$/.test(data.monthlyIncome)) {
      errs.monthlyIncome = "Enter a valid numeric amount.";
    }
    if (isEmployerRequired && !data.employerName.trim()) {
      errs.employerName = "Employer or business name is required.";
    }
    if (data.panNumber && !PAN_FORMAT.test(data.panNumber)) {
      errs.panNumber = "PAN must be exactly 9 digits.";
    }
    if (data.proof.status !== UploadStatus.VERIFIED) {
      errs.proof = data.proof.error ?? "Proof of income or employment is required.";
    }
    return errs;
  }, [data, isEmployerRequired]);

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
    formattedIncome,
    isEmployerRequired,
    upload,
    updateStatus,
    setMonthlyIncome,
    updateEmployer,
    setPanNumber,
    validate,
    attemptProceed,
  };
}
