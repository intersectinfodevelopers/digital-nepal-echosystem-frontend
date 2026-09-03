"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { nanoid } from "nanoid";
import citizensData from "../../../../../data/citizens.json";
import employmentData from "../../../../../data/employment.json";
import disabilityData from "../../../../../data/disability.json";
import educationData from "../../../../../data/education.json";
import householdsData from "../../../../../data/households.json";
import familyData from "../../../../../data/family.json";
import idCardsData from "../../../../../data/id-cards.json";
import auditLogData from "../../../../../data/audit-log.json";
import editApprovalsData from "../../../../../data/edit-approvals.json";
import type {
  Citizen,
  RegistrationFormData,
  EmploymentData,
  FamilyMember,
} from "@/types/citizen";
import type { AuditLog } from "@/types/audit-log";
import type { ApprovalEntry, FamilyRecord, IDCard } from "@/types/ward";
import { getCitizenFormData } from "@/services/citizenService";
import UnifiedCitizenProfile from "@/components/citizens/UnifiedCitizenProfile";
import type { FormState as UnifiedRegistrationForm } from "@/components/UnifiedCitizenRegistration";

import { Modal } from "@/components/ui";
import { useEligibility } from "@/hooks/useEligibility";
import { InputField, SelectField } from "@/components/ui";
import type { ReactNode } from "react";

/** Flat section: heading + optional description + content. No card / border box. */
function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className="scroll-mt-24">
      <div className="border-b border-gray-200 pb-2">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#0A3E9E]">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>}
      </div>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

import { EMPLOYMENT_CATEGORIES, INCOME_BANDS, SEXES, DIGITAL_LITERACIES, BLOOD_GROUPS, CONSENT_CHANNELS } from "@/types/citizen";
import {
  CONSENT_CHANNEL_LABELS, HOUSE_TYPE_LABELS, CONSTRUCTION_TYPE_LABELS,
  ELECTRICITY_SOURCE_LABELS, WATER_SOURCE_LABELS, SANITATION_LABELS, INTERNET_ACCESS_LABELS,
  POVERTY_CLASS_LABELS, DISABILITY_TYPE_LABELS,
  STUDENT_LEVEL_LABELS, INSTITUTION_TYPE_LABELS, SCHOLARSHIP_TYPE_LABELS,
  EMPLOYMENT_CATEGORY_LABELS, INCOME_BAND_LABELS, BLOOD_GROUP_LABELS,
  VISA_TYPE_LABELS, LAND_TYPE_LABELS, IRRIGATION_TYPE_LABELS,
  REMITTANCE_BAND_LABELS, GOV_GRADE_LABELS, COUNTRY_OPTIONS,
} from "@/constants";

const LOCAL_STORAGE_KEY = "edit-approvals";
const initialApprovals = editApprovalsData as unknown as ApprovalEntry[];

const DISABILITY_TYPES_OPTIONS = [
  { value: "", label: "None / No Disability" },
  ...Object.entries(DISABILITY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const SEVERITY_LABELS = ["None", "Mild", "Moderate", "Severe", "Complete"];

/* ------------------------------------------------------------------ */
/* Builders: map the stored RegistrationFormData into the record       */
/* shapes the tabs (Family, Employment, …) expect.                     */
/* ------------------------------------------------------------------ */
function toMember(
  m: FamilyMember | null | undefined,
): { name_np: string; name_en: string; citizenship_number: string } | null {
  if (!m) return null;
  return {
    name_np: m.name_np,
    name_en: m.name_en,
    citizenship_number: m.citizenship_number,
  };
}

function buildFamilyRecord(profile: RegistrationFormData): FamilyRecord {
  return {
    citizen_id: "",
    father: toMember(profile.father),
    mother: toMember(profile.mother),
    spouse: toMember(profile.spouse),
    children: (profile.children || [])
      .map(toMember)
      .filter((c): c is { name_np: string; name_en: string; citizenship_number: string } => c !== null),
  };
}

function buildEmploymentRecord(emp: EmploymentData): Record<string, unknown> {
  const sub_fields: Record<string, unknown> = {};
  if (emp.unemployed_duration_months)
    sub_fields.duration_months = emp.unemployed_duration_months;
  if (emp.unemployed_skills.length) sub_fields.skills = emp.unemployed_skills;
  if (emp.unemployed_office_registered) sub_fields.office_registered = true;
  if (emp.farmer_land_area_ropani) sub_fields.land_ropani = emp.farmer_land_area_ropani;
  if (emp.farmer_land_type) sub_fields.land_type = emp.farmer_land_type;
  if (emp.farmer_primary_crop) sub_fields.crop = emp.farmer_primary_crop;
  if (emp.farmer_irrigation_type) sub_fields.irrigation = emp.farmer_irrigation_type;
  if (emp.farmer_agri_loan) sub_fields.agri_loan = true;
  if (emp.foreign_country) sub_fields.country = emp.foreign_country;
  if (emp.foreign_visa_type) sub_fields.visa_type = emp.foreign_visa_type;
  if (emp.foreign_employer_name) sub_fields.employer_name = emp.foreign_employer_name;
  if (emp.foreign_departure_date) sub_fields.departure_date = emp.foreign_departure_date;
  if (emp.foreign_expected_return) sub_fields.expected_return = emp.foreign_expected_return;
  if (emp.foreign_remittance_band) sub_fields.remittance_band = emp.foreign_remittance_band;
  if (emp.foreign_doe_registered) sub_fields.doe_registered = true;
  if (emp.gov_ministry) sub_fields.ministry = emp.gov_ministry;
  if (emp.gov_grade) sub_fields.grade = emp.gov_grade;
  if (emp.gov_posting_district) sub_fields.posting_district = emp.gov_posting_district;
  if (emp.gov_service_entry_year) sub_fields.service_entry_year = emp.gov_service_entry_year;
  if (emp.student_institution) sub_fields.institution = emp.student_institution;
  if (emp.student_level) sub_fields.level = emp.student_level;
  if (emp.student_field_of_study) sub_fields.field_of_study = emp.student_field_of_study;
  if (emp.student_abroad) sub_fields.study_abroad = true;
  return { citizen_id: "", category: emp.category, income_band: emp.income_band, sub_fields };
}

function getApprovals(): ApprovalEntry[] {
  if (typeof window === "undefined") return initialApprovals;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ApprovalEntry[]) : initialApprovals;
  } catch {
    return initialApprovals;
  }
}

function saveApproval(entry: ApprovalEntry): void {
  const approvals = getApprovals();
  approvals.push(entry);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(approvals));
}

function DataRow({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  const display =
    value === null || value === undefined || value === ""
      ? "—"
      : typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : String(value);
  return (
    <div className="flex items-baseline gap-2 py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500 min-w-40 font-medium">{label}</span>
      <span className="text-sm text-gray-900">{display}</span>
    </div>
  );
}

function SectionHeader({ title, onEdit }: { title: string; onEdit?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {onEdit && (
        <button
          onClick={onEdit}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
        >
          Edit
        </button>
      )}
    </div>
  );
}

function EligibilityPanel({
  citizen,
  employmentRec,
  disabilityRec,
  householdRec,
}: {
  citizen: Citizen;
  employmentRec: Record<string, unknown> | null;
  disabilityRec: Record<string, unknown> | null;
  householdRec: Record<string, unknown> | null;
}) {
  const { eligible, age } = useEligibility(citizen, employmentRec, disabilityRec, householdRec);

  return (
    <section className="scroll-mt-24">
      <div className="border-b border-gray-200 pb-2">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#0A3E9E]">Eligibility</h2>
        <p className="mt-1 text-xs text-gray-500">
          Age {age} &middot; {citizen.sex}
        </p>
      </div>

      {eligible.length === 0 ? (
        <div className="mt-4 text-sm text-gray-400">
          No benefits eligible based on current data.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {eligible.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-900">
                  {(rule as unknown as Record<string, unknown>).benefit_type as string}
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">{rule.ruleName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed right-6 top-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg flex items-center gap-3">
      <span>{message}</span>
      <button onClick={onClose} className="text-white/70 hover:text-white">
        &times;
      </button>
    </div>
  );
}
function IdentityTab({
  citizen,
  onEdit,
}: {
  citizen: Citizen;
  onEdit: () => void;
}) {
  return (
    <SectionCard title="Identity Information" description="Core demographic and identification data">
      <SectionHeader title="Personal Details" onEdit={onEdit} />
      <div className="grid grid-cols-2 gap-x-8">
        <div>
          <DataRow label="Name (Nepali)" value={citizen.name_np} />
          <DataRow label="Name (English)" value={citizen.name_en} />
          <DataRow label="Date of Birth" value={citizen.dob} />
          <DataRow label="Sex" value={citizen.sex} />
          <DataRow label="Tole" value={citizen.tole} />
        </div>
        <div>
          <DataRow label="NID" value={(citizen as unknown as Record<string, unknown>).nid_number as string | undefined || citizen.nid_masked} />
          <DataRow label="Citizenship No." value={citizen.citizenship_number} />
          <DataRow label="NID Verified" value={citizen.nid_verified} />
          <DataRow label="Digital Literacy" value={citizen.digital_literacy} />
          <DataRow label="Has Smartphone" value={citizen.has_smartphone} />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-8">
        <DataRow label="Blood Group" value={BLOOD_GROUP_LABELS[(citizen as unknown as Record<string, unknown>).blood_group as string] || ((citizen as unknown as Record<string, unknown>).blood_group as string | undefined)} />
        <DataRow label="Religion" value={(citizen as unknown as Record<string, unknown>).religion as string | undefined} />
        <DataRow label="Ethnicity" value={(citizen as unknown as Record<string, unknown>).ethnicity as string | undefined} />
        <DataRow label="Mother Tongue" value={(citizen as unknown as Record<string, unknown>).mother_tongue as string | undefined} />
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-8">
        <DataRow label="Consent Channel" value={CONSENT_CHANNEL_LABELS[citizen.consent_channel] || citizen.consent_channel} />
        <DataRow label="Consent Recorded At" value={citizen.consent_recorded_at} />
        <DataRow label="Active" value={citizen.is_active} />
      </div>
    </SectionCard>
  );
}

function FamilyTab({
  family,
  onEdit,
}: {
  family: FamilyRecord | undefined;
  onEdit: () => void;
}) {
  if (!family) {
    return (
      <SectionCard title="Family Information" description="Family tree and relationships">
        <div className="text-sm text-gray-400 py-8 text-center">
          No family data recorded for this citizen.
          <div className="mt-3">
            <button
              onClick={onEdit}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              Add Family Data
            </button>
          </div>
        </div>
      </SectionCard>
    );
  }

  const memberRows = (member: { name_np: string; name_en: string; citizenship_number: string } | null, label: string) =>
    member ? (
      <div className="py-2 border-b border-gray-100 last:border-b-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm text-gray-900">
          {member.name_np} ({member.name_en})
        </p>
        <p className="text-xs text-gray-400">Citizenship: {member.citizenship_number}</p>
      </div>
    ) : null;

  return (
    <SectionCard title="Family Information" description="Family tree and relationships">
      <SectionHeader title="Family Members" onEdit={onEdit} />
      {memberRows(family.father, "Father")}
      {memberRows(family.mother, "Mother")}
      {memberRows(family.spouse, "Spouse")}
      {family.children.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 font-medium mb-1">
            Children ({family.children.length})
          </p>
          {family.children.map((child, idx) => (
            <div key={idx} className="py-1.5 border-b border-gray-100 last:border-b-0">
              <p className="text-sm text-gray-900">
                {child.name_np} ({child.name_en})
              </p>
              <p className="text-xs text-gray-400">Citizenship: {child.citizenship_number}</p>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function EmploymentTab({
  employment,
  onEdit,
}: {
  employment: Record<string, unknown> | null;
  onEdit: () => void;
}) {
  if (!employment) {
    return (
      <SectionCard title="Employment Information" description="Employment and occupation data">
        <div className="text-sm text-gray-400 py-8 text-center">
          No employment data recorded.
          <div className="mt-3">
            <button
              onClick={onEdit}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              Add Employment Data
            </button>
          </div>
        </div>
      </SectionCard>
    );
  }

  const cat = employment.category as string;
  const subFields = employment.sub_fields as Record<string, unknown> | undefined;

  return (
    <SectionCard title="Employment Information" description="Employment and occupation data">
      <SectionHeader title="Employment Details" onEdit={onEdit} />
      <div className="grid grid-cols-2 gap-x-8">
        <DataRow label="Category" value={EMPLOYMENT_CATEGORY_LABELS[cat] || cat} />
        <DataRow label="Income Band" value={INCOME_BAND_LABELS[employment.income_band as string] || (employment.income_band as string)} />
      </div>
      {subFields && Object.keys(subFields).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-2">Additional Details</p>
          <div className="grid grid-cols-2 gap-x-8">
            {Object.entries(subFields).map(([key, val]) => (
              <DataRow key={key} label={key.replace(/_/g, " ")} value={String(val)} />
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function EducationTab({
  education,
  onEdit,
}: {
  education: Record<string, unknown> | null;
  onEdit: () => void;
}) {
  if (!education) {
    return (
      <SectionCard title="Education Information" description="Educational background">
        <div className="text-sm text-gray-400 py-8 text-center">
          No education data recorded.
          <div className="mt-3">
            <button
              onClick={onEdit}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              Add Education Data
            </button>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Education Information" description="Educational background">
      <SectionHeader title="Education Details" onEdit={onEdit} />
      <div className="grid grid-cols-2 gap-x-8">
        <DataRow label="Level" value={STUDENT_LEVEL_LABELS[education.level as string] || (education.level as string)} />
        <DataRow label="Institution" value={education.institution_name as string} />
        <DataRow label="Institution Type" value={INSTITUTION_TYPE_LABELS[education.institution_type as string] || (education.institution_type as string)} />
        <DataRow label="Study Location" value={education.study_location as string} />
        <DataRow label="Dropout" value={education.is_dropout as boolean} />
        {(education.is_dropout as boolean) && (
          <>
            <DataRow label="Dropout Reason" value={education.dropout_reason as string} />
            <DataRow label="Dropout Date" value={education.dropout_date as string} />
          </>
        )}
        <DataRow label="Has Scholarship" value={education.has_scholarship as boolean} />
        {(education.has_scholarship as boolean) && (
          <>
            <DataRow label="Scholarship Type" value={SCHOLARSHIP_TYPE_LABELS[education.scholarship_type as string] || (education.scholarship_type as string)} />
            <DataRow label="Scholarship Provider" value={education.scholarship_provider as string} />
          </>
        )}
      </div>
    </SectionCard>
  );
}

function DisabilityTab({
  disability,
  onEdit,
}: {
  disability: Record<string, unknown> | null;
  onEdit: () => void;
}) {
  if (!disability || !disability.disability_type) {
    return (
      <SectionCard title="Disability Information" description="Disability status using WHO ICF standards">
        <div className="text-sm text-gray-400 py-8 text-center">
          No disability data recorded.
          <div className="mt-3">
            <button
              onClick={onEdit}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              Add Disability Data
            </button>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Disability Information" description="Disability status using WHO ICF standards">
      <SectionHeader title="Disability Details" onEdit={onEdit} />
      <div className="grid grid-cols-2 gap-x-8">
        <DataRow label="Disability Type" value={DISABILITY_TYPE_LABELS[disability.disability_type as string] || (disability.disability_type as string)} />
        <DataRow label="Severity (Body)" value={`${SEVERITY_LABELS[disability.severity_body as number] || "—"} (${disability.severity_body})`} />
        <DataRow label="Severity (Activity)" value={`${SEVERITY_LABELS[disability.severity_activity as number] || "—"} (${disability.severity_activity})`} />
        <DataRow label="Severity (Participation)" value={`${SEVERITY_LABELS[disability.severity_participation as number] || "—"} (${disability.severity_participation})`} />
      </div>
      {(disability.certificate_no as string) && (
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-8">
          <DataRow label="Certificate No." value={disability.certificate_no as string} />
          <DataRow label="Issuing Hospital" value={disability.issuing_hospital as string} />
          <DataRow label="Certificate Expiry" value={disability.certificate_expiry as string} />
        </div>
      )}
    </SectionCard>
  );
}

function HouseholdTab({
  household,
  onEdit,
}: {
  household: Record<string, unknown> | null;
  onEdit: () => void;
}) {
  if (!household) {
    return (
      <SectionCard title="Household Information" description="Housing and living conditions">
        <div className="text-sm text-gray-400 py-8 text-center">
          No household data recorded.
          <div className="mt-3">
            <button
              onClick={onEdit}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              Add Household Data
            </button>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Household Information" description="Housing and living conditions">
      <SectionHeader title="Household Details" onEdit={onEdit} />
      <div className="grid grid-cols-2 gap-x-8">
        <DataRow label="House Type" value={HOUSE_TYPE_LABELS[household.house_type as string] || (household.house_type as string)} />
        <DataRow label="Room Count" value={household.room_count as number} />
        <DataRow label="Electricity" value={ELECTRICITY_SOURCE_LABELS[household.electricity as string] || ELECTRICITY_SOURCE_LABELS[household.electricity_source as string] || (household.electricity as string || household.electricity_source as string)} />
        <DataRow label="Water Source" value={WATER_SOURCE_LABELS[household.water_source as string] || (household.water_source as string)} />
        <DataRow label="Poverty Class" value={POVERTY_CLASS_LABELS[household.poverty_class as string] || (household.poverty_class as string)} />
        <DataRow label="Monthly Income" value={INCOME_BAND_LABELS[household.monthly_income_band as string] || (household.monthly_income_band as string)} />
      </div>
    </SectionCard>
  );
}

function IDCardsTab({ cards }: { cards: IDCard[] }) {
  if (cards.length === 0) {
    return (
      <SectionCard title="ID Cards" description="Issued identification cards">
        <div className="text-sm text-gray-400 py-8 text-center">No ID cards issued.</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="ID Cards" description="Issued identification cards">
      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="p-4 rounded-xl border border-gray-200 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">{card.card_type}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                card.status === "COLLECTED" ? "bg-emerald-100 text-emerald-800" :
                card.status === "APPROVED" ? "bg-blue-100 text-blue-800" :
                card.status === "PENDING_APPROVAL" ? "bg-amber-100 text-amber-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {card.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-500">
              <span>QR: {card.qr_hash}</span>
              <span>Issued: {card.issued_at || "—"}</span>
              <span>Expires: {card.expires_at || "—"}</span>
              <span>Collected: {card.collected_at || "—"}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function AuditTab({ auditEntries }: { auditEntries: AuditLog[] }) {
  if (auditEntries.length === 0) {
    return (
      <SectionCard title="Audit Log" description="Event history for this citizen">
        <div className="text-sm text-gray-400 py-8 text-center">No audit events recorded.</div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Audit Log" description="Event history for this citizen">
      <div className="space-y-2">
        {auditEntries.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100"
          >
            <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{event.event_type}</p>
              <p className="text-xs text-gray-500">
                {event.acted_by_role} &middot; {event.jurisdiction}
              </p>
              <p className="text-xs text-gray-400">{event.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function EditIdentityModal({
  open,
  onClose,
  citizen,
}: {
  open: boolean;
  onClose: () => void;
  citizen: Citizen;
}) {
  const [form, setForm] = useState<Record<string, string>>({
    name_np: citizen.name_np,
    name_en: citizen.name_en,
    dob: citizen.dob,
    sex: citizen.sex,
    blood_group: (citizen as unknown as Record<string, unknown>).blood_group as string || "",
    religion: (citizen as unknown as Record<string, unknown>).religion as string || "",
    ethnicity: (citizen as unknown as Record<string, unknown>).ethnicity as string || "",
    mother_tongue: (citizen as unknown as Record<string, unknown>).mother_tongue as string || "",
    tole: citizen.tole,
    digital_literacy: citizen.digital_literacy,
    has_smartphone: String(citizen.has_smartphone),
    nid_number: (citizen as unknown as Record<string, unknown>).nid_number as string || citizen.nid_masked,
    citizenship_number: citizen.citizenship_number || "",
    consent_channel: citizen.consent_channel,
  });

  const [toast, setToast] = useState("");

  function handleSave() {
    const oldVals: Record<string, unknown> = {
      name_np: citizen.name_np,
      name_en: citizen.name_en,
      dob: citizen.dob,
      sex: citizen.sex,
      blood_group: (citizen as unknown as Record<string, unknown>).blood_group as string || "",
      religion: (citizen as unknown as Record<string, unknown>).religion as string || "",
      ethnicity: (citizen as unknown as Record<string, unknown>).ethnicity as string || "",
      mother_tongue: (citizen as unknown as Record<string, unknown>).mother_tongue as string || "",
      tole: citizen.tole,
      digital_literacy: citizen.digital_literacy,
      has_smartphone: citizen.has_smartphone,
      nid_number: (citizen as unknown as Record<string, unknown>).nid_number as string || citizen.nid_masked,
      citizenship_number: citizen.citizenship_number || "",
      consent_channel: citizen.consent_channel,
    };
    const newVals: Record<string, unknown> = {
      ...form,
      has_smartphone: form.has_smartphone === "true",
    };
    const changed: Record<string, unknown> = {};
    for (const key of Object.keys(newVals)) {
      if (String(oldVals[key]) !== String(newVals[key])) {
        changed[key] = newVals[key];
      }
    }
    if (Object.keys(changed).length === 0) {
      onClose();
      return;
    }
    const entry: ApprovalEntry = {
      id: `edit-${nanoid(8)}`,
      citizen_id: citizen.id,
      submitter_id: "ward-staff",
      status: "PENDING_APPROVAL",
      old_value_json: oldVals,
      new_value_json: newVals,
      submitted_at: new Date().toISOString(),
    };
    saveApproval(entry);
    setToast("Edit submitted for approval");
    setTimeout(() => { setToast(""); onClose(); }, 1000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Identity Information">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <InputField label="Name (Nepali)" value={form.name_np} onChange={(v) => setForm({ ...form, name_np: v })} />
        <InputField label="Name (English)" value={form.name_en} onChange={(v) => setForm({ ...form, name_en: v })} />
        <InputField label="Date of Birth" value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} type="date" />
        <SelectField label="Sex" value={form.sex} onChange={(v) => setForm({ ...form, sex: v })} options={SEXES.map((s) => ({ value: s, label: s }))} />
        <SelectField label="Blood Group" value={form.blood_group} onChange={(v) => setForm({ ...form, blood_group: v })} options={BLOOD_GROUPS.map((b) => ({ value: b, label: BLOOD_GROUP_LABELS[b] || b }))} />
        <InputField label="Religion" value={form.religion} onChange={(v) => setForm({ ...form, religion: v })} />
        <InputField label="Ethnicity" value={form.ethnicity} onChange={(v) => setForm({ ...form, ethnicity: v })} />
        <InputField label="Mother Tongue" value={form.mother_tongue} onChange={(v) => setForm({ ...form, mother_tongue: v })} />
        <InputField label="Tole" value={form.tole} onChange={(v) => setForm({ ...form, tole: v })} />
        <SelectField label="Digital Literacy" value={form.digital_literacy} onChange={(v) => setForm({ ...form, digital_literacy: v })} options={DIGITAL_LITERACIES.map((d) => ({ value: d, label: d }))} />
        <SelectField label="Has Smartphone" value={form.has_smartphone} onChange={(v) => setForm({ ...form, has_smartphone: v })} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
        <InputField label="NID Number" value={form.nid_number} onChange={(v) => setForm({ ...form, nid_number: v })} />
        <InputField label="Citizenship Number" value={form.citizenship_number} onChange={(v) => setForm({ ...form, citizenship_number: v })} />
        <SelectField label="Consent Channel" value={form.consent_channel} onChange={(v) => setForm({ ...form, consent_channel: v })} options={CONSENT_CHANNELS.map((c) => ({ value: c, label: CONSENT_CHANNEL_LABELS[c] || c }))} />
        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700">Submit for Approval</button>
        </div>
      </div>
    </Modal>
  );
}

function EditFamilyModal({
  open,
  onClose,
  citizenId,
  family,
}: {
  open: boolean;
  onClose: () => void;
  citizenId: string;
  family: FamilyRecord | undefined;
}) {
  const [form, setForm] = useState({
    father_name: family?.father?.name_en || "",
    father_citizenship: family?.father?.citizenship_number || "",
    mother_name: family?.mother?.name_en || "",
    mother_citizenship: family?.mother?.citizenship_number || "",
    spouse_name: family?.spouse?.name_en || "",
    spouse_citizenship: family?.spouse?.citizenship_number || "",
  });
  const [children, setChildren] = useState<{ name_en: string; citizenship_number: string }[]>(
    family?.children?.map((c) => ({ name_en: c.name_en, citizenship_number: c.citizenship_number })) || [],
  );

  const [toast, setToast] = useState("");

  function handleSave() {
    const oldVals: Record<string, unknown> = {
      father_name: family?.father?.name_en || "",
      mother_name: family?.mother?.name_en || "",
      spouse_name: family?.spouse?.name_en || "",
      children_count: family?.children?.length || 0,
    };
    const newVals: Record<string, unknown> = {
      ...form,
      children_count: children.length,
      children_names: children.map((c) => c.name_en).join(", "),
    };
    const changed: Record<string, unknown> = {};
    for (const key of Object.keys(newVals)) {
      if (String(oldVals[key]) !== String(newVals[key])) {
        changed[key] = newVals[key];
      }
    }
    if (Object.keys(changed).length === 0) { onClose(); return; }
    const entry: ApprovalEntry = {
      id: `edit-${nanoid(8)}`,
      citizen_id: citizenId,
      submitter_id: "ward-staff",
      status: "PENDING_APPROVAL",
      old_value_json: oldVals,
      new_value_json: newVals,
      submitted_at: new Date().toISOString(),
    };
    saveApproval(entry);
    setToast("Edit submitted for approval");
    setTimeout(() => { setToast(""); onClose(); }, 1000);
  }

  function addChild() {
    setChildren([...children, { name_en: "", citizenship_number: "" }]);
  }

  function updateChild(index: number, field: string, value: string) {
    const next = [...children];
    next[index] = { ...next[index], [field]: value };
    setChildren(next);
  }

  function removeChild(index: number) {
    setChildren(children.filter((_, i) => i !== index));
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Family Information">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <InputField label="Father's Name (EN)" value={form.father_name} onChange={(v) => setForm({ ...form, father_name: v })} />
        <InputField label="Father's Citizenship No." value={form.father_citizenship} onChange={(v) => setForm({ ...form, father_citizenship: v })} />
        <InputField label="Mother's Name (EN)" value={form.mother_name} onChange={(v) => setForm({ ...form, mother_name: v })} />
        <InputField label="Mother's Citizenship No." value={form.mother_citizenship} onChange={(v) => setForm({ ...form, mother_citizenship: v })} />
        <InputField label="Spouse's Name (EN)" value={form.spouse_name} onChange={(v) => setForm({ ...form, spouse_name: v })} />
        <InputField label="Spouse's Citizenship No." value={form.spouse_citizenship} onChange={(v) => setForm({ ...form, spouse_citizenship: v })} />
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Children ({children.length})</span>
            <button onClick={addChild} className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200">+ Add Child</button>
          </div>
          {children.map((child, i) => (
            <div key={i} className="flex gap-2 items-start mb-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex-1 space-y-1">
                <InputField label={`Child ${i + 1} Name`} value={child.name_en} onChange={(v) => updateChild(i, "name_en", v)} />
                <InputField label="Citizenship No." value={child.citizenship_number} onChange={(v) => updateChild(i, "citizenship_number", v)} />
              </div>
              <button onClick={() => removeChild(i)} className="mt-6 text-red-500 hover:text-red-700 text-sm">Remove</button>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700">Submit for Approval</button>
        </div>
      </div>
    </Modal>
  );
}

function EditEmploymentModal({
  open,
  onClose,
  citizenId,
  employment,
}: {
  open: boolean;
  onClose: () => void;
  citizenId: string;
  employment: Record<string, unknown> | null;
}) {
  const [form, setForm] = useState<Record<string, string>>({
    category: (employment?.category as string) || "",
    income_band: (employment?.income_band as string) || "",
    unemployed_duration_months: String((employment as Record<string, unknown>)?.unemployed_duration_months ?? ""),
    unemployed_skills: ((employment as Record<string, unknown>)?.unemployed_skills as string[])?.join(",") || "",
    unemployed_office_registered: String(!!(employment as Record<string, unknown>)?.unemployed_office_registered),
    farmer_land_area_ropani: (employment as Record<string, unknown>)?.farmer_land_area_ropani as string || "",
    farmer_land_type: (employment as Record<string, unknown>)?.farmer_land_type as string || "",
    farmer_primary_crop: (employment as Record<string, unknown>)?.farmer_primary_crop as string || "",
    farmer_irrigation_type: (employment as Record<string, unknown>)?.farmer_irrigation_type as string || "",
    farmer_agri_loan: String(!!(employment as Record<string, unknown>)?.farmer_agri_loan),
    foreign_country: (employment as Record<string, unknown>)?.foreign_country as string || "",
    foreign_visa_type: (employment as Record<string, unknown>)?.foreign_visa_type as string || "",
    foreign_employer_name: (employment as Record<string, unknown>)?.foreign_employer_name as string || "",
    foreign_departure_date: (employment as Record<string, unknown>)?.foreign_departure_date as string || "",
    foreign_expected_return: (employment as Record<string, unknown>)?.foreign_expected_return as string || "",
    foreign_remittance_band: (employment as Record<string, unknown>)?.foreign_remittance_band as string || "",
    foreign_doe_registered: String(!!(employment as Record<string, unknown>)?.foreign_doe_registered),
    gov_ministry: (employment as Record<string, unknown>)?.gov_ministry as string || "",
    gov_grade: (employment as Record<string, unknown>)?.gov_grade as string || "",
    gov_posting_district: (employment as Record<string, unknown>)?.gov_posting_district as string || "",
    gov_service_entry_year: (employment as Record<string, unknown>)?.gov_service_entry_year as string || "",
    student_institution: (employment as Record<string, unknown>)?.student_institution as string || "",
    student_level: (employment as Record<string, unknown>)?.student_level as string || "",
    student_field_of_study: (employment as Record<string, unknown>)?.student_field_of_study as string || "",
    student_abroad: String(!!(employment as Record<string, unknown>)?.student_abroad),
  });

  const [toast, setToast] = useState("");
  const cat = form.category;

  function handleSave() {
    const oldVals: Record<string, unknown> = {
      category: (employment?.category as string) || "",
      income_band: (employment?.income_band as string) || "",
    };
    const newVals: Record<string, unknown> = { category: form.category, income_band: form.income_band };
    if (cat === "UNEMPLOYED") {
      newVals.unemployed_duration_months = Number(form.unemployed_duration_months) || 0;
      newVals.unemployed_skills = form.unemployed_skills ? form.unemployed_skills.split(",") : [];
      newVals.unemployed_office_registered = form.unemployed_office_registered === "true";
    }
    if (cat === "FARMER") {
      newVals.farmer_land_area_ropani = form.farmer_land_area_ropani;
      newVals.farmer_land_type = form.farmer_land_type;
      newVals.farmer_primary_crop = form.farmer_primary_crop;
      newVals.farmer_irrigation_type = form.farmer_irrigation_type;
      newVals.farmer_agri_loan = form.farmer_agri_loan === "true";
    }
    if (cat === "FOREIGN_ABROAD") {
      newVals.foreign_country = form.foreign_country;
      newVals.foreign_visa_type = form.foreign_visa_type;
      newVals.foreign_employer_name = form.foreign_employer_name;
      newVals.foreign_departure_date = form.foreign_departure_date;
      newVals.foreign_expected_return = form.foreign_expected_return;
      newVals.foreign_remittance_band = form.foreign_remittance_band;
      newVals.foreign_doe_registered = form.foreign_doe_registered === "true";
    }
    if (cat === "GOVERNMENT") {
      newVals.gov_ministry = form.gov_ministry;
      newVals.gov_grade = form.gov_grade;
      newVals.gov_posting_district = form.gov_posting_district;
      newVals.gov_service_entry_year = form.gov_service_entry_year;
    }
    if (cat === "STUDENT") {
      newVals.student_institution = form.student_institution;
      newVals.student_level = form.student_level;
      newVals.student_field_of_study = form.student_field_of_study;
      newVals.student_abroad = form.student_abroad === "true";
    }
    const changed: Record<string, unknown> = {};
    for (const key of Object.keys(newVals)) {
      if (String(oldVals[key] ?? "") !== String(newVals[key] ?? "")) { changed[key] = newVals[key]; }
    }
    if (Object.keys(changed).length === 0) { onClose(); return; }
    const entry: ApprovalEntry = {
      id: `edit-${nanoid(8)}`,
      citizen_id: citizenId,
      submitter_id: "ward-staff",
      status: "PENDING_APPROVAL",
      old_value_json: oldVals,
      new_value_json: changed,
      submitted_at: new Date().toISOString(),
    };
    saveApproval(entry);
    setToast("Edit submitted for approval");
    setTimeout(() => { setToast(""); onClose(); }, 1000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Employment Information">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <SelectField
          label="Employment Category"
          value={form.category}
          onChange={(v) => setForm({ ...form, category: v })}
          options={EMPLOYMENT_CATEGORIES.map((c) => ({ value: c, label: EMPLOYMENT_CATEGORY_LABELS[c] || c }))}
        />
        <SelectField
          label="Income Band"
          value={form.income_band}
          onChange={(v) => setForm({ ...form, income_band: v })}
          options={INCOME_BANDS.map((b) => ({ value: b, label: INCOME_BAND_LABELS[b] || b }))}
        />

        {cat === "UNEMPLOYED" && (
          <>
            <InputField label="Duration (months)" value={form.unemployed_duration_months} onChange={(v) => setForm({ ...form, unemployed_duration_months: v })} type="number" />
            <InputField label="Skills (comma-separated)" value={form.unemployed_skills} onChange={(v) => setForm({ ...form, unemployed_skills: v })} />
            <SelectField label="Registered with Employment Office" value={form.unemployed_office_registered} onChange={(v) => setForm({ ...form, unemployed_office_registered: v })} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
          </>
        )}

        {cat === "FARMER" && (
          <>
            <InputField label="Land Area (Ropani)" value={form.farmer_land_area_ropani} onChange={(v) => setForm({ ...form, farmer_land_area_ropani: v })} />
            <SelectField label="Land Type" value={form.farmer_land_type} onChange={(v) => setForm({ ...form, farmer_land_type: v })} options={Object.entries(LAND_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
            <InputField label="Primary Crop" value={form.farmer_primary_crop} onChange={(v) => setForm({ ...form, farmer_primary_crop: v })} />
            <SelectField label="Irrigation Type" value={form.farmer_irrigation_type} onChange={(v) => setForm({ ...form, farmer_irrigation_type: v })} options={Object.entries(IRRIGATION_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
            <SelectField label="Has Agricultural Loan" value={form.farmer_agri_loan} onChange={(v) => setForm({ ...form, farmer_agri_loan: v })} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
          </>
        )}

        {cat === "FOREIGN_ABROAD" && (
          <>
            <SelectField label="Country" value={form.foreign_country} onChange={(v) => setForm({ ...form, foreign_country: v })} options={COUNTRY_OPTIONS} />
            <SelectField label="Visa Type" value={form.foreign_visa_type} onChange={(v) => setForm({ ...form, foreign_visa_type: v })} options={Object.entries(VISA_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
            <InputField label="Employer Name" value={form.foreign_employer_name} onChange={(v) => setForm({ ...form, foreign_employer_name: v })} />
            <InputField label="Departure Date" value={form.foreign_departure_date} onChange={(v) => setForm({ ...form, foreign_departure_date: v })} type="date" />
            <InputField label="Expected Return" value={form.foreign_expected_return} onChange={(v) => setForm({ ...form, foreign_expected_return: v })} type="date" />
            <SelectField label="Remittance Band" value={form.foreign_remittance_band} onChange={(v) => setForm({ ...form, foreign_remittance_band: v })} options={Object.entries(REMITTANCE_BAND_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
            <SelectField label="DOE Registered" value={form.foreign_doe_registered} onChange={(v) => setForm({ ...form, foreign_doe_registered: v })} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
          </>
        )}

        {cat === "GOVERNMENT" && (
          <>
            <InputField label="Ministry" value={form.gov_ministry} onChange={(v) => setForm({ ...form, gov_ministry: v })} />
            <SelectField label="Grade" value={form.gov_grade} onChange={(v) => setForm({ ...form, gov_grade: v })} options={Object.entries(GOV_GRADE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
            <InputField label="Posting District" value={form.gov_posting_district} onChange={(v) => setForm({ ...form, gov_posting_district: v })} />
            <InputField label="Service Entry Year" value={form.gov_service_entry_year} onChange={(v) => setForm({ ...form, gov_service_entry_year: v })} />
          </>
        )}

        {cat === "STUDENT" && (
          <>
            <InputField label="Institution Name" value={form.student_institution} onChange={(v) => setForm({ ...form, student_institution: v })} />
            <SelectField label="Level" value={form.student_level} onChange={(v) => setForm({ ...form, student_level: v })} options={Object.entries(STUDENT_LEVEL_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
            <InputField label="Field of Study" value={form.student_field_of_study} onChange={(v) => setForm({ ...form, student_field_of_study: v })} />
            <SelectField label="Study Abroad" value={form.student_abroad} onChange={(v) => setForm({ ...form, student_abroad: v })} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
          </>
        )}

        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700">Submit for Approval</button>
        </div>
      </div>
    </Modal>
  );
}

function EditEducationModal({
  open,
  onClose,
  citizenId,
  education,
}: {
  open: boolean;
  onClose: () => void;
  citizenId: string;
  education: Record<string, unknown> | null;
}) {
  const [form, setForm] = useState<Record<string, string>>({
    level: (education?.level as string) || "",
    institution_name: (education?.institution_name as string) || "",
    institution_type: (education?.institution_type as string) || "",
    study_location: (education?.study_location as string) || "",
    is_dropout: String(!!(education as Record<string, unknown>)?.is_dropout),
    dropout_reason: (education as Record<string, unknown>)?.dropout_reason as string || "",
    dropout_date: (education as Record<string, unknown>)?.dropout_date as string || "",
    has_scholarship: String(!!(education as Record<string, unknown>)?.has_scholarship),
    scholarship_type: (education as Record<string, unknown>)?.scholarship_type as string || "",
    scholarship_provider: (education as Record<string, unknown>)?.scholarship_provider as string || "",
  });

  const [toast, setToast] = useState("");

  function handleSave() {
    const oldVals: Record<string, unknown> = {
      level: (education?.level as string) || "",
      institution_name: (education?.institution_name as string) || "",
      institution_type: (education?.institution_type as string) || "",
      study_location: (education?.study_location as string) || "",
      is_dropout: !!(education as Record<string, unknown>)?.is_dropout,
      has_scholarship: !!(education as Record<string, unknown>)?.has_scholarship,
    };
    const newVals: Record<string, unknown> = {
      ...form,
      is_dropout: form.is_dropout === "true",
      has_scholarship: form.has_scholarship === "true",
    };
    const changed: Record<string, unknown> = {};
    for (const key of Object.keys(newVals)) {
      if (String(oldVals[key] ?? "") !== String(newVals[key] ?? "")) { changed[key] = newVals[key]; }
    }
    if (Object.keys(changed).length === 0) { onClose(); return; }
    const entry: ApprovalEntry = {
      id: `edit-${nanoid(8)}`,
      citizen_id: citizenId,
      submitter_id: "ward-staff",
      status: "PENDING_APPROVAL",
      old_value_json: oldVals,
      new_value_json: changed,
      submitted_at: new Date().toISOString(),
    };
    saveApproval(entry);
    setToast("Edit submitted for approval");
    setTimeout(() => { setToast(""); onClose(); }, 1000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Education Information">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <SelectField label="Education Level" value={form.level} onChange={(v) => setForm({ ...form, level: v })} options={Object.entries(STUDENT_LEVEL_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <InputField label="Institution Name" value={form.institution_name} onChange={(v) => setForm({ ...form, institution_name: v })} />
        <SelectField label="Institution Type" value={form.institution_type} onChange={(v) => setForm({ ...form, institution_type: v })} options={Object.entries(INSTITUTION_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <InputField label="Study Location" value={form.study_location} onChange={(v) => setForm({ ...form, study_location: v })} />
        <SelectField label="Is Dropout" value={form.is_dropout} onChange={(v) => setForm({ ...form, is_dropout: v })} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
        {form.is_dropout === "true" && (
          <>
            <InputField label="Dropout Reason" value={form.dropout_reason} onChange={(v) => setForm({ ...form, dropout_reason: v })} />
            <InputField label="Dropout Date" value={form.dropout_date} onChange={(v) => setForm({ ...form, dropout_date: v })} type="date" />
          </>
        )}
        <SelectField label="Has Scholarship" value={form.has_scholarship} onChange={(v) => setForm({ ...form, has_scholarship: v })} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
        {form.has_scholarship === "true" && (
          <>
            <SelectField label="Scholarship Type" value={form.scholarship_type} onChange={(v) => setForm({ ...form, scholarship_type: v })} options={Object.entries(SCHOLARSHIP_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
            <InputField label="Scholarship Provider" value={form.scholarship_provider} onChange={(v) => setForm({ ...form, scholarship_provider: v })} />
          </>
        )}
        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700">Submit for Approval</button>
        </div>
      </div>
    </Modal>
  );
}

function EditDisabilityModal({
  open,
  onClose,
  citizenId,
  disability,
}: {
  open: boolean;
  onClose: () => void;
  citizenId: string;
  disability: Record<string, unknown> | null;
}) {
  const [form, setForm] = useState({
    disability_type: (disability?.disability_type as string) || "",
    severity_body: (disability?.severity_body as number) ?? 0,
    severity_activity: (disability?.severity_activity as number) ?? 0,
    severity_participation: (disability?.severity_participation as number) ?? 0,
    certificate_no: (disability?.certificate_no as string) || "",
    issuing_hospital: (disability?.issuing_hospital as string) || "",
    certificate_expiry: (disability?.certificate_expiry as string) || "",
  });

  const [toast, setToast] = useState("");

  function handleSave() {
    const oldVals: Record<string, unknown> = {
      disability_type: (disability?.disability_type as string) || "",
      severity_body: (disability?.severity_body as number) ?? 0,
      severity_activity: (disability?.severity_activity as number) ?? 0,
      severity_participation: (disability?.severity_participation as number) ?? 0,
    };
    const newVals: Record<string, unknown> = { ...form };
    const changed: Record<string, unknown> = {};
    for (const key of Object.keys(newVals)) {
      if (String(oldVals[key]) !== String(newVals[key])) { changed[key] = newVals[key]; }
    }
    if (Object.keys(changed).length === 0) { onClose(); return; }
    const entry: ApprovalEntry = {
      id: `edit-${nanoid(8)}`,
      citizen_id: citizenId,
      submitter_id: "ward-staff",
      status: "PENDING_APPROVAL",
      old_value_json: oldVals,
      new_value_json: newVals,
      submitted_at: new Date().toISOString(),
    };
    saveApproval(entry);
    setToast("Edit submitted for approval");
    setTimeout(() => { setToast(""); onClose(); }, 1000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Disability Information">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-3">
        <SelectField label="Disability Type" value={form.disability_type} onChange={(v) => setForm({ ...form, disability_type: v })} options={DISABILITY_TYPES_OPTIONS} />
        {form.disability_type && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity - Body Functions ({SEVERITY_LABELS[form.severity_body] || form.severity_body})
              </label>
              <input type="range" min={0} max={4} step={1} value={form.severity_body} onChange={(e) => setForm({ ...form, severity_body: Number(e.target.value) })} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity - Activity ({SEVERITY_LABELS[form.severity_activity] || form.severity_activity})
              </label>
              <input type="range" min={0} max={4} step={1} value={form.severity_activity} onChange={(e) => setForm({ ...form, severity_activity: Number(e.target.value) })} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity - Participation ({SEVERITY_LABELS[form.severity_participation] || form.severity_participation})
              </label>
              <input type="range" min={0} max={4} step={1} value={form.severity_participation} onChange={(e) => setForm({ ...form, severity_participation: Number(e.target.value) })} className="w-full" />
            </div>
            <InputField label="Certificate No." value={form.certificate_no} onChange={(v) => setForm({ ...form, certificate_no: v })} />
            <InputField label="Issuing Hospital" value={form.issuing_hospital} onChange={(v) => setForm({ ...form, issuing_hospital: v })} />
            <InputField label="Certificate Expiry" value={form.certificate_expiry} onChange={(v) => setForm({ ...form, certificate_expiry: v })} type="date" />
          </>
        )}
        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700">Submit for Approval</button>
        </div>
      </div>
    </Modal>
  );
}

function EditHouseholdModal({
  open,
  onClose,
  citizenId,
  household,
}: {
  open: boolean;
  onClose: () => void;
  citizenId: string;
  household: Record<string, unknown> | null;
}) {
  const [form, setForm] = useState<Record<string, string>>({
    house_type: (household?.house_type as string) || "",
    construction_type: (household?.construction_type as string) || "",
    room_count: String((household?.room_count as number) ?? 0),
    electricity_source: (household?.electricity_source as string) || (household?.electricity as string) || "",
    water_source: (household?.water_source as string) || "",
    sanitation: (household?.sanitation as string) || "",
    internet_access: (household?.internet_access as string) || "",
    has_bank_account: String(!!(household as Record<string, unknown>)?.has_bank_account),
    monthly_income_band: (household?.monthly_income_band as string) || "",
    poverty_class: (household?.poverty_class as string) || "",
  });

  const [toast, setToast] = useState("");

  function handleSave() {
    const oldVals: Record<string, unknown> = {
      house_type: (household?.house_type as string) || "",
      construction_type: (household?.construction_type as string) || "",
      room_count: (household?.room_count as number) ?? 0,
      electricity_source: (household?.electricity_source as string) || (household?.electricity as string) || "",
      water_source: (household?.water_source as string) || "",
      sanitation: (household?.sanitation as string) || "",
      internet_access: (household?.internet_access as string) || "",
      has_bank_account: !!(household as Record<string, unknown>)?.has_bank_account,
      monthly_income_band: (household?.monthly_income_band as string) || "",
      poverty_class: (household?.poverty_class as string) || "",
    };
    const newVals: Record<string, unknown> = {
      ...form,
      room_count: Number(form.room_count),
      has_bank_account: form.has_bank_account === "true",
    };
    const changed: Record<string, unknown> = {};
    for (const key of Object.keys(newVals)) {
      if (String(oldVals[key] ?? "") !== String(newVals[key] ?? "")) { changed[key] = newVals[key]; }
    }
    if (Object.keys(changed).length === 0) { onClose(); return; }
    const entry: ApprovalEntry = {
      id: `edit-${nanoid(8)}`,
      citizen_id: citizenId,
      submitter_id: "ward-staff",
      status: "PENDING_APPROVAL",
      old_value_json: oldVals,
      new_value_json: changed,
      submitted_at: new Date().toISOString(),
    };
    saveApproval(entry);
    setToast("Edit submitted for approval");
    setTimeout(() => { setToast(""); onClose(); }, 1000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Household Information">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <SelectField label="House Type" value={form.house_type} onChange={(v) => setForm({ ...form, house_type: v })} options={Object.entries(HOUSE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <SelectField label="Construction Type" value={form.construction_type} onChange={(v) => setForm({ ...form, construction_type: v })} options={Object.entries(CONSTRUCTION_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <InputField label="Room Count" value={form.room_count} onChange={(v) => setForm({ ...form, room_count: v })} type="number" />
        <SelectField label="Electricity Source" value={form.electricity_source} onChange={(v) => setForm({ ...form, electricity_source: v })} options={Object.entries(ELECTRICITY_SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <SelectField label="Water Source" value={form.water_source} onChange={(v) => setForm({ ...form, water_source: v })} options={Object.entries(WATER_SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <SelectField label="Sanitation" value={form.sanitation} onChange={(v) => setForm({ ...form, sanitation: v })} options={Object.entries(SANITATION_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <SelectField label="Internet Access" value={form.internet_access} onChange={(v) => setForm({ ...form, internet_access: v })} options={Object.entries(INTERNET_ACCESS_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <SelectField label="Has Bank Account" value={form.has_bank_account} onChange={(v) => setForm({ ...form, has_bank_account: v })} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
        <SelectField label="Monthly Income Band" value={form.monthly_income_band} onChange={(v) => setForm({ ...form, monthly_income_band: v })} options={INCOME_BANDS.map((b) => ({ value: b, label: INCOME_BAND_LABELS[b] || b }))} />
        <SelectField label="Poverty Class" value={form.poverty_class} onChange={(v) => setForm({ ...form, poverty_class: v })} options={Object.entries(POVERTY_CLASS_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700">Submit for Approval</button>
        </div>
      </div>
    </Modal>
  );
}

function EditPhotoModal({
  open,
  onClose,
  citizenId,
}: {
  open: boolean;
  onClose: () => void;
  citizenId: string;
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
    }
  }

  function handleSave() {
    if (!photo) { onClose(); return; }
    const entry: ApprovalEntry = {
      id: `edit-${nanoid(8)}`,
      citizen_id: citizenId,
      submitter_id: "ward-staff",
      status: "PENDING_APPROVAL",
      old_value_json: { photo: "(existing)" },
      new_value_json: { photo: "(new photo uploaded for approval)" },
      submitted_at: new Date().toISOString(),
    };
    saveApproval(entry);
    setToast("Edit submitted for approval");
    setTimeout(() => { setToast(""); onClose(); }, 1000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Biometric Photo">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-4">
        {photo ? (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="New photo" className="w-48 h-48 object-cover rounded-2xl border-2 border-green-300" />
            <label className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800">
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
              Change Photo
            </label>
            <button onClick={() => setPhoto(null)} className="text-sm text-red-500 hover:text-red-700">Remove</button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50">
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
            <span className="text-sm text-gray-500 font-medium">Click to upload new photo</span>
          </label>
        )}
        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={!photo} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300">Submit for Approval</button>
        </div>
      </div>
    </Modal>
  );
}

function EditGpsModal({
  open,
  onClose,
  citizenId,
}: {
  open: boolean;
  onClose: () => void;
  citizenId: string;
}) {
  const [form, setForm] = useState({ latitude: "", longitude: "", place_name: "" });
  const [toast, setToast] = useState("");

  function handleSave() {
    const changed: Record<string, unknown> = {};
    if (form.latitude) changed.latitude = form.latitude;
    if (form.longitude) changed.longitude = form.longitude;
    if (form.place_name) changed.place_name = form.place_name;
    if (Object.keys(changed).length === 0) { onClose(); return; }
    const entry: ApprovalEntry = {
      id: `edit-${nanoid(8)}`,
      citizen_id: citizenId,
      submitter_id: "ward-staff",
      status: "PENDING_APPROVAL",
      old_value_json: { latitude: "", longitude: "", place_name: "" },
      new_value_json: changed,
      submitted_at: new Date().toISOString(),
    };
    saveApproval(entry);
    setToast("Edit submitted for approval");
    setTimeout(() => { setToast(""); onClose(); }, 1000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit GPS Coordinates">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-3">
        <InputField label="Latitude" value={form.latitude} onChange={(v) => setForm({ ...form, latitude: v })} placeholder="e.g. 27.7172" />
        <InputField label="Longitude" value={form.longitude} onChange={(v) => setForm({ ...form, longitude: v })} placeholder="e.g. 85.3240" />
        <InputField label="Place Name" value={form.place_name} onChange={(v) => setForm({ ...form, place_name: v })} />
        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700">Submit for Approval</button>
        </div>
      </div>
    </Modal>
  );
}

export default function CitizenDetailPage() {
  const params = useParams<{ id: string }>();
  const idParam = params.id;

  const [registered] = useState<Citizen[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("citizens_registered");
      return raw ? (JSON.parse(raw) as Citizen[]) : [];
    } catch {
      return [];
    }
  });

  const citizens = [...registered, ...(citizensData as unknown as Citizen[])];
  const citizen = citizens.find(
    (c) => c.id === idParam || c.nid_masked === idParam,
  );

  const [editModal, setEditModal] = useState<string | null>(null);

  if (!citizen) {
    return (
      <main>
        <div className="text-center py-20">
          <h1 className="text-xl font-bold text-gray-900">Citizen not found</h1>
          <p className="text-sm text-gray-500 mt-1">No citizen matches ID: {idParam}</p>
        </div>
      </main>
    );
  }

  // Citizens registered through the unified registration wizard carry the full
  // form on `registration`. Render the complete read-only profile for them.
  const unifiedForm = (citizen as unknown as { registration?: unknown }).registration;
  const isUnified =
    !!unifiedForm && typeof unifiedForm === "object" && "fullName" in (unifiedForm as Record<string, unknown>);

  if (isUnified) {
    const reg = unifiedForm as UnifiedRegistrationForm;
    const cz = citizen as unknown as Record<string, unknown>;
    return (
      <main>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
            {(citizen.name_en || reg.fullName || "?").charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{citizen.name_en || reg.fullName}</h1>
            <p className="text-sm text-gray-500">
              {[citizen.name_np, (cz.nid_masked as string) || reg.nidNumber, `Ward ${citizen.ward_id?.replace?.("ward-", "") ?? citizen.ward_id}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              Citizen ID {citizen.id}
              {cz.created_at ? ` · Registered ${String(cz.created_at).slice(0, 10)}` : ""}
            </p>
          </div>
        </div>

        <UnifiedCitizenProfile form={reg} />
      </main>
    );
  }

  const profile = getCitizenFormData(citizen, registered);

  const hasEmployment = !!profile?.employment?.category;
  const hasDisability = !!profile?.disability?.disability_type;
  const hasHousehold = !!profile?.household;
  const hasEducation = !!profile?.education?.level;

  const displayCitizen: Citizen & Record<string, unknown> = {
    ...citizen,
    blood_group: profile?.blood_group ?? (citizen as unknown as Record<string, unknown>).blood_group,
    religion: profile?.religion ?? (citizen as unknown as Record<string, unknown>).religion,
    ethnicity: profile?.ethnicity ?? (citizen as unknown as Record<string, unknown>).ethnicity,
    mother_tongue: profile?.mother_tongue ?? (citizen as unknown as Record<string, unknown>).mother_tongue,
    citizenship_number: profile?.citizenship_number ?? citizen.citizenship_number,
    nid_number: profile?.nid_number ?? (citizen as unknown as Record<string, unknown>).nid_number ?? citizen.nid_masked,
    photo: profile?.photo ?? (citizen as unknown as Record<string, unknown>).photo,
    latitude: profile?.gps?.latitude !== undefined && profile.gps.latitude !== ""
      ? Number(profile.gps.latitude)
      : citizen.latitude,
    longitude: profile?.gps?.longitude !== undefined && profile.gps.longitude !== ""
      ? Number(profile.gps.longitude)
      : citizen.longitude,
    place_name: profile?.gps?.place_name ?? citizen.place_name,
  };

  const employmentRec = hasEmployment
    ? buildEmploymentRecord(profile.employment)
    : (employmentData as unknown as Record<string, unknown>[]).find(
        (e) => e.citizen_id === citizen.id,
      ) || null;

  const disabilityRec = hasDisability
    ? (profile.disability as unknown as Record<string, unknown>)
    : (disabilityData as unknown as Record<string, unknown>[]).find(
        (d) => d.citizen_id === citizen.id,
      ) || null;

  const householdRec = hasHousehold
    ? (profile.household as unknown as Record<string, unknown>)
    : (householdsData as unknown as Record<string, unknown>[]).find(
        (h) => h.head_citizen_id === citizen.id || h.id === citizen.household_id,
      ) || null;

  const educationRec = hasEducation
    ? (profile.education as unknown as Record<string, unknown>)
    : (educationData as unknown as Record<string, unknown>[]).find(
        (e) => e.citizen_id === citizen.id,
      ) || null;

  const family =
    profile && (profile.father || profile.mother || profile.spouse || (profile.children && profile.children.length > 0))
      ? buildFamilyRecord(profile)
      : (familyData as unknown as FamilyRecord[]).find(
          (f) => f.citizen_id === citizen.id,
        );

  const idCards = (idCardsData as unknown as IDCard[]).filter(
    (c) => c.citizen_id === citizen.id,
  );

  const auditEntries = (auditLogData as unknown as AuditLog[]).filter(
    (a) => a.citizen_id === citizen.id,
  );

  const tabs = [
    {
      label: "Identity",
      content: <IdentityTab citizen={displayCitizen as Citizen} onEdit={() => setEditModal("identity")} />,
    },
    {
      label: "Family",
      content: <FamilyTab family={family} onEdit={() => setEditModal("family")} />,
    },
    {
      label: "Employment",
      content: <EmploymentTab employment={employmentRec} onEdit={() => setEditModal("employment")} />,
    },
    {
      label: "Education",
      content: <EducationTab education={educationRec} onEdit={() => setEditModal("education")} />,
    },
    {
      label: "Disability",
      content: <DisabilityTab disability={disabilityRec} onEdit={() => setEditModal("disability")} />,
    },
    {
      label: "Household",
      content: <HouseholdTab household={householdRec} onEdit={() => setEditModal("household")} />,
    },
    {
      label: "Photo",
      content: (
        <SectionCard title="Biometric Photo" description="Citizen portrait photo">
          <SectionHeader title="Portrait" onEdit={() => setEditModal("photo")} />
          {(displayCitizen as unknown as Record<string, unknown>).photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(displayCitizen as unknown as Record<string, unknown>).photo as string}
              alt="Citizen portrait"
              className="w-48 h-48 object-cover rounded-2xl border border-gray-200"
            />
          ) : (
            <div className="text-sm text-gray-400 py-4 text-center">
              No photo uploaded.
            </div>
          )}
        </SectionCard>
      ),
    },
    {
      label: "GPS",
      content: (
        <SectionCard title="GPS Coordinates" description="Geographic location of residence">
          <SectionHeader title="Location" onEdit={() => setEditModal("gps")} />
          {displayCitizen.latitude != null ? (
            <div className="grid grid-cols-2 gap-x-8">
              <DataRow label="Latitude" value={displayCitizen.latitude} />
              <DataRow label="Longitude" value={displayCitizen.longitude} />
              <DataRow label="Place Name" value={displayCitizen.place_name} />
            </div>
          ) : (
            <div className="text-sm text-gray-400 py-4 text-center">
              No GPS coordinates recorded.
            </div>
          )}
        </SectionCard>
      ),
    },
    {
      label: "ID Cards",
      content: <IDCardsTab cards={idCards} />,
    },
    {
      label: "Audit",
      content: <AuditTab auditEntries={auditEntries} />,
    },
  ];

  return (
    <main>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
          {citizen.name_en.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{citizen.name_en}</h1>
          <p className="text-sm text-gray-500">
            {citizen.name_np} &middot; {citizen.nid_masked} &middot; Ward {citizen.ward_id}
          </p>
        </div>
      </div>

      <div className="space-y-10">
        {tabs.map((t) => (
          <div key={t.label}>{t.content}</div>
        ))}
        <EligibilityPanel
          citizen={citizen}
          employmentRec={employmentRec}
          disabilityRec={disabilityRec}
          householdRec={householdRec}
        />
      </div>

      {editModal === "identity" && (
        <EditIdentityModal open onClose={() => setEditModal(null)} citizen={citizen} />
      )}
      {editModal === "family" && (
        <EditFamilyModal open onClose={() => setEditModal(null)} citizenId={citizen.id} family={family} />
      )}
      {editModal === "employment" && (
        <EditEmploymentModal open onClose={() => setEditModal(null)} citizenId={citizen.id} employment={employmentRec} />
      )}
      {editModal === "education" && (
        <EditEducationModal open onClose={() => setEditModal(null)} citizenId={citizen.id} education={educationRec} />
      )}
      {editModal === "disability" && (
        <EditDisabilityModal open onClose={() => setEditModal(null)} citizenId={citizen.id} disability={disabilityRec} />
      )}
      {editModal === "household" && (
        <EditHouseholdModal open onClose={() => setEditModal(null)} citizenId={citizen.id} household={householdRec} />
      )}
      {editModal === "photo" && (
        <EditPhotoModal open onClose={() => setEditModal(null)} citizenId={citizen.id} />
      )}
      {editModal === "gps" && (
        <EditGpsModal open onClose={() => setEditModal(null)} citizenId={citizen.id} />
      )}
    </main>
  );
}
