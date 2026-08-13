import type { RegistrationFormData } from "./citizen";


export type PersonalInfoData = Pick<
  RegistrationFormData,
  | "name_np"
  | "name_en"
  | "dob"
  | "sex"
  | "blood_group"
  | "religion"
  | "ethnicity"
  | "mother_tongue"
  | "tole"
  | "digital_literacy"
  | "has_smartphone"
>;


export type NidData = Pick<
  RegistrationFormData,
  | "nid_number"
  | "nid_verified"
  | "citizenship_number"
  | "citizenship_front"
  | "citizenship_back"
>;

export interface FamilyMemberDraft {
  id: string;
  relationship: string;
  fullName: string;
  occupation: string;
  age: string;
}

export type FamilyMemberField = Exclude<keyof FamilyMemberDraft, "id">;
