"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  AccountCircleOutlined,
  ArrowBack,
  ArrowForward,
  BoltOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
  GpsFixedOutlined,
  LocationOn,
  LogoutOutlined,
  MyLocation,
  NotificationsNoneOutlined,
  ShieldOutlined,
  VerifiedUserOutlined,
} from "@mui/icons-material";
import { PortalSidebar } from "@/components/Sidebar";
import { PortalStepper } from "@/components/Stepper";
import { HOUSEHOLD_OWNERSHIP_OPTIONS } from "@/constants";
import {
  formatScNumber,
  useHouseholdForm,
} from "@/hooks/useHouseholdForm";

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

function PortalHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-[70px] shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 md:px-10">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0E3A8A]">
          <VerifiedUserOutlined className="h-5 w-5 text-white" />
        </span>
        <span className="font-poppins text-[24px] font-bold uppercase leading-none tracking-[0.02em] text-[#0E3A8A]">
          PRAPTI
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0E3A8A] transition-colors hover:bg-[#F1F5F9]"
        >
          <NotificationsNoneOutlined className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#C2183B]" />
        </button>
        <button
          type="button"
          aria-label="User profile"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] text-[#0E3A8A] transition-colors hover:bg-[#F1F5F9]"
        >
          <AccountCircleOutlined className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}

function OwnershipStatusSelect({
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
      <FieldLabel htmlFor="ownership-status" required>
        Ownership Status
      </FieldLabel>
      <Select
        id="ownership-status"
        fullWidth
        displayEmpty
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select-household"
        renderValue={(selected) =>
          selected ? (
            selected
          ) : (
            <span className="text-[#94A3B8]">Select status…</span>
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
        {HOUSEHOLD_OWNERSHIP_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.label}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <FieldError message={error} />
    </div>
  );
}

function YearsInput({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (raw: string) => void;
}) {
  return (
    <div>
      <FieldLabel htmlFor="years-at-residence" required>
        Years at Residence
      </FieldLabel>
      <TextField
        id="years-at-residence"
        fullWidth
        inputMode="numeric"
        placeholder="e.g. 15"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 3 } }}
        className="form-input-household"
      />
      <FieldError message={error} />
    </div>
  );
}

function RoomsInput({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (raw: string) => void;
}) {
  return (
    <div>
      <FieldLabel htmlFor="room-count" required>
        Number of Rooms
      </FieldLabel>
      <TextField
        id="room-count"
        fullWidth
        inputMode="numeric"
        placeholder="e.g. 4"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 3 } }}
        className="form-input-household"
      />
      <FieldError message={error} />
    </div>
  );
}

function ElectricityInput({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (raw: string) => void;
}) {
  return (
    <div>
      <FieldLabel htmlFor="electricity-sc">Electricity SC Number</FieldLabel>
      <TextField
        id="electricity-sc"
        fullWidth
        inputMode="numeric"
        placeholder="SC-00000000"
        value={formatScNumber(value)}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          htmlInput: { maxLength: 11 },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <BoltOutlined
                  aria-label="Electricity account"
                  sx={{ fontSize: 20, color: "#C2183B" }}
                />
              </InputAdornment>
            ),
          },
        }}
        className="form-input-household"
      />
      <FieldError message={error} />
    </div>
  );
}

const MAP_GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "34px 34px",
};

type RecalibratePhase = "idle" | "recalibrating" | "done";

function GeographicMap({ latitude, longitude }: { latitude: string; longitude: string }) {
  const [phase, setPhase] = useState<RecalibratePhase>("idle");
  const timerRef = useRef<number | null>(null);

  const recalibrate = () => {
    if (phase === "recalibrating") return;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setPhase("recalibrating");
    timerRef.current = window.setTimeout(() => {
      setPhase("done");
      timerRef.current = window.setTimeout(() => {
        setPhase("idle");
        timerRef.current = null;
      }, 2200);
    }, 1400);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    <div className="relative mt-4 h-[260px] overflow-hidden rounded-[10px] border border-[#1F2A44] bg-[#0B1B3A]">
      <div aria-hidden="true" className="absolute inset-0 opacity-50" style={MAP_GRID_STYLE} />
      <div
        aria-hidden="true"
        className="radar-sweep pointer-events-none absolute -inset-16"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(31,79,191,0.18), transparent 90deg)",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15"
      />

      <div className="absolute right-[18%] top-[22%] text-[#7DA5F0]">
        <LocationOn sx={{ fontSize: 30 }} />
      </div>

      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <span className="pin-pulse flex h-10 w-10 items-center justify-center rounded-full bg-[#C2183B]/25">
          <LocationOn sx={{ fontSize: 34, color: "#C2183B" }} />
        </span>
        <span className="mt-1 rounded-full bg-black/40 px-2 py-0.5 font-mono text-[10px] text-white/90">
          {Number.isFinite(lat) ? `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E` : "—"}
        </span>
      </div>

      {phase === "done" && (
        <div className="absolute inset-x-0 top-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 font-poppins text-[11px] font-semibold text-[#0E3A8A] shadow-md">
            <CheckCircleOutlined className="h-3.5 w-3.5 text-[#16A34A]" />
            LOCATION RECALIBRATED
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={recalibrate}
        className="absolute bottom-4 right-4 flex h-10 items-center gap-2 rounded-[8px] bg-[#0E3A8A] px-4 font-poppins text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(14,58,138,0.4)] transition-colors duration-200 hover:bg-[#0A2D6D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3A8A] focus-visible:ring-offset-2"
      >
        {phase === "recalibrating" ? (
          <CircularProgress size={14} thickness={5} sx={{ color: "#FFFFFF" }} />
        ) : (
          <MyLocation className="h-4 w-4" />
        )}
        {phase === "recalibrating"
          ? "Recalibrating…"
          : phase === "done"
            ? "Recalibrated"
            : "Recalibrate Map"}
      </button>
    </div>
  );
}

function SovereignContextCard() {
  return (
    <section className="relative overflow-hidden rounded-[14px] bg-[#0E3A8A] p-6">
      <ShieldOutlined
        aria-hidden="true"
        className="absolute -right-6 -top-6 h-36 w-36 text-white/10"
      />
      <h3 className="font-poppins text-[22px] font-bold text-white">Sovereign Context</h3>
      <p className="mt-3 font-poppins text-[13px] leading-relaxed text-white/80">
        Your household data is protected under the Sovereign Digital Identity
        framework. No third party, including commercial providers, can access
        these details without your cryptographic consent.
      </p>
      <ul className="mt-5 space-y-3.5">
        {[
          "End-to-End Encryption",
          "Automated Land Registry Sync",
          "Utility Verification API",
        ].map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <CheckCircleOutlined
              sx={{ fontSize: 20, color: "#C2183B" }}
              className="shrink-0"
            />
            <span className="font-poppins text-[14px] font-medium text-white">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function IntegrityValidationCard({ lastSaved }: { lastSaved: string | null }) {
  const rows: Array<{ label: string; value: string; valueClass?: string }> = [
    { label: "Auto Protocol", value: "SHA-256 / AES" },
    { label: "Last Auto-save", value: lastSaved ?? "--:--:-- --" },
    { label: "Session TTL", value: "08:22", valueClass: "text-[#C2183B]" },
  ];

  return (
    <section className="rounded-[14px] border border-[#E5E7EB] bg-[#F1F5F9] p-6">
      <h3 className="font-poppins text-[12px] font-bold uppercase tracking-[0.14em] text-[#64748B]">
        Integrity Validation
      </h3>
      <dl className="mt-4 space-y-0">
        {rows.map((row, index) => (
          <div key={row.label}>
            {index > 0 && (
              <div aria-hidden="true" className="my-3 h-px bg-[#E5E7EB]" />
            )}
            <div className="flex items-center justify-between gap-4">
              <dt className="font-poppins text-[13px] font-medium text-[#64748B]">
                {row.label}
              </dt>
              <dd
                className={`font-mono text-[13px] font-semibold text-[#0F172A] ${
                  row.valueClass ?? ""
                }`}
              >
                {row.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SaveExitButton() {
  return (
    <button
      type="button"
      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[8px] border-2 border-[#C2183B] bg-white font-poppins text-[14px] font-bold text-[#C2183B] transition-colors duration-200 hover:bg-[#C2183B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2183B] focus-visible:ring-offset-2"
    >
      <LogoutOutlined className="h-5 w-5" />
      SAVE &amp; EXIT SESSION
    </button>
  );
}

function RightPanel({ lastSaved }: { lastSaved: string | null }) {
  return (
    <div className="flex flex-col gap-6">
      <SovereignContextCard />
      <IntegrityValidationCard lastSaved={lastSaved} />
      <SaveExitButton />
    </div>
  );
}

function BottomNavigation({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <footer className="fixed bottom-0 left-[270px] right-0 z-30 flex h-[76px] items-center justify-between border-t border-[#E5E7EB] bg-white px-6 md:px-10">
      <button
        type="button"
        onClick={onBack}
        className="flex h-12 w-[120px] items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-[#D1D5DB] bg-white font-poppins text-[14px] font-bold text-[#0E3A8A] transition-all duration-200 hover:border-[#0E3A8A] hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3A8A] focus-visible:ring-offset-2"
      >
        <ArrowBack className="h-5 w-5" />
        BACK
      </button>

      <button
        type="button"
        onClick={onNext}
        className="flex h-12 w-[170px] items-center justify-center gap-2 rounded-[10px] bg-[#0E3A8A] font-poppins text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(14,58,138,0.3)] transition-all duration-200 hover:bg-[#0A2D6D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E3A8A] focus-visible:ring-offset-2"
      >
        NEXT PHASE
        <ArrowForward className="h-5 w-5" />
      </button>
    </footer>
  );
}

export function HouseholdStep() {
  const router = useRouter();
  const form = useHouseholdForm();

  const handleNext = () => {
    if (form.attemptProceed()) {
      router.push("/portal/disability");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <PortalSidebar activeLabel="Household" />

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader />

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8 pb-40 md:px-10">
          <PortalStepper currentStep={5} />

          <div className="flex flex-col gap-6 xl:flex-row">
            <div className="min-w-0 flex-1">
              <section className="rounded-[12px] border border-[#E5E7EB] bg-white p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)] md:p-10">
                <h2 className="font-poppins text-[38px] font-bold leading-tight tracking-tight text-[#0E3A8A]">
                  Household Details
                </h2>
                <p className="mt-2 font-poppins text-[16px] text-[#64748B]">
                  Provide verified information about your current residence and
                  utilities.
                </p>

                <div aria-hidden="true" className="mt-6 h-px bg-[#E5E7EB]" />

                <div className="mt-8">
                  <FieldLabel htmlFor="household-address" required>
                    Primary Residence Address
                  </FieldLabel>
                  <TextField
                    id="household-address"
                    fullWidth
                    multiline
                    minRows={4}
                    placeholder="Street Name, House Number, Ward No., Municipality…"
                    value={form.data.address}
                    onChange={(e) => form.setAddress(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 200 } }}
                    className="form-textarea-household"
                  />
                  <p className="mt-2 font-poppins text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                    Must match the address on your NID or land ownership
                    document.
                  </p>
                  <FieldError message={form.errors.address} />
                </div>

                <div className="mt-8 grid gap-7 md:grid-cols-2">
                  <OwnershipStatusSelect
                    value={form.data.ownershipStatus}
                    error={form.errors.ownershipStatus}
                    onChange={form.setOwnership}
                  />
                  <YearsInput
                    value={form.data.yearsAtResidence}
                    error={form.errors.yearsAtResidence}
                    onChange={form.setYearsAtResidence}
                  />
                </div>

                <div className="mt-8 grid gap-7 md:grid-cols-2">
                  <RoomsInput
                    value={form.data.roomCount}
                    error={form.errors.roomCount}
                    onChange={form.setRoomCount}
                  />
                  <ElectricityInput
                    value={form.data.electricityScNumber}
                    error={form.errors.electricityScNumber}
                    onChange={form.setElectricitySc}
                  />
                </div>

                <div className="mt-10 border-t border-[#E5E7EB] pt-8">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-poppins text-[22px] font-bold tracking-tight text-[#0E3A8A]">
                      Geographic Context
                    </h3>
                    <span className="inline-flex items-center gap-2 font-mono text-[13px] font-semibold text-[#C2183B]">
                      <GpsFixedOutlined className="h-4 w-4" />
                      GPS: {Number(form.data.latitude).toFixed(4)}° N,{" "}
                      {Number(form.data.longitude).toFixed(4)}° E
                    </span>
                  </div>

                  <GeographicMap
                    latitude={form.data.latitude}
                    longitude={form.data.longitude}
                  />

                  <p className="mt-3 font-poppins text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                    Location data is cross-referenced with official cadastral
                    records.
                  </p>
                </div>
              </section>
            </div>

            <aside className="w-full shrink-0 xl:w-[320px]">
              <div className="xl:sticky xl:top-[86px]">
                <RightPanel lastSaved={form.lastSaved} />
              </div>
            </aside>
          </div>
        </main>

        <BottomNavigation
          onBack={() => router.push("/portal/employment")}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
