'use client';

import type { Citizen, RegistrationFormData } from '@/types/citizen';
import { WARD_ID } from '@/constants';
import { nanoid } from 'nanoid';
import citizensStatic from '../../data/citizens.json';

const STORAGE_KEY = 'citizens_registered';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(citizens));
  } catch {
    console.error('Failed to save to localStorage');
  }
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

  const stored = getStored();
  stored.push(citizen);
  setStored(stored);

  return citizen;
}
