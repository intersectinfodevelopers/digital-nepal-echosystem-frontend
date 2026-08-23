"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import { PortalSidebar } from "@/components/Sidebar";
import { PortalStepper } from "@/components/Stepper";
import { PortalHeader } from "@/components/ui";
import { registerCitizen } from "@/services/citizenService";
import type { RegistrationFormData } from "@/types/citizen";


interface ReviewSubmitStepProps {
  formData?: RegistrationFormData;
  onNavigateToStep: (step: number) => void;
}


interface Field {
  label: string;
  value: string | number | boolean | null | undefined;
}

interface InfoCardProps {
  title: string;
  editStep?: number;
  onEdit?: (step: number) => void;
  fields: Field[];
  images?: { src: string; alt: string; label: string }[];
}

function InfoCard({ title, editStep, onEdit, fields, images }: InfoCardProps) {
  return (
    <div className="rounded-lg border border-[#D8DDE5] bg-white p-[14px] transition-all duration-200 hover:border-[#B0B8C4] hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-[#1F2A44]">{title}</h3>
        {editStep != null && onEdit && (
          <button
            type="button"
            onClick={() => onEdit(editStep)}
            className="text-[9px] font-bold uppercase tracking-wide text-[#C2183B] transition-colors hover:text-[#A0152E]"
          >
            EDIT
          </button>
        )}
      </div>
      <div className="mt-[8px] h-px bg-[#D9DEE5]" />
      <div className="mt-[10px]">
        {fields.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {fields.map((field, idx) => (
              <div key={idx}>
                <p className="mb-1 text-[8px] font-semibold uppercase tracking-wider text-[#808B9E]">
                  {field.label}
                </p>
                <p className="text-[10px] font-medium text-[#1F2937]">
                  {field.value != null && field.value !== ""
                    ? String(field.value)
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        )}
        {images && images.length > 0 && (
          <div className="mt-3 flex gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-wider text-[#808B9E]">
                  {img.label}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-[45px] w-[65px] rounded border border-[#D9DEE5] object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function field(label: string, value: string | number | boolean | null | undefined): Field {
  return { label, value };
}

export function ReviewSubmitStep({
  formData,
  onNavigateToStep,
}: ReviewSubmitStepProps) {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");

  if (!formData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E8EEF7]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#06439D]" />
          <p className="text-[12px] font-medium text-[#687386]">
            Loading form data...
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!isConfirmed) return;
    setIsSubmitting(true);

    // Persist the citizen record so it appears on the citizens page
    try {
      if (formData) {
        registerCitizen(formData);
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "prapti_registration_v1",
          JSON.stringify(formData),
        );
        window.localStorage.setItem(
          "prapti_submitted_at",
          new Date().toISOString(),
        );
      }
    } catch {
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setRegistrationNumber(`REG-${Date.now().toString(36).toUpperCase()}`);
    }, 2000);
  };

  const handleReturnHome = () => {
    router.push("/ward/dashboard");
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E8EEF7] px-4">
        <div className="w-full max-w-[520px] rounded-lg border border-[#D8DDE5] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F5E9]">
            <svg
              className="h-10 w-10 text-[#16A34A]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-3 text-xl font-bold text-[#1F2A44]">
            Registration Submitted Successfully
          </h2>
          <p className="mb-6 text-[11px] leading-relaxed text-[#687386]">
            Your citizen registration has been submitted and will enter the
            verification queue. You will be notified once the process is
            complete.
          </p>
          <div className="mb-8 rounded-md border border-[#E5E7EB] bg-[#F7F8FA] px-6 py-4">
            <p className="mb-1 text-[8px] font-semibold uppercase tracking-wider text-[#808B9E]">
              Registration Number
            </p>
            <p className="text-[14px] font-bold text-[#06439D]">
              {registrationNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={handleReturnHome}
            className="h-[36px] w-full rounded-[6px] bg-[#06439D] px-6 font-poppins text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-[#05357D]"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E8EEF7]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#06439D]" />
          <p className="text-[12px] font-medium text-[#687386]">
            Submitting your registration...
          </p>
        </div>
      </div>
    );
  }

  const personalFields = [
    field("NAME", formData.name_en),
    field("GENDER", formData.sex),
    field("DATE OF BIRTH", formData.dob),
    field("NATIONALITY", "Nepali"),
  ];

  const nidImages = [
    ...(formData.citizenship_front
      ? [{ src: formData.citizenship_front, alt: "NID Front", label: "FRONT IMAGE" }]
      : []),
    ...(formData.citizenship_back
      ? [{ src: formData.citizenship_back, alt: "NID Back", label: "BACK IMAGE" }]
      : []),
  ];

  const familyFields = [
    field("RELATIONSHIP", formData.father?.relationship ?? "Father"),
    field("NAME", formData.father?.name_en),
    field("RELATIONSHIP", formData.mother?.relationship ?? "Mother"),
    field("NAME", formData.mother?.name_en),
  ];

  const employmentFields = [
    field("STATUS", formData.employment?.category),
    field("EMPLOYER", formData.employment?.gov_ministry || formData.employment?.foreign_employer_name || formData.employment?.student_institution),
    field("MONTHLY INCOME", formData.employment?.income_band),
    field("PAN NUMBER", formData.employment?.gov_grade),
  ];

  const householdFields = [
    field(
      "PRIMARY RESIDENCE ADDRESS",
      formData.household?.address ?? formData.household?.house_type,
    ),
    field(
      "YEARS AT RESIDENCE",
      formData.household?.years_at_residence ?? formData.household?.room_count,
    ),
    field(
      "OWNERSHIP STATUS",
      formData.household?.ownership_status ?? formData.household?.sanitation,
    ),
    field("ROOMS", formData.household?.room_count),
  ];

  const disabilityFields = [
    field("DISABILITY TYPE", formData.disability?.disability_type),
    field("SEVERITY", formData.disability?.severity_body),
    field("AFFECTED AREA", formData.disability?.certificate_no),
  ];

  const educationFields = [
    field("EDUCATION LEVEL", formData.education?.level),
    field("EDUCATION STATUS", formData.education?.institution_type),
    field("INSTITUTION", formData.education?.institution_name),
    field("LOCATION", formData.education?.study_location),
  ];

  const photoImages = formData.photo
    ? [{ src: formData.photo, alt: "Citizen Photo", label: "" }]
    : [];

  const gpsFields = [
    field("LATITUDE", formData.gps?.latitude),
    field("LONGITUDE", formData.gps?.longitude),
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <PortalSidebar activeLabel="Personal Info" />

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader />

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8 pb-40 md:px-10">
          <PortalStepper currentStep={10} />

          <div className="max-w-[1080px]">
            <h1 className="mb-2 text-[22px] font-extrabold text-[#06439D]">
              Review & Submit
            </h1>
            <p className="mb-[22px] max-w-[800px] text-[11px] leading-relaxed text-[#687386]">
              Please verify all the information below before final submission.
              Once submitted, your registration will enter the verification
              queue.
            </p>

            <div className="grid grid-cols-2 gap-[22px]">
              <InfoCard
                title="Personal Information"
                editStep={1}
                onEdit={onNavigateToStep}
                fields={personalFields}
              />

              <InfoCard
                title="NID / Citizenship"
                editStep={2}
                onEdit={onNavigateToStep}
                fields={[
                  field("NID NUMBER", formData.nid_number),
                  field(
                    "CITIZENSHIP NUMBER",
                    formData.citizenship_number,
                  ),
                ]}
                images={nidImages.length > 0 ? nidImages : undefined}
              />

              <InfoCard
                title="Family Information"
                editStep={3}
                onEdit={onNavigateToStep}
                fields={familyFields}
              />

              <InfoCard
                title="Employment Details"
                editStep={4}
                onEdit={onNavigateToStep}
                fields={employmentFields}
              />

              <InfoCard
                title="Household Details"
                editStep={5}
                onEdit={onNavigateToStep}
                fields={householdFields}
              />

              <InfoCard
                title="Disability Information"
                editStep={6}
                onEdit={onNavigateToStep}
                fields={disabilityFields}
              />

              <InfoCard
                title="Education Information"
                editStep={7}
                onEdit={onNavigateToStep}
                fields={educationFields}
              />

              <InfoCard
                title="Citizen Photo"
                editStep={8}
                onEdit={onNavigateToStep}
                fields={[]}
                images={
                  photoImages.length > 0
                    ? photoImages.map((img) => ({
                        ...img,
                        alt: "Citizen Photo",
                        label: "",
                      }))
                    : undefined
                }
              />

              <InfoCard
                title="GPS & Location"
                editStep={9}
                onEdit={onNavigateToStep}
                fields={gpsFields}
              />
            </div>
          </div>
        </main>
        <footer className="fixed bottom-0 left-[270px] right-0 z-30 flex h-[76px] items-center justify-between border-t border-[#D8DDE5] bg-white px-6 md:px-10">
          <button
            type="button"
            onClick={() => onNavigateToStep(9)}
            className="flex h-12 items-center justify-center gap-1.5 rounded-[8px] border border-[#D1D5DB] bg-white px-5 font-poppins text-[13px] font-bold text-[#0E3A8A] transition-colors duration-150 hover:border-[#0E3A8A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3A8A] focus-visible:ring-offset-2"
          >
            <ArrowBack className="h-4 w-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            {/* Confirmation Checkbox */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="h-[18px] w-[18px] cursor-pointer rounded border border-[#CBD2DC] accent-[#06439D]"
              />
              <span className="max-w-[400px] text-[10px] leading-relaxed text-[#687386]">
                I confirm the information is accurate and understand that
                providing false data is a regulatory offense.
              </span>
            </label>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isConfirmed}
              className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#0E3A8A] px-6 font-poppins text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(14,58,138,0.3)] transition-colors duration-150 hover:bg-[#0A2D6D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3A8A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit
              <ArrowForward className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
