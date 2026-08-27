"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewSubmitStep } from "@/components/ReviewSubmitStep";
import type { RegistrationFormData } from "@/types/citizen";

type DraftRecord = Record<string, unknown>;

function readDraft(key: string): DraftRecord | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as DraftRecord;
  } catch {
    return null;
  }
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(str(value));
  return Number.isFinite(n) ? n : 0;
}

function asSex(value: unknown): RegistrationFormData["sex"] {
  return ["MALE", "FEMALE", "OTHER"].includes(str(value).toUpperCase())
    ? (str(value).toUpperCase() as RegistrationFormData["sex"])
    : "";
}

function toFamilyMember(
  m: DraftRecord,
  relationship: NonNullable<RegistrationFormData["father"]>["relationship"],
): NonNullable<RegistrationFormData["father"]> {
  return {
    id: str(m.id) || `mem-${Date.now().toString(36)}`,
    relationship,
    name_np: str(m.name_np),
    name_en: str(m.fullName) || str(m.name_en),
    citizenship_number: str(m.citizenship_number),
    link_status: "pending",
    occupation: str(m.occupation),
    age: str(m.age),
  };
}

function loadDraftData(): Partial<RegistrationFormData> | null {
  if (typeof window === "undefined") return null;

  const snapshot = readDraft("prapti_registration_v1");
  if (snapshot && Object.keys(snapshot).length > 0) {
    return snapshot as Partial<RegistrationFormData>;
  }

  const merged: Partial<RegistrationFormData> = {};

  
  const personal = readDraft("prapti_personal_draft_v1");
  if (personal) {
    merged.name_np = str(personal.name_np);
    merged.name_en = str(personal.name_en);
    merged.dob = str(personal.dob);
    merged.sex = asSex(personal.sex);
    merged.blood_group = str(personal.blood_group) as RegistrationFormData["blood_group"];
    merged.religion = str(personal.religion);
    merged.ethnicity = str(personal.ethnicity);
    merged.mother_tongue = str(personal.mother_tongue);
    merged.tole = str(personal.tole);
    merged.digital_literacy = str(personal.digital_literacy) as RegistrationFormData["digital_literacy"];
    merged.has_smartphone = personal.has_smartphone === true;
    merged.consent_channel = str(personal.consent_channel) as RegistrationFormData["consent_channel"];
  }

  
  const nid = readDraft("prapti_nid_draft_v1");
  if (nid) {
    merged.nid_number = str(nid.nid_number);
    merged.nid_verified = nid.nid_verified === true;
    merged.citizenship_number = str(nid.citizenship_number);
    merged.citizenship_front = str(nid.citizenship_front) || null;
    merged.citizenship_back = str(nid.citizenship_back) || null;
  }

  const family = readDraft("prapti_family_draft_v1");
  if (family && Array.isArray(family.members)) {
    const members = family.members as DraftRecord[];
    const father = members.find((m) => str(m.relationship).toLowerCase() === "father");
    const mother = members.find((m) => str(m.relationship).toLowerCase() === "mother");
    const spouse = members.find((m) => str(m.relationship).toLowerCase() === "spouse");
    const children = members.filter((m) => str(m.relationship).toLowerCase() === "child");
    merged.father = father ? toFamilyMember(father, "FATHER") : null;
    merged.mother = mother ? toFamilyMember(mother, "MOTHER") : null;
    merged.spouse = spouse ? toFamilyMember(spouse, "SPOUSE") : null;
    merged.children = children.map((c) => toFamilyMember(c, "CHILD"));
  }

  
  const employment = readDraft("prapti_employment_draft_v1");
  if (employment) {
    merged.employment = {
      ...DEFAULT_FORM_DATA.employment,
      category: str(employment.employmentStatus) as RegistrationFormData["employment"]["category"],
      income_band: str(employment.monthlyIncome) as RegistrationFormData["employment"]["income_band"],
      gov_ministry: str(employment.employerName),
      gov_grade: str(employment.panNumber),
      foreign_employer_name: str(employment.employerName),
      student_institution: str(employment.employerName),
    };
  }

 
  const household = readDraft("prapti_household_draft_v1");
  if (household) {
    merged.household = {
      ...DEFAULT_FORM_DATA.household,
      house_type: str(household.address),
      room_count: num(household.roomCount),
      sanitation: str(household.ownershipStatus),
      address: str(household.address),
      ownership_status: str(household.ownershipStatus),
      years_at_residence: str(household.yearsAtResidence),
      electricity_sc_number: str(household.electricityScNumber),
    };
  }

  
  const disability = readDraft("prapti_disability_draft_v1");
  if (disability) {
    merged.disability = {
      ...DEFAULT_FORM_DATA.disability,
      disability_type: str(disability.disabilityType),
      severity_body: num(disability.severityLevel),
      severity_activity: num(disability.severityLevel),
      severity_participation: num(disability.severityLevel),
      certificate_no: str(disability.certificateNumber),
      issuing_hospital: str(disability.issuingAuthority),
      certificate_expiry: str(disability.issueDate),
    };
  }

  
  const education = readDraft("prapti_education_draft_v1");
  if (education) {
    merged.education = {
      ...DEFAULT_FORM_DATA.education,
      level: str(education.level),
      institution_name: str(education.institution),
      institution_type: str(education.status),
      study_location: str(education.studyLocation),
    };
  }

  
  const photo = readDraft("prapti_photo_draft_v1");
  if (photo) {
    merged.photo = str(photo.dataUrl) || str(photo.previewUrl) || null;
  }
  const location = readDraft("prapti_location_draft_v1");
  if (location) {
    merged.gps = {
      ...DEFAULT_FORM_DATA.gps,
      latitude: str(location.latitude),
      longitude: str(location.longitude),
    };
  }

  return Object.keys(merged).length > 0 ? merged : null;
}

const DEFAULT_FORM_DATA: RegistrationFormData = {
  name_np: "",
  name_en: "",
  dob: "",
  sex: "",
  blood_group: "",
  religion: "",
  ethnicity: "",
  mother_tongue: "",
  tole: "",
  digital_literacy: "",
  has_smartphone: false,
  nid_number: "",
  nid_verified: false,
  citizenship_number: "",
  citizenship_front: null,
  citizenship_back: null,
  consent_channel: "",
  consent_recorded_at: new Date().toISOString(),
  photo: null,
  father: null,
  mother: null,
  spouse: null,
  children: [],
  employment: {
    category: "",
    income_band: "",
    unemployed_duration_months: 0,
    unemployed_skills: [],
    unemployed_office_registered: false,
    farmer_land_area_ropani: "",
    farmer_land_type: "",
    farmer_primary_crop: "",
    farmer_irrigation_type: "",
    farmer_agri_loan: false,
    foreign_country: "",
    foreign_visa_type: "",
    foreign_employer_name: "",
    foreign_departure_date: "",
    foreign_expected_return: "",
    foreign_remittance_band: "",
    foreign_doe_registered: false,
    gov_ministry: "",
    gov_grade: "",
    gov_posting_district: "",
    gov_service_entry_year: "",
    student_institution: "",
    student_level: "",
    student_field_of_study: "",
    student_abroad: false,
  },
  disability: {
    disability_type: "",
    severity_body: 0,
    severity_activity: 0,
    severity_participation: 0,
    certificate_no: "",
    issuing_hospital: "",
    certificate_expiry: "",
  },
  education: {
    level: "",
    institution_name: "",
    institution_type: "",
    study_location: "",
    is_dropout: false,
    dropout_reason: "",
    dropout_date: "",
    has_scholarship: false,
    scholarship_type: "",
    scholarship_provider: "",
  },
  household: {
    house_type: "",
    construction_type: "",
    room_count: 0,
    electricity_source: "",
    water_source: "",
    sanitation: "",
    internet_access: "",
    has_bank_account: false,
    monthly_income_band: "",
    poverty_class: "",
  },
  gps: {
    latitude: "",
    longitude: "",
    place_name: "",
  },
};

const STEP_ROUTES: Record<number, string> = {
  1: "/ward/dashboard/registercitizen",
  2: "/ward/dashboard/registercitizen",
  3: "/portal/family",
  4: "/portal/employment",
  5: "/portal/household",
  6: "/portal/disability",
  7: "/portal/education",
  8: "/portal/photo",
  9: "/portal/location",
};

export default function PortalSubmitPage() {
  const router = useRouter();

  const loadInitialFormData = () => {
    const draft = loadDraftData();
    return draft ? { ...DEFAULT_FORM_DATA, ...draft } : DEFAULT_FORM_DATA;
  };

  const [formData] = useState<RegistrationFormData | null>(loadInitialFormData);

  const handleNavigateToStep = (step: number) => {
    const route = STEP_ROUTES[step];
    if (route) {
      router.push(route);
    }
  };

  return (
    <ReviewSubmitStep
      formData={formData ?? undefined}
      onNavigateToStep={handleNavigateToStep}
    />
  );
}
