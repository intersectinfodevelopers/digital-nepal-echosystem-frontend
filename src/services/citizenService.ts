'use client';

import type {
  Citizen,
  RegistrationFormData,
  EmploymentData,
  DisabilityData,
  EducationData,
  HouseholdData,
  GpsCoordinates,
  FamilyMember,
} from '@/types/citizen';
import { WARD_ID } from '@/constants';
import { nanoid } from 'nanoid';
import { recordActivity, formatActivityTime } from './activityService';
import citizensStatic from '../../data/citizens.json';

const STORAGE_KEY = 'citizens_registered';
const PROFILE_STORAGE_KEY = 'citizen_profiles_registered';
export const DATASET_STORAGE_KEY = 'digital_nepal_citizen_dataset_v1';
export const LATEST_SUBMISSION_KEY = 'digital_nepal_latest_submission_v1';

/* ------------------------------------------------------------------ */
/* Portal draft keys used to reassemble a registration payload          */
/* ------------------------------------------------------------------ */
const DRAFT_PERSONAL = 'prapti_personal_draft_v1';
const DRAFT_NID = 'prapti_nid_draft_v1';
const DRAFT_FAMILY = 'prapti_family_draft_v1';
const DRAFT_EMPLOYMENT = 'prapti_employment_draft_v1';
const DRAFT_HOUSEHOLD = 'prapti_household_draft_v1';
const DRAFT_DISABILITY = 'prapti_disability_draft_v1';
const DRAFT_EDUCATION = 'prapti_education_draft_v1';
const DRAFT_PHOTO = 'prapti_photo_draft_v1';
const DRAFT_LOCATION = 'prapti_location_draft_v1';
const SNAPSHOT_KEY = 'prapti_registration_v1';

export interface StoredProfile {
  citizenId: string;
  data: RegistrationFormData;
}

function getStored(): Citizen[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Citizen[]) : [];
  } catch {
    return [];
  }
}

function setStored(citizens: Citizen[]): void {
  try {
    const records = Array.isArray(citizens) ? citizens : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    localStorage.setItem(
      DATASET_STORAGE_KEY,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        total: records.length,
        records,
      }),
    );
  } catch {
    console.error('Failed to save to localStorage');
  }
}

function getProfiles(): StoredProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredProfile[]) : [];
  } catch {
    return [];
  }
}

function setProfiles(profiles: StoredProfile[]): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    console.error('Failed to save registration profile to localStorage');
  }
}

export function getCitizenProfile(citizenId: string): RegistrationFormData | null {
  const profile = getProfiles().find((p) => p.citizenId === citizenId);
  return profile ? profile.data : null;
}

/* ------------------------------------------------------------------ */
/* Shared default shapes for a registration form payload                */
/* ------------------------------------------------------------------ */
type DraftRecord = Record<string, unknown>;

export const DEFAULT_EMPLOYMENT: EmploymentData = {
  category: '',
  income_band: '',
  unemployed_duration_months: 0,
  unemployed_skills: [],
  unemployed_office_registered: false,
  farmer_land_area_ropani: '',
  farmer_land_type: '',
  farmer_primary_crop: '',
  farmer_irrigation_type: '',
  farmer_agri_loan: false,
  foreign_country: '',
  foreign_visa_type: '',
  foreign_employer_name: '',
  foreign_departure_date: '',
  foreign_expected_return: '',
  foreign_remittance_band: '',
  foreign_doe_registered: false,
  gov_ministry: '',
  gov_grade: '',
  gov_posting_district: '',
  gov_service_entry_year: '',
  student_institution: '',
  student_level: '',
  student_field_of_study: '',
  student_abroad: false,
};

export const DEFAULT_DISABILITY: DisabilityData = {
  disability_type: '',
  severity_body: 0,
  severity_activity: 0,
  severity_participation: 0,
  certificate_no: '',
  issuing_hospital: '',
  certificate_expiry: '',
};

export const DEFAULT_EDUCATION: EducationData = {
  level: '',
  institution_name: '',
  institution_type: '',
  study_location: '',
  is_dropout: false,
  dropout_reason: '',
  dropout_date: '',
  has_scholarship: false,
  scholarship_type: '',
  scholarship_provider: '',
};

export const DEFAULT_HOUSEHOLD: HouseholdData = {
  house_type: '',
  construction_type: '',
  room_count: 0,
  electricity_source: '',
  water_source: '',
  sanitation: '',
  internet_access: '',
  has_bank_account: false,
  monthly_income_band: '',
  poverty_class: '',
};

export const DEFAULT_GPS: GpsCoordinates = {
  latitude: '',
  longitude: '',
  place_name: '',
};

export const DEFAULT_REGISTRATION_FORM: RegistrationFormData = {
  name_np: '',
  name_en: '',
  dob: '',
  sex: '',
  blood_group: '',
  religion: '',
  ethnicity: '',
  mother_tongue: '',
  tole: '',
  digital_literacy: '',
  has_smartphone: false,
  nid_number: '',
  nid_verified: false,
  citizenship_number: '',
  citizenship_front: null,
  citizenship_back: null,
  consent_channel: '',
  consent_recorded_at: new Date().toISOString(),
  photo: null,
  father: null,
  mother: null,
  spouse: null,
  children: [],
  employment: { ...DEFAULT_EMPLOYMENT },
  disability: { ...DEFAULT_DISABILITY },
  education: { ...DEFAULT_EDUCATION },
  household: { ...DEFAULT_HOUSEHOLD },
  gps: { ...DEFAULT_GPS },
};

function readDraft(key: string): DraftRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as DraftRecord;
  } catch {
    return null;
  }
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(str(value));
  return Number.isFinite(n) ? n : 0;
}

function asSex(value: unknown): RegistrationFormData['sex'] {
  return ['MALE', 'FEMALE', 'OTHER'].includes(str(value).toUpperCase())
    ? (str(value).toUpperCase() as RegistrationFormData['sex'])
    : '';
}

function toFamilyMember(
  m: DraftRecord,
  relationship: NonNullable<RegistrationFormData['father']>['relationship'],
): FamilyMember {
  return {
    id: str(m.id) || `mem-${Date.now().toString(36)}`,
    relationship,
    name_np: str(m.name_np),
    name_en: str(m.fullName) || str(m.name_en),
    citizenship_number: str(m.citizenship_number),
    link_status: 'pending',
    occupation: str(m.occupation),
    age: str(m.age),
  };
}

/**
 * Reassembles the full registration payload from the portal drafts /
 * submission snapshot. Used by the review/submit page and by the citizen
 * detail page when a registered citizen's profile is missing from the
 * dedicated profile store.
 */
export function assembleRegistrationFromDrafts(): Partial<RegistrationFormData> | null {
  if (typeof window === 'undefined') return null;

  /* A fully assembled snapshot saved at submission time wins over the
     individual per-step drafts. */
  const snapshot = readDraft(SNAPSHOT_KEY);
  if (snapshot && Object.keys(snapshot).length > 0) {
    return snapshot as Partial<RegistrationFormData>;
  }

  const merged: Partial<RegistrationFormData> = {};

  /* Personal info */
  const personal = readDraft(DRAFT_PERSONAL);
  if (personal) {
    merged.name_np = str(personal.name_np);
    merged.name_en = str(personal.name_en);
    merged.dob = str(personal.dob);
    merged.sex = asSex(personal.sex);
    merged.blood_group = str(personal.blood_group) as RegistrationFormData['blood_group'];
    merged.religion = str(personal.religion);
    merged.ethnicity = str(personal.ethnicity);
    merged.mother_tongue = str(personal.mother_tongue);
    merged.tole = str(personal.tole);
    merged.digital_literacy = str(personal.digital_literacy) as RegistrationFormData['digital_literacy'];
    merged.has_smartphone = personal.has_smartphone === true;
    merged.consent_channel = str(personal.consent_channel) as RegistrationFormData['consent_channel'];
  }

  /* NID / Citizenship */
  const nid = readDraft(DRAFT_NID);
  if (nid) {
    merged.nid_number = str(nid.nid_number);
    merged.nid_verified = nid.nid_verified === true;
    merged.citizenship_number = str(nid.citizenship_number);
    merged.citizenship_front = str(nid.citizenship_front) || null;
    merged.citizenship_back = str(nid.citizenship_back) || null;
  }

  /* Family */
  const family = readDraft(DRAFT_FAMILY);
  if (family && Array.isArray(family.members)) {
    const members = family.members as DraftRecord[];
    const father = members.find((m) => str(m.relationship).toLowerCase() === 'father');
    const mother = members.find((m) => str(m.relationship).toLowerCase() === 'mother');
    const spouse = members.find((m) => str(m.relationship).toLowerCase() === 'spouse');
    const children = members.filter((m) => str(m.relationship).toLowerCase() === 'child');
    merged.father = father ? toFamilyMember(father, 'FATHER') : null;
    merged.mother = mother ? toFamilyMember(mother, 'MOTHER') : null;
    merged.spouse = spouse ? toFamilyMember(spouse, 'SPOUSE') : null;
    merged.children = children.map((c) => toFamilyMember(c, 'CHILD'));
  }

  /* Employment */
  const employment = readDraft(DRAFT_EMPLOYMENT);
  if (employment) {
    merged.employment = {
      ...DEFAULT_EMPLOYMENT,
      category: str(employment.employmentStatus) as EmploymentData['category'],
      income_band: str(employment.monthlyIncome) as EmploymentData['income_band'],
      gov_ministry: str(employment.employerName),
      gov_grade: str(employment.panNumber),
      foreign_employer_name: str(employment.employerName),
      student_institution: str(employment.employerName),
    };
  }

  /* Household */
  const household = readDraft(DRAFT_HOUSEHOLD);
  if (household) {
    merged.household = {
      ...DEFAULT_HOUSEHOLD,
      house_type: str(household.address),
      room_count: num(household.roomCount),
      sanitation: str(household.ownershipStatus),
      address: str(household.address),
      ownership_status: str(household.ownershipStatus),
      years_at_residence: str(household.yearsAtResidence),
      electricity_sc_number: str(household.electricityScNumber),
    };
  }

  /* Disability */
  const disability = readDraft(DRAFT_DISABILITY);
  if (disability) {
    merged.disability = {
      ...DEFAULT_DISABILITY,
      disability_type: str(disability.disabilityType),
      severity_body: num(disability.severityLevel),
      severity_activity: num(disability.severityLevel),
      severity_participation: num(disability.severityLevel),
      certificate_no: str(disability.certificateNumber),
      issuing_hospital: str(disability.issuingAuthority),
      certificate_expiry: str(disability.issueDate),
    };
  }

  /* Education */
  const education = readDraft(DRAFT_EDUCATION);
  if (education) {
    merged.education = {
      ...DEFAULT_EDUCATION,
      level: str(education.level),
      institution_name: str(education.institution),
      institution_type: str(education.status),
      study_location: str(education.studyLocation),
    };
  }

  /* Photo */
  const photo = readDraft(DRAFT_PHOTO);
  if (photo) {
    merged.photo = str(photo.dataUrl) || str(photo.previewUrl) || null;
  }

  /* GPS / Location */
  const location = readDraft(DRAFT_LOCATION);
  if (location) {
    merged.gps = {
      ...DEFAULT_GPS,
      latitude: str(location.latitude),
      longitude: str(location.longitude),
    };
  }

  return Object.keys(merged).length > 0 ? merged : null;
}

/**
 * Resolves the full registration form data for a citizen record.
 *
 * Order of resolution so that previously-registered citizens (whose full
 * payload was stored before the profile store existed) still render all of
 * their sections on the detail page:
 *   1. dedicated profile store (citizen_profiles_registered)
 *   2. registration embedded on the stored citizen record
 *   3. reassembled portal snapshot/drafts (registered citizens only)
 */
export function getCitizenFormData(
  citizen: Citizen | undefined,
  registered?: Citizen[],
): RegistrationFormData | null {
  if (!citizen) return null;

  const fromProfile = getCitizenProfile(citizen.id);
  if (fromProfile) return fromProfile;

  const embedded = (citizen as unknown as { registration?: RegistrationFormData }).registration;
  if (embedded && typeof embedded === 'object' && 'name_en' in embedded) {
    return embedded;
  }

  const isRegistered = !!registered?.some((c) => c.id === citizen.id);
  if (isRegistered) {
    const merged = assembleRegistrationFromDrafts();
    if (merged) return { ...DEFAULT_REGISTRATION_FORM, ...merged };
  }

  return null;
}

export function getAllCitizens(): Citizen[] {
  const staticCitizens = citizensStatic as unknown as Citizen[];
  const registered = getStored();
  return [...staticCitizens, ...registered];
}

export function getWardCitizens(): Citizen[] {
  return getAllCitizens().filter((c) => c.ward_id === WARD_ID);
}

export function registerCitizen(formData: RegistrationFormData): Citizen {
  const citizen: Citizen = {
    id: `cit-${nanoid(8)}`,
    ward_id: WARD_ID,
    household_id: null,
    citizenship_number: formData.citizenship_number || undefined,
    name_np: formData.name_np,
    name_en: formData.name_en,
    nid_masked: formData.nid_number
      ? `****${formData.nid_number.slice(-4)}`
      : '**********',
    sex: formData.sex as Citizen['sex'],
    dob: formData.dob,
    tole: formData.tole,
    digital_literacy: formData.digital_literacy as Citizen['digital_literacy'],
    has_smartphone: formData.has_smartphone,
    consent_recorded_at: formData.consent_recorded_at,
    consent_channel: formData.consent_channel as Citizen['consent_channel'],
    sync_status: 'pending',
    nid_verified: formData.nid_verified,
    is_active: true,
    employment_category: formData.employment.category
      ? (formData.employment.category as Citizen['employment_category'])
      : undefined,
    created_at: new Date().toISOString(),
    latitude: formData.gps.latitude ? Number(formData.gps.latitude) : undefined,
    longitude: formData.gps.longitude ? Number(formData.gps.longitude) : undefined,
    place_name: formData.gps.place_name || undefined,
  };

  // Persist the full registration payload (family, employment, education,
  // disability, household, photo, gps) so the citizen detail page can render
  // every section the user entered, not just the identity rows. The payload
  // is stored both in the dedicated profile store AND embedded on the
  // citizen record, so the detail page never depends on a single source.
  const storedCitizen = {
    ...citizen,
    blood_group: formData.blood_group || undefined,
    religion: formData.religion || undefined,
    ethnicity: formData.ethnicity || undefined,
    mother_tongue: formData.mother_tongue || undefined,
    citizenship_front: formData.citizenship_front || undefined,
    citizenship_back: formData.citizenship_back || undefined,
    photo: formData.photo || undefined,
    registration: formData,
  } as Citizen & { registration: RegistrationFormData };

  const stored = getStored();
  stored.push(storedCitizen);
  setStored(stored);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      LATEST_SUBMISSION_KEY,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        citizenId: citizen.id,
        registration: formData,
      }),
    );
  }

  const profiles = getProfiles();
  profiles.push({ citizenId: citizen.id, data: formData });
  setProfiles(profiles);

  recordActivity({
    name: citizen.name_en,
    nid: citizen.nid_masked,
    time: formatActivityTime(new Date()),
    action: 'Registration',
    status: 'Pending',
  });

  return citizen;
}