"use client";

import type { ReactNode } from "react";

interface RegistrationWorkspaceProps {
  title: string;
  subtitle: string;
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  draftStatus: string;
  children: ReactNode;
}

const steps = [
  "Personal",
  "NID / Citizenship",
  "Family",
  "Employment",
  "Household",
  "Disability",
  "Education",
  "Photo & Biometrics",
  "Location",
  "Review & Submit",
];

export function RegistrationWorkspace({
  title,
  subtitle,
  currentStep,
  totalSteps,
  completedSteps,
  draftStatus,
  children,
}: RegistrationWorkspaceProps) {
  const progress = Math.max(10, Math.round((completedSteps / totalSteps) * 100));

  return (
    <div className="min-h-screen bg-[#edf3f9] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto" style={{ maxWidth: 1500 }}>
        <div className="overflow-hidden rounded-[28px] border border-[#dfe6ee] bg-white shadow-[0_18px_48px_rgba(15,43,90,0.08)]">
          <div className="flex flex-col lg:flex-row">
            <aside className="w-full bg-[#0A2D6D] p-5 text-white lg:p-6" style={{ width: "100%" }}>
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-100/80">
                    Digital Nepal
                  </p>
                  <h2 className="mt-2 text-[28px] font-extrabold leading-none tracking-tight">
                    PRAPTI
                  </h2>
                </div>
                <div className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-100">
                  Ward
                </div>
              </div>

              <div className="mt-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-100/75">
                  Registration Flow
                </p>
                <div className="mt-4 space-y-2.5">
                  {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isComplete = stepNumber < currentStep;
                    return (
                      <div
                        key={step}
                        className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all ${
                          isActive
                            ? "border-white/30 bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                            : isComplete
                              ? "border-emerald-400/40 bg-emerald-500/10"
                              : "border-white/10 bg-transparent"
                        }`}
                      >
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                            isActive
                              ? "bg-white text-[#0A2D6D]"
                              : isComplete
                                ? "bg-emerald-400 text-[#062961]"
                                : "bg-white/10 text-sky-100"
                          }`}
                        >
                          {isComplete ? "✓" : stepNumber}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-semibold text-white/90">{step}</p>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-sky-100/70">
                            {isComplete ? "Completed" : isActive ? "Current" : "Pending"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-100/70">
                  Auto-save
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  {draftStatus}
                </div>
              </div>
            </aside>

            <main className="flex-1 bg-[#f7f9fc] p-4 sm:p-6 lg:p-8">
              <div className="rounded-3xl border border-[#e3e8f0] bg-white p-4 shadow-[0_8px_24px_rgba(15,43,90,0.04)] sm:p-6 lg:p-7">
                <div className="flex flex-col gap-4 border-b border-[#e8edf4] pb-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#75829a]">
                      Citizen Registration
                    </p>
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0A2D6D] md:text-[30px]">
                      {title}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5e6a7d]">{subtitle}</p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe6ee] bg-[#f4f8ff] px-3 py-2 text-xs font-semibold text-[#0f4db8]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#21b26a]" />
                    {draftStatus}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-[#73809a]">
                    <span>Progress</span>
                    <span>{completedSteps}/{totalSteps} sections</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#edf2f6]">
                    <div
                      className="h-full rounded-full bg-[#0F4DB8] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2 text-right text-sm font-semibold text-[#0A2D6D]">{progress}% complete</div>
                </div>

                <div className="mt-8">{children}</div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
