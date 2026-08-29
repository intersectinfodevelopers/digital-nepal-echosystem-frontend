"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TextField,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward as ArrowRightIcon,
  CameraAltOutlined as CameraIcon,
  CloudUploadOutlined as UploadIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import { RegistrationWorkspace } from "@/components/RegistrationWorkspace";
import {
  GENDER_LABELS,
  GENDERS,
  MOBILE_COUNTRY_CODES,
  NATIONALITIES,
} from "@/constants";

export function PersonalStep() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: "",
    dob: "",
    gender: "",
    nationality: "",
    mobile_country_code: "+977",
    mobile_number: "",
    email: "",
  });
  const [draftStatus, setDraftStatus] = useState("Saved just now ✓");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const persistDraft = useCallback(() => {
    const sexMap: Record<string, string> = {
      male: "MALE",
      female: "FEMALE",
      other: "OTHER",
    };
    const payload = {
      name_np: "",
      name_en: formData.full_name,
      dob: formData.dob,
      sex: sexMap[formData.gender] ?? "",
      nationality: formData.nationality,
      consent_channel: "PORTAL",
    };
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "prapti_personal_draft_v1",
          JSON.stringify(payload),
        );
        window.localStorage.setItem(
          "prapti_registration_v1",
          JSON.stringify({ ...payload, ...formData }),
        );
      }
      setDraftStatus("Saved just now ✓");
    } catch {
      setDraftStatus("Offline — saved locally");
    }
  }, [formData]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraftStatus("Saving...");
      persistDraft();
    }, 400);

    return () => window.clearTimeout(timer);
  }, [formData, persistDraft]);

  const handleSaveDraft = () => {
    persistDraft();
  };

  const handleNext = () => {
    persistDraft();
    router.push("/ward/dashboard/registercitizen/nid");
  };

  return (
    <RegistrationWorkspace
      title="Profile Identification"
      subtitle="Enter the citizen’s identity details clearly and accurately before moving to the verification workflow."
      currentStep={1}
      totalSteps={10}
      completedSteps={1}
      draftStatus={draftStatus}
    >
      <div className="space-y-7">
        <section className="rounded-[22px] border border-[#e7edf4] bg-[#f9fbff] p-5 sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-[#a9bedf] bg-[#edf4ff] text-[#0A2D6D]">
                <CameraIcon sx={{ fontSize: 28 }} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#0A2D6D]">Identity Capture</h2>
                <p className="text-sm text-[#647084]">
                  Photograph and identity documents can be attached before submission.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A2D6D] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(10,45,109,0.2)]"
              >
                <CameraIcon sx={{ fontSize: 16 }} />
                Take Photo
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-[#d5ddea] bg-white px-4 py-2.5 text-sm font-semibold text-[#0A2D6D]"
              >
                <UploadIcon sx={{ fontSize: 16 }} />
                Upload File
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-[#e7edf4] bg-white p-5 sm:p-6">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border-l-4 border-[#0F4DB8] bg-[#eef5ff] p-4">
            <InfoIcon sx={{ fontSize: 18, color: "#0F4DB8" }} />
            <p className="text-sm leading-6 text-[#49576c]">
              At least one identity document is required. Citizenship and NID can be uploaded together when available.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="full-name" className="block text-sm font-semibold text-[#1F2A44]">
                Full Name (As per NID / Citizenship)
              </label>
              <TextField
                id="full-name"
                fullWidth
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dob" className="block text-sm font-semibold text-[#1F2A44]">
                Date of Birth
              </label>
              <TextField id="dob" fullWidth type="date" value={formData.dob} onChange={(e) => handleChange("dob", e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-[#1F2A44]">Gender</label>
              <RadioGroup row value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} className="gap-6">
                {GENDERS.map((g) => (
                  <FormControlLabel
                    key={g}
                    value={g}
                    control={<Radio sx={{ color: "#D9DEE8", "&.Mui-checked": { color: "#0A2D6D" }, "& .MuiSvgIcon-root": { fontSize: 20 } }} />}
                    label={<span className="text-[15px] font-medium text-[#1F2A44]">{GENDER_LABELS[g]}</span>}
                    className="m-0"
                  />
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label htmlFor="nationality" className="block text-sm font-semibold text-[#1F2A44]">
                Nationality
              </label>
              <Select
                id="nationality"
                fullWidth
                displayEmpty
                value={formData.nationality}
                onChange={(e) => handleChange("nationality", e.target.value)}
                renderValue={(value) => value ? value : <span className="text-[#9AA3B2]">Select nationality</span>}
              >
                {NATIONALITIES.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="mobile-number" className="block text-sm font-semibold text-[#1F2A44]">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <Select
                  id="mobile-country-code"
                  value={formData.mobile_country_code}
                  onChange={(e) => handleChange("mobile_country_code", e.target.value)}
                  sx={{ width: 110 }}
                >
                  {MOBILE_COUNTRY_CODES.map((code) => (
                    <MenuItem key={code} value={code}>
                      {code}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  id="mobile-number"
                  fullWidth
                  placeholder="98XXXXXXXX"
                  value={formData.mobile_number}
                  onChange={(e) => handleChange("mobile_number", e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 10, inputMode: "numeric" } }}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="email" className="block text-sm font-semibold text-[#1F2A44]">
                Email Address
              </label>
              <TextField
                id="email"
                fullWidth
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                slotProps={{ htmlInput: { maxLength: 255 } }}
              />
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-[#E3E8F2] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d7deea] bg-white px-5 py-3 text-sm font-semibold text-[#1F2A44]"
        >
          <ArrowBack className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center justify-center rounded-xl border border-[#d7deea] bg-white px-5 py-3 text-sm font-semibold text-[#1F2A44]"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2D6D] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(10,45,109,0.2)]"
          >
            Next Step
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </RegistrationWorkspace>
  );
}
