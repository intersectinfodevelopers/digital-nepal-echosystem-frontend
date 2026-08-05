'use client';

import { useCallback, useState } from 'react';
import type { RegistrationFormData } from '@/types/citizen';

export type PersonalInfoData = Pick<
  RegistrationFormData,
  | 'name_np'
  | 'name_en'
  | 'dob'
  | 'sex'
  | 'blood_group'
  | 'religion'
  | 'ethnicity'
  | 'mother_tongue'
  | 'tole'
  | 'digital_literacy'
  | 'has_smartphone'
>;

export function createDefaultPersonalInfoData(): PersonalInfoData {
  return {
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
  };
}

export function usePersonalInfoForm(
  value?: PersonalInfoData,
  onChange?: (next: PersonalInfoData) => void,
) {
  const [internal, setInternal] = useState<PersonalInfoData>(
    createDefaultPersonalInfoData(),
  );
  const data = value ?? internal;

  const setData = useCallback(
    (next: PersonalInfoData) => {
      if (onChange) onChange(next);
      else setInternal(next);
    },
    [onChange],
  );

  const updateField = useCallback(
    <K extends keyof PersonalInfoData>(key: K, next: PersonalInfoData[K]) => {
      setData({ ...data, [key]: next });
    },
    [data, setData],
  );

  return { data, setData, updateField };
}
