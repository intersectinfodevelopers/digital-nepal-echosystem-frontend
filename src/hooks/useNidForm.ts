"use client";

import type { NidData } from "@/types/registration";

import { useCallback, useState } from "react";

export function createDefaultNidData(): NidData {
  return {
    nid_number:"",
    nid_verified:false,
    citizenship_number:"",
    citizenship_front:null,   
     citizenship_back:null,
     };
}

export function useNidForm(
  value?:NidData,
  onChange?:(next:NidData) => void,
) {
  const [internal, setInternal] = useState<NidData>(createDefaultNidData());
  const data = value ?? internal;

  const setData = useCallback((next:NidData) => {
    if (onChange) {
      onChange(next);
    } else {
      setInternal(next);
    }
  }, [onChange]);

  const updateField = useCallback(
    <K extends keyof NidData>(key: K, next: NidData[K]) => {
      setData({ ...data, [key]: next });
    },
    [data, setData],
  );

  const setCitizenshipFront = useCallback(
    (url: string | null) => {
      setData({ ...data, citizenship_front: url });
    },
    [data, setData],
  );

  const setCitizenshipBack = useCallback(
    (url: string | null) => {
      setData({ ...data, citizenship_back: url });
    },
    [data, setData],
  );

  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const verifyNid = useCallback(async () => {
    const nid = data.nid_number.trim();
    if (nid.length !== 10 || !/^\d{10}$/.test(nid)) {
      setVerifyError('NID number must be 10 digits');
      return;
    }

    setVerifyLoading(true);
    setVerifyError('');
    await new Promise((r) => setTimeout(r, 800));
    setVerifyLoading(false);
    setData({ ...data, nid_verified: true });
  }, [data, setData]);

  const sanitizeCitizenship = useCallback(
    (raw: string) => {
      setData({ ...data, citizenship_number: raw.replace(/[-/]/g, '') });
    },
    [data, setData],
  );

  return {
    data,
    setData,
    updateField,
    setCitizenshipFront,
    setCitizenshipBack,
    verifyNid,
    verifyLoading,
    verifyError,
    sanitizeCitizenship,
  };
}
