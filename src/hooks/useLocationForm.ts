"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AccuracyLevel,
  DraftSaveStatus,
  LocationCaptureStatus,
  LocationData,
  LocationErrors,
  StoredLocationDraft,
} from "@/types/location";

const STORAGE_KEY = "prapti_location_draft_v1";
const AUTO_SAVE_DELAY_MS = 600;

const EMPTY_DATA: LocationData = {
  latitude: "",
  longitude: "",
  manualEntry: false,
  accuracy: null,
  accuracyLevel: "unknown",
};

function loadDraft(): StoredLocationDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredLocationDraft;
  } catch {
    return null;
  }
}

function persistDraft(draft: StoredLocationDraft): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function classifyAccuracy(meters: number): AccuracyLevel {
  if (meters <= 30) return "good";
  if (meters <= 100) return "low";
  return "unknown";
}

export function useLocationForm() {
  const [data, setData] = useState<LocationData>(() => {
    const draft = loadDraft();
    if (!draft) return EMPTY_DATA;
    return {
      latitude: draft.latitude,
      longitude: draft.longitude,
      manualEntry: draft.manualEntry,
      accuracy: draft.accuracy ?? null,
      accuracyLevel: draft.accuracyLevel ?? "unknown",
    };
  });

  const [captureStatus, setCaptureStatus] = useState<LocationCaptureStatus>(
    () => (loadDraft()?.latitude ? "captured" : "idle"),
  );
  const [errors, setErrors] = useState<LocationErrors>({});
  const [saveStatus, setSaveStatus] = useState<DraftSaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const dirtyRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const persistCurrent = useCallback((current: LocationData) => {
    setSaveStatus("saving");
    const stored: StoredLocationDraft = {
      latitude: current.latitude,
      longitude: current.longitude,
      manualEntry: current.manualEntry,
      accuracy: current.accuracy,
      accuracyLevel: current.accuracyLevel,
      savedAt: new Date().toISOString(),
    };
    const ok = persistDraft(stored);
    if (ok) {
      setSaveStatus("saved");
      setLastSaved(formatTime(new Date()));
    } else {
      setSaveStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!dirtyRef.current) return;
    if (typeof window !== "undefined" && saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = typeof window !== "undefined" ? window.setTimeout(() => {
      persistCurrent(data);
    }, AUTO_SAVE_DELAY_MS) : null;
    return () => {
      if (typeof window !== "undefined" && saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [data, persistCurrent]);

  const setLatitude = useCallback((value: string) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, latitude: value }));
    setErrors((prev) => ({ ...prev, latitude: undefined }));
  }, []);

  const setLongitude = useCallback((value: string) => {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, longitude: value }));
    setErrors((prev) => ({ ...prev, longitude: undefined }));
  }, []);

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setCaptureStatus("error");
      setErrors({
        latitude: "Geolocation is not supported by your browser.",
      });
      return;
    }

    setCaptureStatus("requesting");
    setErrors({});

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const accuracy = Math.round(position.coords.accuracy);
        const level = classifyAccuracy(accuracy);
        dirtyRef.current = true;
        setData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          manualEntry: false,
          accuracy,
          accuracyLevel: level,
        }));
        setCaptureStatus("captured");
      },
      () => {
        setCaptureStatus("error");
        setErrors({
          latitude:
            "Unable to retrieve your location. Please allow location access or enter manually.",
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  const enableManualEntry = useCallback(() => {
    dirtyRef.current = true;
    setData((prev) => ({
      ...prev,
      manualEntry: true,
      accuracy: null,
      accuracyLevel: "unknown",
    }));
    setCaptureStatus("manual");
    setErrors({});
  }, []);

  const setCoords = useCallback((lat: number, lng: number) => {
    dirtyRef.current = true;
    setData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      manualEntry: true,
      accuracy: null,
      accuracyLevel: "unknown",
    }));
    setCaptureStatus("manual");
    setErrors({});
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: LocationErrors = {};

    if (!data.latitude.trim()) {
      newErrors.latitude = "Latitude is required.";
    } else {
      const lat = parseFloat(data.latitude);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = "Latitude must be between -90 and 90.";
      }
    }

    if (!data.longitude.trim()) {
      newErrors.longitude = "Longitude is required.";
    } else {
      const lng = parseFloat(data.longitude);
      if (Number.isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = "Longitude must be between -180 and 180.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  const canProceed =
    data.latitude.trim() !== "" && data.longitude.trim() !== "";

  const saveDraftNow = useCallback(() => {
    persistCurrent(data);
  }, [data, persistCurrent]);

  return {
    data,
    captureStatus,
    errors,
    saveStatus,
    lastSaved,
    canProceed,
    setLatitude,
    setLongitude,
    captureLocation,
    enableManualEntry,
    setCoords,
    validate,
    saveDraftNow,
  };
}
