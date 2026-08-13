"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACCEPTED_DOCUMENT_TYPES,
  DocumentMimeType,
  UploadStatus,
} from "@/constants";
import type { PanelState, DocumentUpload } from "@/types/document";

const EMPTY_PANEL: PanelState = {
  status: UploadStatus.EMPTY,
  previewUrl: null,
  fileName: null,
  progress: 0,
  error: null,
};

const MAX_SIZE = 5 * 1024 * 1024;

function revokeUrl(url: string | null) {
  if (url && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {
    }
  }
}

export function useDocumentUpload(): DocumentUpload {
  const [state, setState] = useState<PanelState>(EMPTY_PANEL);
  const browseRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
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
      if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type as DocumentMimeType)) {
        setState({
          ...EMPTY_PANEL,
          error: "Unsupported file type. Use JPG, PNG or PDF.",
        });
        return;
      }
      if (file.size > MAX_SIZE) {
        setState({
          ...EMPTY_PANEL,
          error: "File exceeds the 5 MB maximum size.",
        });
        return;
      }

      cleanTimer();
      revokeUrl(urlRef.current);
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      let progress = 0;

      setState({
        status: UploadStatus.UPLOADING,
        previewUrl: url,
        fileName: file.name,
        progress: 0,
        error: null,
      });

      intervalRef.current = window.setInterval(() => {
        progress = Math.min(100, progress + 20 + Math.random() * 20);
        setState((prev) => ({ ...prev, status: UploadStatus.UPLOADING, progress }));
        if (progress >= 100) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setState((prev) => ({ ...prev, status: UploadStatus.VERIFIED, progress: 100 }));
        }
      }, 160);
    },
    [cleanTimer],
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
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) beginUpload(file);
    },
    [beginUpload],
  );

  const onOpenBrowse = useCallback(() => {
    browseRef.current?.click();
  }, []);

  return {
    state,
    browseRef,
    onFile,
    onOpenBrowse,
    onDragOver,
    onDragLeave,
    onDrop,
  };
}
