import type { UploadStatus } from "@/constants/index";

export type { SaveStatus } from "./common";

export type PanStatus =
  | "idle"
  | "loading"
  | "verified"
  | "invalid"
  | "unavailable";

export const PAN_STATUSES: PanStatus[] = [
  "idle",
  "loading",
  "verified",
  "invalid",
  "unavailable",
];

export interface EmploymentErrors {
  employmentStatus?: string;
  monthlyIncome?: string;
  employerName?: string;
  panNumber?: string;
  proof?: string;
}
export interface EmploymentProofState {
  status: UploadStatus;
  name: string | null;
  type: string | null;
  size: number | null;
  previewUrl: string | null;
  progress: number;
  error: string | null;
}




export interface EmploymentUpload {
  state: EmploymentProofState;
  isDragOver: boolean;
  browseRef: React.RefObject<HTMLInputElement | null>;
  cameraRef: React.RefObject<HTMLInputElement | null>;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenBrowse: () => void;
  onOpenCamera: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  remove: () => void;
}



export interface EmploymentFormData {
  employmentStatus: string;
  monthlyIncome: string;
  employerName: string;
  panNumber: string;
  panStatus: PanStatus;
  proof: EmploymentProofState;
}

export interface StoredProof {
  name: string;
  type: string;
  size: number;
  status: UploadStatus;
}

export interface StoredDraft {
  employmentStatus: string;
  monthlyIncome: string;
  employerName: string;
  panNumber: string;
  panStatus: PanStatus;
  proof: StoredProof | null;
}