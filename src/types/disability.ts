export type { SaveStatus } from "./common";

export interface DisabilityErrors {
  disabilityType?: string;
  severityLevel?: string;
  affectedAreas?: string;
  certificateIssued?: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  certificateUpload?: string;
}

export interface DisabilityFormData {
  disabilityType: string;
  severityLevel: number;
  affectedAreas: string[];
  certificateIssued: boolean;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: string;
  certificateFileName: string;
}

export interface StoredDraft {
  disabilityType: string;
  severityLevel: number;
  affectedAreas: string[];
  certificateIssued: boolean;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: string;
  certificateFileName: string;
}
