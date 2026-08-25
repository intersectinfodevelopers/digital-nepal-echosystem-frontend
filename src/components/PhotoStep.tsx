"use client";

import React from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowBack,
  ArrowForward,
  CheckCircleOutlined,
  CloudDoneOutlined,
  CloudOutlined,
  CloudUploadOutlined,
  DeleteOutlineOutlined,
  ErrorOutlined,
  ImageOutlined,
  LockOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { PortalStepper } from "@/components/Stepper";
import { formatFileSize, usePhotoForm } from "@/hooks/usePhotoForm";
import type { DraftSaveStatus } from "@/types/photo";

function SaveBadge({
  status,
  onRetry,
}: {
  status: DraftSaveStatus;
  onRetry?: () => void;
}) {
  const isSaving = status === "saving";
  const isSaved = status === "saved";
  const isError = status === "error";

  let content: ReactNode;
  if (isSaving) {
    content = (
      <>
        <CloudOutlined className="h-3.5 w-3.5" />
        Saving…
      </>
    );
  } else if (isSaved) {
    content = (
      <>
        <CloudDoneOutlined className="h-3.5 w-3.5" />
        Draft saved
      </>
    );
  } else if (isError) {
    content = (
      <>
        <WarningAmberOutlined className="h-3.5 w-3.5" />
        Unable to save draft
      </>
    );
  } else {
    content = (
      <>
        <CloudDoneOutlined className="h-3.5 w-3.5" />
        Draft saved
      </>
    );
  }

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex shrink-0 items-center gap-1.5 font-poppins text-[13px] font-medium ${
        isSaving
          ? "text-[#B45309]"
          : isError
            ? "text-[#D71945]"
            : isSaved
              ? "text-[#15803D]"
              : "text-[#94A3B8]"
      }`}
    >
      {content}
      {isError && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-1 rounded-[4px] px-1.5 py-0.5 text-[12px] font-semibold underline underline-offset-2 transition-colors hover:bg-[#FDECEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D71945] focus-visible:ring-offset-2"
        >
          Retry
        </button>
      )}
    </span>
  );
}

const REQUIREMENTS = [
  "Face clearly visible",
  "Good lighting",
  "Neutral expression",
  "No sunglasses",
];

const RECOMMENDATIONS = [
  "Plain background",
  "Recent photograph",
  "Face centered",
];

function PhotoGuidelines() {
  return (
    <aside
      aria-labelledby="photo-guidelines-heading"
      className="w-full rounded-[4px] border border-[#D5DAE1] bg-[#FBFCFD] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] lg:w-[150px] lg:shrink-0"
    >
      <h3
        id="photo-guidelines-heading"
        className="font-poppins text-[13px] font-bold text-[#1F2937]"
      >
        Photo Guidelines
      </h3>

      <p className="mt-4 font-poppins text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
        Requirements
      </p>
      <ul className="mt-2.5 space-y-2.5">
        {REQUIREMENTS.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircleOutlined
              aria-hidden="true"
              sx={{ fontSize: 15, color: "#16A36A" }}
              className="mt-[1px] shrink-0"
            />
            <span className="font-poppins text-[11.5px] leading-snug text-[#687386]">
              {item}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-5 font-poppins text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
        Recommended
      </p>
      <ul className="mt-2.5 space-y-2">
        {RECOMMENDATIONS.map((item) => (
          <li key={item} aria-hidden="true" className="flex items-start gap-2">
            <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full bg-[#64748B]" />
            <span className="font-poppins text-[11px] leading-snug text-[#475569]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function BottomNavigation({
  onBack,
  onNext,
  onSaveDraft,
  canProceed,
  saveStatus,
}: {
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  canProceed: boolean;
  saveStatus: DraftSaveStatus;
}) {
  return (
    <footer className="registration-footer sticky bottom-0 z-30 flex h-19 items-center justify-between border-t border-[#D8DDE5] bg-white px-4 sm:px-6 md:px-10">
      <button
        type="button"
        onClick={onBack}
        className="flex h-12 items-center justify-center gap-1.5 rounded-[8px] border border-[#D1D5DB] bg-white px-5 font-poppins text-[13px] font-bold text-[#0E3A8A] transition-colors duration-150 hover:border-[#0E3A8A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3A8A] focus-visible:ring-offset-2"
      >
        <ArrowBack className="h-4 w-4" />
        Back
      </button>

      <div
        aria-label="Step progress"
        className="hidden flex-col items-center gap-1 lg:flex"
      >
        <span className="font-poppins text-[13px] font-medium text-[#687386]">
          Step 8 of 10
        </span>
        <div
          aria-hidden="true"
          className="flex gap-[3px]"
          aria-label="80% complete"
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <span
              key={index}
              className={`h-[5px] w-4 rounded-full ${
                index < 8 ? "bg-[#0E3A8A]" : "bg-[#D8DDE5]"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          className="flex h-12 items-center justify-center rounded-[8px] border border-[#0E3A8A] bg-white px-5 font-poppins text-[13px] font-semibold text-[#0E3A8A] transition-colors duration-150 hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3A8A] focus-visible:ring-offset-2"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#0E3A8A] px-6 font-poppins text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(14,58,138,0.3)] transition-colors duration-150 hover:bg-[#0A2D6D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3A8A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ArrowForward className="h-4 w-4" />
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {saveStatus === "saved"
          ? "Draft saved"
          : saveStatus === "error"
            ? "Unable to save draft"
            : ""}
      </span>
    </footer>
  );
}

export function PhotoStep() {
  const router = useRouter();
  const {
    photo,
    status,
    progress,
    error,
    dragOver,
    saveStatus,
    lastSaved,
    canProceed,
    browseInputRef,
    persistCurrent,
    saveDraftNow,
    removePhoto,
    onFileChange,
    openPicker,
    onDrop,
    onDragOver,
    onDragLeave,
    showProceedError,
  } = usePhotoForm();

  const handleNext = () => {
    if (!canProceed) {
      showProceedError();
      return;
    }
    saveDraftNow();
    router.push("/ward/dashboard/registercitizen/location");
  };

  const showPreview = status !== "empty";

  return (
    <div className="flex min-h-screen bg-[#E8EEF7]">

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-[1130px] flex-1 px-4 py-8 pb-36 sm:px-6 md:px-8 lg:px-10">
          <PortalStepper currentStep={8} />

          <div className="mx-auto w-full max-w-[680px]">
            <section className="rounded-[2px] border border-[#D7DCE3] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-3 px-6 pt-7 md:px-9 md:pt-9">
                <span
                  aria-hidden="true"
                  className="mt-1 h-[27px] w-1 shrink-0 rounded-full bg-[#0645A5]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="registration-title font-poppins text-[21px] font-bold leading-tight tracking-tight text-[#062B68]">
                      Citizen Photograph
                    </h2>
                    <SaveBadge
                      status={saveStatus}
                      onRetry={() => void persistCurrent(photo)}
                    />
                  </div>
                  <p className="mt-1.5 max-w-[520px] text-[11.5px] leading-relaxed text-[#687386]">
                    Upload a clear photograph of the citizen for identity
                    verification and official records.
                  </p>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="mx-6 mt-6 h-px bg-[#E5E7EB] md:mx-9"
              />

              <div className="px-6 pb-8 pt-7 md:px-9">
                <h3 className="font-poppins text-[14px] font-bold text-[#062B68]">
                  Photo Upload
                </h3>

                <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    {showPreview ? (
                      <div className="conditional-reveal w-full rounded-[10px] border border-[#D4D7DC] bg-white">
                        <div className="relative flex h-[315px] items-center justify-center overflow-hidden rounded-[10px]">
                          {photo.previewUrl && (
                            <Image
                              src={photo.previewUrl}
                              alt={
                                photo.fileName ?? "Citizen photograph preview"
                              }
                              fill
                              unoptimized
                              className="object-contain p-2"
                            />
                          )}
                          {status === "uploading" && (
                            <div className="absolute inset-x-0 bottom-0">
                              <div className="h-[4px] w-full bg-[#E5E7EB]">
                                <div
                                  className="h-full bg-[#0645A5] transition-[width] duration-150"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {status === "valid" && (
                            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#16A36A] px-3 py-1.5 font-poppins text-[11px] font-semibold text-white shadow-md">
                              <CheckCircleOutlined sx={{ fontSize: 14 }} />
                              Uploaded
                            </span>
                          )}
                          {photo.previewUrl && (
                            <div className="absolute right-3 top-3 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={removePhoto}
                                aria-label="Remove photo"
                                className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-[#D71945]/30 bg-white text-[#D71945] shadow-sm transition-colors duration-150 hover:bg-[#FDECEF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D71945] focus-visible:ring-offset-2"
                              >
                                <DeleteOutlineOutlined sx={{ fontSize: 18 }} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] px-4 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <ImageOutlined
                              aria-hidden="true"
                              sx={{ fontSize: 16, color: "#64748B" }}
                              className="shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-poppins text-[12px] font-semibold text-[#1F2937]">
                                {photo.fileName ?? "photograph.jpg"}
                              </p>
                              <p className="font-poppins text-[11px] text-[#94A3B8]">
                                {formatFileSize(photo.fileSize)} · Uploaded
                              </p>
                            </div>
                          </div>
                          <span
                            role="status"
                            aria-live="polite"
                            className="inline-flex items-center gap-1.5 font-poppins text-[11.5px] font-semibold text-[#16A36A]"
                          >
                            <CheckCircleOutlined sx={{ fontSize: 14 }} />
                            Photo uploaded
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={openPicker}
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                          onDrop={onDrop}
                          aria-label="Upload citizen photograph"
                          className={`flex h-[315px] w-full flex-col items-center justify-center gap-3 rounded-[10px] border-2 border-dashed bg-white px-6 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0645A5] focus-visible:ring-offset-2 ${
                            dragOver
                              ? "border-[#0645A5] bg-[#EFF4FF]"
                              : "border-[#D4D7DC] hover:border-[#0645A5] hover:bg-[#F8FAFF]"
                          }`}
                        >
                          <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#EAF1FF] text-[#0645A5] transition-colors duration-200">
                            <CloudUploadOutlined sx={{ fontSize: 24 }} />
                          </span>
                          <span className="font-poppins text-[14px] font-semibold text-[#374151]">
                            {dragOver
                              ? "Drop photo to upload"
                              : "Upload photo"}
                          </span>
                          <span className="font-poppins text-[11.5px] text-[#94A3B8]">
                            Click to browse or drag & drop (JPG, PNG, up to 5MB)
                          </span>
                          {error && (
                            <span
                              role="alert"
                              className="flex max-w-[260px] items-start gap-1.5 rounded-[6px] bg-[#FDECEF] px-3 py-2 text-left font-poppins text-[11.5px] font-medium text-[#D71945] animate-[shake_300ms_ease]"
                            >
                              <ErrorOutlined
                                sx={{ fontSize: 14 }}
                                className="mt-px shrink-0"
                              />
                              {error}
                            </span>
                          )}
                        </button>

                        <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={openPicker}
                              className="flex h-9 items-center justify-center gap-2 rounded-[5px] bg-[#0645A5] px-5 font-poppins text-[13px] font-semibold text-white shadow-[0_3px_8px_rgba(6,69,165,0.25)] transition-all duration-150 hover:bg-[#052F75] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0645A5] focus-visible:ring-offset-2"
                            >
                              <CloudUploadOutlined sx={{ fontSize: 17 }} />
                              Upload Photo
                            </button>
                          </div>

                          <span className="inline-flex items-center gap-1.5 font-poppins text-[11px] font-medium text-[#94A3B8]">
                            <LockOutlined sx={{ fontSize: 12 }} />
                            Encrypted · Government Identity Record
                          </span>
                        </div>
                      </>
                    )}

                    <input
                      ref={browseInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      className="sr-only"
                      aria-label="Upload citizen photograph"
                      onChange={onFileChange}
                    />
                  </div>
                  <PhotoGuidelines />
                </div>
              </div>
            </section>

            <p className="mt-4 font-poppins text-[11px] text-[#94A3B8]">
              Last saved: {lastSaved ?? "not yet"}
            </p>
          </div>
        </main>

        <BottomNavigation
          onBack={() => router.push("/ward/dashboard/registercitizen/education")}
          onNext={handleNext}
          onSaveDraft={saveDraftNow}
          canProceed={canProceed}
          saveStatus={saveStatus}
        />
      </div>
    </div>
  );
}
