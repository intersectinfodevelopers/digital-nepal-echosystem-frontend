"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowBack, ArrowForward, CheckCircle, UploadFile, MapOutlined } from "@mui/icons-material";

const STEP_META = [
  { id: 1, label: "NID" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Photo" },
  { id: 4, label: "Household" },
  { id: 5, label: "Employment" },
  { id: 6, label: "Education" },
  { id: 7, label: "Submit" },
] as const;

type StepId = (typeof STEP_META)[number]["id"];

type FamilyMember = {
  id: string;
  relationship: string;
  name: string;
  citizenId: string;
  status: string;
};

type EmploymentRecord = {
  employer: string;
  role: string;
  status: string;
  incomeBand: string;
  sector: string;
  country: string;
  departureYear: string;
  workType: string;
  customWorkType: string;
};

type EducationRecord = {
  level: string;
  institution: string;
  subject: string;
  year: string;
  status: string;
};

type ChildRecord = {
  firstName: string;
  middleName: string;
  lastName: string;
  citizenshipNumber: string;
  dob: string;
  hasDisability: string;
  disabilityType: string;
};

type FormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  fullNameDevnagari: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  fatherName: string;
  motherName: string;
  fatherFirstName: string;
  fatherMiddleName: string;
  fatherLastName: string;
  motherFirstName: string;
  motherMiddleName: string;
  motherLastName: string;
  spouseFirstName: string;
  spouseMiddleName: string;
  spouseLastName: string;
  spouseRelationship: string;
  numberOfChildren: string;
  children: ChildRecord[];
  citizenshipType: string;
  citizenshipNumber: string;
  nidNumber: string;
  citizenshipFront: string;
  citizenshipBack: string;
  nidFront: string;
  nidBack: string;
  familyMembers: FamilyMember[];
  employmentRecords: EmploymentRecord[];
  educationRecords: EducationRecord[];
  disability: {
    hasDisability: string;
    disabilityType: string;
    types: string[];
    severity: string;
    severityLevel: number;
    affectedAreas: string[];
    certificateIssued: boolean;
    support: string;
  };
  photo: string;
  thumbPrint: string;
  signature: string;
  retinaScan: string;
  currentlyInNepal: string;
  countryOfResidence: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  houseType: string;
  ownershipStatus: string;
  yearsAtResidence: string;
  roomCount: string;
  address: string;
  lat: string;
  lng: string;
  placeName: string;
};

const createLinkedCitizenId = (relationship: string, index: number) => {
  const safe = relationship.replace(/\s+/g, "-").toUpperCase();
  return `FAM-${safe}-${String(index + 1).padStart(3, "0")}`;
};

const emptyForm: FormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  fullName: "",
  fullNameDevnagari: "",
  dob: "",
  gender: "",
  maritalStatus: "",
  fatherName: "",
  motherName: "",
  fatherFirstName: "",
  fatherMiddleName: "",
  fatherLastName: "",
  motherFirstName: "",
  motherMiddleName: "",
  motherLastName: "",
  spouseFirstName: "",
  spouseMiddleName: "",
  spouseLastName: "",
  spouseRelationship: "",
  numberOfChildren: "0",
  children: [],
  citizenshipType: "Citizenship",
  citizenshipNumber: "",
  nidNumber: "",
  citizenshipFront: "",
  citizenshipBack: "",
  nidFront: "",
  nidBack: "",
  familyMembers: [
    { id: "FAM-FATHER-001", relationship: "Father", name: "", citizenId: "", status: "Linked" },
    { id: "FAM-MOTHER-001", relationship: "Mother", name: "", citizenId: "", status: "Linked" },
  ],
  employmentRecords: [
    { employer: "", role: "", status: "Government", incomeBand: "NPR 25,000 – 50,000", sector: "Public Service", country: "", departureYear: "", workType: "", customWorkType: "" },
  ],
  educationRecords: [
    { level: "", institution: "", subject: "", year: "", status: "Completed" },
  ],
  disability: {
    hasDisability: "No",
    disabilityType: "",
    types: [],
    severity: "Mild",
    severityLevel: 0,
    affectedAreas: [],
    certificateIssued: true,
    support: "None",
  },
  photo: "",
  thumbPrint: "",
  signature: "",
  retinaScan: "",
  currentlyInNepal: "Yes",
  countryOfResidence: "Nepal",
  province: "",
  district: "",
  municipality: "",
  ward: "",
  houseType: "Owned",
  ownershipStatus: "Owned",
  yearsAtResidence: "",
  roomCount: "",
  address: "",
  lat: "",
  lng: "",
  placeName: "",
};

function saveJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function UnifiedCitizenRegistration() {
  const [step, setStep] = useState<StepId>(1);
  const [draftStatus, setDraftStatus] = useState("Auto-saved");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recordId, setRecordId] = useState("");
  const [isFinalReview, setIsFinalReview] = useState(false);
  const [form, setForm] = useState<FormState>(() => {
    if (typeof window === "undefined") return emptyForm;

    const localDraft = window.localStorage.getItem("prapti_registration_v1");
    if (!localDraft) return emptyForm;

    try {
      const parsed = JSON.parse(localDraft) as Partial<FormState>;
      return { ...emptyForm, ...parsed };
    } catch {
      return emptyForm;
    }
  });
  const [documentPreviews, setDocumentPreviews] = useState<Record<"citizenshipFront" | "citizenshipBack" | "nidFront" | "nidBack" | "photo", string>>({
    citizenshipFront: "",
    citizenshipBack: "",
    nidFront: "",
    nidBack: "",
    photo: "",
  });
  const [documentVerification, setDocumentVerification] = useState<Record<"citizenshipFront" | "citizenshipBack" | "nidFront" | "nidBack" | "photo", { valid: boolean; message: string }>>({
    citizenshipFront: { valid: false, message: "Awaiting document upload." },
    citizenshipBack: { valid: false, message: "Awaiting document upload." },
    nidFront: { valid: false, message: "Awaiting document upload." },
    nidBack: { valid: false, message: "Awaiting document upload." },
    photo: { valid: false, message: "Awaiting portrait upload." },
  });

  const totalFieldScore = useMemo(() => {
    const checks = [
      form.fullName,
      form.dob,
      form.gender,
      form.citizenshipNumber || form.nidNumber,
      form.employmentRecords.some((item) => item.employer || item.role),
      form.address,
      form.disability.hasDisability,
      form.photo || form.thumbPrint || form.signature || form.retinaScan,
      form.placeName || form.lat || form.lng,
    ];
    return checks.filter(Boolean).length;
  }, [form]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraftStatus("Saving...");
      saveJSON("prapti_registration_v1", {
        savedAt: new Date().toISOString(),
        step,
        form,
      });
      saveJSON("digital_nepal_citizen_dataset_v1", {
        savedAt: new Date().toISOString(),
        total: 1,
        records: [{ id: recordId || "draft", form }],
      });
      setDraftStatus("Auto-saved");
    }, 250);

    return () => window.clearTimeout(timer);
  }, [form, step, recordId]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "firstName" || field === "middleName" || field === "lastName") {
        const assembledName = [next.firstName, next.middleName, next.lastName].filter(Boolean).join(" ").trim();
        next.fullName = assembledName;
      }

      if (field === "fatherFirstName" || field === "fatherMiddleName" || field === "fatherLastName") {
        next.fatherName = [next.fatherFirstName, next.fatherMiddleName, next.fatherLastName].filter(Boolean).join(" ").trim();
      }

      if (field === "motherFirstName" || field === "motherMiddleName" || field === "motherLastName") {
        next.motherName = [next.motherFirstName, next.motherMiddleName, next.motherLastName].filter(Boolean).join(" ").trim();
      }

      if (field === "gender" && value === "Male") {
        next.spouseRelationship = "Wife";
      }

      if (field === "gender" && value === "Female") {
        next.spouseRelationship = "Husband";
      }

      if (field === "maritalStatus" && value !== "Married") {
        next.spouseFirstName = "";
        next.spouseMiddleName = "";
        next.spouseLastName = "";
        next.spouseRelationship = "";
      }

      return next;
    });
  };

  const updateChildCount = (value: string) => {
    const count = Math.max(0, Number(value) || 0);

    setForm((prev) => {
      const children = Array.from({ length: count }, (_, index) => {
        const existing = prev.children[index];
        return existing ?? {
          firstName: "",
          middleName: "",
          lastName: "",
          citizenshipNumber: "",
          dob: "",
          hasDisability: "No",
          disabilityType: "",
        };
      });

      return {
        ...prev,
        numberOfChildren: String(count),
        children,
      };
    });
  };

  const addEmploymentRecord = () => {
    setForm((prev) => ({
      ...prev,
      employmentRecords: [
        ...prev.employmentRecords,
        { employer: "", role: "", status: "Private", incomeBand: "NPR 10,000 – 25,000", sector: "", country: "", departureYear: "", workType: "", customWorkType: "" },
      ],
    }));
  };

  const addEducationRecord = () => {
    setForm((prev) => ({
      ...prev,
      educationRecords: [
        ...prev.educationRecords,
        { level: "", institution: "", subject: "", year: "", status: "Completed" },
      ],
    }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 7) as StepId);
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1) as StepId);

  const handleUseCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((prev) => ({
          ...prev,
          lat: String(coords.latitude),
          lng: String(coords.longitude),
          placeName: prev.placeName || "Current location",
        }));
      },
      () => {
        setForm((prev) => ({ ...prev, placeName: prev.placeName || "Location not available" }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateDocumentType = (fileName: string, fieldName: "citizenshipFront" | "citizenshipBack" | "nidFront" | "nidBack" | "photo") => {
    const normalized = (fileName || "").trim().toLowerCase();

    if (!normalized) {
      return { valid: false, message: "No document selected yet." };
    }

    if (fieldName === "photo") {
      const isPortrait = /(photo|portrait|selfie|headshot|citizen)/.test(normalized);
      if (isPortrait) {
        return { valid: true, message: "Citizen portrait detected and ready for verification." };
      }
      return { valid: false, message: "This does not look like a valid citizen portrait. Please upload the person’s face photo." };
    }

    const isCitizenship = /(citizenship|bansaj|banasaj|citizen)/.test(normalized);
    const isNid = /(nid|national id|national-id|identity card|citizen id)/.test(normalized);

    if (fieldName === "nidFront" || fieldName === "nidBack") {
      if (isNid) {
        return { valid: true, message: "Valid NID / national identity document detected." };
      }
      return { valid: false, message: "This does not look like a Nepal NID or identity card. Please upload the correct document image." };
    }

    if (isCitizenship) {
      return { valid: true, message: "Valid Nepal citizenship document detected." };
    }

    return { valid: false, message: "This does not look like a Nepal citizenship document. Please upload the front or back of the citizenship card/certificate." };
  };

  const applyDocumentExtraction = (fieldName: "citizenshipFront" | "citizenshipBack" | "nidFront" | "nidBack" | "photo", fileName: string) => {
    const normalized = (fileName || "").trim();
    if (!normalized) return;

    const nameMatch = normalized.match(/(?:name|full name|citizen name)[\s:_-]*([A-Z][A-Za-z.\s'-]+)/i);
    const dobMatch = normalized.match(/(?:dob|date of birth|birth date)[\s:_-]*(\d{4}-\d{2}-\d{2}|\d{2}[/-]\d{2}[/-]\d{4}|\d{4}\/\d{2}\/\d{2})/i);
    const fatherMatch = normalized.match(/(?:father|father's name|fathers name)[\s:_-]*([A-Z][A-Za-z.\s'-]+)/i);
    const motherMatch = normalized.match(/(?:mother|mother's name|mothers name)[\s:_-]*([A-Z][A-Za-z.\s'-]+)/i);
    const citizenshipNoMatch = normalized.match(/(?:citizenship(?:\s*(?:no|number))?)[\s:_-]*(\d{1,}[A-Z0-9-]+)/i);
    const nidNoMatch = normalized.match(/(?:nid(?:\s*(?:no|number))?)[\s:_-]*(\d{1,}[A-Z0-9-]+)/i);
    const citizenshipTypeMatch = normalized.match(/(?:citizenship|bansaj|banasaj)/i);

    if (nameMatch && !form.fullName) updateField("fullName", nameMatch[1].trim());
    if (dobMatch && !form.dob) {
      const value = dobMatch[1].replace(/\//g, "-");
      updateField("dob", value);
    }
    if (fatherMatch && !form.fatherName) updateField("fatherName", fatherMatch[1].trim());
    if (motherMatch && !form.motherName) updateField("motherName", motherMatch[1].trim());
    if (citizenshipNoMatch && !form.citizenshipNumber) updateField("citizenshipNumber", citizenshipNoMatch[1].trim());
    if (nidNoMatch && !form.nidNumber) updateField("nidNumber", nidNoMatch[1].trim());
    if (citizenshipTypeMatch && !form.citizenshipType) updateField("citizenshipType", "Citizenship");

    if (fieldName === "citizenshipFront" || fieldName === "citizenshipBack") {
      if (citizenshipTypeMatch) {
        updateField("citizenshipType", "Citizenship");
      }
    }
  };

  const handleDocumentSelection = (fieldName: "citizenshipFront" | "citizenshipBack" | "nidFront" | "nidBack" | "photo", file: File | null) => {
    if (!file) return;

    const fileName = file.name;
    updateField(fieldName as keyof FormState, fileName as never);
    const verification = validateDocumentType(fileName, fieldName);
    setDocumentVerification((prev) => ({ ...prev, [fieldName]: verification }));

    setDocumentPreviews((prev) => {
      const next = { ...prev };
      if (next[fieldName]) {
        const previous = next[fieldName];
        if (previous.startsWith("blob:")) {
          URL.revokeObjectURL(previous);
        }
      }
      next[fieldName] = URL.createObjectURL(file);
      return next;
    });

    applyDocumentExtraction(fieldName, fileName);
  };

  const handleSubmit = () => {
    const citizenId = `CIT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    setRecordId(citizenId);

    const existing = (() => {
      try {
        const raw = window.localStorage.getItem("citizens_registered");
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();

    const payload = {
      id: citizenId,
      name_en: form.fullName,
      dob: form.dob,
      sex: form.gender || "OTHER",
      marital_status: form.maritalStatus,
      citizenship_number: form.citizenshipNumber,
      nid_number: form.nidNumber,
      created_at: new Date().toISOString(),
      registration: form,
      ward_id: "ward-004",
    };

    const updated = [...existing, payload];
    saveJSON("citizens_registered", updated);
    saveJSON("digital_nepal_latest_submission_v1", {
      savedAt: new Date().toISOString(),
      citizenId,
      form,
    });

    setIsSubmitted(true);
  };

  const childCount = form.familyMembers.filter((member) => /child|son|daughter/i.test(member.relationship)).length;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <UploadDocumentCard title="Front Side" subtitle="JPG, PNG or PDF, Max file size 5MB." value={form.citizenshipFront} onSelect={(event) => handleDocumentSelection("citizenshipFront", event.target.files?.[0] ?? null)} onChangeText={(v) => updateField("citizenshipFront", v)} previewUrl={documentPreviews.citizenshipFront} verification={documentVerification.citizenshipFront} />
              <UploadDocumentCard title="Back Side" subtitle="Ensure the MRZ or barcode is clearly visible." value={form.citizenshipBack} onSelect={(event) => handleDocumentSelection("citizenshipBack", event.target.files?.[0] ?? null)} onChangeText={(v) => updateField("citizenshipBack", v)} previewUrl={documentPreviews.citizenshipBack} verification={documentVerification.citizenshipBack} />
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <UploadDocumentCard title="NID Front" subtitle="Upload the front side of the national ID card." value={form.nidFront} onSelect={(event) => handleDocumentSelection("nidFront", event.target.files?.[0] ?? null)} onChangeText={(v) => updateField("nidFront", v)} previewUrl={documentPreviews.nidFront} verification={documentVerification.nidFront} compact />
              <UploadDocumentCard title="NID Back" subtitle="Upload the back side of the national ID card." value={form.nidBack} onSelect={(event) => handleDocumentSelection("nidBack", event.target.files?.[0] ?? null)} onChangeText={(v) => updateField("nidBack", v)} previewUrl={documentPreviews.nidBack} verification={documentVerification.nidBack} compact />
            </div>

            <div className="rounded-[20px] border border-[#dfe6ee] bg-[#f3f1ff] p-4 text-[#3f1b5f]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#3f1b5f] text-xs font-bold text-white">i</div>
                <div className="text-sm leading-6">
                  <div className="font-semibold">Upload Guidelines</div>
                  <div>Avoid glare and shadows on the document. Place the document against a dark, high-contrast background. Do not use flash if the document is reflective. Ensure all four corners of the document are within the frame.</div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <SampleDocumentCard label="Good Example" tone="light" />
              <SampleDocumentCard label="Avoid Glare" tone="warm" />
              <SampleDocumentCard label="Avoid Blur" tone="dark" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField label="Citizenship type" value={form.citizenshipType} onChange={(v) => updateField("citizenshipType", v)} options={["Citizenship", "Naturalized", "Temporary", "Other"]} />
              <Field label="Citizenship number" value={form.citizenshipNumber} onChange={(v) => updateField("citizenshipNumber", v)} placeholder="Enter citizenship number" />
              <Field label="NID number" value={form.nidNumber} onChange={(v) => updateField("nidNumber", v)} placeholder="Enter NID number" />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-sm text-slate-600">Personal details are the core identity record. Father and mother names are optional, especially in cases involving unaccompanied or missing family information.</div>

            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71809a]">Identity portrait</p>
                <h3 className="mt-1 text-lg font-bold text-[#0A2D6D]">Citizen photo</h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${form.photo ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {form.photo ? "✓ Filled" : "Ready"}
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
              <UploadDocumentCard
                title="Citizen photo"
                subtitle="Take a live capture or upload a passport-style portrait."
                value={form.photo}
                onSelect={(event) => handleDocumentSelection("photo", event.target.files?.[0] ?? null)}
                onChangeText={(v) => updateField("photo", v)}
                previewUrl={documentPreviews.photo}
                verification={documentVerification.photo}
                capture="user"
                inputId="citizen-portrait-top"
                compact
              />

              <div className="rounded-2xl border border-dashed border-[#dbe3ee] bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#73809a]">Status</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p><span className="font-semibold text-[#0A2D6D]">Photo:</span> {form.photo ? "Uploaded" : "Pending"}</p>
                  <p><span className="font-semibold text-[#0A2D6D]">Verification:</span> {form.photo ? (documentVerification.photo.valid ? "Accepted" : "Uploaded") : "Awaiting review"}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <Field label="First name" value={form.firstName} onChange={(v) => updateField("firstName", v)} placeholder="Enter first name" />
              <Field label="Middle name" value={form.middleName} onChange={(v) => updateField("middleName", v)} placeholder="Enter middle name" />
              <Field label="Last name" value={form.lastName} onChange={(v) => updateField("lastName", v)} placeholder="Enter last name" />
              <Field label="Full name in Devnagari" value={form.fullNameDevnagari} onChange={(v) => updateField("fullNameDevnagari", v)} placeholder="पूरा नाम" />
              <Field label="Date of birth" type="date" value={form.dob} onChange={(v) => updateField("dob", v)} />
              <SelectField label="Gender" value={form.gender} onChange={(v) => updateField("gender", v)} options={["Male", "Female", "Other"]} />
              <SelectField label="Marital status" value={form.maritalStatus} onChange={(v) => updateField("maritalStatus", v)} options={["Single", "Married", "Widowed", "Divorced", "Separated", "Other"]} />
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-4 text-sm font-semibold text-slate-900">Father details</p>
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Father's first name" value={form.fatherFirstName} onChange={(v) => updateField("fatherFirstName", v)} placeholder="First name" />
                <Field label="Father's middle name" value={form.fatherMiddleName} onChange={(v) => updateField("fatherMiddleName", v)} placeholder="Middle name" />
                <Field label="Father's last name" value={form.fatherLastName} onChange={(v) => updateField("fatherLastName", v)} placeholder="Last name" />
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-4 text-sm font-semibold text-slate-900">Mother details</p>
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Mother's first name" value={form.motherFirstName} onChange={(v) => updateField("motherFirstName", v)} placeholder="First name" />
                <Field label="Mother's middle name" value={form.motherMiddleName} onChange={(v) => updateField("motherMiddleName", v)} placeholder="Middle name" />
                <Field label="Mother's last name" value={form.motherLastName} onChange={(v) => updateField("motherLastName", v)} placeholder="Last name" />
              </div>
            </div>

            {form.maritalStatus === "Married" && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-4 text-sm font-semibold text-slate-900">Spouse information</p>
                <div className="grid gap-5 md:grid-cols-3">
                  <Field label="Spouse first name" value={form.spouseFirstName} onChange={(v) => updateField("spouseFirstName", v)} placeholder="First name" />
                  <Field label="Spouse middle name" value={form.spouseMiddleName} onChange={(v) => updateField("spouseMiddleName", v)} placeholder="Middle name" />
                  <Field label="Spouse last name" value={form.spouseLastName} onChange={(v) => updateField("spouseLastName", v)} placeholder="Last name" />
                  <SelectField label="Relationship" value={form.spouseRelationship} onChange={(v) => updateField("spouseRelationship", v)} options={form.gender === "Male" ? ["Wife", "Spouse"] : form.gender === "Female" ? ["Husband", "Spouse"] : ["Spouse", "Partner"]} />
                </div>
              </div>
            )}

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-4 text-sm font-semibold text-slate-900">Children details</p>
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Number of children" type="number" value={form.numberOfChildren} onChange={(v) => updateChildCount(v)} placeholder="0" />
              </div>

              {form.children.length > 0 && (
                <div className="mt-5 space-y-4">
                  {form.children.map((child, index) => (
                    <div key={`child-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-800">Child {index + 1}</p>
                      <div className="grid gap-5 md:grid-cols-3">
                        <Field label="First name" value={child.firstName} onChange={(v) => {
                          const next = [...form.children];
                          next[index] = { ...next[index], firstName: v };
                          updateField("children", next);
                        }} placeholder="First name" />
                        <Field label="Middle name" value={child.middleName} onChange={(v) => {
                          const next = [...form.children];
                          next[index] = { ...next[index], middleName: v };
                          updateField("children", next);
                        }} placeholder="Middle name" />
                        <Field label="Last name" value={child.lastName} onChange={(v) => {
                          const next = [...form.children];
                          next[index] = { ...next[index], lastName: v };
                          updateField("children", next);
                        }} placeholder="Last name" />
                        <Field label="Citizenship number" value={child.citizenshipNumber} onChange={(v) => {
                          const next = [...form.children];
                          next[index] = { ...next[index], citizenshipNumber: v };
                          updateField("children", next);
                        }} placeholder="Citizenship no." />
                        <Field label="Date of birth" type="date" value={child.dob} onChange={(v) => {
                          const next = [...form.children];
                          next[index] = { ...next[index], dob: v };
                          updateField("children", next);
                        }} />
                        <SelectField label="Disabled" value={child.hasDisability} onChange={(v) => {
                          const next = [...form.children];
                          next[index] = { ...next[index], hasDisability: v };
                          updateField("children", next);
                        }} options={["No", "Yes"]} />
                        {child.hasDisability === "Yes" && (
                          <div className="md:col-span-3">
                            <Field label="Disability details" value={child.disabilityType} onChange={(v) => {
                              const next = [...form.children];
                              next[index] = { ...next[index], disabilityType: v };
                              updateField("children", next);
                            }} placeholder="Describe disability type" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-4 text-sm font-semibold text-slate-900">Disability details</p>
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField label="Disability type" value={form.disability.disabilityType} onChange={(v) => updateField("disability", { ...form.disability, disabilityType: v, hasDisability: v ? "Yes" : "No" })} options={["Visual Impairment", "Hearing Impairment", "Physical Disability", "Speech Impairment", "Intellectual Disability", "Mental / Psychosocial Disability", "Multiple Disabilities", "Other"]} />
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Severity level</p>
                  <input type="range" min={0} max={4} step={1} value={form.disability.severityLevel} onChange={(e) => updateField("disability", { ...form.disability, severityLevel: Number(e.target.value), severity: ["No impact", "Mild", "Moderate", "Severe", "Complete"][Number(e.target.value)] })} className="h-2 w-full cursor-pointer accent-[#0A2D6D]" />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    {["No impact", "Mild", "Moderate", "Severe", "Complete"].map((label, idx) => (
                      <span key={label} className={form.disability.severityLevel === idx ? "font-semibold text-[#0A2D6D]" : ""}>{idx}</span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="mb-3 text-sm font-semibold text-slate-900">Affected area</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {["Body Function", "Activity Limitation", "Participation Restriction"].map((area) => {
                      const checked = form.disability.affectedAreas.includes(area);
                      return (
                        <label key={area} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
                          <input type="checkbox" checked={checked} onChange={() => {
                            const next = checked ? form.disability.affectedAreas.filter((item) => item !== area) : [...form.disability.affectedAreas, area];
                            updateField("disability", { ...form.disability, affectedAreas: next, hasDisability: next.length ? "Yes" : form.disability.hasDisability });
                          }} className="h-4 w-4 accent-[#0A2D6D]" />
                          <span>{area}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <p className="mb-3 text-sm font-semibold text-slate-900">Government disability certificate issued?</p>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="radio" name="certificate-issued" checked={form.disability.certificateIssued} onChange={() => updateField("disability", { ...form.disability, certificateIssued: true })} className="h-4 w-4 accent-[#0A2D6D]" />
                      Yes
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="radio" name="certificate-issued" checked={!form.disability.certificateIssued} onChange={() => updateField("disability", { ...form.disability, certificateIssued: false })} className="h-4 w-4 accent-[#0A2D6D]" />
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Live summary</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
                <BadgePill label={form.fullName || "Name not entered"} missing={!form.fullName} />
                <BadgePill label={form.dob ? new Date(form.dob).toLocaleDateString() : "DOB missing"} missing={!form.dob} />
                <BadgePill label={form.gender || "Gender pending"} missing={!form.gender} />
                <BadgePill label={`${childCount} child record${childCount === 1 ? "" : "s"}`} missing={childCount === 0} />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-sm text-slate-600">The applicant portrait is already captured in the personal section. This step is reserved for hardware-based biometric validation such as thumbprint, signature, and retina scan registration.</div>
            <div className="grid gap-5 md:grid-cols-2">
              <HardwareCaptureCard label="Thumb print" value={form.thumbPrint} status={form.thumbPrint ? "Captured" : "Waiting for device"} />
              <HardwareCaptureCard label="Signature" value={form.signature} status={form.signature ? "Captured" : "Waiting for device"} />
              <HardwareCaptureCard label="Retina scan" value={form.retinaScan} status={form.retinaScan ? "Captured" : "Waiting for device"} />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-sm text-slate-600">Primary address, household details, and geographic location are essential for registration, service access, and residence verification.</div>
            <div className="grid gap-5 md:grid-cols-2">
              <SelectField label="Currently residing in Nepal" value={form.currentlyInNepal} onChange={(v) => updateField("currentlyInNepal", v)} options={["Yes", "No"]} />
              {form.currentlyInNepal === "No" && <Field label="Country of residence" value={form.countryOfResidence} onChange={(v) => updateField("countryOfResidence", v)} placeholder="Enter country name" />}
              <Field label="Province" value={form.province} onChange={(v) => updateField("province", v)} placeholder="Province" />
              <Field label="District" value={form.district} onChange={(v) => updateField("district", v)} placeholder="District" />
              <Field label="Municipality / Rural municipality" value={form.municipality} onChange={(v) => updateField("municipality", v)} placeholder="Municipality" />
              <Field label="Ward" value={form.ward} onChange={(v) => updateField("ward", v)} placeholder="Ward" />
              <SelectField label="House type" value={form.houseType} onChange={(v) => updateField("houseType", v)} options={["Owned", "Rented", "Family owned", "Government provided", "Other"]} />
              <SelectField label="Ownership status" value={form.ownershipStatus} onChange={(v) => updateField("ownershipStatus", v)} options={["Owned", "Rented", "Family owned", "Government allocated", "Other"]} />
              <Field label="Years at residence" value={form.yearsAtResidence} onChange={(v) => updateField("yearsAtResidence", v)} placeholder="Years" />
              <Field label="Number of rooms" value={form.roomCount} onChange={(v) => updateField("roomCount", v)} placeholder="3" />
              <div className="md:col-span-2"><Field label="Primary address" value={form.address} onChange={(v) => updateField("address", v)} placeholder="House no, street, village, locality" /></div>
              <div className="md:col-span-2 rounded-3xl border border-cyan-100 bg-cyan-50 p-4">
                <p className="text-sm font-semibold text-cyan-900">Residence location</p>
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <Field label="Latitude" value={form.lat} onChange={(v) => updateField("lat", v)} placeholder="27.7172" />
                  <Field label="Longitude" value={form.lng} onChange={(v) => updateField("lng", v)} placeholder="85.3240" />
                  <div className="md:col-span-2"><Field label="Selected place" value={form.placeName} onChange={(v) => updateField("placeName", v)} placeholder="Baneshwor, Kathmandu" /></div>
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-sky-300 bg-white/60 p-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700"><MapOutlined sx={{ fontSize: 28 }} /></div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">Location selected</p>
                  <p className="mt-1 text-xs text-slate-600">{form.placeName || form.address || "No place selected yet"}</p>
                  <button type="button" onClick={handleUseCurrentLocation} className="mt-3 rounded-xl bg-[#0A2D6D] px-4 py-2 text-xs font-semibold text-white">Use current location</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Employment & income</h3>
                <p className="mt-1 text-sm text-slate-500">Add multiple employment entries and salary ranges as needed with new records for each role.</p>
              </div>
              <button type="button" onClick={addEmploymentRecord} className="rounded-xl bg-[#0A2D6D] px-3 py-2 text-xs font-semibold text-white">+ Add record</button>
            </div>

            <div className="space-y-4">
              {form.employmentRecords.map((job, index) => (
                <div key={`${job.employer || "employment"}-${index}`} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-3">
                  <SelectField label="Status" value={job.status} onChange={(v) => { const next = [...form.employmentRecords]; next[index] = { ...next[index], status: v }; updateField("employmentRecords", next); }} options={["Government", "Private", "Business", "Unemployed", "Student", "Foreign employment"]} />
                  <Field label="Employer" value={job.employer} onChange={(v) => { const next = [...form.employmentRecords]; next[index] = { ...next[index], employer: v }; updateField("employmentRecords", next); }} />
                  <Field label="Role" value={job.role} onChange={(v) => { const next = [...form.employmentRecords]; next[index] = { ...next[index], role: v }; updateField("employmentRecords", next); }} />
                  <SelectField label="Salary band" value={job.incomeBand} onChange={(v) => { const next = [...form.employmentRecords]; next[index] = { ...next[index], incomeBand: v }; updateField("employmentRecords", next); }} options={["Below NPR 5,000", "NPR 5,000 – 10,000", "NPR 10,000 – 25,000", "NPR 25,000 – 50,000", "Above NPR 50,000", "Not disclosed"]} />
                  <Field label="Sector" value={job.sector} onChange={(v) => { const next = [...form.employmentRecords]; next[index] = { ...next[index], sector: v }; updateField("employmentRecords", next); }} />
                  {job.status === "Foreign employment" && (
                    <>
                      <Field label="Country" value={job.country} onChange={(v) => { const next = [...form.employmentRecords]; next[index] = { ...next[index], country: v }; updateField("employmentRecords", next); }} placeholder="e.g. UAE" />
                      <Field label="Year went abroad" type="number" value={job.departureYear} onChange={(v) => { const next = [...form.employmentRecords]; next[index] = { ...next[index], departureYear: v }; updateField("employmentRecords", next); }} placeholder="2023" />
                      <SelectField label="Work type" value={job.workType} onChange={(v) => { const next = [...form.employmentRecords]; next[index] = { ...next[index], workType: v }; updateField("employmentRecords", next); }} options={["Construction", "Hospitality", "Driving", "Agriculture", "Cleaning", "Security", "Factory work", "Other"]} />
                      {job.workType === "Other" && <Field label="Name of work" value={job.customWorkType} onChange={(v) => { const next = [...form.employmentRecords]; next[index] = { ...next[index], customWorkType: v }; updateField("employmentRecords", next); }} placeholder="Mention exact work type if not listed" />}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Education</h3>
                <p className="mt-1 text-sm text-slate-500">Add detailed education history with institution, subject, year, and status.</p>
              </div>
              <button type="button" onClick={addEducationRecord} className="rounded-xl bg-[#0A2D6D] px-3 py-2 text-xs font-semibold text-white">+ Add education</button>
            </div>
            <div className="space-y-4">
              {form.educationRecords.map((education, index) => (
                <div key={`${education.level || "education"}-${index}`} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-5">
                  <Field label="Level" value={education.level} onChange={(v) => { const next = [...form.educationRecords]; next[index] = { ...next[index], level: v }; updateField("educationRecords", next); }} />
                  <Field label="Institution" value={education.institution} onChange={(v) => { const next = [...form.educationRecords]; next[index] = { ...next[index], institution: v }; updateField("educationRecords", next); }} />
                  <Field label="Subject" value={education.subject} onChange={(v) => { const next = [...form.educationRecords]; next[index] = { ...next[index], subject: v }; updateField("educationRecords", next); }} />
                  <Field label="Passing year" value={education.year} onChange={(v) => { const next = [...form.educationRecords]; next[index] = { ...next[index], year: v }; updateField("educationRecords", next); }} />
                  <SelectField label="Status" value={education.status} onChange={(v) => { const next = [...form.educationRecords]; next[index] = { ...next[index], status: v }; updateField("educationRecords", next); }} options={["Completed", "In progress", "Dropped out", "Not applicable"]} />
                </div>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-sm text-slate-600">Final review before submission. Confirm the record is final and then submit to the local registration dataset.</div>
            <div className="grid gap-4 md:grid-cols-2">
              <SummaryCard title="NID / citizenship" onEdit={() => setStep(1)} lines={[form.citizenshipNumber || "Citizenship no. missing", form.nidNumber || "NID no. missing", form.citizenshipType || "Type pending"]} />
              <SummaryCard title="Personal" onEdit={() => setStep(2)} lines={[form.fullName || "Name missing", form.dob || "DOB missing", form.gender || "Gender missing", form.maritalStatus || "Marital status not entered"]} />
              <SummaryCard title="Photo" onEdit={() => setStep(3)} lines={[form.photo || "Photo not uploaded", form.signature || "Signature not uploaded", form.retinaScan || "Retina scan pending"]} />
              <SummaryCard title="Household" onEdit={() => setStep(4)} lines={[form.address || "Address missing", `${form.roomCount || 0} rooms`, form.placeName || "Location not selected"]} />
              <SummaryCard title="Employment" onEdit={() => setStep(5)} lines={[`${form.employmentRecords.length} employment record(s)`, form.employmentRecords[0]?.role || "No role entered", form.employmentRecords[0]?.incomeBand || "No salary range"]} />
              <SummaryCard title="Education" onEdit={() => setStep(6)} lines={[form.educationRecords[0]?.level || "Education not entered", form.educationRecords[0]?.institution || "No institution", form.educationRecords[0]?.status || "Status pending"]} />
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <input type="checkbox" checked={isFinalReview} onChange={(e) => setIsFinalReview(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0A2D6D] focus:ring-[#0A2D6D]" />
              <span>I confirm that the information above is complete, accurate, and ready for final registration.</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#edf3f9] p-6">
        <div className="w-full max-w-xl rounded-[28px] border border-[#dfe6ee] bg-white p-8 text-center shadow-[0_18px_48px_rgba(15,43,90,0.08)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eafaf0] text-[#1aa35f]"><CheckCircle sx={{ fontSize: 42 }} /></div>
          <h2 className="mt-6 text-3xl font-extrabold text-[#0A2D6D]">Registration complete</h2>
          <p className="mt-3 text-sm text-slate-600">Citizen record has been saved on this device and is ready for verification.</p>
          <div className="mt-6 rounded-2xl border border-[#dde7f3] bg-[#f7faff] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7b95]">Citizen ID</p>
            <p className="mt-2 text-2xl font-black text-[#0A2D6D]">{recordId || "CIT-2026-0001"}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => { setIsSubmitted(false); setForm(emptyForm); setStep(1); }} className="flex-1 rounded-xl bg-[#0A2D6D] px-4 py-3 font-semibold text-white">New entry</button>
            <button type="button" onClick={() => { setIsSubmitted(false); setStep(7); }} className="flex-1 rounded-xl border border-[#d7deea] bg-white px-4 py-3 font-semibold text-[#0A2D6D]">Review record</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf3f9] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="pb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7a8599]">Citizen registration</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-[#0A2D6D] md:text-[32px]">{STEP_META[step - 1].label}</h1>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe6ee] bg-[#f4f8ff] px-3 py-2 text-xs font-semibold text-[#0f4db8]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#21b26a]" />
              {draftStatus}
            </div>
          </div>

          <div className="relative mt-8">
            <div className="absolute left-0 right-0 top-[20px] h-[2px] bg-[#dfe6ee]" />
            <div className="relative flex flex-wrap items-start justify-between gap-3">
              {STEP_META.map(({ id, label }) => {
                const active = step === id;
                const complete = id < step;
                const circleClasses = active ? "bg-[#3f1b5f] text-white border-[#3f1b5f] shadow-[0_6px_18px_rgba(63,27,95,0.35)]" : complete ? "bg-[#1aa35f] text-white border-[#1aa35f]" : "bg-white text-[#6b7280] border-[#dfe6ee]";

                return (
                  <button key={id} type="button" onClick={() => setStep(id)} className="flex min-w-[84px] flex-1 flex-col items-center justify-center text-center">
                    <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${circleClasses}`}>{complete ? "✓" : id}</span>
                    <span className={`mt-2 text-[11px] font-medium leading-tight ${active ? "text-[#1f2430]" : "text-[#6b7280]"}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6">{renderStep()}</div>

        <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-[#e7edf4] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={prevStep} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d7deea] bg-white px-5 py-3 text-sm font-semibold text-[#1F2A44]">
            <ArrowBack sx={{ fontSize: 18 }} />
            Back
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            {step < 7 ? (
              <button type="button" onClick={nextStep} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A2D6D] px-5 py-3 text-sm font-semibold text-white">
                Save & continue
                <ArrowForward sx={{ fontSize: 18 }} />
              </button>
            ) : (
              <button type="button" disabled={!isFinalReview} onClick={handleSubmit} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white ${isFinalReview ? "bg-[#0A2D6D]" : "cursor-not-allowed bg-slate-300"}`}>
                Finalize registration
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const safeValue = value ?? "";

  return (
    <label className="block text-sm font-medium text-[#1F2A44]">
      <span className="mb-2 block text-sm font-semibold text-[#1F2A44]">{label}</span>
      <input
        type={type}
        value={safeValue}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#dbe3ee] bg-white px-3.5 py-2.5 text-sm text-[#1b2433] outline-none transition focus:border-[#0F4DB8] focus:ring-2 focus:ring-[#dfeaff]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  const safeValue = value ?? "";

  return (
    <label className="block text-sm font-medium text-[#1F2A44]">
      <span className="mb-2 block text-sm font-semibold text-[#1F2A44]">{label}</span>
      <select
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#dbe3ee] bg-white px-3.5 py-2.5 text-sm text-[#1b2433] outline-none transition focus:border-[#0F4DB8] focus:ring-2 focus:ring-[#dfeaff]"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

function HardwareCaptureCard({ label, value, status }: { label: string; value: string; status: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#d5dbe7] bg-[#f4f7fb] p-4">
      <div className="mb-4 flex items-center justify-between gap-2 text-sm font-semibold text-[#1f2430]">
        <span>{label}</span>
        <span className="text-xs text-[#5f6f8a]">{status}</span>
      </div>

      <div className="flex min-h-[180px] flex-col items-center justify-center rounded-[14px] border border-[#dfe6ee] bg-[#eef3ff] p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dfe9ff] text-[#0A2D6D]">
          <CheckCircle sx={{ fontSize: 26 }} />
        </div>
        <div className="mt-4 text-base font-semibold text-[#0A2D6D]">{value ? "Captured successfully" : "Waiting for hardware"}</div>
        <div className="mt-2 text-xs leading-5 text-[#667085]">
          {value ? value : "The scanning device will populate this value automatically once the capture is complete."}
        </div>
      </div>
    </div>
  );
}

function UploadDocumentCard({
  title,
  subtitle,
  value,
  onSelect,
  onChangeText,
  compact = false,
  previewUrl,
  verification,
  capture,
  inputId,
}: {
  title: string;
  subtitle: string;
  value: string;
  onSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeText: (value: string) => void;
  compact?: boolean;
  previewUrl?: string;
  verification?: { valid: boolean; message: string };
  capture?: "user" | "environment" | boolean;
  inputId?: string;
}) {
  const id = inputId ?? `upload-${title.toLowerCase().replace(/\s+/g, "-")}`;

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const syntheticEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onSelect(syntheticEvent);
    }
  };

  return (
    <div className={`rounded-[18px] border border-dashed border-[#d5dbe7] bg-[#f4f7fb] p-4 ${compact ? "" : "min-h-[220px]"}`}>
      <div className="mb-4 flex items-center justify-between gap-2 text-sm font-semibold text-[#1f2430]">
        <span>{title}</span>
        <span className={`text-xs ${verification?.valid ? "text-emerald-600" : "text-[#6b7280]"}`}>{value ? (verification?.valid ? "Verified" : "Needs review") : "Required"}</span>
      </div>

      <label
        htmlFor={id}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="block cursor-pointer overflow-hidden rounded-[14px] border border-[#dfe6ee] bg-[#eef2fb] text-[#1f2430]"
      >
        {previewUrl ? (
          <div className="relative h-52 w-full overflow-hidden bg-white">
            <img src={previewUrl} alt={`${title} preview`} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-slate-900/75 to-transparent px-3 py-2 text-left text-[11px] font-medium text-white">
              <span>{title}</span>
              <span className="rounded-full bg-white/20 px-2 py-1">Uploaded</span>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[210px] flex-col items-center justify-center p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#eae6f6] text-[#3f1b5f] shadow-inner">
              <UploadFile sx={{ fontSize: 30 }} />
            </div>
            <div className="mt-4 text-base font-semibold">Drag and drop or upload photo</div>
            <div className="mt-2 text-xs leading-5 text-[#667085]">{subtitle}</div>
          </div>
        )}
        <input id={id} type="file" accept="image/*,.pdf" capture={capture} className="hidden" onChange={onSelect} />
      </label>

      {verification && (
        <div className={`mt-3 rounded-xl border px-3 py-2 text-xs leading-5 ${verification.valid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
          {verification.message}
        </div>
      )}
    </div>
  );
}

function SampleDocumentCard({ label, tone }: { label: string; tone: "light" | "warm" | "dark" }) {
  const toneClasses = {
    light: "bg-gradient-to-br from-[#f1f5f9] via-[#dfeaf6] to-[#c9d7f0] text-[#1f2430]",
    warm: "bg-gradient-to-br from-[#d2b7a6] via-[#b3917b] to-[#6d4942] text-white",
    dark: "bg-gradient-to-br from-[#2d2d2d] via-[#4b4b4b] to-[#8d8d8d] text-white",
  };

  return (
    <div className={`flex h-[180px] items-center justify-center rounded-[18px] border border-[#dfe6ee] ${toneClasses[tone]} p-4`}>
      <div className="w-full max-w-[240px] rounded-[12px] border border-[#e6e6e6] bg-white/70 p-3 shadow-inner backdrop-blur-sm">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-[#1f2430]">
          <span>Sample</span>
          <span className="rounded-full bg-[#f1f4f8] px-2 py-1">{label}</span>
        </div>
        <div className="mt-4 rounded-[8px] border border-[#dfe6ee] bg-white/70 p-3 text-xs text-[#1f2430]">
          <div className="font-semibold">Citizen Name</div>
          <div className="mt-1">DOB: 1995-03-14</div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, lines, onEdit }: { title: string; lines: string[]; onEdit?: () => void }) {
  return (
    <div className="rounded-2xl border border-[#e4ebf5] bg-[#f8fafc] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#73809a]">{title}</p>
        {onEdit && (
          <button type="button" onClick={onEdit} className="text-xs font-semibold text-[#0A2D6D] underline-offset-2 hover:underline">
            Edit
          </button>
        )}
      </div>
      <ul className="mt-3 space-y-2 text-sm text-[#465266]">
        {lines.map((line, index) => (
          <li key={`${title}-${index}-${line || "empty"}`} className="rounded-lg bg-white px-2.5 py-2">{line || "—"}</li>
        ))}
      </ul>
    </div>
  );
}

function BadgePill({ label, missing = false }: { label: string; missing?: boolean }) {
  return (
    <span className={`rounded-full border px-2.5 py-1.5 text-xs font-medium ${missing ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-700"}`}>
      {label}
    </span>
  );
}
