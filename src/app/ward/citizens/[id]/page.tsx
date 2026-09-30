"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarMonthOutlined,
  CheckCircle,
  DeleteOutlined,
  EditOutlined,
  EventOutlined,
  MapOutlined,
  PersonOutlined,
  PersonOutlineOutlined,
  PrintOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
  FolderOffOutlined,
} from "@mui/icons-material";
import { Modal } from "@/components/ui";
import { getCitizenFormData } from "@/services/citizenService";
import {
  BLOOD_GROUP_LABELS,
  ELECTRICITY_SOURCE_LABELS,
  EMPLOYMENT_CATEGORY_LABELS,
  HOUSE_TYPE_LABELS,
  INCOME_BAND_LABELS,
  IRRIGATION_TYPE_LABELS,
  POVERTY_CLASS_LABELS,
  STUDENT_LEVEL_LABELS,
  WATER_SOURCE_LABELS,
} from "@/constants";
import type { Citizen } from "@/types/citizen";
import type { AuditLog } from "@/types/audit-log";
import type { FamilyRecord, IDCard } from "@/types/ward";
import citizensData from "../../../../../data/citizens.json";
import familyData from "../../../../../data/family.json";
import disabilityData from "../../../../../data/disability.json";
import educationData from "../../../../../data/education.json";
import householdsData from "../../../../../data/households.json";
import idCardsData from "../../../../../data/id-cards.json";
import auditLogData from "../../../../../data/audit-log.json";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const EDITS_KEY = "citizen_edits";
const REGISTERED_KEY = "citizens_registered";
const DELETED_KEY = "citizens_deleted";

function em(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const s = String(value).trim();
  return s ? s : "—";
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, "0")} ${ampm}`;
}

function ageFrom(dob: string): string {
  if (!dob) return "—";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years--;
  if (years < 0) return "—";
  return `${years} Years`;
}

function maskNumber(full: string): string {
  const clean = full.trim();
  if (!clean) return "—";
  return clean.length <= 4 ? clean : `****${clean.slice(-4)}`;
}

function genderLabel(sex: string): string {
  const s = String(sex ?? "").toUpperCase();
  if (s === "MALE") return "Male";
  if (s === "FEMALE") return "Female";
  if (s === "OTHER") return "Other";
  return "—";
}

function readRegistered(): Citizen[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REGISTERED_KEY);
    return raw ? (JSON.parse(raw) as Citizen[]) : [];
  } catch {
    return [];
  }
}

function readEdits(): Record<string, Record<string, unknown>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(EDITS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Record<string, unknown>>) : {};
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------ */
/* Shared presentational pieces                                        */
/* ------------------------------------------------------------------ */

function SectionCard({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-md border border-[#D9D9D9] bg-white p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold text-[#063477]">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] leading-tight text-[#AAAAAA]">{label}</p>
      <div className="mt-1.5 text-[13px] font-medium leading-snug text-[#111111] break-words">
        {value}
      </div>
    </div>
  );
}

function EyeToggle({
  revealed,
  onToggle,
  label,
  disabled = false,
}: {
  revealed: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
      className="rounded p-0.5 text-[#8B8F96] transition-colors hover:bg-[#F0F5FF] hover:text-[#063477] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4174C8]/30"
    >
      {revealed ? (
        <VisibilityOffOutlined sx={{ fontSize: 16 }} />
      ) : (
        <VisibilityOutlined sx={{ fontSize: 16 }} />
      )}
    </button>
  );
}

function MaskedNumberField({
  label,
  masked,
  full,
  fieldId,
  revealed,
  onToggle,
}: {
  label: string;
  masked: string;
  full: string;
  fieldId: string;
  revealed: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasFull = Boolean(full.trim());
  const isRevealed = hasFull && revealed.has(fieldId);
  return (
    <Field
      label={label}
      value={
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono tracking-tight">{isRevealed ? full : masked}</span>
          <EyeToggle
            revealed={isRevealed}
            onToggle={() => onToggle(fieldId)}
            label={label}
            disabled={!hasFull}
          />
        </span>
      }
    />
  );
}

function FamilyField({
  label,
  name,
  masked,
  full,
  fieldId,
  revealed,
  onToggle,
}: {
  label: string;
  name: string;
  masked: string;
  full: string;
  fieldId: string;
  revealed: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasFull = Boolean(full.trim());
  const isRevealed = hasFull && revealed.has(fieldId);
  return (
    <div className="min-w-0">
      <p className="text-[12px] leading-tight text-[#AAAAAA]">{label}</p>
      <p className="mt-1.5 text-[13px] font-medium leading-snug text-[#111111]">{name}</p>
      <span className="mt-1 inline-flex items-center gap-1.5">
        <span className="font-mono text-[12px] text-[#777777]">
          {isRevealed ? full : masked}
        </span>
        <EyeToggle
          revealed={isRevealed}
          onToggle={() => onToggle(fieldId)}
          label={`${label} citizenship`}
          disabled={!hasFull}
        />
      </span>
    </div>
  );
}

function InfoTile({
  label,
  icon,
  tone = "blue",
  children,
}: {
  label: string;
  icon?: ReactNode;
  tone?: "blue" | "green" | "amber";
  children: ReactNode;
}) {
  const border =
    tone === "green"
      ? "border-[#BBE3C9] bg-[#F6FEF8]"
      : tone === "amber"
        ? "border-[#F2DCB8] bg-[#FFFCF5]"
        : "border-[#D9D9D9] bg-white";
  return (
    <div className={`min-w-0 rounded-md border p-3.5 ${border}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="pt-1 text-[11px] leading-tight text-[#AAAAAA]">{label}</p>
        {icon}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function TileIcon({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${bg}`}>
      {children}
    </span>
  );
}

function CollectedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#D9F1E3] px-2.5 py-1 text-[11px] font-bold text-[#168A45]">
      <CheckCircle sx={{ fontSize: 13 }} />
      Collected
    </span>
  );
}

function InProcessBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF0C7] px-2.5 py-1 text-[11px] font-bold text-[#B54708]">
      In Process
    </span>
  );
}

function EmptyState({ message, minHeight = "min-h-40" }: { message: string; minHeight?: string }) {
  return (
    <div
      className={`flex ${minHeight} items-center justify-center rounded-md border border-dashed border-[#D9D9D9] bg-[#FAFBFC] px-6 text-center`}
    >
      <p className="text-[13px] text-[#AAAAAA]">{message}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CitizenDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const idParam = params.id;

  const [registered] = useState<Citizen[]>(() => readRegistered());

  const citizen = useMemo(() => {
    const staticCitizens = citizensData as unknown as Citizen[];
    const base = [...registered, ...staticCitizens].find(
      (c) => c.id === idParam || c.nid_masked === idParam,
    );
    if (!base) return undefined;

    // Respect deletions made from the citizens list (tombstones for static
    // seeds, hard removal for registered records).
    if (typeof window !== "undefined") {
      try {
        const rawDeleted = localStorage.getItem(DELETED_KEY);
        const deleted: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
        if (deleted.includes(base.id)) return undefined;
      } catch {
        // ignore
      }
    }

    const edits = readEdits()[base.id] ?? {};
    return { ...base, ...edits } as Citizen & Record<string, unknown>;
  }, [registered, idParam]);

  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const toggleReveal = (fieldId: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
  };

  if (!citizen) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FDE2E6] text-[#C0392B]">
          <FolderOffOutlined sx={{ fontSize: 28 }} />
        </span>
        <h1 className="text-xl font-bold text-[#101828]">Citizen not found</h1>
        <p className="text-sm text-[#667085]">No citizen matches ID: {idParam}</p>
        <Link
          href="/ward/citizens"
          className="mt-2 inline-flex h-9 items-center rounded-md bg-[#4174C8] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#2F5FAF]"
        >
          Back to Citizens
        </Link>
      </div>
    );
  }

  const profile = getCitizenFormData(citizen as Citizen, registered);
  const cz = citizen as Record<string, unknown>;

  const nidFull: string =
    (profile?.nid_number || cz.nid_number || citizen.citizenship_number || "") as string;
  const nidMasked: string = citizen.nid_masked || maskNumber(nidFull);

  const bloodGroup: string =
    (cz.blood_group as string) || (profile?.blood_group as string) || "";
  const bloodGroupLabel = bloodGroup
    ? BLOOD_GROUP_LABELS[bloodGroup] || bloodGroup
    : "—";

  /* Family: wizard registration payload first, static family records second. */
  const familyRecord =
    profile && (profile.father || profile.mother || profile.spouse || profile.children.length > 0)
      ? {
          citizen_id: citizen.id,
          father: profile.father
            ? {
                name_np: profile.father.name_np,
                name_en: profile.father.name_en,
                citizenship_number: profile.father.citizenship_number,
              }
            : null,
          mother: profile.mother
            ? {
                name_np: profile.mother.name_np,
                name_en: profile.mother.name_en,
                citizenship_number: profile.mother.citizenship_number,
              }
            : null,
          spouse: profile.spouse
            ? {
                name_np: profile.spouse.name_np,
                name_en: profile.spouse.name_en,
                citizenship_number: profile.spouse.citizenship_number,
              }
            : null,
          children: profile.children.map((c) => ({
            name_np: c.name_np,
            name_en: c.name_en,
            citizenship_number: c.citizenship_number,
          })),
        }
      : (familyData as unknown as FamilyRecord[]).find((f) => f.citizen_id === citizen.id);

  const memberName = (m: { name_np: string; name_en: string } | null | undefined) => {
    if (!m) return "—";
    const np = m.name_np?.trim();
    const en = m.name_en?.trim();
    if (np && en && np !== en) return `${en} (${np})`;
    return en || np || "—";
  };
  const memberCtz = (m: { citizenship_number: string } | null | undefined) =>
    m?.citizenship_number?.trim() || "";

  /* Employment */
  const empCategory = citizen.employment_category;
  const emp = profile?.employment;
  const landRopani = emp?.farmer_land_area_ropani?.trim()
    ? emp.farmer_land_area_ropani
    : "";
  const irrigation = emp?.farmer_irrigation_type?.trim()
    ? IRRIGATION_TYPE_LABELS[emp.farmer_irrigation_type] || emp.farmer_irrigation_type
    : "";

  /* Education */
  const edu =
    profile?.education?.level || profile?.education?.institution_name
      ? profile.education
      : (educationData as unknown as Record<string, unknown>[]).find(
          (e) => e.citizen_id === citizen.id,
        );
  const eduLevel = edu?.level
    ? STUDENT_LEVEL_LABELS[edu.level as string] || (edu.level as string)
    : "";
  const eduInstitution = (edu?.institution_name as string) || "";
  const eduDropout = Boolean(edu?.is_dropout);

  /* Household */
  const household =
    profile?.household && (profile.household.house_type || profile.household.monthly_income_band)
      ? (profile.household as unknown as Record<string, unknown>)
      : (householdsData as unknown as Record<string, unknown>[]).find(
          (h) => h.head_citizen_id === citizen.id || h.id === citizen.household_id,
        ) || null;
  const houseType = household?.house_type
    ? HOUSE_TYPE_LABELS[household.house_type as string] || (household.house_type as string)
    : "";
  const electricity = (() => {
    const v =
      (household?.electricity_source as string) || (household?.electricity as string) || "";
    return v ? ELECTRICITY_SOURCE_LABELS[v] || v : "";
  })();
  const waterSource = household?.water_source
    ? WATER_SOURCE_LABELS[household.water_source as string] || (household.water_source as string)
    : "";
  const povertyClass = household?.poverty_class
    ? POVERTY_CLASS_LABELS[household.poverty_class as string] || (household.poverty_class as string)
    : "";
  const incomeBand = (() => {
    const v =
      (household?.monthly_income_band as string) ||
      ((emp?.income_band as string) ?? "");
    return v ? INCOME_BAND_LABELS[v] || v : "";
  })();
  const roomCount = household?.room_count as number | string | undefined;

  /* Disability */
  const disability =
    profile?.disability?.disability_type
      ? (profile.disability as unknown as Record<string, unknown>)
      : (disabilityData as unknown as Record<string, unknown>[]).find(
          (d) => d.citizen_id === citizen.id,
        ) || null;
  const DISABILITY_TYPE_LABELS_MAP: Record<string, string> = {
    VISUAL: "Visual",
    HEARING: "Hearing",
    PHYSICAL: "Physical",
    INTELLECTUAL: "Intellectual",
    PSYCHOSOCIAL: "Psychosocial",
    OTHER: "Other",
  };

  /* GPS */
  const latitude = citizen.latitude;
  const longitude = citizen.longitude;
  const placeName = citizen.place_name || profile?.gps?.place_name || "";
  const hasGps = latitude != null && longitude != null;

  /* ID card */
  const idCard = (idCardsData as unknown as IDCard[]).find((c) => c.citizen_id === citizen.id);

  /* Activity log from the citizen's audit trail */
  const auditEntries = (auditLogData as unknown as AuditLog[]).filter(
    (a) => a.citizen_id === citizen.id,
  );

  const wardNumber = String(citizen.ward_id ?? "").replace("ward-", "");
  const PAGE_META = [
    `Ward ${wardNumber || "—"}`,
    "Kummayak Rural Municipality",
    "Sunsari District",
  ];

  const handlePrint = () => {
    setToastMessage(
      `Preparing print view for ${citizen.name_en || citizen.name_np || "citizen"}…`,
    );
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleDelete = () => {
    try {
      const isRegistered = registered.some((c) => c.id === citizen.id);
      if (isRegistered) {
        const list = readRegistered().filter((c) => c.id !== citizen.id);
        localStorage.setItem(REGISTERED_KEY, JSON.stringify(list));
      } else {
        const raw = localStorage.getItem(DELETED_KEY);
        const ids: string[] = raw ? JSON.parse(raw) : [];
        if (!ids.includes(citizen.id)) {
          localStorage.setItem(DELETED_KEY, JSON.stringify([...ids, citizen.id]));
        }
      }
    } catch {
      // ignore
    }
    router.push("/ward/citizens");
  };

  const actionButtonClass =
    "inline-flex h-9 items-center gap-1.5 rounded-md border bg-white px-4 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2";

  return (
    <div className="mx-auto w-full max-w-6xl pb-2">
      {/* Toast message */}
      {toastMessage && (
        <div className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-lg bg-[#063477] px-4 py-3 text-[13px] font-semibold text-white shadow-lg">
          <CheckCircle sx={{ fontSize: 16 }} />
          {toastMessage}
        </div>
      )}

      {/* Page heading + actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-tight text-[#063477]">
            {citizen.name_en || citizen.name_np || "Unnamed Citizen"}
          </h1>
          <p className="mt-1.5 text-[12px] text-[#AAAAAA]">{PAGE_META.join("   •   ")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={() => router.push(`/ward/dashboard/registercitizen?edit=${encodeURIComponent(citizen.id)}`)}
            className={`${actionButtonClass} border-[#063477] text-[#063477] hover:bg-[#F0F5FF] focus-visible:ring-[#063477]/30`}
          >
            <EditOutlined sx={{ fontSize: 16 }} />
            Edit
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className={`${actionButtonClass} border-[#344054] text-[#344054] hover:bg-[#F5F7FA] focus-visible:ring-[#344054]/30`}
          >
            <PrintOutlined sx={{ fontSize: 16 }} />
            Print
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className={`${actionButtonClass} border-[#D92D20] text-[#D92D20] hover:bg-[#FEF3F2] focus-visible:ring-[#D92D20]/30`}
          >
            <DeleteOutlined sx={{ fontSize: 16 }} />
            Delete
          </button>
        </div>
      </div>

      {/* Citizen summary card */}
      <section className="mt-5 rounded-md border border-[#D9D9D9] bg-white p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-[#F59E0B] bg-[#F8FAFC]">
              <PersonOutlined sx={{ fontSize: 44 }} className="text-[#C4CCD8]" />
            </div>
            <div className="min-w-0">
              <p className="text-[18px] font-bold leading-tight text-[#111111]">
                {citizen.name_en || citizen.name_np || "Unnamed Citizen"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-[14px] tracking-tight text-[#344054]">
                  {revealed.has("main-nid") && nidFull ? nidFull : nidMasked}
                </span>
                <EyeToggle
                  revealed={revealed.has("main-nid")}
                  onToggle={() => toggleReveal("main-nid")}
                  label="NID"
                  disabled={!nidFull}
                />
              </div>
              <p className="mt-1 text-[11px] text-[#AAAAAA]">NID / Citizenship Number</p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-[620px] xl:grid-cols-4">
            <InfoTile
              label="Date of Birth"
              icon={
                <TileIcon bg="bg-[#E8F0FB] text-[#063477]">
                  <CalendarMonthOutlined sx={{ fontSize: 15 }} />
                </TileIcon>
              }
            >
              <p className="text-[13px] font-semibold text-[#111111]">{em(citizen.dob)}</p>
              <p className="mt-0.5 text-[11px] text-[#777777]">{citizen.dob ? "(AD)" : ""}</p>
            </InfoTile>

            <InfoTile
              label="Age"
              icon={
                <TileIcon bg="bg-[#E8F0FB] text-[#063477]">
                  <PersonOutlineOutlined sx={{ fontSize: 15 }} />
                </TileIcon>
              }
            >
              <p className="text-[13px] font-semibold text-[#111111]">{ageFrom(citizen.dob)}</p>
            </InfoTile>

            <InfoTile
              label="Registered on"
              icon={
                <TileIcon bg="bg-[#E8F0FB] text-[#063477]">
                  <EventOutlined sx={{ fontSize: 15 }} />
                </TileIcon>
              }
            >
              <p className="text-[13px] font-semibold text-[#111111]">{fmtDate(citizen.created_at)}</p>
              <p className="mt-0.5 text-[11px] text-[#777777]">{fmtTime(citizen.created_at)}</p>
            </InfoTile>

            <InfoTile
              label="Status"
              tone={citizen.nid_verified ? "green" : "amber"}
              icon={
                citizen.nid_verified ? (
                  <TileIcon bg="bg-[#D9F1E3] text-[#168A45]">
                    <CheckCircle sx={{ fontSize: 15 }} />
                  </TileIcon>
                ) : undefined
              }
            >
              {citizen.nid_verified ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#138A42] px-2.5 py-0.5 text-[11px] font-bold text-white">
                    <CheckCircle sx={{ fontSize: 12 }} />
                    Verified
                  </span>
                  <p className="mt-1.5 text-[11px] leading-snug text-[#777777]">
                    Citizen identity has been verified
                  </p>
                </>
              ) : (
                <span className="inline-flex items-center rounded-full bg-[#FEF0C7] px-2.5 py-1 text-[11px] font-bold text-[#B54708]">
                  Pending
                </span>
              )}
            </InfoTile>
          </div>
        </div>
      </section>

      {/* Personal information */}
      <div className="mt-5">
        <SectionCard title="Personal Information">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            <Field label="Full Name (NP)" value={em(citizen.name_np)} />
            <Field label="Full Name (EN)" value={em(citizen.name_en)} />
            <Field label="Gender" value={genderLabel(citizen.sex)} />
            <Field label="Date of Birth (AD)" value={em(citizen.dob)} />
            <MaskedNumberField
              label="NID / Citizenship"
              masked={nidMasked}
              full={nidFull}
              fieldId="personal-nid"
              revealed={revealed}
              onToggle={toggleReveal}
            />
            <Field label="Blood group" value={bloodGroupLabel} />
            <Field label="Digital Literacy" value={em(citizen.digital_literacy)} />
            <Field label="Has Smartphone" value={citizen.has_smartphone ? "Yes" : "No"} />
            <Field label="Religion" value={em(profile?.religion)} />
            <Field label="Ethnicity" value={em(profile?.ethnicity)} />
            <Field label="Mother Tongue" value={em(profile?.mother_tongue)} />
            <Field label="Sync Status" value={em(citizen.sync_status)} />
          </div>
        </SectionCard>
      </div>

      {/* Family information */}
      <div className="mt-5">
        <SectionCard title="Family information">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <FamilyField
              label="Father Name"
              name={memberName(familyRecord?.father)}
              masked={maskNumber(memberCtz(familyRecord?.father))}
              full={memberCtz(familyRecord?.father)}
              fieldId="father-ctz"
              revealed={revealed}
              onToggle={toggleReveal}
            />
            <FamilyField
              label="Mother Name"
              name={memberName(familyRecord?.mother)}
              masked={maskNumber(memberCtz(familyRecord?.mother))}
              full={memberCtz(familyRecord?.mother)}
              fieldId="mother-ctz"
              revealed={revealed}
              onToggle={toggleReveal}
            />
            <FamilyField
              label="Spouse Name"
              name={memberName(familyRecord?.spouse)}
              masked={maskNumber(memberCtz(familyRecord?.spouse))}
              full={memberCtz(familyRecord?.spouse)}
              fieldId="spouse-ctz"
              revealed={revealed}
              onToggle={toggleReveal}
            />
            {[0, 1].map((i) => {
              const child = familyRecord?.children?.[i];
              return (
                <FamilyField
                  key={i}
                  label={`Children Name (${i + 1})`}
                  name={memberName(child)}
                  masked={maskNumber(memberCtz(child))}
                  full={memberCtz(child)}
                  fieldId={`child${i}-ctz`}
                  revealed={revealed}
                  onToggle={toggleReveal}
                />
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Address information */}
      <div className="mt-5">
        <SectionCard title="Address information">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            <Field label="Province" value="Koshi Province" />
            <Field label="District" value="Sunsari" />
            <Field label="Local Government" value="Kummayak Rural Municipality" />
            <Field label="Ward" value={wardNumber || "—"} />
            <Field label="Tole" value={em(citizen.tole)} />
            <Field label="House Number" value={em(household?.address as string)} />
          </div>
        </SectionCard>
      </div>

      {/* Employment + Education */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Employment information">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field
              label="Occupation"
              value={
                empCategory ? EMPLOYMENT_CATEGORY_LABELS[empCategory] || empCategory : "—"
              }
            />
            <Field label="Income Band" value={incomeBand || "—"} />
          </div>
          {(landRopani || irrigation) && (
            <>
              <p className="mt-5 text-[12px] font-semibold text-[#777777]">
                Additional Information
              </p>
              <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <Field label="Land Ropani" value={em(landRopani)} />
                <Field label="Irrigation" value={em(irrigation)} />
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard title="Education information">
          {eduLevel || eduInstitution ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field label="Level" value={em(eduLevel)} />
              <Field label="Institution" value={em(eduInstitution)} />
              <Field label="Drop out" value={eduDropout ? "Yes" : "No"} />
            </div>
          ) : (
            <EmptyState message="No education data recorded" minHeight="min-h-28" />
          )}
        </SectionCard>
      </div>

      {/* Household information */}
      <div className="mt-5">
        <SectionCard title="Household information">
          {household ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              <Field label="House Type" value={em(houseType)} />
              <Field label="Electricity" value={em(electricity)} />
              <Field label="Poverty class" value={em(povertyClass)} />
              <Field label="Room count" value={em(roomCount ?? "")} />
              <Field label="Water Source" value={em(waterSource)} />
              <Field label="Monthly income" value={incomeBand || "—"} />
            </div>
          ) : (
            <EmptyState message="No household data recorded" minHeight="min-h-28" />
          )}
        </SectionCard>
      </div>

      {/* Disability + GPS */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Disability information">
          {disability ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <Field
                label="Disability Type"
                value={em(
                  DISABILITY_TYPE_LABELS_MAP[disability.disability_type as string] ||
                    (disability.disability_type as string),
                )}
              />
              <Field label="Certificate No." value={em(disability.certificate_no as string)} />
              <Field label="Issuing Hospital" value={em(disability.issuing_hospital as string)} />
              <Field
                label="Certificate Expiry"
                value={em(disability.certificate_expiry as string)}
              />
            </div>
          ) : (
            <EmptyState message="No disability data recorded" minHeight="min-h-44" />
          )}
        </SectionCard>

        <SectionCard
          title="Gps Co-ordinated information"
          action={
            <Link
              href="/ward/map"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#063477] bg-white px-4 text-[13px] font-semibold text-[#063477] transition-colors hover:bg-[#F0F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#063477]/30"
            >
              <MapOutlined sx={{ fontSize: 16 }} />
              View Map
            </Link>
          }
        >
          {hasGps ? (
            <>
              <div className="flex h-56 items-center justify-center rounded-md border border-[#D9D9D9] bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F0FB] text-[#063477]">
                    <MapOutlined sx={{ fontSize: 24 }} />
                  </span>
                  <p className="text-[13px] font-medium text-[#344054]">
                    {em(placeName)}
                    {wardNumber ? `, Ward ${wardNumber}` : ""}
                  </p>
                  <p className="text-[11px] text-[#AAAAAA]">
                    Map preview — open the ward map for the exact location
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                <Field label="Latitude" value={String(latitude)} />
                <Field label="Longitude" value={String(longitude)} />
                <Field label="Place Name" value={em(placeName)} />
              </div>
            </>
          ) : (
            <EmptyState message="No GPS coordinates recorded" minHeight="min-h-44" />
          )}
        </SectionCard>
      </div>

      {/* ID-card + Audit log (left) and Activity log (right) */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <SectionCard
            title="ID-Card information"
            action={idCard ? (idCard.status === "COLLECTED" ? <CollectedBadge /> : <InProcessBadge />) : undefined}
          >
            {idCard ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <Field label="Card Type" value={em(idCard.card_type)} />
                <Field label="QR" value={em(idCard.qr_hash)} />
                <Field label="Expires" value={em(idCard.expires_at)} />
                <Field label="Issued date" value={em(idCard.issued_at)} />
                <Field label="Collected date" value={em(idCard.collected_at)} />
              </div>
            ) : (
              <EmptyState message="No ID card issued for this citizen" minHeight="min-h-28" />
            )}
          </SectionCard>

          <SectionCard title="Audit Log">
            {auditEntries.length > 0 ? (
              <div className="divide-y divide-[#EFEFEF]">
                {auditEntries.slice(0, 4).map((entry) => (
                  <div key={entry.id} className="py-2.5">
                    <p className="text-[13px] font-medium text-[#111111]">{entry.event_type}</p>
                    <p className="mt-0.5 text-[11px] text-[#AAAAAA]">
                      {entry.acted_by_role} • {fmtDate(entry.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No audit log recorded" minHeight="min-h-28" />
            )}
          </SectionCard>
        </div>

        <SectionCard title="Activity log">
          {auditEntries.length > 0 ? (
            <div className="sidebar-scrollbar max-h-[430px] overflow-y-auto pr-1">
              {auditEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-start gap-3 py-3.5 ${
                    index !== auditEntries.length - 1 ? "border-b border-[#EFEFEF]" : "pb-1"
                  }`}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#138A42]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#111111]">{entry.event_type}</p>
                    <p className="mt-0.5 text-[12px] text-[#777777]">
                      Date: {fmtDate(entry.timestamp)} &nbsp;•&nbsp; Time: {fmtTime(entry.timestamp)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-[#AAAAAA]">By: {entry.acted_by_role}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No activity recorded yet" minHeight="min-h-28" />
          )}
        </SectionCard>
      </div>

      {/* Footer */}
      <footer className="-mx-4 mt-8 border-t border-[#E4E8EF] bg-white py-5 text-center sm:-mx-6 lg:-ml-[54px] lg:-mr-[60px]">
        <p className="text-[13px] font-semibold text-[#063477]">
          Digital Nepal E-Governance System
        </p>
      </footer>

      {/* Delete confirmation modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Citizen?" size="sm">
        <p className="text-[13px] leading-relaxed text-[#475467]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#111111]">
            {citizen.name_en || citizen.name_np}
          </span>
          ? This will remove the citizen record from this ward&apos;s registry. This action cannot
          be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeleteOpen(false)}
            className="h-9 rounded-md border border-[#D9D9D9] bg-white px-4 text-[13px] font-semibold text-[#344054] transition-colors hover:bg-[#F5F7FA]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-9 rounded-md bg-[#D92D20] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#B42318]"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
