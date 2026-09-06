"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowBack, ArrowForward, CheckCircle, UploadFile, MapOutlined, ContentCopy } from "@mui/icons-material";
import { LocationMap } from "@/components/LocationMap";

const STEP_META = [
  { id: 1, label: "NID" },
  { id: 2, label: "Personal" },
  { id: 3, label: "Photo" },
  { id: 4, label: "Household" },
  { id: 5, label: "Employment" },
  { id: 6, label: "Education" },
  { id: 7, label: "Living standard" },
  { id: 8, label: "Submit" },
] as const;

const LAST_STEP = 8;

type StepId = (typeof STEP_META)[number]["id"];

type FamilyMember = {
  id: string;
  relationship: string;
  name: string;
  citizenId: string;
  status: string;
};

type EmploymentRecord = {
  // Core
  status: string;
  role: string; // occupation / job title
  employmentType: string; // Full-time / Part-time / Seasonal / Contractual / Casual
  sector: string;
  incomeBand: string;
  primaryIncome: string; // "Yes" | "No" — is this the main household income source
  currentlyWorking: string; // "Yes" | "No"
  startYear: string;
  yearsOfExperience: string;
  // Paid employment
  employer: string; // employer / organisation name
  employerLocation: string;
  // Self-employed / business owner
  businessName: string;
  businessType: string;
  businessRegistration: string;
  registrationNumber: string; // PAN / VAT / registration no.
  businessEmployees: string;
  businessStartYear: string;
  // Foreign employment
  country: string;
  departureYear: string;
  workType: string;
  customWorkType: string;
  employerAbroad: string;
  remittanceRegular: string; // "Yes" | "No"
  monthlyRemittance: string;
  // Unemployed
  seekingWork: string; // "Yes" | "No"
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
  disabilityCategory: string;
  disabilitySeverityLevel: number;
  disabilityCertificateIssued: boolean;
};

const DISABILITY_TYPE_OPTIONS = [
  "Visual Impairment",
  "Hearing Impairment",
  "Physical Disability",
  "Speech Impairment",
  "Intellectual Disability",
  "Mental / Psychosocial Disability",
  "Multiple Disabilities",
  "Other",
];

// Government of Nepal disability ID-card classification (Disability Rights Act 2074)
const DISABILITY_CATEGORY_OPTIONS = [
  "Ka – Red (Profound disability)",
  "Kha – Blue (Severe disability)",
  "Ga – Yellow (Moderate disability)",
  "Gha – White (Mild disability)",
];

const DISABILITY_SEVERITY_LABELS = ["No impact", "Mild", "Moderate", "Severe", "Complete"];

const NEPAL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

const PURPOSE_OF_STAYING_OPTIONS = [
  "Study / Education",
  "Job / Employment",
  "Business / Trade",
  "Medical treatment",
  "Family reasons",
  "Training / Internship",
  "Other",
];

const EMPLOYMENT_SECTOR_OPTIONS = [
  "Public / Government",
  "Semi-government / Public enterprise",
  "Private sector",
  "Own business / Self-employed",
  "NGO / INGO",
  "Cooperative",
  "International organization / Diplomatic mission",
  "Agriculture / Livestock",
  "Informal sector / Daily wage",
  "Other",
];

const EMPLOYMENT_STATUS_OPTIONS = [
  "Government",
  "Public enterprise / Semi-government",
  "Private sector",
  "Self-employed / Business owner",
  "Freelance / Contract",
  "Daily wage / Labour",
  "Agriculture / Farming",
  "Foreign employment",
  "Unemployed",
  "Student",
  "Homemaker",
  "Retired",
];

const EMPLOYMENT_TYPE_OPTIONS = ["Full-time", "Part-time", "Seasonal", "Contractual", "Casual / On-call"];

const INCOME_BAND_OPTIONS = [
  "No income",
  "Below NPR 5,000",
  "NPR 5,000 – 10,000",
  "NPR 10,000 – 25,000",
  "NPR 25,000 – 50,000",
  "NPR 50,000 – 1,00,000",
  "Above NPR 1,00,000",
  "Above NPR 2,00,000",
  "Above NPR 5,00,000",
  "Above NPR 10,00,000",
];

const FOREIGN_WORK_TYPE_OPTIONS = ["Construction", "Hospitality", "Driving", "Agriculture", "Cleaning", "Security", "Factory work", "Care giving / Domestic", "Technical / Skilled", "Professional / White collar", "Other"];

const BUSINESS_TYPE_OPTIONS = [
  "Retail / Trade shop",
  "Wholesale / Distribution",
  "Manufacturing / Production",
  "Agriculture / Agro-business",
  "Livestock / Poultry / Dairy",
  "Hotel / Restaurant / Hospitality",
  "Construction / Contracting",
  "Transport / Logistics",
  "Personal services (salon, tailoring, repair)",
  "IT / Digital services",
  "Handicraft / Cottage industry",
  "Import / Export",
  "Consultancy / Professional practice",
  "Education / Training institute",
  "Healthcare / Pharmacy / Clinic",
  "Tourism / Travel / Trekking",
  "Other",
];

const BUSINESS_REGISTRATION_OPTIONS = [
  "Registered — PAN / VAT",
  "Registered — local body / ward only",
  "Registered — Company Registrar / Cottage & Small Industries",
  "Not registered",
  "Registration in process",
];

const createEmploymentRecord = (overrides: Partial<EmploymentRecord> = {}): EmploymentRecord => ({
  status: "Private sector",
  role: "",
  employmentType: "Full-time",
  sector: "",
  incomeBand: "NPR 25,000 – 50,000",
  primaryIncome: "Yes",
  currentlyWorking: "Yes",
  startYear: "",
  yearsOfExperience: "",
  employer: "",
  employerLocation: "",
  businessName: "",
  businessType: "",
  businessRegistration: "",
  registrationNumber: "",
  businessEmployees: "",
  businessStartYear: "",
  country: "",
  departureYear: "",
  workType: "",
  customWorkType: "",
  employerAbroad: "",
  remittanceRegular: "No",
  monthlyRemittance: "",
  seekingWork: "Yes",
  ...overrides,
});

const EDUCATION_LEVEL_OPTIONS = [
  "No formal education (illiterate)",
  "Literate only (no formal schooling)",
  "Primary (Grade 1–5)",
  "Lower secondary (Grade 6–8)",
  "Secondary / SEE (Grade 9–10)",
  "Higher secondary / +2 (Grade 11–12)",
  "Diploma / TSLC",
  "Bachelor's degree",
  "Master's degree",
  "MPhil / PhD",
];

// Levels that don't need institution / subject / year detail
const EDUCATION_NON_FORMAL = ["No formal education (illiterate)", "Literate only (no formal schooling)"];

const LS_YESNO = ["Yes", "No"];
const LS_ELECTRICITY_SOURCE = ["National grid", "Solar", "Micro-hydro", "Generator", "None"];
const LS_DRINKING_WATER = ["Piped tap inside home", "Piped tap in yard", "Public tap / stand post", "Tube well / hand pump", "Covered well", "Uncovered well", "River / stream / pond", "Jar / tanker water", "Other"];
const LS_TOILET = ["Flush toilet (connected)", "Flush toilet (septic tank)", "Ordinary / pit latrine", "Shared with other households", "No toilet / open defecation"];
const LS_COOKING_FUEL = ["LPG gas", "Firewood", "Biogas", "Electricity", "Kerosene", "Cow dung / agri residue", "Other"];
const LS_INTERNET_TYPE = ["Mobile data only", "Fixed broadband / fibre", "Both", "None"];
const LS_WALK_DISTANCE = ["At the house / doorstep", "Under 15 min walk", "15–30 min walk", "30–60 min walk", "1–2 hours", "More than 2 hours"];
const LS_FOOD_SUFFICIENCY = ["Enough round the year", "Enough for 9–12 months", "Enough for 6–9 months", "Enough for 3–6 months", "Less than 3 months", "Not applicable / no farming"];
const LS_HOUSE_STRUCTURE = ["RCC (pillar) with concrete roof", "Cement-bonded brick / stone", "Mud-bonded brick / stone", "Wood / plank", "Bamboo / thatch / temporary", "Other"];
const LS_SOCIAL_SECURITY_TYPE = ["Senior citizen allowance", "Single woman / widow allowance", "Disability allowance", "Child nutrition grant", "Endangered ethnicity allowance", "Dalit senior citizen allowance", "Other"];
const LS_LAND_AREA = ["Below 1 kattha / ropani", "1–5 kattha / ropani", "5–10 kattha / ropani", "10 kattha – 1 bigha", "1–5 bigha", "Above 5 bigha"];

const emptyLivingStandard = {
  houseStructure: "",
  landOwnership: "No",
  landArea: "",
  electricity: "Yes",
  electricitySource: "National grid",
  drinkingWater: "",
  toilet: "",
  cookingFuel: "",
  internet: "No",
  internetType: "None",
  mobilePhones: "",
  ownsVehicle: "No",
  twoWheelers: "",
  fourWheelers: "",
  bicycles: "",
  bankAccount: "No",
  bankAccountCount: "",
  livestock: "No",
  healthInsurance: "No",
  socialSecurity: "No",
  socialSecurityType: "",
  migrantMember: "No",
  roadAccess: "Yes",
  roadDistance: "",
  marketDistance: "",
  healthFacilityDistance: "",
  schoolDistance: "",
  foodSufficiency: "",
};

export type FormState = {
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
    disabilityCategory: string;
    types: string[];
    severity: string;
    severityLevel: number;
    certificateIssued: boolean;
    support: string;
  };
  photo: string;
  thumbPrint: string;
  signature: string;
  retinaScan: string;
  // Permanent address (always in Nepal)
  permanentProvince: string;
  permanentDistrict: string;
  permanentMunicipality: string;
  permanentWard: string;
  permanentStreet: string;
  permanentHouseNo: string;
  // Temporary / current address
  currentResidence: string; // "Nepal" | "Abroad"
  purposeOfStaying: string; // shown when the current address differs from the permanent one
  countryOfResidence: string;
  cityOfResidence: string;
  visaType: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  houseType: string;
  ownershipStatus: string;
  yearsAtResidence: string;
  roomCount: string;
  address: string;
  houseNo: string;
  lat: string;
  lng: string;
  placeName: string;
  livingStandard: typeof emptyLivingStandard;
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
    createEmploymentRecord({ status: "Government", sector: "Public / Government" }),
  ],
  educationRecords: [
    { level: "", institution: "", subject: "", year: "", status: "Completed" },
  ],
  disability: {
    hasDisability: "No",
    disabilityType: "",
    disabilityCategory: "",
    types: [],
    severity: "Mild",
    severityLevel: 0,
    certificateIssued: true,
    support: "None",
  },
  photo: "",
  thumbPrint: "",
  signature: "",
  retinaScan: "",
  permanentProvince: "",
  permanentDistrict: "",
  permanentMunicipality: "",
  permanentWard: "",
  permanentStreet: "",
  permanentHouseNo: "",
  currentResidence: "Nepal",
  purposeOfStaying: "",
  countryOfResidence: "",
  cityOfResidence: "",
  visaType: "",
  province: "",
  district: "",
  municipality: "",
  ward: "",
  houseType: "Owned",
  ownershipStatus: "Owned",
  yearsAtResidence: "",
  roomCount: "",
  address: "",
  houseNo: "",
  lat: "",
  lng: "",
  placeName: "",
  livingStandard: emptyLivingStandard,
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
          disabilityCategory: "",
          disabilitySeverityLevel: 0,
          disabilityCertificateIssued: true,
        };
      });

      return {
        ...prev,
        numberOfChildren: String(count),
        children,
      };
    });
  };

  const updateChild = (index: number, patch: Partial<ChildRecord>) => {
    setForm((prev) => {
      const children = [...prev.children];
      children[index] = { ...children[index], ...patch };
      return { ...prev, children };
    });
  };

  const updateJob = (patch: Partial<EmploymentRecord>) => {
    setForm((prev) => {
      const employmentRecords = [...prev.employmentRecords];
      employmentRecords[0] = { ...(employmentRecords[0] ?? createEmploymentRecord()), ...patch };
      return { ...prev, employmentRecords };
    });
  };

  const updateEducation = (patch: Partial<EducationRecord>) => {
    setForm((prev) => {
      const educationRecords = [...prev.educationRecords];
      educationRecords[0] = { ...(educationRecords[0] ?? { level: "", institution: "", subject: "", year: "", status: "Completed" }), ...patch };
      return { ...prev, educationRecords };
    });
  };

  const updateLiving = (patch: Partial<typeof emptyLivingStandard>) => {
    setForm((prev) => ({ ...prev, livingStandard: { ...prev.livingStandard, ...patch } }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, LAST_STEP) as StepId);
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

  /** Sets the residence coordinates from a click on the map. */
  const handleMapSelect = (lat: number, lng: number) => {
    setForm((prev) => ({
      ...prev,
      lat: String(lat),
      lng: String(lng),
    }));
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

    const empStatus = form.employmentRecords[0]?.status ?? "";
    const empCategoryMap: Record<string, string> = {
      "Government": "GOVERNMENT",
      "Public enterprise / Semi-government": "GOVERNMENT",
      "Private sector": "PRIVATE",
      "Self-employed / Business owner": "BUSINESS",
      "Freelance / Contract": "PRIVATE",
      "Daily wage / Labour": "OTHER",
      "Agriculture / Farming": "FARMER",
      "Foreign employment": "FOREIGN_ABROAD",
      "Unemployed": "UNEMPLOYED",
      "Student": "STUDENT",
      "Homemaker": "HOMEMAKER",
      "Retired": "RETIRED",
    };

    const payload = {
      id: citizenId,
      source: "unified",
      name_en: form.fullName,
      name_np: form.fullNameDevnagari || form.fullName,
      dob: form.dob,
      sex: (form.gender || "OTHER").toUpperCase(),
      marital_status: form.maritalStatus,
      citizenship_number: form.citizenshipNumber,
      nid_number: form.nidNumber,
      nid_masked: form.nidNumber
        ? `****${form.nidNumber.slice(-4)}`
        : form.citizenshipNumber
          ? `CTZ ${form.citizenshipNumber}`
          : "**********",
      employment_category: empCategoryMap[empStatus] ?? "OTHER",
      tole: form.permanentStreet || form.address || "",
      nid_verified: false,
      is_active: true,
      sync_status: "pending",
      latitude: form.lat ? Number(form.lat) : undefined,
      longitude: form.lng ? Number(form.lng) : undefined,
      place_name: form.placeName || undefined,
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

  const copyPermanentToCurrent = () => {
    setForm((prev) => ({
      ...prev,
      province: prev.permanentProvince,
      district: prev.permanentDistrict,
      municipality: prev.permanentMunicipality,
      ward: prev.permanentWard,
      address: prev.permanentStreet,
      houseNo: prev.permanentHouseNo,
    }));
  };

  const currentMatchesPermanent =
    form.province === form.permanentProvince &&
    form.district === form.permanentDistrict &&
    form.municipality === form.permanentMunicipality &&
    form.ward === form.permanentWard &&
    form.address === form.permanentStreet &&
    form.houseNo === form.permanentHouseNo;

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
                          updateChild(index, v === "Yes"
                            ? { hasDisability: v }
                            : { hasDisability: v, disabilityType: "", disabilityCategory: "", disabilitySeverityLevel: 0, disabilityCertificateIssued: true });
                        }} options={["No", "Yes"]} />
                        {child.hasDisability === "Yes" && (
                          <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-4 text-sm font-semibold text-slate-900">Disability details</p>
                            <div className="grid gap-5 md:grid-cols-2">
                              <SelectField label="Disability type" value={child.disabilityType} onChange={(v) => updateChild(index, { disabilityType: v, hasDisability: v ? "Yes" : child.hasDisability })} options={DISABILITY_TYPE_OPTIONS} />
                              <SelectField label="Disability category (ID card)" value={child.disabilityCategory} onChange={(v) => updateChild(index, { disabilityCategory: v })} options={DISABILITY_CATEGORY_OPTIONS} />
                              <div className="space-y-3">
                                <p className="text-sm font-semibold text-slate-900">Severity level</p>
                                <input type="range" min={0} max={4} step={1} value={child.disabilitySeverityLevel ?? 0} onChange={(e) => updateChild(index, { disabilitySeverityLevel: Number(e.target.value) })} className="h-2 w-full cursor-pointer accent-[#0A2D6D]" />
                                <div className="flex justify-between text-[11px] text-slate-500">
                                  {DISABILITY_SEVERITY_LABELS.map((label, idx) => (
                                    <span key={label} className={(child.disabilitySeverityLevel ?? 0) === idx ? "font-semibold text-[#0A2D6D]" : ""}>{idx}</span>
                                  ))}
                                </div>
                              </div>

                              <div className="md:col-span-2">
                                <p className="mb-3 text-sm font-semibold text-slate-900">Government disability certificate issued?</p>
                                <div className="flex items-center gap-6">
                                  <label className="flex items-center gap-2 text-sm text-slate-700">
                                    <input type="radio" name={`child-certificate-issued-${index}`} checked={child.disabilityCertificateIssued ?? true} onChange={() => updateChild(index, { disabilityCertificateIssued: true })} className="h-4 w-4 accent-[#0A2D6D]" />
                                    Yes
                                  </label>
                                  <label className="flex items-center gap-2 text-sm text-slate-700">
                                    <input type="radio" name={`child-certificate-issued-${index}`} checked={!(child.disabilityCertificateIssued ?? true)} onChange={() => updateChild(index, { disabilityCertificateIssued: false })} className="h-4 w-4 accent-[#0A2D6D]" />
                                    No
                                  </label>
                                </div>
                              </div>
                            </div>
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
                <SelectField label="Disability type" value={form.disability.disabilityType} onChange={(v) => updateField("disability", { ...form.disability, disabilityType: v, hasDisability: v ? "Yes" : "No" })} options={DISABILITY_TYPE_OPTIONS} />
                <SelectField label="Disability category (ID card)" value={form.disability.disabilityCategory} onChange={(v) => updateField("disability", { ...form.disability, disabilityCategory: v })} options={DISABILITY_CATEGORY_OPTIONS} />
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Severity level</p>
                  <input type="range" min={0} max={4} step={1} value={form.disability.severityLevel} onChange={(e) => updateField("disability", { ...form.disability, severityLevel: Number(e.target.value), severity: DISABILITY_SEVERITY_LABELS[Number(e.target.value)] })} className="h-2 w-full cursor-pointer accent-[#0A2D6D]" />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    {DISABILITY_SEVERITY_LABELS.map((label, idx) => (
                      <span key={label} className={form.disability.severityLevel === idx ? "font-semibold text-[#0A2D6D]" : ""}>{idx}</span>
                    ))}
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

      case 4: {
        const isAbroad = form.currentResidence === "Abroad";
        const latNum = Number(form.lat);
        const lngNum = Number(form.lng);
        const hasResidencePin =
          form.lat.trim() !== "" &&
          form.lng.trim() !== "" &&
          Number.isFinite(latNum) &&
          Number.isFinite(lngNum);

        const residenceLocationCard = (
          <div className="md:col-span-2 rounded-3xl border border-cyan-100 bg-cyan-50 p-4">
            <p className="text-sm font-semibold text-cyan-900">Residence location</p>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <Field label="Latitude" value={form.lat} onChange={(v) => updateField("lat", v)} placeholder="27.7172" />
              <Field label="Longitude" value={form.lng} onChange={(v) => updateField("lng", v)} placeholder="85.3240" />
              <div className="md:col-span-2"><Field label="Selected place" value={form.placeName} onChange={(v) => updateField("placeName", v)} placeholder="Baneshwor, Kathmandu" /></div>
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-sky-300 bg-white/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700"><MapOutlined sx={{ fontSize: 22 }} /></span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Locate residence on map</p>
                    <p className="mt-0.5 truncate text-xs text-slate-600">
                      {hasResidencePin
                        ? `${latNum.toFixed(5)}° N, ${lngNum.toFixed(5)}° E`
                        : form.placeName || form.address || "No location selected yet"}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={handleUseCurrentLocation} className="rounded-xl bg-[#0A2D6D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#082257]">Use current location</button>
              </div>
              <div className="mt-4">
                <LocationMap latitude={form.lat} longitude={form.lng} accuracy={null} onSelect={handleMapSelect} />
              </div>
              <p className="mt-3 text-center font-poppins text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                Click the map to set the residence location, or capture it with your device
              </p>
            </div>
          </div>
        );

        const householdFields = (
          <>
            <SelectField label="House type" value={form.houseType} onChange={(v) => updateField("houseType", v)} options={["Owned", "Rented", "Family owned", "Government provided", "Other"]} />
            <SelectField label="Ownership status" value={form.ownershipStatus} onChange={(v) => updateField("ownershipStatus", v)} options={["Owned", "Rented", "Family owned", "Government allocated", "Other"]} />
            <Field label="Years at residence" value={form.yearsAtResidence} onChange={(v) => updateField("yearsAtResidence", v)} placeholder="Years" />
            <Field label="Number of rooms" value={form.roomCount} onChange={(v) => updateField("roomCount", v)} placeholder="3" />
          </>
        );

        return (
          <div className="space-y-6">
            <div className="text-sm text-slate-600">Record the permanent address (always in Nepal) and the current / temporary address. The temporary address may be inside or outside Nepal &mdash; declare that first.</div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-4 text-sm font-semibold text-slate-900">Permanent address (Nepal)</p>
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField label="Province" value={form.permanentProvince} onChange={(v) => updateField("permanentProvince", v)} options={NEPAL_PROVINCES} />
                <Field label="District" value={form.permanentDistrict} onChange={(v) => updateField("permanentDistrict", v)} placeholder="District" />
                <Field label="Municipality / Rural municipality" value={form.permanentMunicipality} onChange={(v) => updateField("permanentMunicipality", v)} placeholder="Municipality" />
                <Field label="Ward" value={form.permanentWard} onChange={(v) => updateField("permanentWard", v)} placeholder="Ward" />
                <Field label="Street / tole" value={form.permanentStreet} onChange={(v) => updateField("permanentStreet", v)} placeholder="Street, tole, village, locality" />
                <Field label="House no." value={form.permanentHouseNo} onChange={(v) => updateField("permanentHouseNo", v)} placeholder="e.g. 42" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Temporary / current address</p>
                {!isAbroad && (
                  <button type="button" onClick={copyPermanentToCurrent} className="inline-flex items-center gap-1.5 rounded-xl border border-[#d7deea] bg-white px-3 py-1.5 text-xs font-semibold text-[#0A2D6D] transition hover:bg-[#f4f8ff]">
                    <ContentCopy sx={{ fontSize: 15 }} />
                    Copy from permanent
                  </button>
                )}
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField label="Where does the citizen currently reside?" value={form.currentResidence} onChange={(v) => updateField("currentResidence", v)} options={["Nepal", "Abroad"]} />
              </div>

              {isAbroad ? (
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <Field label="Country of residence" value={form.countryOfResidence} onChange={(v) => updateField("countryOfResidence", v)} placeholder="e.g. Australia" />
                  <Field label="City of residence" value={form.cityOfResidence} onChange={(v) => updateField("cityOfResidence", v)} placeholder="e.g. Sydney" />
                  <Field label="Visa type" value={form.visaType} onChange={(v) => updateField("visaType", v)} placeholder="e.g. Student, Work, PR" />
                  <Field label="Years abroad" value={form.yearsAtResidence} onChange={(v) => updateField("yearsAtResidence", v)} placeholder="Years" />
                  <SelectField label="Purpose of staying" value={form.purposeOfStaying} onChange={(v) => updateField("purposeOfStaying", v)} options={PURPOSE_OF_STAYING_OPTIONS} />
                  <div className="md:col-span-2"><Field label="Address abroad" value={form.address} onChange={(v) => updateField("address", v)} placeholder="Street, suburb, postal / zip code" /></div>
                </div>
              ) : (
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <SelectField label="Province" value={form.province} onChange={(v) => updateField("province", v)} options={NEPAL_PROVINCES} />
                  <Field label="District" value={form.district} onChange={(v) => updateField("district", v)} placeholder="District" />
                  <Field label="Municipality / Rural municipality" value={form.municipality} onChange={(v) => updateField("municipality", v)} placeholder="Municipality" />
                  <Field label="Ward" value={form.ward} onChange={(v) => updateField("ward", v)} placeholder="Ward" />
                  {householdFields}
                  <Field label="Street / tole" value={form.address} onChange={(v) => updateField("address", v)} placeholder="Street, tole, village, locality" />
                  <Field label="House no." value={form.houseNo} onChange={(v) => updateField("houseNo", v)} placeholder="e.g. 42" />
                  {!currentMatchesPermanent && (
                    <div className="md:col-span-2">
                      <SelectField label="Purpose of staying (current address differs from permanent)" value={form.purposeOfStaying} onChange={(v) => updateField("purposeOfStaying", v)} options={PURPOSE_OF_STAYING_OPTIONS} />
                    </div>
                  )}
                  {residenceLocationCard}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 5: {
        const job = form.employmentRecords[0] ?? createEmploymentRecord();
        const isUnemployed = job.status === "Unemployed";
        const isInactive = isUnemployed || job.status === "Student" || job.status === "Homemaker" || job.status === "Retired";
        const isBusiness = job.status === "Self-employed / Business owner" || job.status === "Agriculture / Farming";
        const isForeign = job.status === "Foreign employment";
        const showEmployer = !isBusiness && !isForeign && !isInactive;

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Employment & income</h3>
              <p className="mt-1 text-sm text-slate-500">Record the citizen&rsquo;s current / main work and income.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <SelectField label="Employment status" value={job.status} onChange={(v) => updateJob({ status: v })} options={EMPLOYMENT_STATUS_OPTIONS} />
                <Field label="Occupation / job title" value={job.role} onChange={(v) => updateJob({ role: v })} placeholder="e.g. Teacher, Shopkeeper, Driver" />
                <SelectField label="Sector" value={job.sector} onChange={(v) => updateJob({ sector: v })} options={EMPLOYMENT_SECTOR_OPTIONS} />
                {!isInactive && <SelectField label="Employment type" value={job.employmentType} onChange={(v) => updateJob({ employmentType: v })} options={EMPLOYMENT_TYPE_OPTIONS} />}
                <SelectField label="Monthly income band" value={job.incomeBand} onChange={(v) => updateJob({ incomeBand: v })} options={INCOME_BAND_OPTIONS} />
                <SelectField label="Main source of income?" value={job.primaryIncome} onChange={(v) => updateJob({ primaryIncome: v })} options={LS_YESNO} />
                {!isInactive && <SelectField label="Currently active in this work?" value={job.currentlyWorking} onChange={(v) => updateJob({ currentlyWorking: v })} options={LS_YESNO} />}
                {!isInactive && <Field label="Started (year)" type="number" value={job.startYear} onChange={(v) => updateJob({ startYear: v })} placeholder="2019" />}
                {!isInactive && <Field label="Total experience (years)" type="number" value={job.yearsOfExperience} onChange={(v) => updateJob({ yearsOfExperience: v })} placeholder="e.g. 6" />}
              </div>

              {showEmployer && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Employer details</p>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Employer / organisation name" value={job.employer} onChange={(v) => updateJob({ employer: v })} placeholder="Organisation or person you work for" />
                    <Field label="Employer location" value={job.employerLocation} onChange={(v) => updateJob({ employerLocation: v })} placeholder="City / district" />
                  </div>
                </div>
              )}
              {isBusiness && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Business / enterprise details</p>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Business / enterprise name" value={job.businessName} onChange={(v) => updateJob({ businessName: v })} placeholder="Registered or trading name" />
                    <SelectField label="Type of business" value={job.businessType} onChange={(v) => updateJob({ businessType: v })} options={BUSINESS_TYPE_OPTIONS} />
                    <SelectField label="Registration status" value={job.businessRegistration} onChange={(v) => updateJob({ businessRegistration: v })} options={BUSINESS_REGISTRATION_OPTIONS} />
                    {job.businessRegistration.startsWith("Registered") && (
                      <Field label="PAN / VAT / registration no." value={job.registrationNumber} onChange={(v) => updateJob({ registrationNumber: v })} placeholder="e.g. 301234567" />
                    )}
                    <Field label="People employed (incl. self)" type="number" value={job.businessEmployees} onChange={(v) => updateJob({ businessEmployees: v })} placeholder="e.g. 3" />
                    <Field label="Business started (year)" type="number" value={job.businessStartYear} onChange={(v) => updateJob({ businessStartYear: v })} placeholder="2018" />
                  </div>
                </div>
              )}

              {isForeign && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Foreign employment details</p>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Country" value={job.country} onChange={(v) => updateJob({ country: v })} placeholder="e.g. UAE" />
                    <Field label="Year went abroad" type="number" value={job.departureYear} onChange={(v) => updateJob({ departureYear: v })} placeholder="2023" />
                    <SelectField label="Work type" value={job.workType} onChange={(v) => updateJob({ workType: v })} options={FOREIGN_WORK_TYPE_OPTIONS} />
                    {job.workType === "Other" && <Field label="Name of work" value={job.customWorkType} onChange={(v) => updateJob({ customWorkType: v })} placeholder="Mention exact work type" />}
                    <Field label="Employer abroad" value={job.employerAbroad} onChange={(v) => updateJob({ employerAbroad: v })} placeholder="Company / sponsor" />
                    <SelectField label="Sends remittance regularly?" value={job.remittanceRegular} onChange={(v) => updateJob({ remittanceRegular: v })} options={LS_YESNO} />
                    {job.remittanceRegular === "Yes" && <SelectField label="Approx. monthly remittance" value={job.monthlyRemittance} onChange={(v) => updateJob({ monthlyRemittance: v })} options={INCOME_BAND_OPTIONS} />}
                  </div>
                </div>
              )}

              {isUnemployed && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Job-seeking status</p>
                  <div className="grid gap-5 md:grid-cols-2">
                    <SelectField label="Actively seeking work?" value={job.seekingWork} onChange={(v) => updateJob({ seekingWork: v })} options={LS_YESNO} />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 6: {
        const edu = form.educationRecords[0] ?? { level: "", institution: "", subject: "", year: "", status: "Completed" };
        const nonFormal = EDUCATION_NON_FORMAL.includes(edu.level);
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Education</h3>
              <p className="mt-1 text-sm text-slate-500">Record the highest / most recent level of education attained.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField label="Highest level of education" value={edu.level} onChange={(v) => updateEducation({ level: v })} options={EDUCATION_LEVEL_OPTIONS} />
                {!nonFormal && edu.level && (
                  <>
                    <SelectField label="Status" value={edu.status} onChange={(v) => updateEducation({ status: v })} options={["Completed", "In progress", "Dropped out"]} />
                    <Field label="Institution / school / college" value={edu.institution} onChange={(v) => updateEducation({ institution: v })} placeholder="Name of institution" />
                    <Field label="Faculty / subject / stream" value={edu.subject} onChange={(v) => updateEducation({ subject: v })} placeholder="e.g. Science, Management, Education" />
                    <Field label="Passing / current year" value={edu.year} onChange={(v) => updateEducation({ year: v })} placeholder="e.g. 2019" />
                  </>
                )}
              </div>
              {nonFormal && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">
                  No formal schooling recorded. Institution, subject and year are not required for this level.
                </p>
              )}
            </div>
          </div>
        );
      }

      case 7: {
        const ls = form.livingStandard;
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Living standard & household access</h3>
              <p className="mt-1 text-sm text-slate-500">Socio-economic profile of the household &mdash; assets, services, and access to facilities.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">House &amp; land</p>
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField label="House construction type" value={ls.houseStructure} onChange={(v) => updateLiving({ houseStructure: v })} options={LS_HOUSE_STRUCTURE} />
                <SelectField label="Does the household own agricultural land?" value={ls.landOwnership} onChange={(v) => updateLiving({ landOwnership: v })} options={LS_YESNO} />
                {ls.landOwnership === "Yes" && <SelectField label="Approx. land holding" value={ls.landArea} onChange={(v) => updateLiving({ landArea: v })} options={LS_LAND_AREA} />}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Utilities &amp; services</p>
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField label="Electricity connection?" value={ls.electricity} onChange={(v) => updateLiving({ electricity: v })} options={LS_YESNO} />
                {ls.electricity === "Yes" && <SelectField label="Electricity source" value={ls.electricitySource} onChange={(v) => updateLiving({ electricitySource: v })} options={LS_ELECTRICITY_SOURCE} />}
                <SelectField label="Main source of drinking water" value={ls.drinkingWater} onChange={(v) => updateLiving({ drinkingWater: v })} options={LS_DRINKING_WATER} />
                <SelectField label="Toilet facility" value={ls.toilet} onChange={(v) => updateLiving({ toilet: v })} options={LS_TOILET} />
                <SelectField label="Main cooking fuel" value={ls.cookingFuel} onChange={(v) => updateLiving({ cookingFuel: v })} options={LS_COOKING_FUEL} />
                <SelectField label="Internet access at home?" value={ls.internet} onChange={(v) => updateLiving({ internet: v })} options={LS_YESNO} />
                {ls.internet === "Yes" && <SelectField label="Internet type" value={ls.internetType} onChange={(v) => updateLiving({ internetType: v })} options={LS_INTERNET_TYPE} />}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Assets &amp; finance</p>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Number of mobile phones in household" type="number" value={ls.mobilePhones} onChange={(v) => updateLiving({ mobilePhones: v })} placeholder="e.g. 3" />
                <SelectField label="Does the household own any vehicle?" value={ls.ownsVehicle} onChange={(v) => updateLiving({ ownsVehicle: v })} options={LS_YESNO} />
                {ls.ownsVehicle === "Yes" && <Field label="Two-wheelers (motorcycle / scooter)" type="number" value={ls.twoWheelers} onChange={(v) => updateLiving({ twoWheelers: v })} placeholder="0" />}
                {ls.ownsVehicle === "Yes" && <Field label="Four-wheelers (car / jeep / van)" type="number" value={ls.fourWheelers} onChange={(v) => updateLiving({ fourWheelers: v })} placeholder="0" />}
                {ls.ownsVehicle === "Yes" && <Field label="Bicycles / rickshaw / cart" type="number" value={ls.bicycles} onChange={(v) => updateLiving({ bicycles: v })} placeholder="0" />}
                <SelectField label="Does any member have a bank / financial account?" value={ls.bankAccount} onChange={(v) => updateLiving({ bankAccount: v })} options={LS_YESNO} />
                {ls.bankAccount === "Yes" && <Field label="Number of accounts in household" type="number" value={ls.bankAccountCount} onChange={(v) => updateLiving({ bankAccountCount: v })} placeholder="e.g. 2" />}
                <SelectField label="Does the household keep livestock / poultry?" value={ls.livestock} onChange={(v) => updateLiving({ livestock: v })} options={LS_YESNO} />
                <SelectField label="Covered by health insurance?" value={ls.healthInsurance} onChange={(v) => updateLiving({ healthInsurance: v })} options={LS_YESNO} />
                <SelectField label="Receives any social security allowance?" value={ls.socialSecurity} onChange={(v) => updateLiving({ socialSecurity: v })} options={LS_YESNO} />
                {ls.socialSecurity === "Yes" && <SelectField label="Type of allowance" value={ls.socialSecurityType} onChange={(v) => updateLiving({ socialSecurityType: v })} options={LS_SOCIAL_SECURITY_TYPE} />}
                <SelectField label="Any member migrated for work in the last 12 months?" value={ls.migrantMember} onChange={(v) => updateLiving({ migrantMember: v })} options={LS_YESNO} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Access &amp; distance</p>
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField label="Motorable road access to the house?" value={ls.roadAccess} onChange={(v) => updateLiving({ roadAccess: v })} options={LS_YESNO} />
                {ls.roadAccess === "Yes" && <SelectField label="Distance to nearest motorable road" value={ls.roadDistance} onChange={(v) => updateLiving({ roadDistance: v })} options={LS_WALK_DISTANCE} />}
                <SelectField label="Distance to nearest market / haat bazaar" value={ls.marketDistance} onChange={(v) => updateLiving({ marketDistance: v })} options={LS_WALK_DISTANCE} />
                <SelectField label="Distance to nearest health facility" value={ls.healthFacilityDistance} onChange={(v) => updateLiving({ healthFacilityDistance: v })} options={LS_WALK_DISTANCE} />
                <SelectField label="Distance to nearest school" value={ls.schoolDistance} onChange={(v) => updateLiving({ schoolDistance: v })} options={LS_WALK_DISTANCE} />
                <SelectField label="Food sufficiency from own production" value={ls.foodSufficiency} onChange={(v) => updateLiving({ foodSufficiency: v })} options={LS_FOOD_SUFFICIENCY} />
              </div>
            </div>
          </div>
        );
      }

      case 8: {
        const job = form.employmentRecords[0] ?? createEmploymentRecord();
        const edu = form.educationRecords[0] ?? { level: "", institution: "", subject: "", year: "", status: "" };
        const ls = form.livingStandard;
        const jobIsBusiness = job.status === "Self-employed / Business owner" || job.status === "Agriculture / Farming";
        const jobIsForeign = job.status === "Foreign employment";
        const jobIsUnemployed = job.status === "Unemployed";
        const jobIsInactive = jobIsUnemployed || job.status === "Student" || job.status === "Homemaker" || job.status === "Retired";
        const eduFormal = Boolean(edu.level) && !EDUCATION_NON_FORMAL.includes(edu.level);
        const spouseName = [form.spouseFirstName, form.spouseMiddleName, form.spouseLastName].filter(Boolean).join(" ");

        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Review &amp; submit</h3>
              <p className="mt-1 text-sm text-slate-500">Everything captured for this citizen is listed below. Use &ldquo;Edit&rdquo; on any section to change it, then confirm and submit.</p>
            </div>

            <ReviewSection title="NID / Citizenship" onEdit={() => setStep(1)}>
              <ReviewRows rows={[
                ["Citizenship type", form.citizenshipType],
                ["Citizenship number", form.citizenshipNumber],
                ["NID number", form.nidNumber],
                ["Citizenship — front", form.citizenshipFront],
                ["Citizenship — back", form.citizenshipBack],
                ["NID — front", form.nidFront],
                ["NID — back", form.nidBack],
              ]} />
            </ReviewSection>

            <ReviewSection title="Personal" onEdit={() => setStep(2)}>
              <ReviewRows rows={[
                ["First name", form.firstName],
                ["Middle name", form.middleName],
                ["Last name", form.lastName],
                ["Full name (Devanagari)", form.fullNameDevnagari],
                ["Date of birth", form.dob],
                ["Gender", form.gender],
                ["Marital status", form.maritalStatus],
                ["Father's name", form.fatherName],
                ["Mother's name", form.motherName],
                ["Spouse name", form.maritalStatus === "Married" ? spouseName : ""],
                ["Spouse relationship", form.maritalStatus === "Married" ? form.spouseRelationship : ""],
                ["Number of children", form.numberOfChildren],
              ]} />
              {form.children.map((c, i) => (
                <div key={`review-child-${i}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-700">Child {i + 1}</p>
                  <ReviewRows rows={[
                    ["Name", [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ")],
                    ["Date of birth", c.dob],
                    ["Citizenship no.", c.citizenshipNumber],
                    ["Has disability", c.hasDisability],
                    ["Disability type", c.hasDisability === "Yes" ? c.disabilityType : ""],
                    ["Disability category", c.hasDisability === "Yes" ? c.disabilityCategory : ""],
                    ["Severity level", c.hasDisability === "Yes" ? String(c.disabilitySeverityLevel ?? "") : ""],
                    ["Govt. certificate", c.hasDisability === "Yes" ? ((c.disabilityCertificateIssued ?? true) ? "Yes" : "No") : ""],
                  ]} />
                </div>
              ))}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">Disability (self)</p>
                <ReviewRows rows={[
                  ["Has disability", form.disability.hasDisability],
                  ["Type", form.disability.hasDisability === "Yes" ? form.disability.disabilityType : ""],
                  ["Category (ID card)", form.disability.hasDisability === "Yes" ? form.disability.disabilityCategory : ""],
                  ["Severity level", form.disability.hasDisability === "Yes" ? String(form.disability.severityLevel ?? "") : ""],
                  ["Govt. certificate issued", form.disability.hasDisability === "Yes" ? (form.disability.certificateIssued ? "Yes" : "No") : ""],
                ]} />
              </div>
            </ReviewSection>

            <ReviewSection title="Photo & biometrics" onEdit={() => setStep(3)}>
              <ReviewRows rows={[
                ["Photo", form.photo],
                ["Thumb print", form.thumbPrint],
                ["Signature", form.signature],
                ["Retina scan", form.retinaScan],
              ]} />
            </ReviewSection>

            <ReviewSection title="Household" onEdit={() => setStep(4)}>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">Permanent address</p>
                <ReviewRows rows={[
                  ["Province", form.permanentProvince],
                  ["District", form.permanentDistrict],
                  ["Municipality / RM", form.permanentMunicipality],
                  ["Ward", form.permanentWard],
                  ["Street / tole", form.permanentStreet],
                  ["House no.", form.permanentHouseNo],
                ]} />
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">Current / temporary address</p>
                {form.currentResidence === "Abroad" ? (
                  <ReviewRows rows={[
                    ["Currently residing", "Abroad"],
                    ["Country", form.countryOfResidence],
                    ["City", form.cityOfResidence],
                    ["Visa type", form.visaType],
                    ["Years abroad", form.yearsAtResidence],
                    ["Address abroad", form.address],
                    ["Purpose of staying", form.purposeOfStaying],
                  ]} />
                ) : currentMatchesPermanent ? (
                  <ReviewRows rows={[
                    ["Currently residing", "Nepal"],
                    ["Current address", "Same as permanent address"],
                    ["House type", form.houseType],
                    ["Ownership status", form.ownershipStatus],
                    ["Years at residence", form.yearsAtResidence],
                    ["Number of rooms", form.roomCount],
                  ]} />
                ) : (
                  <ReviewRows rows={[
                    ["Currently residing", "Nepal"],
                    ["Province", form.province],
                    ["District", form.district],
                    ["Municipality / RM", form.municipality],
                    ["Ward", form.ward],
                    ["House type", form.houseType],
                    ["Ownership status", form.ownershipStatus],
                    ["Years at residence", form.yearsAtResidence],
                    ["Number of rooms", form.roomCount],
                    ["Street / tole", form.address],
                    ["House no.", form.houseNo],
                    ["Purpose of staying", form.purposeOfStaying],
                  ]} />
                )}
              </div>
              <ReviewRows optional rows={[
                ["Latitude", form.lat],
                ["Longitude", form.lng],
                ["Selected place", form.placeName],
              ]} />
            </ReviewSection>

            <ReviewSection title="Employment & income" onEdit={() => setStep(5)}>
              <ReviewRows rows={[
                ["Status", job.status],
                ["Occupation / job title", job.role],
                ["Sector", job.sector],
                ["Employment type", jobIsInactive ? "" : job.employmentType],
                ["Monthly income band", job.incomeBand],
                ["Main source of income", job.primaryIncome],
                ["Currently active", jobIsInactive ? "" : job.currentlyWorking],
                ["Started (year)", jobIsInactive ? "" : job.startYear],
                ["Experience (years)", jobIsInactive ? "" : job.yearsOfExperience],
              ]} />
              {!jobIsBusiness && !jobIsForeign && !jobIsInactive && (
                <ReviewRows optional rows={[
                  ["Employer / organisation", job.employer],
                  ["Employer location", job.employerLocation],
                ]} />
              )}
              {jobIsBusiness && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-700">Business / enterprise</p>
                  <ReviewRows rows={[
                    ["Business name", job.businessName],
                    ["Type of business", job.businessType],
                    ["Registration status", job.businessRegistration],
                    ["PAN / registration no.", job.registrationNumber],
                    ["People employed", job.businessEmployees],
                    ["Business started (year)", job.businessStartYear],
                  ]} />
                </div>
              )}
              {jobIsForeign && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-700">Foreign employment</p>
                  <ReviewRows rows={[
                    ["Country", job.country],
                    ["Year went abroad", job.departureYear],
                    ["Work type", job.workType === "Other" ? job.customWorkType : job.workType],
                    ["Employer abroad", job.employerAbroad],
                    ["Sends remittance regularly", job.remittanceRegular],
                    ["Approx. monthly remittance", job.monthlyRemittance],
                  ]} />
                </div>
              )}
              {jobIsUnemployed && <ReviewRows rows={[["Actively seeking work", job.seekingWork]]} />}
            </ReviewSection>

            <ReviewSection title="Education" onEdit={() => setStep(6)}>
              <ReviewRows rows={[
                ["Highest level", edu.level],
                ["Status", eduFormal ? edu.status : ""],
                ["Institution", eduFormal ? edu.institution : ""],
                ["Faculty / subject", eduFormal ? edu.subject : ""],
                ["Passing / current year", eduFormal ? edu.year : ""],
              ]} />
            </ReviewSection>

            <ReviewSection title="Living standard & household access" onEdit={() => setStep(7)}>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">House &amp; land</p>
                <ReviewRows rows={[
                  ["House construction type", ls.houseStructure],
                  ["Owns agricultural land", ls.landOwnership],
                  ["Land holding", ls.landOwnership === "Yes" ? ls.landArea : ""],
                ]} />
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">Utilities &amp; services</p>
                <ReviewRows rows={[
                  ["Electricity", ls.electricity],
                  ["Electricity source", ls.electricity === "Yes" ? ls.electricitySource : ""],
                  ["Drinking water", ls.drinkingWater],
                  ["Toilet", ls.toilet],
                  ["Cooking fuel", ls.cookingFuel],
                  ["Internet at home", ls.internet],
                  ["Internet type", ls.internet === "Yes" ? ls.internetType : ""],
                ]} />
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">Assets &amp; finance</p>
                <ReviewRows rows={[
                  ["Mobile phones", ls.mobilePhones],
                  ["Owns a vehicle", ls.ownsVehicle],
                  ["Two-wheelers", ls.ownsVehicle === "Yes" ? ls.twoWheelers : ""],
                  ["Four-wheelers", ls.ownsVehicle === "Yes" ? ls.fourWheelers : ""],
                  ["Bicycles / cart", ls.ownsVehicle === "Yes" ? ls.bicycles : ""],
                  ["Bank / financial account", ls.bankAccount],
                  ["Number of accounts", ls.bankAccount === "Yes" ? ls.bankAccountCount : ""],
                  ["Livestock / poultry", ls.livestock],
                  ["Health insurance", ls.healthInsurance],
                  ["Social security allowance", ls.socialSecurity],
                  ["Allowance type", ls.socialSecurity === "Yes" ? ls.socialSecurityType : ""],
                  ["Member migrated for work (12 mo)", ls.migrantMember],
                ]} />
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold text-slate-700">Access &amp; distance</p>
                <ReviewRows rows={[
                  ["Motorable road access", ls.roadAccess],
                  ["Distance to road", ls.roadAccess === "Yes" ? ls.roadDistance : ""],
                  ["Distance to market", ls.marketDistance],
                  ["Distance to health facility", ls.healthFacilityDistance],
                  ["Distance to school", ls.schoolDistance],
                  ["Food sufficiency", ls.foodSufficiency],
                ]} />
              </div>
            </ReviewSection>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <input type="checkbox" checked={isFinalReview} onChange={(e) => setIsFinalReview(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0A2D6D] focus:ring-[#0A2D6D]" />
              <span>I confirm that the information above is complete, accurate, and ready for final registration.</span>
            </label>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-6">
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
            <button type="button" onClick={() => { setIsSubmitted(false); setStep(LAST_STEP); }} className="flex-1 rounded-xl border border-[#d7deea] bg-white px-4 py-3 font-semibold text-[#0A2D6D]">Review record</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7a8599]">Citizen registration</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#0A2D6D] md:text-[28px]">{STEP_META[step - 1].label}</h1>
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
          {step < LAST_STEP ? (
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
    </>
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

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#e4ebf5] bg-white p-4">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h4 className="text-sm font-bold text-[#0A2D6D]">{title}</h4>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 rounded-lg border border-[#d7deea] px-2.5 py-1 text-xs font-semibold text-[#0A2D6D] transition hover:bg-[#f4f8ff]"
        >
          Edit
        </button>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function ReviewRows({ rows, optional = false }: { rows: Array<[string, string | number | null | undefined]>; optional?: boolean }) {
  const visible = rows.filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "");
  if (visible.length === 0) {
    return optional ? null : <p className="text-sm text-slate-400">Nothing entered in this section.</p>;
  }
  return (
    <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
      {visible.map(([label, value], index) => (
        <div key={`${label}-${index}`} className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</dt>
          <dd className="break-words text-sm text-slate-800">{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function BadgePill({ label, missing = false }: { label: string; missing?: boolean }) {
  return (
    <span className={`rounded-full border px-2.5 py-1.5 text-xs font-medium ${missing ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-700"}`}>
      {label}
    </span>
  );
}