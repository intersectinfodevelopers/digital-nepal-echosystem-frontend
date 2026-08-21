"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowBack,
  ArrowForward,
  Check,
  CloudDoneOutlined,
  CloudOutlined,
  ErrorOutlined,
  KeyboardArrowDown,
  SaveOutlined,
  UploadFileOutlined,
} from "@mui/icons-material";
import { PortalSidebar } from "@/components/Sidebar";
import { PortalStepper } from "@/components/Stepper";
import { PortalHeader } from "@/components/ui";
import {
  AFFECTED_AREA_OPTIONS,
  DISABILITY_TYPE_OPTIONS,
  SEVERITY_LEVELS,
  SEVERITY_LEVEL_LABELS,
} from "@/constants";
import type { SaveStatus } from "@/types/common";
import { useDisabilityForm } from "@/hooks/useDisabilityForm";

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
      className="mb-2 block font-poppins text-[14px] font-semibold text-[#0E3A8A]"
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

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h3 className="mb-3 font-poppins text-[14px] font-semibold text-[#0E3A8A]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SelectField({
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
      <FieldLabel htmlFor="disability-type" required>
        Disability Type
      </FieldLabel>
      <div className="relative">
        <select
          id="disability-type"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={`h-10 w-full appearance-none rounded-[3px] border bg-white pl-3 pr-9 text-[13px] text-[#596273] outline-none transition-colors duration-150 focus:ring-2 focus:ring-[#06439B]/20 ${
            error
              ? "border-[#C2183B]"
              : "border-[#D7DCE3] hover:border-[#1F4FBF] focus:border-[#06439B]"
          }`}
        >
          <option value="">Select Primary Disability</option>
          {DISABILITY_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <KeyboardArrowDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#596273]"
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

function SeveritySlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const pct = (value / 4) * 100;

  return (
    <div>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor="severity-level" required>
          Severity Level
        </FieldLabel>
        <span className="mb-2 rounded bg-[#06439B]/10 px-2 py-0.5 font-poppins text-[12px] font-semibold text-[#06439B]">
          {SEVERITY_LEVEL_LABELS[value] ?? value}
        </span>
      </div>

      <input
        id="severity-level"
        type="range"
        min={0}
        max={4}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={`${SEVERITY_LEVEL_LABELS[value]}, level ${value} of 4`}
        className="severity-slider mt-1"
        style={{
          background: `linear-gradient(90deg, #06439b ${pct}%, #e2e8f0 ${pct}%)`,
        }}
      />

      <div className="mt-2 flex justify-between text-[11px] text-[#7A8492]">
        {SEVERITY_LEVELS.map((level) => (
          <span
            key={level.value}
            className={`text-center font-poppins ${
              level.value === value
                ? "font-semibold text-[#06439B]"
                : "font-medium"
            }`}
          >
            {level.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function CheckboxCard({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex h-10 cursor-pointer items-center gap-3 rounded-[3px] border px-3 transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#06439B]/30 ${
        checked
          ? "border-[#06439B] bg-[#F0F6FF]"
          : "border-[#D7DCE3] bg-white hover:border-[#1F4FBF]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-150 ${
          checked
            ? "border-[#06439B] bg-[#06439B]"
            : "border-[#B6BFCC] bg-white"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5 text-white" />}
      </span>
      <span
        className={`font-poppins text-[13px] font-medium ${
          checked ? "text-[#06439B]" : "text-[#374151]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

function RadioOption({
  name,
  checked,
  value,
  label,
  onChange,
}: {
  name: string;
  checked: boolean;
  value: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-2.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#06439B]/30 has-[:focus-visible]:ring-offset-2"
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors duration-150 ${
          checked ? "border-[#06439B]" : "border-[#B6BFCC] bg-white"
        }`}
      >
        <span
          className={`h-2.5 w-2.5 rounded-full transition-opacity duration-150 ${
            checked ? "bg-[#06439B] opacity-100" : "opacity-0"
          }`}
        />
      </span>
      <span
        className={`font-poppins text-[13px] font-medium ${
          checked ? "text-[#0F172A]" : "text-[#596273]"
        }`}
      >
        {label}
      </span>
    </label>
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

function CertificateUpload({
  fileName,
  onChange,
}: {
  fileName: string;
  onChange: (fileName: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <FieldLabel htmlFor="certificate-upload">Certificate Upload</FieldLabel>
      <input
        ref={inputRef}
        id="certificate-upload"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file.name);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-10 w-full items-center gap-2 rounded-[3px] border border-dashed border-[#B6BFCC] bg-[#F8FAFC] px-3 text-left transition-colors duration-150 hover:border-[#1F4FBF] hover:bg-[#F0F6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06439B]/30"
      >
        {fileName ? (
          <>
            <Check className="h-4 w-4 shrink-0 text-[#15803D]" />
            <span className="truncate font-poppins text-[13px] font-medium text-[#0F172A]">
              {fileName}
            </span>
          </>
        ) : (
          <>
            <UploadFileOutlined className="h-4 w-4 shrink-0 text-[#64748B]" />
            <span className="font-poppins text-[13px] text-[#596273]">
              Choose a file
            </span>
          </>
        )}
      </button>
    </div>
  );
}

function TextInput({
  id,
  label,
  value,
  type = "text",
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-[3px] border border-[#D7DCE3] bg-white px-3 text-[13px] text-[#0F172A] outline-none transition-colors duration-150 placeholder:text-[#94A3B8] hover:border-[#1F4FBF] focus:border-[#06439B] focus:ring-2 focus:ring-[#06439B]/20"
      />
    </div>
  );
}

function WizardFooter({
  onBack,
  onSaveDraft,
  onNext,
  saveStatus,
}: {
  onBack: () => void;
  onSaveDraft: () => void;
  onNext: () => void;
  saveStatus: SaveStatus;
}) {
  const isSaving = saveStatus === "saving";

  return (
    <footer className="fixed bottom-0 left-[270px] right-0 z-30 flex h-16 items-center justify-between border-t border-[#E5E7EB] bg-white px-[34px]">
      <button
        type="button"
        onClick={onBack}
        className="flex h-8 items-center gap-1.5 rounded-[4px] border border-[#06439B] bg-white px-4 font-poppins text-[13px] font-medium text-[#06439B] transition-all duration-200 hover:bg-[#F0F6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06439B]/30 focus-visible:ring-offset-2"
      >
        <ArrowBack className="h-4 w-4" />
        Back
      </button>

      <span className="absolute left-1/2 -translate-x-1/2 font-poppins text-[13px] font-medium text-[#64748B]">
        Step 6 of 10
      </span>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="flex h-8 items-center gap-1.5 rounded-[4px] border border-[#06439B] bg-white px-4 font-poppins text-[13px] font-medium text-[#06439B] transition-all duration-200 hover:bg-[#F0F6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06439B]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SaveOutlined className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Draft"}
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex h-8 w-[110px] items-center justify-center gap-1.5 rounded-[4px] border border-[#06439B] bg-[#06439B] font-poppins text-[13px] font-medium text-white transition-all duration-200 hover:bg-[#05307A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06439B]/30 focus-visible:ring-offset-2"
        >
          Next
          <ArrowForward className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
}

export function DisabilityInformationStep() {
  const router = useRouter();
  const form = useDisabilityForm();

  const handleNext = () => {
    if (form.attemptProceed()) {
      router.push("/portal/education");
    }
  };

  const handleSaveExit = () => {
    form.saveDraftNow();
    router.push("/portal");
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <PortalSidebar activeLabel="Disability" onSaveExit={handleSaveExit} />

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader />

        <main className="flex-1 px-6 py-8 pb-40 md:px-10">
          <div className="mx-auto w-full max-w-[1250px]">
            <PortalStepper currentStep={6} />

            <div className="mx-auto w-full max-w-[730px]">
              <section className="rounded-[3px] border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.05)] md:p-8">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 h-[28px] w-1 shrink-0 rounded-full bg-[#06439B]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="font-poppins text-[21px] font-bold leading-[1.2] text-[#0E3A8A]">
                        Disability Information
                      </h2>
                      <DraftStatus status={form.saveStatus} />
                    </div>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#7A8492]">
                      Provide specific details regarding functional limitations
                      and formal certifications.
                    </p>
                  </div>
                </div>

                <div aria-hidden="true" className="mt-6 h-px bg-[#E5E7EB]" />

                <div className="mt-7 grid gap-7 md:grid-cols-2">
                  <SelectField
                    value={form.data.disabilityType}
                    error={form.errors.disabilityType}
                    onChange={form.setDisabilityType}
                  />
                  <SeveritySlider
                    value={form.data.severityLevel}
                    onChange={form.setSeverityLevel}
                  />
                </div>

                <FormSection title="Affected Area">
                  <div className="grid gap-3 md:grid-cols-3">
                    {AFFECTED_AREA_OPTIONS.map((option) => (
                      <CheckboxCard
                        key={option.value}
                        label={option.label}
                        checked={form.data.affectedAreas.includes(option.value)}
                        onChange={() =>
                          form.toggleAffectedArea(option.value)
                        }
                      />
                    ))}
                  </div>
                  <FieldError message={form.errors.affectedAreas} />
                </FormSection>

                <FormSection title="Government Disability Certificate Issued?">
                  <div className="flex gap-8">
                    <RadioOption
                      name="certificate-issued"
                      checked={form.data.certificateIssued}
                      value={true}
                      label="Yes"
                      onChange={form.setCertificateIssued}
                    />
                    <RadioOption
                      name="certificate-issued"
                      checked={!form.data.certificateIssued}
                      value={false}
                      label="No"
                      onChange={form.setCertificateIssued}
                    />
                  </div>

                  {form.data.certificateIssued && (
                    <div className="conditional-reveal mt-5 grid gap-6 md:grid-cols-2">
                      <TextInput
                        id="certificate-number"
                        label="Certificate Number"
                        value={form.data.certificateNumber}
                        placeholder="e.g. D-12345"
                        onChange={form.setCertificateNumber}
                      />
                      <TextInput
                        id="issuing-authority"
                        label="Issuing Authority"
                        value={form.data.issuingAuthority}
                        placeholder="e.g. Ministry of Social Welfare"
                        onChange={form.setIssuingAuthority}
                      />
                      <TextInput
                        id="issue-date"
                        label="Issue Date"
                        type="date"
                        value={form.data.issueDate}
                        onChange={form.setIssueDate}
                      />
                      <CertificateUpload
                        fileName={form.data.certificateFileName}
                        onChange={form.setCertificateFileName}
                      />
                    </div>
                  )}
                </FormSection>
              </section>
            </div>
          </div>
        </main>

        <WizardFooter
          onBack={() => router.push("/portal/household")}
          onSaveDraft={form.saveDraftNow}
          onNext={handleNext}
          saveStatus={form.saveStatus}
        />
      </div>
    </div>
  );
}

export default DisabilityInformationStep;
