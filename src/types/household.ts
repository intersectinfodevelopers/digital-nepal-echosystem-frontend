export type { SaveStatus } from "./common";

export interface HouseholdErrors {
  address?: string;
  ownershipStatus?: string;
  yearsAtResidence?: string;
  roomCount?: string;
  electricityScNumber?: string;
}

export interface HouseholdFormData {
  address: string;
  ownershipStatus: string;
  yearsAtResidence: string;
  roomCount: string;
  electricityScNumber: string;
  latitude: string;
  longitude: string;
}

export interface StoredDraft {
  address: string;
  ownershipStatus: string;
  yearsAtResidence: string;
  roomCount: string;
  electricityScNumber: string;
  latitude: string;
  longitude: string;
}
