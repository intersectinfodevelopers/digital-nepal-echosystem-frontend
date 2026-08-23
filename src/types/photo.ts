export type PhotoStatus = "empty" | "uploading" | "valid";

export type DraftSaveStatus = "idle" | "saving" | "saved" | "error";

export interface PhotoRecord {
  previewUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fromCamera: boolean;
}

export interface StoredPhotoDraft {
  fileName: string | null;
  fileSize: number | null;
  fromCamera: boolean;
  dataUrl?: string | null;
  savedAt: string;
}

export interface PhotoAnalysisResult {
  ok: boolean;
  message?: string;
}