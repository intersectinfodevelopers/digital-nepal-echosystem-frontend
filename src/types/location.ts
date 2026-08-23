export type LocationCaptureStatus =
  | "idle"
  | "requesting"
  | "captured"
  | "error"
  | "manual";

export type AccuracyLevel = "good" | "low" | "unknown";

export type DraftSaveStatus = "idle" | "saving" | "saved" | "error";

export interface LocationData {
  latitude: string;
  longitude: string;
  manualEntry: boolean;
  accuracy: number | null;
  accuracyLevel: AccuracyLevel;
}

export interface StoredLocationDraft {
  latitude: string;
  longitude: string;
  manualEntry: boolean;
  accuracy: number | null;
  accuracyLevel: AccuracyLevel;
  savedAt: string;
}

export interface LocationErrors {
  latitude?: string;
  longitude?: string;
}
