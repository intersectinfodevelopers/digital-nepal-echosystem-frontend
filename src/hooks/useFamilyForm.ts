'use client';

import { useCallback, useState } from 'react';
import type { FamilyMemberDraft, FamilyMemberField } from "@/types/registration";

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
    if (typeof window === "undefined") {
      setDraftSaved(true);
      return;
    }
    try {
      window.localStorage.setItem(
        "prapti_family_draft_v1",
        JSON.stringify({ members }),
      );
    } catch {
      // localStorage may be full or unavailable
    }
    setDraftSaved(true);
    if (typeof window !== "undefined") {
      window.setTimeout(() => setDraftSaved(false), 2200);
    }
  }, [members]);

  return {
    members,
    draftSaved,
    addMember,
    removeMember,
    updateMember,
    saveDraft,
  };
}
