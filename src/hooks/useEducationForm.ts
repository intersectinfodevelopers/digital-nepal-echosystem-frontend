"use client";

import {
  EDUCATION_COMPLETED_STATUSES,
  EDUCATION_LEVEL_OPTIONS,
  EDUCATION_STATUS_OPTIONS,
  EDUCATION_TERMINATED_STATUSES,
  GRADING_SCALE_OPTIONS,
} from "@/constants";
import {
  EducationErrors,
  EducationFormData,
  SaveStatus,
  StoredDraft,
} from "@/types/education";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "prapti_education_draft_v1";
const AUTO_SAVE_DELAY_MS = 600;
const INSTITUTION_MIN = 3;

const MAX_LENGTHS: Partial<Record<keyof EducationFormData, number>> = {
  institution: 200,
  studyLocation: 120,
  degreeName: 160,
  faculty: 120,
  board: 160,
  major: 120,
  thesisArea: 200,
  currentYear: 40,
  grade: 8,
  discontinuationReason: 300,
};

type ErrorKey = keyof EducationErrors;

const ERROR_KEYS: ErrorKey[] = [
  "level",
  "status",
  "institution",
  "studyLocation",
  "completionDate",
  "discontinuationReason",
  "certificateAvailable",
];

export function createDefaultEducationData(): EducationFormData {
  return {
    level: "",
    status: "",
    institution: "",
    studyLocation: "",
    degreeName: "",
    faculty: "",
    board: "",
    major: "",
    thesisArea: "",
    startDate: "",
    completionDate: "",
    currentYear: "",
    grade: "",
    gradingScale: "",
    certificateAvailable: "",
    discontinuationReason: "",
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function toStored(data: EducationFormData): StoredDraft {
  return {
    level: data.level,
    status: data.status,
    institution: data.institution,
    studyLocation: data.studyLocation,
    degreeName: data.degreeName,
    faculty: data.faculty,
    board: data.board,
    major: data.major,
    thesisArea: data.thesisArea,
    startDate: data.startDate,
    completionDate: data.completionDate,
    currentYear: data.currentYear,
    grade: data.grade,
    gradingScale: data.gradingScale,
    certificateAvailable: data.certificateAvailable,
    discontinuationReason: data.discontinuationReason,
  };
}

function mergeDraft(
  stored: Partial<StoredDraft>,
  fallback: EducationFormData,
): EducationFormData {
  const levels = EDUCATION_LEVEL_OPTIONS.map((o) => o.value);
  const statuses = EDUCATION_STATUS_OPTIONS.map((o) => o.value);
  const gradingScales = GRADING_SCALE_OPTIONS.map((o) => o.value);

  const stringField = (key: keyof StoredDraft): string =>
    typeof stored[key] === "string" ? String(stored[key]) : "";

  return {
    level: levels.includes(String(stored.level))
      ? String(stored.level)
      : fallback.level,
    status: statuses.includes(String(stored.status))
      ? String(stored.status)
      : fallback.status,
    institution: stringField("institution").slice(0, MAX_LENGTHS.institution),
    studyLocation: stringField("studyLocation").slice(
      0,
      MAX_LENGTHS.studyLocation,
    ),
    degreeName: stringField("degreeName").slice(0, MAX_LENGTHS.degreeName),
    faculty: stringField("faculty").slice(0, MAX_LENGTHS.faculty),
    board: stringField("board").slice(0, MAX_LENGTHS.board),
    major: stringField("board").slice(0, MAX_LENGTHS.board),
    thesisArea: stringField("thesisArea").slice(0, MAX_LENGTHS.thesisArea),
    startDate: stringField("startDate"),
    completionDate: stringField("completionDate"),
    currentYear: stringField("currentYear").slice(0, MAX_LENGTHS.currentYear),
    grade: stringField("grade").slice(0, MAX_LENGTHS.grade),
    gradingScale: gradingScales.includes(String(stored.gradingScale))
      ? String(stored.gradingScale)
      : fallback.gradingScale,
    certificateAvailable: ["yes", "no"].includes(
      String(stored.certificateAvailable),
    )
      ? String(stored.certificateAvailable)
      : "",
    discontinuationReason: stringField("discontinuationReason").slice(
      0,
      MAX_LENGTHS.discontinuationReason,
    ),
  };
}

function loadDraft(): EducationFormData | null {
 if(typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    return mergeDraft(
      JSON.parse(raw) as Partial<StoredDraft>,
      createDefaultEducationData(),
    );
  } catch {
    return null;
  }
}

function persist(stored:StoredDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch  {
    return;
  }
}

export default function useEducationFormData() {
  const [data, setData] = useState<EducationFormData>(() => {
    const draft = loadDraft();
    return draft || createDefaultEducationData();
  });

  const [errors, setErrors] = useState<EducationErrors>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if(!dirtyRef.current) return;
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
    return() => {
      if (saveTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const setField = useCallback(
    <K extends keyof EducationFormData>(
      key:K,
      value:EducationFormData[K],
    ) => {
      dirtyRef.current = true;
      const max = MAX_LENGTHS[key];
      const nextValue = typeof value === "string" && max != null ? (value.slice(0, max) as EducationFormData[K]) : value;
      setData((prev) => ({...prev, [key]: nextValue})) ;
      if(ERROR_KEYS.includes(key as ErrorKey)) {
        setErrors((prev) => 
        prev[key as ErrorKey]
      ? {...prev, [key as ErrorKey]: undefined}
      : prev
      );
      }
    },
    [],
  );

  const validate = useCallback((): EducationErrors => {
    const errs: EducationErrors = {};

    if(!data.level) {
      errs.level = "Education Level is required.";

    }
    if(!data.status) {
      errs.status = "Education Status is required.";
    }
    if(!data.institution.trim()) {
      errs.institution = "Institution name is required.";
    } else if(data.institution.trim().length<INSTITUTION_MIN) {
      errs.institution = "Please enter a valid Institution name.";
    }
    if(!data.studyLocation.trim()){
      errs.studyLocation = "Study Location is required.";
    }

    const isCompleted = EDUCATION_COMPLETED_STATUSES.includes(data.status);
    if(isCompleted && !data.completionDate) {
      errs.completionDate = "please enter the completion date.";
    } else if(
      data.startDate &&
      data.completionDate &&
      data.completionDate <data.startDate
    ){
      errs.completionDate = "Completion date cannot be before start date.";
    }

    if(EDUCATION_TERMINATED_STATUSES.includes(data.status) && !data.discontinuationReason.trim()){
      errs.discontinuationReason ="Please provide a reason for discontinuation.";
    }
    return errs;

  }, [data]);


  const attemptProceed = useCallback(():boolean => {
   const errs = validate();
   setErrors(errs);
   if(Object.keys(errs).length > 0) {
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
    setField,
    setErrors,
    validate,
    attemptProceed,
    saveDraftNow,
  };
}



