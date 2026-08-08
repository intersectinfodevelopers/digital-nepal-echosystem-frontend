'use client';

import { useCallback, useState } from 'react';

export interface FamilyMemberDraft {
  id: string;
  relationship: string;
  fullName: string;
  occupation: string;
  age: string;
}

export type FamilyMemberField = Exclude<keyof FamilyMemberDraft, 'id'>;

export function createDefaultFamilyMember(): FamilyMemberDraft {
  return {
    id: `mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    relationship: '',
    fullName: '',
    occupation: '',
    age: '',
  };
}

export function useFamilyForm() {
  const [members, setMembers] = useState<FamilyMemberDraft[]>([
    createDefaultFamilyMember(),
  ]);
  const [draftSaved, setDraftSaved] = useState(false);

  const addMember = useCallback(
    () => setMembers((prev) => [...prev, createDefaultFamilyMember()]),
    [],
  );

  const removeMember = useCallback((id: string) => {
    setMembers((prev) =>
      prev.length > 1 ? prev.filter((m) => m.id !== id) : prev,
    );
  }, []);

  const updateMember = useCallback(
    (id: string, field: FamilyMemberField, value: string) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
      );
    },
    [],
  );

  const saveDraft = useCallback(() => {
    setDraftSaved(true);
    window.setTimeout(() => setDraftSaved(false), 2200);
  }, []);

  return {
    members,
    draftSaved,
    addMember,
    removeMember,
    updateMember,
    saveDraft,
  };
}
