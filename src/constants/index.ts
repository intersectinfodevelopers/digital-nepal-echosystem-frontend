export const WARD_ID = "ward-004";

export const STEP_LABELS = [
  "Core Identity", "Family Tree", "Employment",
  "Disability", "Education", "Household", "GPS Coordinates",
];

export const BLOOD_GROUP_LABELS: Record<string, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
};

export const CONSENT_CHANNEL_LABELS: Record<string, string> = {
  WARD_OFFICE: "Ward Office",
  FIELD: "Field Visit",
  PORTAL: "Online Portal",
  VERBAL_WITNESS: "Verbal Witness",
  OTHER: "Other",
};

export const EMPLOYMENT_CATEGORY_LABELS: Record<string, string> = {
  FARMER: "Farmer",
  GOVERNMENT: "Government Employee",
  PRIVATE: "Private Sector Employee",
  BUSINESS: "Business / Self-Employed",
  STUDENT: "Student",
  UNEMPLOYED: "Unemployed",
  FOREIGN_ABROAD: "Foreign Employment / Abroad",
  HOMEMAKER: "Homemaker",
  RETIRED: "Retired",
  OTHER: "Other",
};

export const INCOME_BAND_LABELS: Record<string, string> = {
  UNDER_5K: "Under NPR 5,000",
  "5K_10K": "NPR 5,000 – 10,000", 
  "10K_25K": "NPR 10,000 – 25,000",
  "25K_50K": "NPR 25,000 – 50,000",
  "50K_100K": "NPR 50,000 – 100,000",
  OVER_100K: "Over NPR 100,000",
};

export const VISA_TYPE_LABELS: Record<string, string> = {
  WORK_PERMIT: "Work Permit",
  STUDENT_VISA: "Student Visa",
  DEPENDENT_VISA: "Dependent Visa",
  DIPLOMATIC: "Diplomatic",
  TOURIST: "Tourist",
  OTHER: "Other",
};

export const LAND_TYPE_LABELS: Record<string, string> = {
  OWNED: "Owned",
  LEASED: "Leased",
  SHARED: "Shared / Cooperative",
  OTHER: "Other",
};

export const IRRIGATION_TYPE_LABELS: Record<string, string> = {
  CANAL: "Canal",
  TUBEWELL: "Tubewell",
  RAINFED: "Rainfed",
  DRIP: "Drip Irrigation",
  SPRINKLER: "Sprinkler",
  OTHER: "Other",
};

export const REMITTANCE_BAND_LABELS: Record<string, string> = {
  UNDER_10K: "Under NPR 10,000",
  "10K_25K": "NPR 10,000 – 25,000",
  "25K_50K": "NPR 25,000 – 50,000",
  "50K_100K": "NPR 50,000 – 100,000",
  OVER_100K: "Over NPR 100,000",
};

export const GOV_GRADE_LABELS: Record<string, string> = {
  GAZETTED: "Gazetted",
  NON_GAZETTED: "Non-Gazetted",
};

export const STUDENT_LEVEL_LABELS: Record<string, string> = {
  PRIMARY: "Primary (1-5)",
  LOWER_SECONDARY: "Lower Secondary (6-8)",
  SECONDARY: "Secondary (9-10)",
  HIGHER_SECONDARY: "Higher Secondary (11-12)",
  BACHELORS: "Bachelor's",
  MASTERS: "Master's",
  PHD: "PhD / Doctorate",
  OTHER: "Other",
};

export const COUNTRY_OPTIONS = [
  { value: "AE", label: "United Arab Emirates" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "QA", label: "Qatar" },
  { value: "KW", label: "Kuwait" },
  { value: "OM", label: "Oman" },
  { value: "BH", label: "Bahrain" },
  { value: "MY", label: "Malaysia" },
  { value: "KR", label: "South Korea" },
  { value: "JP", label: "Japan" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "IT", label: "Italy" },
  { value: "IL", label: "Israel" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
  { value: "NP", label: "Nepal" },
  { value: "TH", label: "Thailand" },
  { value: "SG", label: "Singapore" },
  { value: "NZ", label: "New Zealand" },
  { value: "OTHER", label: "Other Country" },
];

export const SKILL_OPTIONS = [
  { value: "carpentry", label: "Carpentry" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "welding", label: "Welding" },
  { value: "masonry", label: "Masonry" },
  { value: "driving", label: "Driving" },
  { value: "tailoring", label: "Tailoring / Sewing" },
  { value: "cooking", label: "Cooking / Catering" },
  { value: "farming", label: "Farming / Agriculture" },
  { value: "teaching", label: "Teaching / Tutoring" },
  { value: "nursing", label: "Nursing / Health Care" },
  { value: "it", label: "IT / Computer Skills" },
  { value: "accounting", label: "Accounting / Bookkeeping" },
  { value: "construction", label: "Construction / Labor" },
  { value: "hospitality", label: "Hospitality / Tourism" },
  { value: "other", label: "Other Skill" },
];

export const DISABILITY_TYPE_LABELS: Record<string, string> = {
  PHYSICAL: "Physical Disability",
  VISUAL: "Visual Impairment",
  HEARING: "Hearing Impairment",
  SPEECH: "Speech Impairment",
  INTELLECTUAL: "Intellectual Disability",
  MENTAL: "Mental / Psychosocial Disability",
  MULTIPLE: "Multiple Disability",
  OTHER: "Other",
};

export const INSTITUTION_TYPE_LABELS: Record<string, string> = {
  GOVERNMENT: "Government",
  PRIVATE: "Private",
  COMMUNITY: "Community",
  TRUST: "Trust / NGO",
  OTHER: "Other",
};

export const HOUSE_TYPE_LABELS: Record<string, string> = {
  OWNED: "Owned",
  RENTED: "Rented",
  GOVERNMENT: "Government Provided",
  RELATIVE: "Relative's House",
  OTHER: "Other",
};

export const CONSTRUCTION_TYPE_LABELS: Record<string, string> = {
  RCC: "RCC (Reinforced Cement Concrete)",
  BRICK_MORTAR: "Brick with Mortar",
  BRICK_MUD: "Brick with Mud",
  STONE: "Stone",
  WOOD: "Wood / Timber",
  MUD: "Mud / Earth",
  PREFAB: "Prefabricated",
  OTHER: "Other",
};

export const ELECTRICITY_SOURCE_LABELS: Record<string, string> = {
  GRID: "National Grid",
  SOLAR: "Solar",
  GENERATOR: "Generator",
  BIOMASS: "Biomass",
  MICRO_HYDRO: "Micro Hydro",
  NONE: "No Electricity",
  OTHER: "Other",
};

export const WATER_SOURCE_LABELS: Record<string, string> = {
  PIPED: "Piped Water Supply",
  TUBEWELL: "Tubewell / Handpump",
  WELL: "Well (Open / Covered)",
  SPRING: "Spring Water",
  RIVER: "River / Stream",
  RAINWATER: "Rainwater Harvesting",
  TANKER: "Tanker / Bottled Water",
  OTHER: "Other",
};

export const SANITATION_LABELS: Record<string, string> = {
  FLUSH_SEWER: "Flush Toilet (Connected to Sewer)",
  FLUSH_SEPTIC: "Flush Toilet (Septic Tank)",
  VENTILATED_PIT: "Ventilated Improved Pit Latrine",
  PIT: "Pit Latrine",
  PUBLIC: "Public / Community Toilet",
  NONE: "No Facility / Open Defecation",
  OTHER: "Other",
};

export const INTERNET_ACCESS_LABELS: Record<string, string> = {
  FIBER: "Fiber Optic",
  DSL: "DSL / ADSL",
  MOBILE: "Mobile Data (3G/4G/5G)",
  SATELLITE: "Satellite",
  NONE: "No Internet Access",
  OTHER: "Other",
};

export const POVERTY_CLASS_LABELS: Record<string, string> = {
  EXTREME_POOR: "Extreme Poor",
  POOR: "Poor",
  MIDDLE: "Middle Class",
  UPPER_MIDDLE: "Upper Middle",
  RICH: "Rich",
};

export const SCHOLARSHIP_TYPE_LABELS: Record<string, string> = {
  GOVERNMENT: "Government Scholarship",
  PRIVATE: "Private / Institutional",
  INTERNATIONAL: "International / Foreign",
  COMMUNITY: "Community / Trust",
  MERIT_BASED: "Merit-Based",
  NEED_BASED: "Need-Based",
  OTHER: "Other",
};

export const RELATIONSHIPS = [
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "CHILD", label: "Child" },
  { value: "OTHER", label: "Other" },
];


export enum Nationality {
  NEPALI = "Nepali",
  INDIAN = "Indian",
  OTHER = "Other",
}

export const NATIONALITIES: Nationality[] = [
  Nationality.NEPALI,
  Nationality.INDIAN,
  Nationality.OTHER,
];

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export const GENDERS: Gender[] = [
  Gender.MALE,
  Gender.FEMALE,
  Gender.OTHER,
];

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: "Male",
  [Gender.FEMALE]: "Female",
  [Gender.OTHER]: "Other",
};

export enum MobileCountryCode {
  NEPAL = "+977",
  INDIA = "+91",
}

export const MOBILE_COUNTRY_CODES: MobileCountryCode[] = [
  MobileCountryCode.NEPAL,
  MobileCountryCode.INDIA,
];

export enum DocumentSide {
  FRONT = "front",
  BACK = "back",
}

export const DOCUMENT_SIDE_LABELS: Record<DocumentSide, string> = {
  [DocumentSide.FRONT]: "Front Side",
  [DocumentSide.BACK]: "Back Side",
};

export enum DocumentMimeType {
  JPEG = "image/jpeg",
  PNG = "image/png",
  PDF = "application/pdf",
}

export const ACCEPTED_DOCUMENT_TYPES: DocumentMimeType[] = [
  DocumentMimeType.JPEG,
  DocumentMimeType.PNG,
  DocumentMimeType.PDF,
];

export enum UploadStatus {
  EMPTY = "empty",
  UPLOADING = "uploading",
  VERIFIED = "verified",
}

export enum Relationship {
  FATHER = "father",
  MOTHER = "mother",
  SPOUSE = "spouse",
  CHILD = "child",
  OTHER = "other",
}

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  [Relationship.FATHER]: "Father",
  [Relationship.MOTHER]: "Mother",
  [Relationship.SPOUSE]: "Spouse",
  [Relationship.CHILD]: "Child",
  [Relationship.OTHER]: "Other",
};

export const RELATIONSHIP_OPTIONS: Relationship[] = [
  Relationship.FATHER,
  Relationship.MOTHER,
  Relationship.SPOUSE,
  Relationship.CHILD,
  Relationship.OTHER,
];
