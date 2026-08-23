"use client";

import React, { useState } from "react";
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
  CloudDoneOutlined,
  CloudOutlined,
  ErrorOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import { PortalSidebar } from "@/components/Sidebar";
import { PortalStepper } from "@/components/Stepper";
import { PortalHeader } from "@/components/ui";
import {
  EDUCATION_ACTIVE_STATUSES,
  EDUCATION_COMPLETION_LABELS,
  EDUCATION_FINISHED_STATUSES,
  EDUCATION_LEVEL_FIELDS,
  EDUCATION_LEVEL_OPTIONS,
  EDUCATION_STATUS_OPTIONS,
  EDUCATION_TERMINATED_STATUSES,
} from "@/constants";
import useEducationForm from "@/hooks/useEducationForm";
import type {
  EducationErrors,
  EducationFieldDef,
  EducationFormData,
} from "@/types/education";
import type { SaveStatus } from "@/types/common";

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
      className="mb-2 block font-poppins text-[15px] font-semibold text-[#0E3A8A]"
    >    
      {children}
      {required && (
        <span aria-hidden="true" className="ml-1 text-[#C2183B]">
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
      className="mt-2 flex items-center gap-1.5 font-poppins text-[12px] font-medium text-[#C2183B]"
    >
      <ErrorOutlined className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

function DraftStatus({ status }: { status: SaveStatus }) {
  const isSaving = status === "saving";
  const isSaved = status === "saved";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-poppins text-[13px] font-medium ${
        isSaving ? "text-[#B45309]" : isSaved ? "text-[#15803D]" : "text-[#94A3B8]"
      }`}
    >
      {isSaving ? (
        <CloudOutlined className="h-4 w-4 animate-pulse" />
      ) : (
        <CloudDoneOutlined className="h-4 w-4" />
      )}
      {isSaving ? "Saving..." : isSaved ? "Draft saved" : "Not saved yet"}
    </span>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h3 className="mb-4 font-poppins text-[16px] font-bold text-[#0E3A8A]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function EducationLevelSelect({
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
      <FieldLabel htmlFor="education-level" required>
        Education Level
      </FieldLabel>
      <Select
        id="education-level"
        fullWidth
        displayEmpty
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className="form-select-household"
        renderValue={(selected) =>
          selected ? (
            selected
          ) : (
            <span className="text-[#94A3B8]">Select Education Level</span>
          )
        }
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
        {EDUCATION_LEVEL_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <FieldError message={error} />
    </div>
  );
}

function EducationStatusSelect({
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
      <FieldLabel htmlFor="education-status" required>
        Education Status
      </FieldLabel>
      <Select
        id="education-status"
        fullWidth
        displayEmpty
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className="form-select-household"
        renderValue={(selected) =>
          selected ? (
            selected
          ) : (
            <span className="text-[#94A3B8]">Current Status</span>
          )
        }
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
        {EDUCATION_STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <FieldError message={error} />
    </div>
  );
}

function InstitutionInput({
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
      <FieldLabel htmlFor="education-institution" required>
        Institution
      </FieldLabel>
      <TextField
        id="education-institution"
        fullWidth
        placeholder="Full name of University/College"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 200 } }}
        aria-invalid={error ? true : undefined}
        className="form-input-household"
      />
      <FieldError message={error} />
    </div>
  );
}

function StudyLocationInput({
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
      <FieldLabel htmlFor="education-study-location" required>
        Study Location
      </FieldLabel>
      <TextField
        id="education-study-location"
        fullWidth
        placeholder="City, Country"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          htmlInput: { maxLength: 120 },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <LocationOnOutlined
                  aria-label="Location"
                  sx={{ fontSize: 20, color: "#0E3A8A" }}
                />
              </InputAdornment>
            ),
          },
        }}
        aria-invalid={error ? true : undefined}
        className="form-input-household"
      />
      <FieldError message={error} />
    </div>
  );
}

function DynamicTextField({
  id,
  def,
  value,
  error,
  onChange,
}: {
  id: string;
  def: EducationFieldDef;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  if (def.type === "date") {
    return (
      <div>
        <FieldLabel htmlFor={id}>{def.label}</FieldLabel>
        <TextField
          id={id}
          fullWidth
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className="form-input-household"
        />
        <FieldError message={error} />
      </div>
    );
  }
  if (def.type === "select" && def.options) {
    return (
      <div>
        <FieldLabel htmlFor={id}>{def.label}</FieldLabel>
        <Select
          id={id}
          fullWidth
          displayEmpty
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className="form-select-household"
          renderValue={(selected) =>
            selected ? (
              selected
            ) : (
              <span className="text-[#94A3B8]">Select {def.label}</span>
            )
          }
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
          {def.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <FieldError message={error} />
      </div>
    );
  }
  return (
    <div>
      <FieldLabel htmlFor={id}>{def.label}</FieldLabel>
      <TextField
        id={id}
        fullWidth
        placeholder={def.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 200 } }}
        aria-invalid={error ? true : undefined}
        className="form-input-household"
      />
      <FieldError message={error} />
    </div>
  );
}

function CertificateAvailability({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <span className="mb-2 block font-poppins text-[15px] font-semibold text-[#0E3A8A]">
        Certificate Available?
      </span>
      <div className="flex gap-8">
        {["yes", "no"].map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0E3A8A]/30 has-[:focus-visible]:ring-offset-2"
          >
            <input
              type="radio"
              name="certificate-available"
              checked={value === option}  
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                value === option ? "border-[#0E3A8A]" : "border-[#B6BFCC] bg-white"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full transition-opacity duration-150 ${
                  value === option ? "bg-[#0E3A8A] opacity-100" : "opacity-0"
                }`}
              />
            </span>
            <span
              className={`font-poppins text-[14px] font-medium ${
                value === option ? "text-[#0F172A]" : "text-[#596273]"
              }`}
            >
              {option === "yes" ? "Yes" : "No"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function DynamicEducationFields({
  data,
  errors,
  onChange,
}: {
  data: EducationFormData;
  errors: EducationErrors;
  onChange: <K extends keyof EducationFormData>(
    key: K,
    value: EducationFormData[K],
  ) => void;
}) {
  const defs = EDUCATION_LEVEL_FIELDS[data.level] ?? [];
  const completionLabel =
    EDUCATION_COMPLETION_LABELS[data.status] ?? "Completion Date";
  const showCurrentYear = EDUCATION_ACTIVE_STATUSES.includes(data.status);
  const showDiscontinuation =
    EDUCATION_TERMINATED_STATUSES.includes(data.status);
  const showCertificate = EDUCATION_FINISHED_STATUSES.includes(data.status);

  if (defs.length === 0 && !showCurrentYear && !showDiscontinuation && !showCertificate) {
    return null;
  }

  return (
    <div className="conditional-reveal mt-10 border-t border-[#E5E7EB] pt-8">
      <h3 className="mb-4 font-poppins text-[16px] font-bold text-[#0E3A8A]">
        Academic Details
      </h3>

      <div className="grid gap-7 md:grid-cols-2">
        {defs.map((def) => {
          const id =
            def.key === "completionDate"
              ? "education-completion-date"
              : `education-${def.key}`;
          const label =
            def.key === "completionDate" ? completionLabel : def.label;
          return (
            <DynamicTextField
              key={def.key}
              id={id}
              def={{ ...def, label }}
              value={data[def.key]}
              error={
                def.key === "completionDate" ? errors.completionDate : undefined
              }
              onChange={(value) => onChange(def.key, value)}
            />
          );
        })}

        {showCurrentYear && (
          <div>
            <FieldLabel htmlFor="education-current-year">
              Current Semester / Year
            </FieldLabel>
            <TextField
              id="education-current-year"
              fullWidth
              placeholder="e.g. Semester 5, 2nd Year"
              value={data.currentYear}
              onChange={(e) => onChange("currentYear", e.target.value)}
              slotProps={{ htmlInput: { maxLength: 40 } }}
              className="form-input-household"
            />
          </div>
        )}

        {showCertificate && (
          <CertificateAvailability
            value={data.certificateAvailable}
            onChange={(value) => onChange("certificateAvailable", value)}
          />
        )}
      </div>

      {showDiscontinuation && (
        <div className="mt-7">
          <FieldLabel htmlFor="education-discontinuation-reason" required>
            Reason for Discontinuation
          </FieldLabel>
          <TextField
            id="education-discontinuation-reason"
            fullWidth
            multiline
            minRows={3}
            placeholder="Please describe the reason…"
            value={data.discontinuationReason}
            onChange={(e) => onChange("discontinuationReason", e.target.value)}
            slotProps={{ htmlInput: { maxLength: 300 } }}
            aria-invalid={errors.discontinuationReason ? true : undefined}
            className="form-textarea-household"
          />
          <FieldError message={errors.discontinuationReason} />
        </div>
      )}
    </div>
  );
}

const FIELD_IDS: Record<string, string> = {
  level: "education-level",
  status: "education-status",
  institution: "education-institution",
  studyLocation: "education-study-location",
  completionDate: "education-completion-date",
  discontinuationReason: "education-discontinuation-reason",
};

function scrollToFirstError(errors: EducationErrors) {
  const firstKey = Object.keys(errors)[0];
  const id = firstKey ? FIELD_IDS[firstKey] : undefined;
  if (!id) return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
  }
}

function BottomNavigation({
  onBack,
  onNext,
  submitting,
}: {
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
}) {
  return (
    <footer className="fixed bottom-0 left-[270px] right-0 z-30 flex h-[76px] items-center justify-between border-t border-[#E5E7EB] bg-white px-6 md:px-10">
      <button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="flex h-12 w-[120px] items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#D1D5DB] bg-white font-poppins text-[14px] font-bold text-[#0E3A8A] transition-all duration-200 hover:border-[#0E3A8A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3A8A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ArrowBack className="h-5 w-5" />
        BACK
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={submitting}
        className="flex h-12 w-[170px] items-center justify-center gap-2 rounded-[10px] bg-[#0E3A8A] font-poppins text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(14,58,138,0.3)] transition-all duration-200 hover:bg-[#0A2D6D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3A8A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <CircularProgress size={16} thickness={5} sx={{ color: "#FFFFFF" }} />
            SAVING…
          </>
        ) : (
          <>
            NEXT PHASE
            <ArrowForward className="h-5 w-5" />
          </>
        )}
      </button>
    </footer>
  );
}

export function EducationStep() {
  const router = useRouter();
  const form = useEducationForm();
  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => {
    if (submitting) return;
    const errs = form.validate();
    if (Object.keys(errs).length > 0) {
      form.setErrors(errs);
      scrollToFirstError(errs);
      return;
    }
    form.saveDraftNow();
    setSubmitting(true);
    window.setTimeout(() => {
      router.push("/portal/photo");
    }, 400);
  };

  const handleSaveExit = () => {
    form.saveDraftNow();
    router.push("/portal");
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <PortalSidebar activeLabel="Education" onSaveExit={handleSaveExit} />

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader />

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8 pb-40 md:px-10">
          <PortalStepper currentStep={7} />

          <div className="mx-auto w-full max-w-[760px]">
            <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)] md:p-10">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 h-[28px] w-1 shrink-0 rounded-full bg-[#0E3A8A]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-poppins text-[22px] font-bold leading-tight tracking-tight text-[#0E3A8A]">
                      Education Information
                    </h2>
                    <DraftStatus status={form.saveStatus} />
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748B]">
                    Please provide comprehensive information regarding your
                    highest level of completed education. This data is critical
                    for registry verification.
                  </p>
                </div>
              </div>

              <div aria-hidden="true" className="mt-6 h-px bg-[#E5E7EB]" />

              <FormSection title="Level & Status">
                <div className="grid gap-7 md:grid-cols-2">
                  <EducationLevelSelect
                    value={form.data.level}
                    error={form.errors.level}
                    onChange={(value) => form.setField("level", value)}
                  />
                  <EducationStatusSelect
                    value={form.data.status}
                    error={form.errors.status}
                    onChange={(value) => form.setField("status", value)}
                  />
                </div>
              </FormSection>

              <FormSection title="Provider Details">
                <div className="grid gap-7 md:grid-cols-2">
                  <InstitutionInput
                    value={form.data.institution}
                    error={form.errors.institution}
                    onChange={(value) => form.setField("institution", value)}
                  />
                  <StudyLocationInput
                    value={form.data.studyLocation}
                    error={form.errors.studyLocation}
                    onChange={(value) => form.setField("studyLocation", value)}
                  />
                </div>
              </FormSection>

              <DynamicEducationFields
                data={form.data}
                errors={form.errors}
                onChange={form.setField}
              />
            </section>
          </div>
        </main>

        <BottomNavigation
          onBack={() => router.push("/portal/disability")}
          onNext={handleNext}
          submitting={submitting}
        />
      </div>
    </div>
  );
}

export default EducationStep;
