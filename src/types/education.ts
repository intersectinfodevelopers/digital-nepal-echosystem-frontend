export type { SaveStatus } from "./common";

export interface EducationErrors {
  level?: string;
  status?: string;
  institution?: string;
  studyLocation?: string;
  completionDate?: string;
  discontinuationReason?: string;
  certificateAvailable?: string;
}

export interface EducationFormData {
  level: string;
  status: string;
  institution: string;
  studyLocation: string;
  degreeName: string;
  faculty: string;
  board: string;
  major: string;
  thesisArea: string;
  startDate: string;
  completionDate: string;
  currentYear: string;
  grade: string;
  gradingScale: string;
  certificateAvailable: string;
  discontinuationReason: string;
}

export interface StoredDraft {
  level: string;
  status: string;
  institution: string;
  studyLocation: string;
  degreeName: string;
  faculty: string;
  board: string;
  major: string;
  thesisArea: string;
  startDate: string;
  completionDate: string;
  currentYear: string;
  grade: string;
  gradingScale: string;
  certificateAvailable: string;
  discontinuationReason: string;
}

export interface EducationFieldDef {
  key: keyof EducationFormData;
  label: string;
  placeholder?: string;
  type?: "text" | "date" | "select";
  options?: Array<{ value: string; label: string }>;
}
