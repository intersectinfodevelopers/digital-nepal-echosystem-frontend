"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowBack,
  ArrowForward,
  Check,
  CheckCircle,
  CloudUploadOutlined,
  InfoOutlined,
  NotificationsNoneOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { PortalSidebar } from "@/components/Sidebar";
import { PortalStepper } from "@/components/Stepper";
import {
  ACCEPTED_DOCUMENT_TYPES,
  DOCUMENT_SIDE_LABELS,
  DocumentSide,
  UploadStatus,
} from "@/constants";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";
import type { DocumentUpload } from "@/types/document";

const GUIDELINES = [
  "Avoid glare and shadows on the document.",
  "Place the document against a dark, high-contrast background.",
  "Do not use flash if the document is reflective.",
  "Ensure all four corners of the document are within the frame.",
];


interface UploadPanelProps {
  label: string;
  footerText?: string;
  upload: DocumentUpload;
}

function UploadPanel({
  label,
  footerText,
  upload,
}: UploadPanelProps) {
  const { state, browseRef, onFile, onOpenBrowse, onDragOver, onDragLeave, onDrop } = upload;

  return (
    <div>
      <p className="font-poppins text-[15px] font-bold text-[#0A2D6D] mb-3">
        {label}
      </p>

      {state.status === UploadStatus.EMPTY && (
        <div
          onClick={onOpenBrowse}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className="w-full h-[250px] rounded-[8px] border-2 border-dashed border-[#C6CFDC] bg-white flex flex-col items-center justify-center gap-2.5 cursor-pointer"
        >
          <input
            ref={browseRef}
            type="file"
            accept={ACCEPTED_DOCUMENT_TYPES.join(",")}
            className="hidden"
            onChange={onFile}
          />
          <div className="w-16 h-16 rounded-[12px] bg-[#EAF1FF] flex items-center justify-center text-[#0A2D6D]">
            <CloudUploadOutlined className="w-8 h-8" />
          </div>
          <p className="font-poppins text-[16px] font-semibold text-[#1E293B]">
            Take photo or upload
          </p>
          <p className="font-poppins text-[13px] text-[#64748B]">
            JPG, PNG or PDF. Max file size 5MB.
          </p>
          {state.error && (
            <p className="font-poppins text-[12px] text-[#DC2626] text-center px-4">
              {state.error}
            </p>
          )}
        </div>
      )}

      {state.status === UploadStatus.UPLOADING && (
        <div className="w-full h-[250px] rounded-[8px] border border-[#0A2D6D] bg-[#F6F9FF] flex flex-col items-center justify-center gap-3">
          <p className="font-poppins text-[14px] font-medium text-[#0A2D6D]">
            Uploading… {Math.round(state.progress)}%
          </p>
          <div className="w-48 h-1.5 bg-[#E4E8EF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0A2D6D] rounded-full"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {state.status === UploadStatus.VERIFIED && state.previewUrl && (
        <div className="relative w-full h-[250px] rounded-[8px] border border-[#16A34A] bg-[#F0FDF4] overflow-hidden">
          <Image
            src={state.previewUrl}
            alt={`${label} document preview`}
            fill
            className="object-contain p-3"
            unoptimized
          />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#16A34A] text-white text-[11px] font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Verified
          </span>
        </div>
      )}

      {footerText && (
        <p className="font-poppins text-[12px] text-[#64748B] mt-3 text-center">
          {footerText}
        </p>
      )}
    </div>
  );
}

interface ExampleCardProps {
  badge: string;
  badgeClass: string;
  children: React.ReactNode;
}

function ExampleCard({ badge, badgeClass, children }: ExampleCardProps) {
  return (
    <div className="relative h-[200px] rounded-[10px] border border-[#E4E8EF] bg-white shadow-sm overflow-hidden">
      {children}
      <span
        className={`absolute top-4 left-1/2 -translate-x-1/2 inline-block px-4 py-1.5 rounded-full bg-white text-[13px] font-semibold shadow-sm ${badgeClass}`}
      >
        {badge}
      </span>
    </div>
  );
}

export function NidStep() {
  const router = useRouter();

  const front = useDocumentUpload();
  const back = useDocumentUpload();

  const blobUrlToDataUrl = async (url: string | null): Promise<string | null> => {
    if (!url) return null;
    if (url.startsWith("data:")) return url;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      return await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Unable to read file"));
        reader.readAsDataURL(blob);
      });
    } catch {
      return url;
    }
  };

  const persistDraft = async () => {
    const [frontUrl, backUrl] = await Promise.all([
      blobUrlToDataUrl(front.state.previewUrl),
      blobUrlToDataUrl(back.state.previewUrl),
    ]);
    const payload = {
      nid_number: "",
      nid_verified: false,
      citizenship_number: "",
      citizenship_front: frontUrl,
      citizenship_back: backUrl,
    };
    try {
      window.localStorage.setItem("prapti_nid_draft_v1", JSON.stringify(payload));
    } catch {
      // localStorage may be full or unavailable
    }
  };

  const handleSaveDraft = () => {
    void persistDraft();
  };

  const handleNext = () => {
    void persistDraft();
    router.push("/portal/family");
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FB] font-poppins">
      <PortalSidebar activeLabel="NID Upload" />

      <div className="flex-1 flex flex-col min-w-0">
       
        <header className="h-[72px] shrink-0 bg-white border-b border-[#E4E8EF] flex items-center justify-between px-8">
          <h1 className="font-poppins font-bold text-[38px] text-[#0A2D6D] tracking-tight leading-none">
            NID / Citizenship Upload
          </h1>
          <div className="flex items-center gap-5">
            <button
              aria-label="Notifications"
              className="text-[#64748B] flex items-center justify-center"
            >
              <NotificationsNoneOutlined className="w-6 h-6" />
            </button>
            <div
              aria-label="User profile"
              className="w-10 h-10 rounded-full bg-[#0A2D6D] flex items-center justify-center text-white"
            >
              <PersonOutlined className="w-6 h-6" />
            </div>
          </div>
        </header>

        
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-8 py-6 pb-36">
          <PortalStepper currentStep={2} />

         
          <section className="bg-white rounded-[10px] border border-[#D8D8D8] p-8 shadow-[0_1px_3px_rgba(10,45,109,0.06)]">
            <h2 className="font-poppins font-bold text-[24px] text-[#0A2D6D] leading-tight">
              Identity Verification
            </h2>
            <p className="font-poppins text-[16px] text-[#64748B] mt-2 leading-relaxed max-w-[760px]">
              Please provide a clear photo of your National Identity Card or
              Citizenship Document. Ensure all text is legible and edges are
              visible.
            </p>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <UploadPanel
                label={DOCUMENT_SIDE_LABELS[DocumentSide.FRONT]}
                upload={front}
              />
              <UploadPanel
                label={DOCUMENT_SIDE_LABELS[DocumentSide.BACK]}
                footerText="Ensure the MRZ or barcode is clearly visible."
                upload={back}
              />
            </div>
          </section>

          <section className="mt-6 bg-[#EAF1FF] border border-[#D6E4FF] rounded-[10px] p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-11 h-11 rounded-[12px] bg-[#0A2D6D]/10 flex items-center justify-center text-[#0A2D6D]">
                <InfoOutlined className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-poppins text-[18px] font-bold text-[#0A2D6D]">
                  Upload Guidelines
                </h3>
                <ul className="mt-3 space-y-2">
                  {GUIDELINES.map((g) => (
                    <li key={g} className="flex items-start gap-2.5"><Check className="w-4 h-4 text-[#0A2D6D] shrink-0 mt-0.5" />
                      <span className="font-poppins text-[14px] text-[#334155]">
                        {g}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          <section className="grid grid-cols-3 gap-6 mt-6">
            <ExampleCard
              badge="Good Example"
              badgeClass="text-[#0A2D6D]"
            >
              <div className="absolute inset-0 bg-[#16233F]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[110px] h-[190px] rounded-[18px] bg-[#0A2D6D] border-[3px] border-[#3A5A9C] p-2 flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-[#3A5A9C] mb-2" />
                  <div className="w-full flex-1 rounded-[6px] bg-[#E8EEF8] p-2.5">
                    <div className="w-full h-8 rounded-[4px] bg-[#0A2D6D] mb-2" />
                    <div className="w-3/4 h-1.5 bg-[#B9C6DC] rounded mb-1.5" />
                    <div className="w-5/6 h-1.5 bg-[#B9C6DC] rounded mb-1.5" />
                    <div className="w-2/3 h-1.5 bg-[#B9C6DC] rounded" />
                  </div>
                </div>
              </div>
            </ExampleCard>

            <ExampleCard
              badge="Avoid Glare"
              badgeClass="text-[#C01F38]"
            >
              <div className="absolute inset-0 bg-[#1F2A3E]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[170px] h-[108px] rounded-[10px] bg-[#E8EEF8] overflow-hidden">
                  <div className="absolute -top-5 -right-7 w-[90px] h-[150%] bg-white/85 rotate-[25deg]" />
                  <div className="p-3">
                    <div className="w-full h-6 rounded-[4px] bg-[#0A2D6D] mb-2" />
                    <div className="w-3/4 h-1.5 bg-[#B9C6DC] rounded mb-1.5" />
                    <div className="w-5/6 h-1.5 bg-[#B9C6DC] rounded" />
                  </div>
                </div>
              </div>
            </ExampleCard>

            <ExampleCard
              badge="Avoid Blur"
              badgeClass="text-[#C01F38]"
            >
              <div className="absolute inset-0 bg-[#232F45]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[170px] h-[108px] rounded-[10px] bg-[#E8EEF8] blur-[2px] opacity-90 p-3">
                  <div className="w-full h-6 rounded-[4px] bg-[#0A2D6D] mb-2" />
                  <div className="w-3/4 h-1.5 bg-[#B9C6DC] rounded mb-1.5" />
                  <div className="w-5/6 h-1.5 bg-[#B9C6DC] rounded" />
                </div>
              </div>
            </ExampleCard>
          </section>
        </main>

        <footer className="fixed bottom-0 left-[270px] right-0 z-30 bg-white border-t border-[#D8D8D8] h-[76px] px-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/portal/personal")}
            className="h-12 px-6 rounded-[10px] border border-[#D8D8D8] bg-white text-[#1E293B] font-poppins font-medium text-[15px] flex items-center gap-2"
          >
            <ArrowBack className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveDraft}
              className="h-12 px-6 rounded-[10px] border border-[#D8D8D8] bg-white text-[#1E293B] font-poppins font-medium text-[15px]"
            >
              Save Draft
            </button>
            <button
              onClick={handleNext}
              className="h-12 px-7 rounded-[10px] bg-[#0A2D6D] text-white font-poppins font-semibold text-[15px] flex items-center gap-2"
            >
              Next
              <ArrowForward className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
