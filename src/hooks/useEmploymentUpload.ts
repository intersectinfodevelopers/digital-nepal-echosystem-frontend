"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACCEPTED_DOCUMENT_TYPES,
  DocumentMimeType,
  UploadStatus,
} from "@/constants";

import type { EmploymentProofState, EmploymentUpload } from "@/types/employment";

const MAX_SIZE = 5 * 1024 * 1024;

function revokeUrl(url: string | null) {
  if (url && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      return;
    }
  }
}

export const EMPTY_EMPLOYMENT_PROOF: EmploymentProofState = {
  status: UploadStatus.EMPTY,
  name: null,
  type: null,
  size: null,
  previewUrl: null,
  progress: 0,
  error: null,
};

export function useEmploymentUpload(
  value?: EmploymentProofState,
  onChange?: (next: EmploymentProofState) => void,
): EmploymentUpload {
  const [internal, setInternal] = useState<EmploymentProofState>(
    value ?? EMPTY_EMPLOYMENT_PROOF,
  );
  const state = value ?? internal;

  const setState = useCallback(
    (next: EmploymentProofState) => {
      if (onChange) {
        onChange(next);
      } else {
        setInternal(next);
      }
    },
    [onChange],
  );

  const [isDragOver, setIsDragOver] = useState(false);
  const browseRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | null>(null);
  const urlRef = useRef<string | null>(null);
  const baseRef = useRef<EmploymentProofState>(EMPTY_EMPLOYMENT_PROOF);

  const cleanTimer = useCallback(() => {
    if (intervalRef.current !== null && typeof window !== "undefined") {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanTimer();
      revokeUrl(urlRef.current);
    };
  }, [cleanTimer]);

  const beginUpload = useCallback(
    (file: File) => {
      const type = file.type as DocumentMimeType;
      if (!ACCEPTED_DOCUMENT_TYPES.includes(type)) {
        setState({
          ...EMPTY_EMPLOYMENT_PROOF,
          error: "Unsupported file type. Use JPG, PNG or PDF.",
        });
        return;
      }
      if (file.size > MAX_SIZE) {
        setState({
          ...EMPTY_EMPLOYMENT_PROOF,
          error: "File exceeds the 5 MB maximum size.",
        });
        return;
      }

      cleanTimer();
      revokeUrl(urlRef.current);
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      let progress = 0;

      baseRef.current = {
        status: UploadStatus.UPLOADING,
        name: file.name,
        type: file.type,
        size: file.size,
        previewUrl: url,
        progress: 0,
        error: null,
      };
      setState(baseRef.current);

      intervalRef.current = typeof window !== "undefined" ? window.setInterval(() => {
        progress = Math.min(100, progress + 20 + Math.random() * 20);
        setState({ ...baseRef.current, progress });
        if (progress >= 100) {
          if (intervalRef.current !== null && typeof window !== "undefined") {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setState({
            ...baseRef.current,
            status: UploadStatus.VERIFIED,
            progress: 100,
          });
        }
      }, 160) : null;
    },
    [cleanTimer, setState],
  );

  const onFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) beginUpload(file);
      e.target.value = "";
    },
    [beginUpload],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) beginUpload(file);
    },
    [beginUpload],
  );

  const onOpenBrowse = useCallback(() => {
    browseRef.current?.click();
  }, []);

  const onOpenCamera = useCallback(() => {
    cameraRef.current?.click();
  }, []);

  const remove = useCallback(() => {
    cleanTimer();
    revokeUrl(urlRef.current);
    urlRef.current = null;
    setState(EMPTY_EMPLOYMENT_PROOF);
  }, [cleanTimer, setState]);

  return {
    state,
    isDragOver,
    browseRef,
    cameraRef,
    onFile,
    onOpenBrowse,
    onOpenCamera,
    onDragOver,
    onDragLeave,
    onDrop,
    remove,
  };
}
