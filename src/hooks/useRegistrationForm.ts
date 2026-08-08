'use client';

import { useState, useCallback } from 'react';
import type {
  RegistrationFormData,
  EmploymentData,
  DisabilityData,
  EducationData,
  HouseholdData,
  GpsCoordinates,
  ConsentChannel,
} from '@/types/citizen';
import { usePersonalInfoForm, createDefaultPersonalInfoData } from './usePersonalInfoForm';
import { useNidForm, createDefaultNidData } from './useNidForm';

/* ------------------------------------------------------------------ */
/* Defaults for steps that are not implemented yet (Family, Employment, */
/* Household, Disability, Education, Photo, GPS — a later phase).        */
/* ------------------------------------------------------------------ */
const DEFAULT_EMPLOYMENT: EmploymentData = {
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

const DEFAULT_DISABILITY: DisabilityData = {
  disability_type: '',
  severity_body: 0,
  severity_activity: 0,
  severity_participation: 0,
  certificate_no: '',
  issuing_hospital: '',
  certificate_expiry: '',
};

const DEFAULT_EDUCATION: EducationData = {
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

const DEFAULT_HOUSEHOLD: HouseholdData = {
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

const DEFAULT_GPS: GpsCoordinates = {
  latitude: '',
  longitude: '',
  place_name: '',
};

export function createDefaultFormData(): RegistrationFormData {
  return {
    ...createDefaultPersonalInfoData(),
    ...createDefaultNidData(),
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
    consent_channel: '',
    consent_recorded_at: new Date().toISOString(),
  };
}

export function useRegistrationForm() {
  const [step, setStep] = useState(1);

  const personal = usePersonalInfoForm();
  const nid = useNidForm();

  const [consentChannel, setConsentChannel] = useState<ConsentChannel | ''>('');
  const [consentRecordedAt, setConsentRecordedAt] = useState(
    () => new Date().toISOString(),
  );

  const formData: RegistrationFormData = {
    ...personal.data,
    ...nid.data,
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
    consent_channel: consentChannel,
    consent_recorded_at: consentRecordedAt,
  };

  const updateField = useCallback(
    <K extends keyof RegistrationFormData>(
      key: K,
      value: RegistrationFormData[K],
    ) => {
      switch (key) {
        case 'citizenship_front':
          nid.setCitizenshipFront(value as string | null);
          break;
        case 'citizenship_back':
          nid.setCitizenshipBack(value as string | null);
          break;
        case 'consent_channel':
          setConsentChannel(value as ConsentChannel | '');
          break;
        case 'consent_recorded_at':
          setConsentRecordedAt(value as string);
          break;
        default:
          personal.updateField(
            key as keyof typeof personal.data,
            value as never,
          );
      }
    },
    [personal, nid],
  );

  const setFormData = useCallback(
    (next: RegistrationFormData) => {
      personal.setData({
        name_np: next.name_np,
        name_en: next.name_en,
        dob: next.dob,
        sex: next.sex,
        blood_group: next.blood_group,
        religion: next.religion,
        ethnicity: next.ethnicity,
        mother_tongue: next.mother_tongue,
        tole: next.tole,
        digital_literacy: next.digital_literacy,
        has_smartphone: next.has_smartphone,
      });
      nid.setData({
        nid_number: next.nid_number,
        nid_verified: next.nid_verified,
        citizenship_number: next.citizenship_number,
        citizenship_front: next.citizenship_front,
        citizenship_back: next.citizenship_back,
      });
      setConsentChannel(next.consent_channel);
      setConsentRecordedAt(next.consent_recorded_at);
    },
    [personal, nid],
  );

  const updateConsentTimestamp = useCallback(() => {
    setConsentRecordedAt(new Date().toISOString());
  }, []);

  const MAX_STEP = 10;

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, MAX_STEP));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const resetForm = useCallback(() => {
    personal.setData(createDefaultPersonalInfoData());
    nid.setData(createDefaultNidData());
    setConsentChannel('');
    setConsentRecordedAt(new Date().toISOString());
    setStep(1);
  }, [personal, nid]);

  return {
    step,
    formData,
    setFormData,
    updateField,
    personal,
    nid,
    verifyNid: nid.verifyNid,
    sanitizeCitizenship: nid.sanitizeCitizenship,
    nidVerifyLoading: nid.verifyLoading,
    nidVerifyError: nid.verifyError,
    updateConsentTimestamp,
    nextStep,
    prevStep,
    resetForm,
  };
}
