"use client";

import React, { useState } from "react";
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
  PersonOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import { PortalStepper } from "@/components/Stepper";
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col min-w-0"> 
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-[#E4E8EF] flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-[10px] bg-[#0A2D6D] flex items-center justify-center">
            <VerifiedUserOutlined className="w-[18px] h-[18px] text-white" />
          </span>
          <div className="flex items-baseline gap-2.5">
            <span className="font-poppins font-bold text-[19px] tracking-[0.04em] text-[#0A2D6D]">
              PRAPTI
            </span>
            <span className="hidden md:inline text-[12px] font-medium text-[#6B7280]">
              Digital Citizen Services
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-label="Account profile"
          className="w-9 h-9 rounded-full border-[1.5px] border-[#D9DEE8] bg-white flex items-center justify-center hover:border-[#0A2D6D] hover:bg-[#F1F4FB] transition-colors"
        >
          <PersonOutlined className="w-[18px] h-[18px] text-[#0A2D6D]" />
        </button>
      </header>

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-6 md:px-10 py-8 pb-40">
        <PortalStepper currentStep={1} />
        <section className="flex flex-col gap-6 border-b border-[#E4E8EF] pb-10 sm:flex-row sm:items-start sm:gap-8">
          <div className="flex size-28 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[rgba(15,77,184,0.25)] bg-[#EEF4FF]">
            <CameraIcon sx={{ fontSize: 28, color: "#0F4DB8", opacity: 0.6 }} />
          </div>
          <div>
            <h2 className="font-poppins text-2xl font-extrabold tracking-tight text-[#0A2D6D]">
              Profile Identification
            </h2>
            <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-[#6B7280]">
              Please ensure your photograph is clear and matches your NID
              documentation for automated verification.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="flex h-11 items-center gap-2 rounded-[10px] bg-[#0A2D6D] px-5 font-semibold text-[15px] text-white shadow-[0_8px_20px_rgba(10,45,109,0.25)] transition-all duration-200 hover:bg-[#081F4D] active:scale-[0.98]"
              >
                <CameraIcon sx={{ fontSize: 16 }} />
                Take Photo
              </button>
              <button
                type="button"
                className="flex h-11 items-center gap-2 rounded-[10px] border-[1.5px] border-[#0A2D6D] px-5 font-semibold text-[15px] text-[#0A2D6D] transition-all duration-200 hover:bg-[#F1F4FB] active:scale-[0.98]"
              >
                <UploadIcon sx={{ fontSize: 16 }} />
                Upload File
              </button>
            </div>
          </div>
        </section>
        <section className="mt-10 rounded-3xl border border-[#E3E8F2] bg-white p-8 md:p-10 shadow-[0_8px_24px_rgba(15,61,145,0.08)]">
          <h3 className="font-poppins text-xl font-extrabold tracking-tight text-[#0A2D6D]">
            Identify Yourself
          </h3>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#6B7280]">
            Please provide your official details as per your national
            identification documents to ensure proper verification.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="full-name"
                className="block text-sm font-medium text-[#1F2A44]"
              >
                Full Name (As per NID/Citizenship)
              </label>
              <TextField
                id="full-name"
                fullWidth
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                className="form-input-rounded"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-[#1F2A44]"
              >
                Date of Birth
              </label>
              <TextField
                id="dob"
                fullWidth
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="form-input-rounded"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="block text-sm font-medium text-[#1F2A44]">
                Gender
              </label>
              <RadioGroup
                row
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="gap-6"
              >
                {GENDERS.map((g) => (
                  <FormControlLabel
                    key={g}
                    value={g}
                    control={
                      <Radio
                        sx={{
                          color: "#D9DEE8",
                          "&.Mui-checked": { color: "#0A2D6D" },
                          "& .MuiSvgIcon-root": { fontSize: 20 },
                        }}
                      />
                    }
                    label={
                      <span className="text-[15px] font-normal text-[#1F2A44]">
                        {GENDER_LABELS[g]}
                      </span>
                    }
                    className="m-0"
                  />
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="nationality"
                className="block text-sm font-medium text-[#1F2A44]"
              >
                Nationality
              </label>
              <Select
                id="nationality"
                fullWidth
                displayEmpty
                value={formData.nationality}
                onChange={(e) => handleChange("nationality", e.target.value)}
                className="form-select-rounded"
                renderValue={(value) =>
                  value ? (
                    value
                  ) : (
                    <span className="text-[#9AA3B2]">Select Nationality</span>
                  )
                }
                MenuProps={{
                  slotProps: {
                    paper: {
                      sx: {
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(15,61,145,0.16)",
                      },
                    },
                  },
                }}
              >
                {NATIONALITIES.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="mobile-number"
                className="block text-sm font-medium text-[#1F2A44]"
              >
                Mobile Number
              </label>
              <div className="flex gap-2">
                <Select
                  id="mobile-country-code"
                  value={formData.mobile_country_code}
                  onChange={(e) =>
                    handleChange("mobile_country_code", e.target.value)
                  }
                  className="form-select-rounded w-28 shrink-0"
                  MenuProps={{
                    slotProps: {
                      paper: {
                        sx: {
                          borderRadius: "12px",
                          boxShadow: "0 8px 24px rgba(15,61,145,0.16)",
                        },
                      },
                    },
                  }}
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
                  className="form-input-rounded flex-1"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#1F2A44]"
              >
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
                className="form-input-rounded"
              />
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl border-l-4 border-[#0A2D6D] bg-[#EEF4FF] p-5">
            <InfoIcon
              sx={{ fontSize: 20, color: "#0A2D6D" }}
              className="mt-0.5 shrink-0"
            />
            <p className="text-sm leading-relaxed text-[#6B7280]">
              Your information is protected by industry-standard encryption.
              Data collected here is used solely for identity verification
              within the Digital Nepal Ecosystem.
            </p>
          </div>
        </section>
      </main>
      <footer className="fixed bottom-0 left-[270px] right-0 z-30 bg-white/95 backdrop-blur border-t border-[#E3E8F2] h-[80px] px-6 md:px-10 flex items-center justify-between shadow-[0_-4px_16px_rgba(15,61,145,0.05)]">
        <button
          type="button"
          className="h-12 px-7 rounded-xl border-[1.5px] border-[#D9DEE8] bg-white text-[#1F2A44] font-semibold text-[15px] hover:border-[#6B7280] hover:bg-[#F8F9FB] transition-all duration-200 active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2"
        >
          <ArrowBack className="w-5 h-5" />
          Back
        </button>

        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            className="h-12 px-7 rounded-xl border-[1.5px] border-[#D9DEE8] bg-white text-[#1F2A44] font-semibold text-[15px] hover:border-[#6B7280] hover:bg-[#F8F9FB] transition-all duration-200 active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => router.push("/portal/nid")}
            className="h-12 px-8 rounded-xl bg-[#0A2D6D] text-white font-semibold text-[15px] shadow-[0_8px_20px_rgba(10,45,109,0.3)] hover:bg-[#081F4D] transition-all duration-200 active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2"
          >
            Next Step
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
