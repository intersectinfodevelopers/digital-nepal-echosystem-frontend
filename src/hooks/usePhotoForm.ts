"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import type {
  DraftSaveStatus,
  PhotoRecord,
  PhotoStatus,
  StoredPhotoDraft,
} from "@/types/photo";

const STORAGE_KEY = "prapti_photo_draft_v1";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png"];
const AUTO_SAVE_DELAY_MS = 600;
const STORABLE_DATA_URL_THRESHOLD = 2 * 1024 * 1024;
const PROGRESS_EVERY_MS = 160;

const EMPTY_PHOTO: PhotoRecord = {
  previewUrl: null,
  fileName: null,
  fileSize: null,
  fromCamera: false,
};

export function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function readToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the file"));
    reader.readAsDataURL(file);
  });
}

function loadDraft(): StoredPhotoDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredPhotoDraft;
  } catch {
    return null;
  }
}

function persistDraft(draft: StoredPhotoDraft): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function usePhotoForm() {
  const [photo, setPhoto] = useState<PhotoRecord>(() => {
    const draft = loadDraft();
    if (!draft) return EMPTY_PHOTO;
    return {
      previewUrl: draft.dataUrl ?? null,
      fileName: draft.fileName,
      fileSize: draft.fileSize,
      fromCamera: draft.fromCamera,
    };
  });
  const [status, setStatus] = useState<PhotoStatus>(() =>
    loadDraft() ? "valid" : "empty",
  );
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saveStatus, setSaveStatus] = useState<DraftSaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const browseInputRef = useRef<HTMLInputElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const dirtyRef = useRef(false);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current !== null && typeof window !== "undefined") {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const revokeUrl = useCallback(() => {
    if (objectUrlRef.current && objectUrlRef.current.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(objectUrlRef.current);
      } catch {
        /* noop */
      }
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearProgressTimer();
      revokeUrl();
      if (saveTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [clearProgressTimer, revokeUrl]);

  const persistCurrent = useCallback(async (current: PhotoRecord) => {
    setSaveStatus("saving");
    const stored: StoredPhotoDraft = {
      fileName: current.fileName,
      fileSize: current.fileSize,
      fromCamera: current.fromCamera,
      savedAt: new Date().toISOString(),
    };
    const dataUrl = current.previewUrl?.startsWith("data:")
      ? current.previewUrl
      : null;
    if (
      current.previewUrl &&
      !dataUrl &&
      current.fileSize &&
      current.fileSize < STORABLE_DATA_URL_THRESHOLD
    ) {
      try {
        const res = await fetch(current.previewUrl);
        const blob = await res.blob();
        const file = new File([blob], current.fileName ?? "photo.jpg", {
          type: blob.type,
        });
        stored.dataUrl = await readToDataUrl(file);
      } catch {
        stored.dataUrl = null;
      }
    }
    stored.dataUrl = dataUrl ?? stored.dataUrl;
    const ok = persistDraft(stored);
    if (ok) {
      setSaveStatus("saved");
      setLastSaved(formatTime(new Date()));
    } else {
      setSaveStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!dirtyRef.current || status === "uploading") return;
    if (saveTimerRef.current !== null && typeof window !== "undefined") {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = typeof window !== "undefined" ? window.setTimeout(() => {
      void persistCurrent(photo);
    }, AUTO_SAVE_DELAY_MS) : null;
    return () => {
      if (saveTimerRef.current !== null && typeof window !== "undefined") {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [photo, status, persistCurrent]);

  const setPhotoValid = useCallback((record: PhotoRecord) => {
    dirtyRef.current = true;
    setPhoto(record);
    setStatus("valid");
    setError(null);
  }, []);

  const finishUpload = useCallback(
    async (record: PhotoRecord) => {
      if (!record.previewUrl) return;
      setPhotoValid(record);
    },
    [setPhotoValid],
  );

  const beginUpload = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
        setError("Unsupported file format. Use JPG or PNG.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("File size exceeds 5MB. Please choose a smaller image.");
        return;
      }

      clearProgressTimer();
      revokeUrl();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      let value = 0;

      setProgress(0);
      setStatus("uploading");
      setPhoto({
        previewUrl: url,
        fileName: file.name,
        fileSize: file.size,
        fromCamera: false,
      });

      progressTimerRef.current = typeof window !== "undefined" ? window.setInterval(() => {
        value = Math.min(100, value + 22 + Math.random() * 18);
        setProgress(value);
        if (value >= 100) {
          if (progressTimerRef.current !== null && typeof window !== "undefined") {
            window.clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
          }
          void finishUpload({
            previewUrl: url,
            fileName: file.name,
            fileSize: file.size,
            fromCamera: false,
          });
        }
      }, PROGRESS_EVERY_MS) : null;
    },
    [clearProgressTimer, revokeUrl, finishUpload],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) beginUpload(file);
      e.target.value = "";
    },
    [beginUpload],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) beginUpload(file);
    },
    [beginUpload],
  );

  const handleOnDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOver(true);
  }, []);

  const handleOnDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleRemove = useCallback(() => {
    clearProgressTimer();
    revokeUrl();
    setPhoto(EMPTY_PHOTO);
    setStatus("empty");
    setError(null);
    setProgress(0);
    dirtyRef.current = true;
  }, [clearProgressTimer, revokeUrl]);

  const saveDraftNow = useCallback(() => {
    if (photo.previewUrl) {
      void persistCurrent(photo);
    } else {
      const ok = persistDraft({
        fileName: null,
        fileSize: null,
        fromCamera: false,
        savedAt: new Date().toISOString(),
      });
      if (ok) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    }
  }, [photo, persistCurrent]);

  const showProceedError = useCallback(() => {
    setError("A citizen photograph is required before continuing.");
  }, []);

  return {
    photo,
    status,
    progress,
    error,
    dragOver,
    saveStatus,
    lastSaved,
    canProceed: status === "valid",
    browseInputRef,
    persistCurrent,
    saveDraftNow,
    removePhoto: handleRemove,
    onFileChange: handleFileChange,
    openPicker: () => browseInputRef.current?.click(),
    onDrop: handleDrop,
    onDragOver: handleOnDragOver,
    onDragLeave: handleOnDragLeave,
    showProceedError,
  };
}