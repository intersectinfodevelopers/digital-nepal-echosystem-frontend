"use client";

import React, { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowBack,
  ArrowForward,
  CloudDoneOutlined,
  CloudOutlined,
  ErrorOutlined,
  GpsFixedOutlined,
  LockOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { PortalStepper } from "@/components/Stepper";
import { LocationMap } from "@/components/LocationMap";
import type { DraftSaveStatus, AccuracyLevel } from "@/types/location";
import { useLocationForm } from "@/hooks/useLocationForm";

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

function AccuracyIndicator({
  accuracy,
  level,
}: {
  accuracy: number | null;
  level: AccuracyLevel;
}) {
  if (accuracy === null) return null;

  let colorClass: string;
  let label: string;

  if (level === "good") {
    colorClass = "text-[#3C9B62]";
    label = "Good";
  } else if (level === "low") {
    colorClass = "text-[#D97706]";
    label = "Low accuracy";
  } else {
    colorClass = "text-[#94A3B8]";
    label = "Unknown";
  }

  return (
    <div className="mt-3">
      <span
        className={`font-poppins text-[12px] font-semibold ${colorClass}`}
      >
        ±{accuracy}m — {label}
      </span>
    </div>
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
          Step 9 of 10
        </span>
        <div
          aria-hidden="true"
          className="flex gap-[3px]"
          aria-label="90% complete"
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <span
              key={index}
              className={`h-[5px] w-4 rounded-full ${
                index < 9 ? "bg-[#0E3A8A]" : "bg-[#D8DDE5]"
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

export function LocationStep() {
  const router = useRouter();
  const {
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
  } = useLocationForm();

  const handleNext = () => {
    if (!validate()) return;
    saveDraftNow();
    router.push("/ward/dashboard/registercitizen/submit");
  };

  const isCapturing = captureStatus === "requesting";
  const isCaptured = captureStatus === "captured";
  const isManual = data.manualEntry;
  const isError = captureStatus === "error";

  return (
    <div className="flex min-h-screen bg-[#E8EEF7]">
      <div className="flex min-w-0 flex-1 flex-col">

        <main className="mx-auto w-full max-w-[1130px] flex-1 px-4 py-8 pb-36 sm:px-6 md:px-8 lg:px-10">
          <PortalStepper currentStep={9} />

          <div className="mx-auto w-full max-w-[800px]">
            <section className="rounded-[2px] border border-[#D7DCE3] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-3 px-6 pt-7 md:px-9 md:pt-9">
                <span
                  aria-hidden="true"
                  className="mt-1 h-[27px] w-1 shrink-0 rounded-full bg-[#0645A5]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="registration-title font-poppins text-[21px] font-bold leading-tight tracking-tight text-[#062B68]">
                      GPS Capture
                    </h2>
                    <SaveBadge
                      status={saveStatus}
                      onRetry={() => saveDraftNow()}
                    />
                  </div>
                  <p className="mt-1.5 max-w-[520px] text-[11.5px] leading-relaxed text-[#687386]">
                    Capture or enter the GPS coordinates of the citizen&apos;s
                    primary residence for official records.
                  </p>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="mx-6 mt-6 h-px bg-[#E5E7EB] md:mx-9"
              />

              <div className="px-6 pb-8 pt-7 md:px-9">
                <LocationMap
                  latitude={data.latitude}
                  longitude={data.longitude}
                  accuracy={data.accuracy}
                  onSelect={setCoords}
                />

                {isCaptured && (
                  <AccuracyIndicator
                    accuracy={data.accuracy}
                    level={data.accuracyLevel}
                  />
                )}

                {isError && (
                  <div className="mt-3">
                    <span className="font-poppins text-[12px] font-semibold text-[#C2183B]">
                      Unable to capture your location. Move to an open area and try again.
                    </span>
                  </div>
                )}
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                 
                  <div>
                    <label
                      htmlFor="latitude"
                      className="mb-2 block font-poppins text-[13px] font-semibold text-[#0645A5]"
                    >
                      Latitude
                    </label>
                    <div className="relative">
                      <input
                        id="latitude"
                        type="text"
                        readOnly={!isManual}
                        value={
                          isCapturing
                            ? "Detecting…"
                            : isError
                              ? "Unavailable"
                              : data.latitude || "-"
                        }
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="-"
                        className={`h-[42px] w-full rounded-[6px] border bg-[#F7F8FA] px-4 font-mono text-[14px] outline-none transition-colors ${
                          isCapturing || isError
                            ? "text-[#94A3B8]"
                            : "text-[#1F2937]"
                        } ${
                          isError
                            ? "border-[#FF5270]"
                            : errors.latitude
                              ? "border-[#D71945]"
                              : "border-[#D5DAE1] focus:border-[#0645A5]"
                        } ${
                          !isManual || isCapturing
                            ? "cursor-not-allowed opacity-70"
                            : ""
                        }`}
                      />
                      {(!isManual || isCapturing) && (
                        <LockOutlined
                          sx={{ fontSize: 16, color: "#94A3B8" }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        />
                      )}
                    </div>
                    {errors.latitude && (
                      <p
                        role="alert"
                        className="mt-1.5 flex items-center gap-1 font-poppins text-[11px] font-medium text-[#D71945]"
                      >
                        <ErrorOutlined sx={{ fontSize: 13 }} />
                        {errors.latitude}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="longitude"
                      className="mb-2 block font-poppins text-[13px] font-semibold text-[#0645A5]"
                    >
                      Longitude
                    </label>
                    <div className="relative">
                      <input
                        id="longitude"
                        type="text"
                        readOnly={!isManual}
                        value={
                          isCapturing
                            ? "Detecting…"
                            : isError
                              ? "Unavailable"
                              : data.longitude || "-"
                        }
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="-"
                        className={`h-[42px] w-full rounded-[6px] border bg-[#F7F8FA] px-4 font-mono text-[14px] outline-none transition-colors ${
                          isCapturing || isError
                            ? "text-[#94A3B8]"
                            : "text-[#1F2937]"
                        } ${
                          isError
                            ? "border-[#FF5270]"
                            : errors.longitude
                              ? "border-[#D71945]"
                              : "border-[#D5DAE1] focus:border-[#0645A5]"
                        } ${
                          !isManual || isCapturing
                            ? "cursor-not-allowed opacity-70"
                            : ""
                        }`}
                      />
                      {(!isManual || isCapturing) && (
                        <LockOutlined
                          sx={{ fontSize: 16, color: "#94A3B8" }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        />
                      )}
                    </div>
                    {errors.longitude && (
                      <p
                        role="alert"
                        className="mt-1.5 flex items-center gap-1 font-poppins text-[11px] font-medium text-[#D71945]"
                      >
                        <ErrorOutlined sx={{ fontSize: 13 }} />
                        {errors.longitude}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-7 flex flex-col items-center gap-4">
                  {isCapturing ? (
                    <div className="flex h-[38px] w-[225px] items-center justify-center gap-2 rounded-[6px] bg-[#D0D5DD] font-poppins text-[13px] font-semibold text-[#667085]">
                      <CircularProgress
                        size={14}
                        thickness={5}
                        sx={{ color: "#667085" }}
                      />
                      Acquiring signal…
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={captureLocation}
                      className="flex h-[38px] w-[225px] items-center justify-center gap-2 rounded-[6px] bg-[#0E3A8A] font-poppins text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(14,58,138,0.3)] transition-colors duration-150 hover:bg-[#0A2D6D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3A8A] focus-visible:ring-offset-2"
                    >
                      <GpsFixedOutlined sx={{ fontSize: 18 }} />
                      {isCaptured ? "Capture Again" : isError ? "Try Again" : "Capture Location"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={enableManualEntry}
                    className="font-poppins text-[12px] font-semibold text-[#C2183B] underline underline-offset-2 transition-colors hover:text-[#A0152E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2183B] focus-visible:ring-offset-2"
                  >
                    Enter manually
                  </button>
                </div>
              </div>
            </section>

            <p className="mt-4 font-poppins text-[11px] text-[#94A3B8]">
              Last saved: {lastSaved ?? "not yet"}
            </p>
          </div>
        </main>

        <BottomNavigation
          onBack={() => router.push("/ward/dashboard/registercitizen/photo")}
          onNext={handleNext}
          onSaveDraft={saveDraftNow}
          canProceed={canProceed}
          saveStatus={saveStatus}
        />
      </div>
    </div>
  );
}
