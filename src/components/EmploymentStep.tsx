"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  Cancel,
  CheckCircle,
  CloudOffOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  DescriptionOutlined,
  ErrorOutlined,
  InsertDriveFileOutlined,
  PhotoCameraOutlined,
  PictureAsPdfOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import { PortalStepper } from "@/components/Stepper";
import { EMPLOYMENT_STATUS_OPTIONS, UploadStatus } from "@/constants";
import { useEmploymentForm } from "@/hooks/useEmploymentForm";
import type {
  EmploymentUpload,
  PanStatus,
  SaveStatus,
} from "@/types/employment";

function FieldLabel({
  htmlFor,
  required = false,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block font-poppins text-[15px] font-semibold text-[#0A2D6D]"
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-1 text-[#C01F38]">
          *
        </span>
      )}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-2 flex items-center gap-1.5 font-poppins text-[12px] font-medium text-[#C01F38]"
    >
      <ErrorOutlined className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

function FormIdBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#D9DEE8] bg-[#F5F8FD] px-3 py-1.5 font-poppins text-[12px] font-semibold text-[#5F6673] shadow-sm">
      <DescriptionOutlined className="h-4 w-4 text-[#0A2D6D]" />
      FORM_ID: 06-EMP-99
    </span>
  );
}

function EmploymentStatusSelect({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel htmlFor="employment-status" required>
        Current Employment Status
      </FieldLabel>
      <Select
        id="employment-status"
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select-rounded employment-field"
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(15,61,145,0.16)",
              },
            },
          },
        }}
      >
        {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <FieldError message={error} />
    </div>
  );
}

function IncomeInput({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (raw: string) => void;
}) {
  return (
    <div>
      <FieldLabel htmlFor="monthly-income" required>
        Monthly Income (NPR)      
      </FieldLabel>
      <TextField
        id="monthly-income"
        fullWidth
        inputMode="numeric"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          htmlInput: { maxLength: 12 },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <span className="font-poppins text-[14px] font-semibold text-[#5F6673]">
                  NPR
                </span>
              </InputAdornment>
            ),
          },
        }}
        className="form-input-rounded employment-field"
      />
      <FieldError message={error} />
    </div>
  );
}

function EmployerInput({
  value,
  required,
  error,
  onChange,
}: {
  value: string;
  required: boolean;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel htmlFor="employer-name" required={required}>
        Employer / Business Name
      </FieldLabel>
      <TextField
        id="employer-name"
        fullWidth
        placeholder="e.g. Kathmandu Tech Solutions"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 120 } }}
        className="form-input-rounded employment-field"
      />
      <FieldError message={error} />
    </div>
  );
}

function PanStatusMessage({
  status,
  hasValue,
}: {
  status: PanStatus;
  hasValue: boolean;
}) {
  if (status === "loading") {
    return (
      <p className="mt-1.5 font-poppins text-[12px] text-[#5F6673]">
        Verifying against IRD records…
      </p>
    );
  }
  if (status === "verified") {
    return (
      <p className="mt-1.5 flex items-center gap-1 font-poppins text-[12px] font-medium text-[#16A34A]">
        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
        PAN verified against IRD records.
      </p>
    );
  }
  if (status === "invalid") {
    return (
      <p className="mt-1.5 flex items-center gap-1 font-poppins text-[12px] font-medium text-[#C01F38]">
        <Cancel className="h-3.5 w-3.5 shrink-0" />
        Invalid PAN. Must be exactly 9 digits.
      </p>
    );
  }
  if (status === "unavailable") {
    return (
      <p className="mt-1.5 flex items-center gap-1 font-poppins text-[12px] text-[#5F6673]">
        <CloudOffOutlined className="h-3.5 w-3.5 shrink-0" />
        IRD verification service is temporarily unavailable.
      </p>
    );
  }
  if (hasValue) {
    return (
      <p className="mt-1.5 font-poppins text-[12px] text-[#9AA3B2]">
        Enter all 9 digits to run IRD verification.
      </p>
    );
  }
  return null;
}

function PanVerificationInput({
  value,
  status,
  error,
  onChange,
}: {
  value: string;
  status: PanStatus;
  error?: string;
  onChange: (raw: string) => void;
}) {
  let adornment: React.ReactNode;
  if (status === "loading") {
    adornment = (
      <CircularProgress size={18} thickness={4} sx={{ color: "#0A2D6D" }} />
    );
  } else if (status === "verified") {
    adornment = <CheckCircle sx={{ fontSize: 20, color: "#16A34A" }} />;
  } else if (status === "invalid") {
    adornment = <Cancel sx={{ fontSize: 20, color: "#C01F38" }} />;
  } else if (status === "unavailable") {
    adornment = <CloudOffOutlined sx={{ fontSize: 20, color: "#5F6673" }} />;
  } else {
    adornment = (
      <VerifiedUserOutlined sx={{ fontSize: 20, color: "#B0B9C7" }} />
    );
  }

  return (
    <div>
      <FieldLabel htmlFor="pan-number">PAN Number</FieldLabel>
      <TextField
        id="pan-number"
        fullWidth
        inputMode="numeric"
        placeholder="XXXXXXXXX"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          htmlInput: { maxLength: 9 },
          input: {
            endAdornment: (
              <InputAdornment position="end">{adornment}</InputAdornment>
            ),
          },
        }}
        className="form-input-rounded employment-field"
      />
      <p className="mt-2 font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5F6673]">
        Real-time validation with IRD active
      </p>
      <PanStatusMessage status={status} hasValue={value.length > 0} />
      <FieldError message={error} />
    </div>
  );
}

function CameraCapture({ upload }: { upload: EmploymentUpload }) {
  const { cameraRef, onFile } = upload;
  return (
    <input
      ref={cameraRef}
      type="file"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={onFile}
    />
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ProofPreview({ upload }: { upload: EmploymentUpload }) {
  const { state, remove } = upload;
  const isImage = state.type?.startsWith("image/") === true;
  const isPdf = state.type === "application/pdf";
  const formattedSize = state.size != null ? formatFileSize(state.size) : "";
  const uploading = state.status === UploadStatus.UPLOADING;

  return (
    <div className="w-full overflow-hidden rounded-[8px] border border-[#D5D8DD] bg-white">
      <div className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[#EAF1FF] text-[#0A2D6D]">
          {isImage && state.previewUrl ? (
            <Image
              src={state.previewUrl}
              alt="Uploaded proof preview"
              width={48}
              height={48}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : isPdf ? (
            <PictureAsPdfOutlined className="h-6 w-6" />
          ) : (
            <InsertDriveFileOutlined className="h-6 w-6" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate font-poppins text-[14px] font-semibold text-[#172033]">
              {state.name}
            </p>
            {uploading ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#EEF4FF] px-2 py-0.5 font-poppins text-[11px] font-semibold text-[#0A2D6D]">
                <CircularProgress size={12} thickness={5} sx={{ color: "#0A2D6D" }} />
                Uploading {Math.round(state.progress)}%
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F0FDF4] px-2 py-0.5 font-poppins text-[11px] font-semibold text-[#16A34A]">
                <CheckCircle className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3 font-poppins text-[12px] text-[#5F6673]">
            <span className="uppercase">{state.type?.split("/")[1] ?? "file"}</span>
            {formattedSize && <span>{formattedSize}</span>}
          </div>

          {uploading && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E4E8EF]">
              <div
                className="h-full rounded-full bg-[#0A2D6D] transition-[width] duration-200"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={remove}
          aria-label="Remove uploaded document"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-[#9AA3B2] transition-colors hover:bg-[#FCEBED] hover:text-[#C01F38]"
        >
          <DeleteOutlined className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function DocumentUploader({
  upload,
  error,
}: {
  upload: EmploymentUpload;
  error?: string;
}) {
  const {
    state,
    isDragOver,
    browseRef,
    onFile,
    onOpenBrowse,
    onOpenCamera,
    onDragOver,
    onDragLeave,
    onDrop,
  } = upload;
  const showEmpty = state.status === UploadStatus.EMPTY;

  return (
    <div>
      <FieldLabel htmlFor="proof-dropzone" required>
        Proof of Income / Employment
      </FieldLabel>

      <input
        ref={browseRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={onFile}
      />
      <CameraCapture upload={upload} />

      {showEmpty && (
        <div
          id="proof-dropzone"
          role="button"
          tabIndex={0}
          aria-label="Upload proof of income or employment"
          onClick={onOpenBrowse}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenBrowse();
            }
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`flex h-46.25 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[8px] border-2 border-dashed transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2 ${
            isDragOver
              ? "border-[#0A2D6D] bg-[#EEF4FF]"
              : "border-[#B9C6DC] bg-white"
          }`}
        >
          <CloudUploadOutlined className="h-10 w-10 text-[#0A2D6D]" />
          <p className="font-poppins text-[16px] font-semibold text-[#172033]">
            Take photo or upload document
          </p>
          <p className="font-poppins text-[13px] text-[#5F6673]">
            PDF, JPG, PNG (Max 5MB)
          </p>

          <div className="mt-1.5 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCamera();
              }}
              className="flex h-11 items-center gap-2 rounded-[8px] bg-[#0A2D6D] px-5 font-poppins text-[14px] font-semibold text-white transition-all duration-200 hover:bg-[#081F4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2"
            >
              <PhotoCameraOutlined className="h-4 w-4" />
              USE CAMERA
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenBrowse();
              }}
              className="flex h-11 items-center gap-2 rounded-[8px] border-[1.5px] border-[#0A2D6D] bg-white px-5 font-poppins text-[14px] font-semibold text-[#0A2D6D] transition-all duration-200 hover:bg-[#F1F4FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2"
            >
              <InsertDriveFileOutlined className="h-4 w-4" />
              BROWSE FILES
            </button>
          </div>
        </div>
      )}

      {state.status === UploadStatus.UPLOADING && <ProofPreview upload={upload} />}
      {state.status === UploadStatus.VERIFIED && <ProofPreview upload={upload} />}

      <FieldError message={state.error ?? error} />
    </div>
  );
}

function SaveStatusIndicator({
  status,
  lastSaved,
}: {
  status: SaveStatus;
  lastSaved: string | null;
}) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-2 font-poppins text-[12px] font-medium text-[#5F6673]">
        <CircularProgress size={13} thickness={5} sx={{ color: "#5F6673" }} />
        Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-2 font-poppins text-[12px] font-medium text-[#16A34A]">
        <CheckCircle className="h-4 w-4" />
        Saved{lastSaved ? ` · Last saved: ${lastSaved}` : ""}
      </span>
    );
  }
  return (
    <span className="font-poppins text-[12px] text-[#9AA3B2]">
      Changes auto-save to this device
    </span>
  );
}

function BottomNavigation({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <footer className="registration-footer sticky bottom-0 z-30 flex h-19 items-center justify-between border-t border-[#D5D8DD] bg-white/95 px-4 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 md:px-10">
      <button
        type="button"
        onClick={onBack}
        className="flex h-11 min-w-28 items-center justify-center gap-2 rounded-lg border border-[#D9DEE8] bg-white px-4 font-semibold text-[14px] text-[#0A2D6D] transition-all duration-200 hover:border-[#0A2D6D] hover:bg-[#F5F8FD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2"
      >
        <ArrowBack className="h-5 w-5" />
        BACK
      </button>

      <button
        type="button"
        onClick={onNext}
        className="flex h-11 min-w-32 items-center justify-center gap-2 rounded-lg bg-[#0A2D6D] px-4 font-semibold text-[14px] text-white shadow-[0_8px_20px_rgba(10,45,109,0.22)] transition-all duration-200 hover:bg-[#081F4D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2"
      >
        NEXT
        <ArrowForward className="h-5 w-5" />
      </button>
    </footer>
  );
}

export function EmploymentStep() {
  const router = useRouter();
  const form = useEmploymentForm();

  const handleNext = () => {
    if (form.attemptProceed()) {
      router.push("/ward/dashboard/registercitizen/household");
    }
  };

  return (
    <div className="employment-form flex min-h-screen bg-[#F5F7FB]">

       <div className="flex min-w-0 flex-1 flex-col"> 

        <main className="w-full max-w-none flex-1 px-0 py-2 pb-32 md:py-4">
          <PortalStepper currentStep={4} />

          <section className="overflow-hidden rounded-2xl border border-[#E1E7F0] bg-white shadow-[0_8px_28px_rgba(15,61,145,0.07)]">
            <div className="border-b border-[#E8ECF2] bg-[linear-gradient(120deg,#F8FAFF_0%,#FFFFFF_70%)] px-6 py-7 md:px-9 md:py-8">
              <div className="flex flex-col items-start justify-between gap-5 md:flex-row">
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#C01F38]">Step 4 of 8 · Citizen registration</p>
                <h2 className="registration-title font-poppins text-[28px] font-bold leading-tight tracking-tight text-[#0A2D6D] md:text-[30px]">
                  Employment Details
                </h2>
                <p className="mt-2 max-w-2xl font-poppins text-[14px] leading-relaxed text-[#667085] md:text-[15px]">
                  Provide accurate information for sovereign data
                  cross-referencing.
                </p>
              </div>
              <FormIdBadge />
              </div>
            </div>

            <div className="px-6 py-7 md:px-9 md:py-8">
            <div className="grid gap-6 md:grid-cols-2">
              <EmploymentStatusSelect
                value={form.data.employmentStatus}
                error={form.errors.employmentStatus}
                onChange={form.updateStatus}
              />
              <IncomeInput
                value={form.formattedIncome}
                error={form.errors.monthlyIncome}
                onChange={form.setMonthlyIncome}
              />
            </div>

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <EmployerInput
                value={form.data.employerName}
                required={form.isEmployerRequired}
                error={form.errors.employerName}
                onChange={form.updateEmployer}
              />
              <PanVerificationInput
                value={form.data.panNumber}
                status={form.data.panStatus}
                error={form.errors.panNumber}
                onChange={form.setPanNumber}
              />
            </div>

            <div className="mt-8 rounded-xl border border-[#E8ECF2] bg-[#FBFCFE] p-4 md:p-5">
              <DocumentUploader upload={form.upload} error={form.errors.proof} />
            </div>

            <div className="mt-6 flex justify-end border-t border-[#E8ECF2] pt-5">
              <SaveStatusIndicator
                status={form.saveStatus}
                lastSaved={form.lastSaved}
              />
            </div>
            </div>
          </section>
        </main>

        <BottomNavigation
          onBack={() => router.push("/ward/dashboard/registercitizen/family")}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
