"use client";

import React from "react";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import { registerCitizen } from "@/services/citizenService";
import { PortalStepper } from "@/components/Stepper";
import { SubmitStep } from "@/components/ui";

export default function WardRegisterCitizenPage() {
  const {
    step,
    formData,
    updateField,
    nextStep,
    prevStep,
    resetForm,
  } = useRegistrationForm();

  const handleFileUpload =
    (field: "citizenship_front" | "citizenship_back") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        updateField(field, url);
      }
    };

  const handleSubmit = async () => {
    try {
      await registerCitizen(formData);
      alert("Citizen profile created and sent for verification!");
      resetForm();
    } catch {
      alert("Submission failed. Please check connectivity and try again.");
    }
  };

  const getSidebarActiveLabel = () => {
    switch (step) {
      case 1:
        return "Personal Info";
      case 2:
        return "NID Upload";
      case 3:
        return "Family Info";
      case 4:
        return "Employment";
      default:
        return "Household";
    }
  };

  const getHeaderTitle = () => {
    const titles = [
      "Personal Information",
      "NID / Citizenship Upload",
      "Family Tree",
      "Employment Details",
      "Household Information",
      "Disability Records",
      "Educational Background",
      "Biometric Photo",
      "Geo-Location (GPS)",
      "Final Review & Submit",
    ];
    return titles[step - 1] || "Citizen Registration";
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <div className="hidden lg:block w-[280px] shrink-0">
        <div className="sticky top-0">
          <div className="bg-white border-b border-gray-100 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#0A3E9E] text-white shadow-sm">
                RC
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A3E9E]">Register Citizen</p>
                <p className="text-xs text-[#6B7280]">Ward staff flow</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-[#64748B]">
              <div className="rounded-xl bg-[#F8FAFC] p-3">Step 1 - Personal Info</div>
              <div className="rounded-xl bg-[#F8FAFC] p-3">Step 2 - NID Upload</div>
              <div className="rounded-xl bg-[#F8FAFC] p-3">Step 3 - Family Info</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col min-w-0">
        <div className="h-20 px-10 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-20">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Ward staff registration</p>
            <h1 className="text-2xl font-bold text-[#0A3E9E]">{getHeaderTitle()}</h1>
          </div>
        </div>

        <div className="px-10 py-6 bg-white border-b border-gray-100 shadow-sm">
          <PortalStepper currentStep={step} />
        </div>

        <div className="flex-grow p-10 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto pb-32">
            {step === 2 ? (
              <div className="space-y-8">
                <div className="rounded-[40px] border border-gray-200 bg-white p-12 shadow-sm">
                  <div className="mb-12">
                    <h2 className="text-3xl font-bold text-[#0B3A84] mb-4">Identity Verification</h2>
                    <p className="text-[#64748B] text-xl font-medium">
                      Please upload high-resolution photos of your National Identity Card or Citizenship Document.
                    </p>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {([
                      { field: "citizenship_front", title: "Front Side" },
                      { field: "citizenship_back", title: "Back Side" },
                    ] as const).map(({ field, title }) => (
                      <div key={field} className="text-center">
                        <h3 className="mb-5 text-xl font-bold text-[#0B3A84]">
                          {title} <span className="text-[#C61F3B]">*</span>
                        </h3>
                        {formData[field] ? (
                          <div className="relative">
                            <div className="flex flex-col items-center justify-center h-80 rounded-[3rem] border-4 border-green-300 bg-green-50/30 shadow-inner">
                              <img
                                src={formData[field]}
                                alt={title}
                                className="w-full h-full object-contain p-4"
                              />
                              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-white shadow-lg">
                                Uploaded
                              </div>
                            </div>
                            <div className="mt-4 flex justify-center gap-3">
                              <label className="inline-flex items-center gap-2 rounded-full bg-[#0B3A84] px-6 py-2.5 text-white shadow-md hover:bg-[#092d6b] transition-all">
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={handleFileUpload(field as "citizenship_front" | "citizenship_back")}
                                  accept="image/*"
                                />
                                Replace
                              </label>
                              <button
                                type="button"
                                onClick={() => updateField(field as "citizenship_front" | "citizenship_back", null)}
                                className="rounded-full border border-[#C61F3B] bg-white px-6 py-2.5 text-[#C61F3B] shadow-md hover:bg-red-50 transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="group flex h-80 flex-col items-center justify-center rounded-[3rem] border-4 border-dashed border-gray-300 bg-gray-50/30 px-8 text-center transition-all hover:border-[#0B3A84] hover:bg-blue-50/50">
                            <input
                              type="file"
                              className="hidden"
                              onChange={handleFileUpload(field as "citizenship_front" | "citizenship_back")}
                              accept="image/*,.pdf"
                            />
                            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-blue-100 text-[#0B3A84] shadow-md">
                              Upload
                            </div>
                            <div className="space-y-2 text-[#64748B] text-left">
                              <p className="text-xl font-bold text-[#0B3A84]">Take photo or upload</p>
                              <p>Drag & drop your file here</p>
                              <p className="text-sm text-[#94A3B8]">JPG, PNG, or PDF — Max 5MB</p>
                            </div>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-[2.5rem] border border-blue-100 bg-[#F0F7FF] p-10 shadow-sm">
                    <p className="text-2xl font-bold text-[#0B3A84] mb-4">Upload Guidelines</p>
                    <ul className="space-y-3 text-[#0B3A84] opacity-90 text-lg font-medium">
                      <li>Avoid glare and direct flash on the document surface.</li>
                      <li>Place the document against a dark, non-reflective background.</li>
                      <li>Ensure all four corners of the document are visible.</li>
                      <li>Ensure all text and barcodes are perfectly legible.</li>
                    </ul>
                  </div>
                  <div className="rounded-[2.5rem] border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="font-semibold text-[#0B3A84]">Good Example</p>
                    <p className="mt-2 text-sm text-[#64748B]">Use a clean, well-lit photo with all details visible.</p>
                  </div>
                  <div className="rounded-[2.5rem] border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="font-semibold text-[#0B3A84]">Avoid Blur</p>
                    <p className="mt-2 text-sm text-[#64748B]">Blurry images may be rejected during verification.</p>
                  </div>
                </div>
              </div>
            ) : step <= 9 ? (
              <div className="rounded-[40px] border border-gray-200 bg-white p-12 shadow-sm text-center">
                <h2 className="text-3xl font-bold text-[#0B3A84] mb-3">{getHeaderTitle()}</h2>
                <p className="text-[#64748B] text-lg">This step is under development and will be available soon.</p>
              </div>
            ) : (
              <SubmitStep formData={formData} onSubmit={handleSubmit} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
