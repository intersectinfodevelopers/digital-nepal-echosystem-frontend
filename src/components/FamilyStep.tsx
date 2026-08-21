"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MenuItem, Select, TextField } from "@mui/material";
import {
  AccountCircleOutlined,
  AddCircleOutlined,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  DeleteOutlined,
  DescriptionOutlined,
  Favorite,
  Fingerprint,
  HubOutlined,
  LockOutlined,
  PeopleOutlined,
  PersonOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import { PortalSidebar } from "@/components/Sidebar";
import { PortalStepper } from "@/components/Stepper";
import { useFamilyForm } from "@/hooks/useFamilyForm";
import {
  RELATIONSHIP_LABELS,
  RELATIONSHIP_OPTIONS,
  Relationship,
} from "@/constants";
import { FamilyMemberCardProps } from "@/types/registration";

function FamilyMemberCard({
  member,
  index,
  total,
  onRemove,
  onUpdate,
}: FamilyMemberCardProps) {
  return (
    <div className={index > 0 ? "mt-10 border-t border-[#EFF2F7] pt-8" : ""}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <HubOutlined className="w-4.5 h-4.5 text-[#C01F38]" />
          <p className="font-poppins text-[14px] font-bold tracking-wide text-[#C01F38]">
            MEMBER {String(index + 1).padStart(2, "0")}
          </p>
          {total > 1 && (
            <button
              type="button"
              onClick={() => onRemove(member.id)}
              aria-label={`Remove member ${index + 1}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9AA3B2] hover:text-[#C01F38] hover:bg-[#FCEBED] transition-colors"
            >
              <DeleteOutlined className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-[#9AA3B2]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#6B7280]">
            uid: pending_gen
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor={`relationship-${member.id}`}
            className="block font-medium text-[14px] text-[#1F2A44] mb-2"
          >
            Relationship
          </label>
          <Select
            id={`relationship-${member.id}`}
            fullWidth
            displayEmpty
            value={member.relationship}
            onChange={(e) => onUpdate(member.id, "relationship", e.target.value)}
            className="form-select-rounded"
            renderValue={(value) =>
              value ? (
                RELATIONSHIP_LABELS[value as Relationship] ?? value
              ) : (
                <span className="text-[#9AA3B2]">Select Relationship</span>
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
            {RELATIONSHIP_OPTIONS.map((relationship) => (
              <MenuItem key={relationship} value={relationship}>
                {RELATIONSHIP_LABELS[relationship]}
              </MenuItem>
            ))}
          </Select>
        </div>

        <div>
          <label
            htmlFor={`name-${member.id}`}
            className="block font-medium text-[14px] text-[#1F2A44] mb-2"
          >
            Full Name
          </label>
          <TextField
            id={`name-${member.id}`}
            fullWidth
            placeholder="Legal full name"
            value={member.fullName}
            onChange={(e) => onUpdate(member.id, "fullName", e.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            className="form-input-rounded"
          />
        </div>

        <div>
          <label
            htmlFor={`occupation-${member.id}`}
            className="block font-medium text-[14px] text-[#1F2A44] mb-2"
          >
            Occupation
          </label>
          <TextField
            id={`occupation-${member.id}`}
            fullWidth
            placeholder="Current profession"
            value={member.occupation}
            onChange={(e) => onUpdate(member.id, "occupation", e.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
            className="form-input-rounded"
          />
        </div>

        <div>
          <label
            htmlFor={`age-${member.id}`}
            className="block font-medium text-[14px] text-[#1F2A44] mb-2"
          >
            Age
          </label>
          <TextField
            id={`age-${member.id}`}
            fullWidth
            placeholder="Current age"
            value={member.age}
            onChange={(e) => onUpdate(member.id, "age", e.target.value)}
            slotProps={{ htmlInput: { maxLength: 3, inputMode: "numeric" } }}
            className="form-input-rounded"
          />
        </div>
      </div>
    </div>
  );
}

export function FamilyStep() {
  const router = useRouter();
  const {
    members,
    draftSaved,
    addMember,
    removeMember,
    updateMember,
    saveDraft,
  } = useFamilyForm();

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <PortalSidebar activeLabel="Family Info" />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E4E8EF] flex items-center justify-between px-6 md:px-10">
          <span className="font-poppins font-bold text-[20px] tracking-[0.04em] text-[#163B87] uppercase">
            PRAPTI
          </span>

          <button
            type="button"
            aria-label="Account profile"
            className="flex items-center justify-center p-1 text-[#163B87] transition-colors hover:text-[#0A2D6D]"
          >
            <AccountCircleOutlined className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 w-full max-w-310 mx-auto px-6 md:px-10 py-8 pb-40">
          <PortalStepper currentStep={3} />

          <div className="space-y-8 md:space-y-10">
            <section className="bg-white rounded-3xl border border-[#E3E8F2] shadow-[0_8px_24px_rgba(15,61,145,0.08)] p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#F1F4FB] border border-[#D9DEE8] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.08em] text-[#0A2D6D] uppercase">
                    <DescriptionOutlined className="w-3.5 h-3.5" />
                    FORM_INDEX: F-301-A
                  </span>
                  <h2 className="font-poppins font-bold text-[26px] md:text-[32px] text-[#1F2A44] tracking-tight mt-5 mb-3 leading-tight">
                    Immediate Family Declaration
                  </h2>
                  <p className="text-[15px] md:text-base text-[#6B7280] leading-relaxed max-w-[680px]">
                    Provide details of your immediate family members for the
                    sovereign digital ledger. This data is encrypted with
                    AES-256 standards.
                  </p>
                </div>

                <div className="hidden shrink-0 text-right sm:block md:pt-1">
                  <PeopleOutlined className="ml-auto w-6 h-6 text-[#0A2D6D]" />
                  <p className="mt-2 text-[11px] uppercase tracking-widest text-[#6B7280]">
                    Secure layer active
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-[#E3E8F2] shadow-[0_8px_24px_rgba(15,61,145,0.08)] p-8 md:p-10">
              {members.map((member, index) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  total={members.length}
                  onRemove={removeMember}
                  onUpdate={updateMember}
                />
              ))}

              <button
                type="button"
                onClick={addMember}
                className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#B9C6E0] bg-white py-5 text-[15px] font-semibold text-[#0A2D6D] transition-all duration-200 hover:border-[#0A2D6D] hover:bg-[#F1F5FC] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2"
              >
                <AddCircleOutlined className="w-5 h-5" />
                Add Another Family Member
              </button>
            </section>

            <section className="bg-white rounded-3xl border border-[#E3E8F2] shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-8 md:p-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10 items-center">
              <div className="relative h-55 rounded-2xl bg-linear-to-br from-[#0A2D6D] via-[#0F3D91] to-[#1B4AA8] overflow-hidden flex items-center justify-center">
                <PeopleOutlined className="absolute w-44 h-44 text-white/6" />
                <div className="relative flex items-end justify-center gap-3 pb-8">
                  <div className="w-12 h-12 rounded-full bg-white/15 border border-white/25 flex items-center justify-center -translate-y-4">
                    <PersonOutlined className="w-6 h-6 text-white/90" />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/25 border border-white/35 flex items-center justify-center translate-y-1">
                    <PersonOutlined className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/15 border border-white/25 flex items-center justify-center -translate-y-4">
                    <PersonOutlined className="w-6 h-6 text-white/90" />
                  </div>
                </div>
                <Favorite
                  className="absolute bottom-4 right-5 w-5 h-5"
                  sx={{ color: "#FF8A9B" }}
                />
              </div>

              <div>
                <h3 className="font-poppins font-bold text-[24px] md:text-[28px] text-[#1F2A44] tracking-tight mb-3">
                  Why this matters?
                </h3>
                <p className="text-[15px] md:text-base text-[#6B7280] leading-relaxed mb-7">
                  The Digital Nepal Ecosystem uses family tree mapping to
                  automate dependent verification. Providing accurate info here
                  speeds up your application processing by up to 60%.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FCEBED] text-[#C01F38] px-4 py-2 text-[13px] font-semibold">
                    <VerifiedUserOutlined className="w-4 h-4" />
                    Data Encrypted
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FCEBED] text-[#C01F38] px-4 py-2 text-[13px] font-semibold">
                    <LockOutlined className="w-4 h-4" />
                    Privacy Compliant
                  </span>
                </div>
              </div>
            </section>
          </div>
        </main>
        <footer className="fixed bottom-0 left-67.5 right-0 z-30 bg-white/95 backdrop-blur border-t border-[#E3E8F2] h-[80px] px-6 md:px-10 flex items-center justify-between shadow-[0_-4px_16px_rgba(15,61,145,0.05)]">
          <button
            type="button"
            onClick={() => router.push("/portal/nid")}
            className="h-12 px-7 rounded-xl border-[1.5px] border-[#D9DEE8] bg-white text-[#1F2A44] font-semibold text-[15px] hover:border-[#6B7280] hover:bg-[#F8F9FB] transition-all duration-200 active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2"
          >
            <ArrowBack className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={saveDraft}
              className={`h-12 px-7 rounded-xl border-[1.5px] font-semibold text-[15px] transition-all duration-200 active:scale-[0.98] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2D6D] focus-visible:ring-offset-2 ${
                draftSaved
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-[#D9DEE8] bg-white text-[#1F2A44] hover:border-[#6B7280] hover:bg-[#F8F9FB]"
              }`}
            >
              {draftSaved && <CheckCircle className="w-5 h-5" />}
              {draftSaved ? "Draft Saved" : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={() => {
                saveDraft();
                router.push("/portal/employment");
              }}
              className="h-12 px-8 rounded-xl bg-[#0A2D6D] text-white font-semibold text-[15px] shadow-[0_8px_20px_rgba(10,45,109,0.3)] hover:bg-[#081F4D] transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
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
