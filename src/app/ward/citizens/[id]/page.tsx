"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowBack } from "@mui/icons-material";
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
import type { Citizen } from "@/types/citizen";
import type { AuditLog } from "@/types/audit-log";

import { Tabs, Modal } from "@/components/ui";
import { useEligibility } from "@/hooks/useEligibility";
import { InputField, SelectField, SectionCard } from "@/components/ui";

import { EMPLOYMENT_CATEGORIES, INCOME_BANDS, SEXES, DIGITAL_LITERACIES } from "@/types/citizen";
import {
  CONSENT_CHANNEL_LABELS, HOUSE_TYPE_LABELS,
  ELECTRICITY_SOURCE_LABELS, WATER_SOURCE_LABELS,
  POVERTY_CLASS_LABELS, DISABILITY_TYPE_LABELS,
  STUDENT_LEVEL_LABELS, INSTITUTION_TYPE_LABELS, SCHOLARSHIP_TYPE_LABELS,
  EMPLOYMENT_CATEGORY_LABELS, INCOME_BAND_LABELS,
} from "@/constants";

type IDCard = {
  id: string;
  citizen_id: string;
  card_type: string;
  status: string;
  qr_hash: string;
  issued_at: string | null;
  expires_at: string | null;
  collected_at: string | null;
};

type FamilyRecord = {
  citizen_id: string;
  father: { name_np: string; name_en: string; citizenship_number: string } | null;
  mother: { name_np: string; name_en: string; citizenship_number: string } | null;
  spouse: { name_np: string; name_en: string; citizenship_number: string } | null;
  children: { name_np: string; name_en: string; citizenship_number: string }[];
};

type ApprovalEntry = {
  id: string;
  citizen_id: string;
  submitter_id: string;
  status: string;
  old_value_json: Record<string, unknown>;
  new_value_json: Record<string, unknown>;
  submitted_at: string;
};

const LOCAL_STORAGE_KEY = "edit-approvals";
const initialApprovals = editApprovalsData as unknown as ApprovalEntry[];

const DISABILITY_TYPES_OPTIONS = [
  { value: "", label: "None / No Disability" },
  ...Object.entries(DISABILITY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

const SEVERITY_LABELS = ["None", "Mild", "Moderate", "Severe", "Complete"];

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
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">Eligibility</h3>
      <p className="text-xs text-gray-500 mb-4">
        Age {age} &middot; {citizen.sex}
      </p>

      {eligible.length === 0 ? (
        <div className="text-sm text-gray-400 py-4 text-center">
          No benefits eligible based on current data
        </div>
      ) : (
        <div className="space-y-3">
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
    </div>
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
          <DataRow label="NID" value={citizen.nid_masked} />
          <DataRow label="Citizenship No." value={citizen.citizenship_number} />
          <DataRow label="NID Verified" value={citizen.nid_verified} />
          <DataRow label="Digital Literacy" value={citizen.digital_literacy} />
          <DataRow label="Has Smartphone" value={citizen.has_smartphone} />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-8">
        <DataRow label="Consent Channel" value={CONSENT_CHANNEL_LABELS[citizen.consent_channel] || citizen.consent_channel} />
        <DataRow label="Consent Recorded At" value={citizen.consent_recorded_at} />
        <DataRow label="Sync Status" value={citizen.sync_status} />
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
    tole: citizen.tole,
    digital_literacy: citizen.digital_literacy,
    has_smartphone: String(citizen.has_smartphone),
  });

  const [toast, setToast] = useState("");

  function handleSave() {
    const oldVals: Record<string, unknown> = {
      name_np: citizen.name_np,
      name_en: citizen.name_en,
      dob: citizen.dob,
      sex: citizen.sex,
      tole: citizen.tole,
      digital_literacy: citizen.digital_literacy,
      has_smartphone: citizen.has_smartphone,
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
      <div className="space-y-3">
        <InputField label="Name (Nepali)" value={form.name_np} onChange={(v) => setForm({ ...form, name_np: v })} />
        <InputField label="Name (English)" value={form.name_en} onChange={(v) => setForm({ ...form, name_en: v })} />
        <InputField label="Date of Birth" value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} type="date" />
        <SelectField label="Sex" value={form.sex} onChange={(v) => setForm({ ...form, sex: v })} options={SEXES.map((s) => ({ value: s, label: s }))} />
        <InputField label="Tole" value={form.tole} onChange={(v) => setForm({ ...form, tole: v })} />
        <SelectField label="Digital Literacy" value={form.digital_literacy} onChange={(v) => setForm({ ...form, digital_literacy: v })} options={DIGITAL_LITERACIES.map((d) => ({ value: d, label: d }))} />
        <SelectField label="Has Smartphone" value={form.has_smartphone} onChange={(v) => setForm({ ...form, has_smartphone: v })} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
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
    mother_name: family?.mother?.name_en || "",
    spouse_name: family?.spouse?.name_en || "",
  });

  const [toast, setToast] = useState("");

  function handleSave() {
    const oldVals: Record<string, unknown> = {
      father_name: family?.father?.name_en || "",
      mother_name: family?.mother?.name_en || "",
      spouse_name: family?.spouse?.name_en || "",
    };
    const newVals: Record<string, unknown> = { ...form };
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

  return (
    <Modal open={open} onClose={onClose} title="Edit Family Information">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-3">
        <InputField label="Father's Name (EN)" value={form.father_name} onChange={(v) => setForm({ ...form, father_name: v })} />
        <InputField label="Mother's Name (EN)" value={form.mother_name} onChange={(v) => setForm({ ...form, mother_name: v })} />
        <InputField label="Spouse's Name (EN)" value={form.spouse_name} onChange={(v) => setForm({ ...form, spouse_name: v })} />
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
  const [form, setForm] = useState({
    category: (employment?.category as string) || "",
    income_band: (employment?.income_band as string) || "",
  });

  const [toast, setToast] = useState("");

  function handleSave() {
    const oldVals: Record<string, unknown> = {
      category: (employment?.category as string) || "",
      income_band: (employment?.income_band as string) || "",
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
    <Modal open={open} onClose={onClose} title="Edit Employment Information">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-3">
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
  const [form, setForm] = useState({
    level: (education?.level as string) || "",
    institution_name: (education?.institution_name as string) || "",
    institution_type: (education?.institution_type as string) || "",
    study_location: (education?.study_location as string) || "",
  });

  const [toast, setToast] = useState("");

  function handleSave() {
    const oldVals: Record<string, unknown> = {
      level: (education?.level as string) || "",
      institution_name: (education?.institution_name as string) || "",
      institution_type: (education?.institution_type as string) || "",
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
    <Modal open={open} onClose={onClose} title="Edit Education Information">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-3">
        <SelectField label="Education Level" value={form.level} onChange={(v) => setForm({ ...form, level: v })} options={Object.entries(STUDENT_LEVEL_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <InputField label="Institution Name" value={form.institution_name} onChange={(v) => setForm({ ...form, institution_name: v })} />
        <SelectField label="Institution Type" value={form.institution_type} onChange={(v) => setForm({ ...form, institution_type: v })} options={Object.entries(INSTITUTION_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <InputField label="Study Location" value={form.study_location} onChange={(v) => setForm({ ...form, study_location: v })} />
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
  const [form, setForm] = useState({
    house_type: (household?.house_type as string) || "",
    room_count: String((household?.room_count as number) ?? 0),
    electricity: (household?.electricity as string) || (household?.electricity_source as string) || "",
    water_source: (household?.water_source as string) || "",
    poverty_class: (household?.poverty_class as string) || "",
    monthly_income_band: (household?.monthly_income_band as string) || "",
  });

  const [toast, setToast] = useState("");

  function handleSave() {
    const oldVals: Record<string, unknown> = {
      house_type: (household?.house_type as string) || "",
      room_count: (household?.room_count as number) ?? 0,
      water_source: (household?.water_source as string) || "",
      poverty_class: (household?.poverty_class as string) || "",
    };
    const newVals: Record<string, unknown> = { ...form, room_count: Number(form.room_count) };
    const changed: Record<string, unknown> = {};
    for (const key of ["house_type", "room_count", "water_source", "poverty_class"]) {
      if (String(oldVals[key]) !== String(newVals[key])) { changed[key] = newVals[key]; }
    }
    if (Object.keys(changed).length === 0) { onClose(); return; }
    const entry: ApprovalEntry = {
      id: `edit-${nanoid(8)}`,
      citizen_id: citizenId,
      submitter_id: "ward-staff",
      status: "PENDING_APPROVAL",
      old_value_json: oldVals,
      new_value_json: { ...changed },
      submitted_at: new Date().toISOString(),
    };
    saveApproval(entry);
    setToast("Edit submitted for approval");
    setTimeout(() => { setToast(""); onClose(); }, 1000);
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Household Information">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <div className="space-y-3">
        <SelectField label="House Type" value={form.house_type} onChange={(v) => setForm({ ...form, house_type: v })} options={Object.entries(HOUSE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <InputField label="Room Count" value={form.room_count} onChange={(v) => setForm({ ...form, room_count: v })} type="number" />
        <SelectField label="Water Source" value={form.water_source} onChange={(v) => setForm({ ...form, water_source: v })} options={Object.entries(WATER_SOURCE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
        <SelectField label="Poverty Class" value={form.poverty_class} onChange={(v) => setForm({ ...form, poverty_class: v })} options={Object.entries(POVERTY_CLASS_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
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

  const citizens = citizensData as unknown as Citizen[];
  const citizen = citizens.find(
    (c) => c.id === idParam || c.nid_masked === idParam,
  );

  const employmentRec = (employmentData as unknown as Record<string, unknown>[]).find(
    (e) => e.citizen_id === citizen?.id,
  ) || null;

  const disabilityRec = (disabilityData as unknown as Record<string, unknown>[]).find(
    (d) => d.citizen_id === citizen?.id,
  ) || null;

  const householdRec = (householdsData as unknown as Record<string, unknown>[]).find(
    (h) => h.head_citizen_id === citizen?.id || h.id === citizen?.household_id,
  ) || null;

  const educationRec = (educationData as unknown as Record<string, unknown>[]).find(
    (e) => e.citizen_id === citizen?.id,
  ) || null;

  const family = (familyData as unknown as FamilyRecord[]).find(
    (f) => f.citizen_id === citizen?.id,
  );

  const idCards = (idCardsData as unknown as IDCard[]).filter(
    (c) => c.citizen_id === citizen?.id,
  );

  const auditEntries = (auditLogData as unknown as AuditLog[]).filter(
    (a) => a.citizen_id === citizen?.id,
  );

  const [editModal, setEditModal] = useState<string | null>(null);

  if (!citizen) {
    return (
      <main className="p-6">
        <Link href="/ward/citizens" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
          <ArrowBack className="text-lg" /> Back to Citizens
        </Link>
        <div className="text-center py-20">
          <h1 className="text-xl font-bold text-gray-900">Citizen not found</h1>
          <p className="text-sm text-gray-500 mt-1">No citizen matches ID: {idParam}</p>
        </div>
      </main>
    );
  }

  const tabs = [
    {
      label: "Identity",
      content: <IdentityTab citizen={citizen} onEdit={() => setEditModal("identity")} />,
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
      label: "ID Cards",
      content: <IDCardsTab cards={idCards} />,
    },
    {
      label: "Audit",
      content: <AuditTab auditEntries={auditEntries} />,
    },
  ];

  return (
    <main className="p-6">
      <Link href="/ward/citizens" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4">
        <ArrowBack className="text-lg" /> Back to Citizens
      </Link>

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
        <span className={`ml-auto text-xs font-medium px-2.5 py-0.5 rounded-full ${
          citizen.sync_status === "synced" ? "bg-emerald-100 text-emerald-800" :
          citizen.sync_status === "pending" ? "bg-amber-100 text-amber-800" :
          "bg-red-100 text-red-800"
        }`}>
          {citizen.sync_status}
        </span>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <Tabs tabs={tabs} />
        </div>

        <div className="w-80 shrink-0">
          <EligibilityPanel
            citizen={citizen}
            employmentRec={employmentRec}
            disabilityRec={disabilityRec}
            householdRec={householdRec}
          />
        </div>
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
    </main>
  );
}
