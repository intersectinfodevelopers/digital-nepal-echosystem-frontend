import type { UploadStatus } from "@/constants";

export interface PanelState {
  status: UploadStatus;
  previewUrl: string | null;
  fileName: string | null;
  progress: number;
  error: string | null;
}

export interface DocumentUpload {
  state: PanelState;
  browseRef: React.RefObject<HTMLInputElement | null>;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenBrowse: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}
