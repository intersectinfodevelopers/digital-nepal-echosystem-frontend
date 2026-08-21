"use client";

import React from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Paper,
  IconButton,
} from "@mui/material";
import {
  NotificationsNoneOutlined as IconBell,
  AccountCircleOutlined as IconUser,
  InfoOutlined as IconInfo,
  ArrowForward as IconNext,
  ArrowBack as IconBack,
  CheckCircleOutlined as IconCheck,
  DeleteOutlineOutlined as IconDelete,
  CloudUploadOutlined as IconCloudUpload,
  SwapHorizOutlined as IconSwap,
} from "@mui/icons-material";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import { PortalSidebar } from "@/components/Sidebar";
import { PortalStepper } from "@/components/Stepper";
import { ReviewSubmitStep } from "@/components/ReviewSubmitStep";
import Image from "next/image";

export default function NewCitizenPage() {
  const {
    step,
    formData,
    updateField,
    nextStep,
    prevStep,
  } = useRegistrationForm();

  // Handle file upload preview and state update
  const handleFileUpload =
    (field: "citizenship_front" | "citizenship_back") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        updateField(field, url);
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
    <Box className="flex min-h-screen bg-[#F5F7FA]">
      <Box className="hidden lg:block w-[280px] shrink-0">
        <PortalSidebar activeLabel={getSidebarActiveLabel()} />
      </Box>
      <Box className="flex-grow flex flex-col min-w-0">
        <Box
          component="header"
          className="h-20 px-10 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm"
        >
          <Typography
            variant="h5"
            className="font-poppins font-bold text-[#0F172A]"
          >
            {getHeaderTitle()}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <IconButton className="text-gray-400 hover:bg-gray-50 transition-colors">
              <IconBell />
            </IconButton>
            <IconButton className="text-gray-400 hover:bg-gray-50 transition-colors">
              <IconUser sx={{ fontSize: 32 }} />
            </IconButton>
          </Stack>
        </Box>

        <Box className="px-10 py-6 bg-white border-b border-gray-100 shadow-sm">
          <PortalStepper currentStep={step} />
        </Box>
        <Box className="flex-grow p-10 overflow-y-auto bg-[#F8FAFC]">
          <Box className="max-w-6xl mx-auto pb-32">
            {step === 2 && (
              <Stack spacing={5}>
                <Paper
                  elevation={0}
                  className="p-12 border border-gray-200 rounded-[40px] bg-white shadow-sm"
                >
                  <Box className="mb-12">
                    <Typography
                      variant="h4"
                      className="font-poppins font-bold text-[#0B3A84] mb-4 tracking-tight"
                    >
                      Identity Verification
                    </Typography>
                    <Typography className="text-[#64748B] text-xl max-w-3xl leading-relaxed font-medium">
                      Please upload high-resolution photos of your National
                      Identity Card or Citizenship Document.
                    </Typography>
                  </Box>

                  <Stack
                    direction={{ lg: "row" }}
                    spacing={6}
                    className="mb-12"
                  >
                    <Box className="flex-1 text-center">
                      <Typography className="font-poppins font-bold text-[#0B3A84] mb-5 text-xl">
                        Front Side <span className="text-[#C61F3B]">*</span>
                      </Typography>
                      {formData.citizenship_front ? (
                        <Box className="relative">
                          <Box className="flex flex-col items-center justify-center h-80 border-4 border-green-300 rounded-[3rem] overflow-hidden bg-green-50/30 shadow-inner">
                            <Image
                              src={formData.citizenship_front}
                              alt="Front"
                              className="w-full h-full object-contain p-4"
                            />
                            <Box className="absolute top-4 left-4 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
                              <IconCheck sx={{ fontSize: 20 }} />
                              <Typography className="font-poppins font-bold text-sm">
                                Uploaded
                              </Typography>
                            </Box>
                          </Box>
                          <Stack
                            direction="row"
                            spacing={2}
                            className="mt-4 justify-center"
                          >
                            <label className="group relative flex items-center gap-2 bg-[#0B3A84] text-white px-6 py-2.5 rounded-full cursor-pointer hover:bg-[#092d6b] transition-all shadow-md">
                              <input
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload("citizenship_front")}
                                accept="image/*"
                              />
                              <IconSwap sx={{ fontSize: 18 }} />
                              <Typography className="font-poppins font-bold text-sm">
                                Replace
                              </Typography>
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                updateField("citizenship_front", null)
                              }
                              className="flex items-center gap-2 bg-white text-[#C61F3B] border-2 border-[#C61F3B] px-6 py-2.5 rounded-full cursor-pointer hover:bg-red-50 transition-all shadow-md"
                            >
                              <IconDelete sx={{ fontSize: 18 }} />
                              <Typography className="font-poppins font-bold text-sm">
                                Remove
                              </Typography>
                            </button>
                          </Stack>
                        </Box>
                      ) : (
                        <label className="group relative flex flex-col items-center justify-center h-80 border-4 border-dashed border-gray-300 rounded-[3rem] cursor-pointer hover:border-[#0B3A84] hover:bg-blue-50/50 transition-all overflow-hidden bg-gray-50/30 shadow-inner">
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload("citizenship_front")}
                            accept="image/*,.pdf"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.parentElement?.classList.add(
                                "border-[#0B3A84]",
                                "bg-blue-50/50",
                              );
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.parentElement?.classList.remove(
                                "border-[#0B3A84]",
                                "bg-blue-50/50",
                              );
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.parentElement?.classList.remove(
                                "border-[#0B3A84]",
                                "bg-blue-50/50",
                              );
                            }}
                          />
                          <Stack sx={{ alignItems: "center" }} spacing={3}>
                            <Box className="w-[5.5rem] h-[5.5rem] bg-blue-100 rounded-[1.5rem] flex items-center justify-center text-[#0B3A84] group-hover:scale-110 group-hover:bg-[#0B3A84] group-hover:text-white transition-all duration-500 shadow-md">
                              <IconCloudUpload sx={{ fontSize: 48 }} />
                            </Box>
                            <Typography className="font-poppins font-bold text-[#0B3A84] text-2xl">
                              Take photo or upload
                            </Typography>
                            <Typography className="text-[#64748B] text-base font-medium">
                              Drag &amp; Drop your file here
                            </Typography>
                            <Typography className="text-[#94A3B8] text-sm font-medium">
                              JPG, PNG, or PDF — Max 5MB
                            </Typography>
                          </Stack>
                        </label>
                      )}
                    </Box>

                    {/* Back Side Upload */}
                    <Box className="flex-1 text-center">
                      <Typography className="font-poppins font-bold text-[#0B3A84] mb-5 text-xl">
                        Back Side <span className="text-[#C61F3B]">*</span>
                      </Typography>
                      {formData.citizenship_back ? (
                        <Box className="relative">
                          <Box className="flex flex-col items-center justify-center h-80 border-4 border-green-300 rounded-[3rem] overflow-hidden bg-green-50/30 shadow-inner">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={formData.citizenship_back}
                              alt="Back"
                              className="w-full h-full object-contain p-4"
                            />
                            <Box className="absolute top-4 left-4 flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
                              <IconCheck sx={{ fontSize: 20 }} />
                              <Typography className="font-poppins font-bold text-sm">
                                Uploaded
                              </Typography>
                            </Box>
                          </Box>
                          <Stack
                            direction="row"
                            spacing={2}
                            className="mt-4 justify-center"
                          >
                            <label className="group relative flex items-center gap-2 bg-[#0B3A84] text-white px-6 py-2.5 rounded-full cursor-pointer hover:bg-[#092d6b] transition-all shadow-md">
                              <input
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload("citizenship_back")}
                                accept="image/*"
                              />
                              <IconSwap sx={{ fontSize: 18 }} />
                              <Typography className="font-poppins font-bold text-sm">
                                Replace
                              </Typography>
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                updateField("citizenship_back", null)
                              }
                              className="flex items-center gap-2 bg-white text-[#C61F3B] border-2 border-[#C61F3B] px-6 py-2.5 rounded-full cursor-pointer hover:bg-red-50 transition-all shadow-md"
                            >
                              <IconDelete sx={{ fontSize: 18 }} />
                              <Typography className="font-poppins font-bold text-sm">
                                Remove
                              </Typography>
                            </button>
                          </Stack>
                        </Box>
                      ) : (
                        <label className="group relative flex flex-col items-center justify-center h-80 border-4 border-dashed border-gray-300 rounded-[3rem] cursor-pointer hover:border-[#0B3A84] hover:bg-blue-50/50 transition-all overflow-hidden bg-gray-50/30 shadow-inner">
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload("citizenship_back")}
                            accept="image/*,.pdf"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.parentElement?.classList.add(
                                "border-[#0B3A84]",
                                "bg-blue-50/50",
                              );
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.parentElement?.classList.remove(
                                "border-[#0B3A84]",
                                "bg-blue-50/50",
                              );
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.parentElement?.classList.remove(
                                "border-[#0B3A84]",
                                "bg-blue-50/50",
                              );
                            }}
                          />
                          <Stack sx={{ alignItems: "center" }} spacing={3}>
                            <Box className="w-[5.5rem] h-[5.5rem] bg-blue-100 rounded-[1.5rem] flex items-center justify-center text-[#0B3A84] group-hover:scale-110 group-hover:bg-[#0B3A84] group-hover:text-white transition-all duration-500 shadow-md">
                              <IconCloudUpload sx={{ fontSize: 48 }} />
                            </Box>
                            <Typography className="font-poppins font-bold text-[#0B3A84] text-2xl">
                              Take photo or upload
                            </Typography>
                            <Typography className="text-[#64748B] text-base font-medium">
                              Drag &amp; Drop your file here
                            </Typography>
                            <Typography className="text-[#94A3B8] text-sm font-medium">
                              JPG, PNG, or PDF — Max 5MB
                            </Typography>
                          </Stack>
                        </label>
                      )}
                    </Box>
                  </Stack>

                  <Box className="bg-[#F0F7FF] p-10 rounded-[2.5rem] border border-blue-100 flex gap-6 shadow-sm">
                    <IconInfo
                      className="text-[#0B3A84] mt-1"
                      sx={{ fontSize: 32 }}
                    />
                    <Box>
                      <Typography className="font-poppins font-bold text-[#0B3A84] mb-4 text-2xl">
                        Upload Guidelines
                      </Typography>
                      <Stack
                        spacing={2.5}
                        className="text-[#0B3A84] opacity-90 text-lg font-medium"
                      >
                        <Box className="flex items-center gap-4">
                          <Box className="w-7 h-7 rounded-full bg-[#0B3A84] flex items-center justify-center shrink-0">
                            <IconCheck sx={{ fontSize: 18, color: "white" }} />
                          </Box>
                          Avoid glare and direct flash on the document surface.
                        </Box>
                        <Box className="flex items-center gap-4">
                          <Box className="w-7 h-7 rounded-full bg-[#0B3A84] flex items-center justify-center shrink-0">
                            <IconCheck sx={{ fontSize: 18, color: "white" }} />
                          </Box>
                          Place the document against a dark, non-reflective
                          background.
                        </Box>
                        <Box className="flex items-center gap-4">
                          <Box className="w-7 h-7 rounded-full bg-[#0B3A84] flex items-center justify-center shrink-0">
                            <IconCheck sx={{ fontSize: 18, color: "white" }} />
                          </Box>
                          Ensure all four corners of the document are visible.
                        </Box>
                        <Box className="flex items-center gap-4">
                          <Box className="w-7 h-7 rounded-full bg-[#0B3A84] flex items-center justify-center shrink-0">
                            <IconCheck sx={{ fontSize: 18, color: "white" }} />
                          </Box>
                          Ensure all text and barcodes are perfectly legible.
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                </Paper>

                <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
                  {[
                    {
                      url: "https://images.unsplash.com/photo-1588859959584-b93533d35c3a?auto=format&fit=crop&q=80&w=800",
                      label: "Good Example",
                      active: true,
                    },
                    {
                      url: "https://images.unsplash.com/photo-1589915282613-aad021a2a500?auto=format&fit=crop&q=80&w=800",
                      label: "Avoid Glare",
                      active: false,
                    },
                    {
                      url: "https://images.unsplash.com/photo-1774846505579-4a710ff4c5fe?auto=format&fit=crop&q=80&w=800",
                      label: "Avoid Blur",
                      active: false,
                    },
                  ].map((ex, i) => (
                    <Box
                      key={i}
                      className="flex-1 relative rounded-[3rem] overflow-hidden group shadow-xl border-4 border-white h-[22rem]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ex.url}
                        alt={ex.label}
                        className="w-full h-full object-cover brightness-90 group-hover:scale-110 transition-all duration-1000"
                      />
                      <Box className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                        <Typography
                          className={`${ex.active ? "bg-white text-[#0B3A84]" : "bg-[#C61F3B] text-white"} backdrop-blur-xl px-12 py-3.5 rounded-full font-poppins font-bold shadow-2xl border border-white/50 text-lg`}
                        >
                          {ex.label}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            )}

            {step <= 9 && step !== 2 && (
              <Paper
                elevation={0}
                className="p-12 border border-gray-200 rounded-[40px] bg-white shadow-sm text-center"
              >
                <Typography
                  variant="h4"
                  className="font-poppins font-bold text-[#0B3A84] mb-3"
                >
                  {getHeaderTitle()}
                </Typography>
                <Typography className="text-[#64748B] text-lg">
                  This step is under development and will be available soon.
                </Typography>
              </Paper>
            )}
            {step === 10 && (
              <ReviewSubmitStep
                formData={formData}
                onNavigateToStep={(s) => {
                
                  const routes: Record<number, string> = {
                    1: "/portal/personal",
                    2: "/portal/nid",
                    3: "/portal/family",
                    4: "/portal/employment",
                    5: "/portal/household",
                    6: "/portal/disability",
                    7: "/portal/education",
                    8: "/portal/photo",
                    9: "/portal/location",
                  };
                  window.location.href = routes[s] || "/portal/personal";
                }}
              />
            )}
          </Box>
        </Box>
        <Box className="h-28 px-12 flex items-center justify-between bg-[#F5F7FA] border-t border-gray-200 sticky bottom-0 z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <Button
            variant="text"
            onClick={prevStep}
            disabled={step === 1}
            startIcon={<IconBack />}
            className="text-gray-600 font-poppins font-bold text-xl px-12 py-5 rounded-[1.5rem] hover:bg-gray-200 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:active:scale-100"
          >
            Back
          </Button>
          <Stack direction="row" spacing={3}>
            <Button
              variant="text"
              className="text-gray-500 font-poppins font-semibold text-lg px-10 py-4 rounded-[1.5rem] hover:bg-gray-200 hover:text-gray-700 active:scale-95 transition-all duration-200"
            >
              Save Draft
            </Button>
            {step < 10 ? (
              <Button
                variant="contained"
                onClick={nextStep}
                endIcon={<IconNext />}
                className="bg-[#0B3A84] hover:bg-[#092d6b] active:scale-95 text-white font-poppins font-bold text-xl px-20 py-5 rounded-[1.5rem] shadow-2xl shadow-blue-900/40 transition-all duration-200 hover:shadow-blue-900/60"
              >
                Next
              </Button>
            ) : null}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
