import type { EducationFieldDef } from "@/types/education";

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

export interface EmploymentStatusOption {
  value: string;
  label: string;
}

export const EMPLOYMENT_STATUS_OPTIONS: EmploymentStatusOption[] = [
  { value: "full_time_professional", label: "Full-time Professional" },
  { value: "part_time", label: "Part-time" },
  { value: "self_employed", label: "Self-employed" },
  { value: "business_owner", label: "Business Owner" },
  { value: "freelancer", label: "Freelancer" },
  { value: "student", label: "Student" },
  { value: "unemployed", label: "Unemployed" },
  { value: "retired", label: "Retired" },
  { value: "other", label: "Other" },
];

export const EMPLOYMENT_STATUS_LABELS: Record<string, string> =
  Object.fromEntries(EMPLOYMENT_STATUS_OPTIONS.map((o) => [o.value, o.label]));

export const EMPLOYER_REQUIRED_STATUSES: string[] = [
  "full_time_professional",
  "part_time",
  "self_employed",
  "business_owner",
  "freelancer",
];

export const PAN_FORMAT = /^\d{9}$/;

export interface HouseholdOwnershipOption {
  value: string;
  label: string;
}

export const HOUSEHOLD_OWNERSHIP_OPTIONS: HouseholdOwnershipOption[] = [
  { value: "owned", label: "Owned" },
  { value: "rented", label: "Rented" },
  { value: "government", label: "Government Provided" },
  { value: "relative", label: "Relative's House" },
  { value: "other", label: "Other" },
];

export const HOUSEHOLD_OWNERSHIP_LABELS: Record<string, string> =
  Object.fromEntries(HOUSEHOLD_OWNERSHIP_OPTIONS.map((o) => [o.value, o.label]));

export interface DisabilityTypeOption {
  value: string;
  label: string;
}

export const DISABILITY_TYPE_OPTIONS: DisabilityTypeOption[] = [
  { value: "PHYSICAL", label: "Physical Disability" },
  { value: "VISUAL", label: "Visual Disability" },
  { value: "HEARING", label: "Hearing Disability" },
  { value: "SPEECH", label: "Speech and Language Disability" },
  { value: "INTELLECTUAL", label: "Intellectual Disability" },
  { value: "MENTAL", label: "Mental / Psychosocial Disability" },
  { value: "MULTIPLE", label: "Multiple Disabilities" },
  { value: "OTHER", label: "Other" },
];

export interface SeverityLevel {
  value: number;
  label: string;
}

export const SEVERITY_LEVELS: SeverityLevel[] = [
  { value: 0, label: "No impact" },
  { value: 1, label: "Mild" },
  { value: 2, label: "Moderate" },
  { value: 3, label: "Severe" },
  { value: 4, label: "Complete" },
];

export const SEVERITY_LEVEL_LABELS: Record<number, string> = Object.fromEntries(
  SEVERITY_LEVELS.map((level) => [level.value, level.label]),
);

export interface AffectedAreaOption {
  value: string;
  label: string;
}

export const AFFECTED_AREA_OPTIONS: AffectedAreaOption[] = [
  { value: "body_function", label: "Body Function" },
  { value: "activity_limitation", label: "Activity Limitation" },
  { value: "participation_restriction", label: "Participation Restriction" },
];

export interface EducationLevelOption {
  value: string;
  label: string;
}

export const EDUCATION_LEVEL_OPTIONS: EducationLevelOption[] = [
  { value: "secondary", label: "Secondary Education" },
  { value: "higher_secondary", label: "Higher Secondary / +2" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
  { value: "mphil", label: "MPhil" },
  { value: "phd", label: "PhD" },
  { value: "other", label: "Other" },
];

export const EDUCATION_LEVEL_LABELS: Record<string, string> =
  Object.fromEntries(EDUCATION_LEVEL_OPTIONS.map((o) => [o.value, o.label]));

export interface EducationStatusOption {
  value: string;
  label: string;
}

export const EDUCATION_STATUS_OPTIONS: EducationStatusOption[] = [
  { value: "completed", label: "Completed" },
  { value: "studying", label: "Currently Studying" },
  { value: "graduated", label: "Graduated" },
  { value: "discontinued", label: "Discontinued" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "on_leave", label: "On Leave" },
  { value: "other", label: "Other" },
];

export const EDUCATION_STATUS_LABELS: Record<string, string> =
  Object.fromEntries(EDUCATION_STATUS_OPTIONS.map((o) => [o.value, o.label]));

export interface GradingScaleOption {
  value: string;
  label: string;
}

export const GRADING_SCALE_OPTIONS: GradingScaleOption[] = [
  { value: "gpa_4", label: "GPA / 4.0" },
  { value: "gpa_10", label: "GPA / 10.0" },
  { value: "cgpa", label: "CGPA" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "other", label: "Other" },
];

export const GRADING_SCALE_LABELS: Record<string, string> =
  Object.fromEntries(GRADING_SCALE_OPTIONS.map((o) => [o.value, o.label]));

// Statuses that represent a finished education period (require completion date).
export const EDUCATION_COMPLETED_STATUSES: string[] = [
  "completed",
  "graduated",
  "discontinued",
  "withdrawn",
];

// Statuses that represent an ongoing education period (show expected date + semester/year).
export const EDUCATION_ACTIVE_STATUSES: string[] = ["studying", "on_leave"];

// Statuses that were terminated early (show end date + reason).
export const EDUCATION_TERMINATED_STATUSES: string[] = ["discontinued", "withdrawn"];

// Statuses that indicate successful completion (show certificate availability).
export const EDUCATION_FINISHED_STATUSES: string[] = ["completed", "graduated"];

// Label used for the completion date field depending on the selected status.
export const EDUCATION_COMPLETION_LABELS: Record<string, string> = {
  completed: "Completion Date",
  graduated: "Completion Date",
  studying: "Expected Completion Date",
  on_leave: "Expected Completion Date",
  discontinued: "End Date",
  withdrawn: "End Date",
};

// Dynamic per-level field configuration rendered in the education step.
export const EDUCATION_LEVEL_FIELDS: Record<string, EducationFieldDef[]> = {
  secondary: [
    { key: "faculty", label: "Stream", placeholder: "e.g. Science, Management, Humanities" },
    { key: "board", label: "Board", placeholder: "e.g. NEB" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "completionDate", label: "Completion Date", type: "date" },
    { key: "grade", label: "GPA / Percentage", placeholder: "e.g. 3.8 GPA or 78%" },
  ],
  higher_secondary: [
    { key: "faculty", label: "Stream", placeholder: "e.g. Science, Management, Humanities" },
    { key: "board", label: "Board", placeholder: "e.g. NEB" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "completionDate", label: "Completion Date", type: "date" },
    { key: "grade", label: "GPA / Percentage", placeholder: "e.g. 3.5 GPA or 72%" },
  ],
  diploma: [
    { key: "degreeName", label: "Program Name", placeholder: "e.g. Diploma in Civil Engineering" },
    { key: "major", label: "Specialization", placeholder: "e.g. Civil, IT, Nursing" },
    { key: "board", label: "Board / University", placeholder: "e.g. CTEVT, TU" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "completionDate", label: "Completion Date", type: "date" },
    { key: "grade", label: "GPA / Percentage", placeholder: "e.g. 3.5 GPA or 72%" },
  ],
  bachelors: [
    { key: "degreeName", label: "Degree Name", placeholder: "e.g. Bachelor of Business Administration" },
    { key: "faculty", label: "Faculty / Stream", placeholder: "e.g. Management, Science, Engineering" },
    { key: "board", label: "University / Board", placeholder: "e.g. Tribhuvan University, Purbanchal University" },
    { key: "major", label: "Major / Specialization", placeholder: "e.g. Finance, Computer Science" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "completionDate", label: "Completion Date", type: "date" },
    { key: "grade", label: "GPA / Percentage", placeholder: "e.g. 3.6 GPA or 82%" },
    {
      key: "gradingScale",
      label: "Grading Scale",
      type: "select",
      options: GRADING_SCALE_OPTIONS,
    },
  ],
  masters: [
    { key: "degreeName", label: "Program Name", placeholder: "e.g. Master of Science in Computer Science" },
    { key: "major", label: "Specialization", placeholder: "e.g. Data Science, Finance" },
    { key: "board", label: "University / Board", placeholder: "e.g. Tribhuvan University" },
    { key: "thesisArea", label: "Thesis / Research Area", placeholder: "e.g. Machine Learning, Public Health" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "completionDate", label: "Completion Date", type: "date" },
    { key: "grade", label: "GPA / Percentage", placeholder: "e.g. 3.8 GPA or 85%" },
    {
      key: "gradingScale",
      label: "Grading Scale",
      type: "select",
      options: GRADING_SCALE_OPTIONS,
    },
  ],
  mphil: [
    { key: "degreeName", label: "Program Name", placeholder: "e.g. MPhil in Development Studies" },
    { key: "thesisArea", label: "Research Area", placeholder: "e.g. Rural Development" },
    { key: "board", label: "University / Board", placeholder: "e.g. Tribhuvan University" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "completionDate", label: "Completion Date", type: "date" },
    { key: "grade", label: "GPA / Percentage", placeholder: "e.g. 3.7 GPA" },
  ],
  phd: [
    { key: "degreeName", label: "Program Name", placeholder: "e.g. PhD in Physics" },
    { key: "thesisArea", label: "Thesis / Research Area", placeholder: "e.g. Theoretical Physics" },
    { key: "board", label: "University / Board", placeholder: "e.g. Tribhuvan University" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "completionDate", label: "Completion Date", type: "date" },
    { key: "grade", label: "GPA / Percentage", placeholder: "e.g. 3.9 GPA" },
  ],
  other: [
    { key: "degreeName", label: "Program / Course Name", placeholder: "e.g. Professional Certification" },
    { key: "board", label: "Board / University", placeholder: "e.g. NEB, TU, CTEVT" },
    { key: "startDate", label: "Start Date", type: "date" },
    { key: "completionDate", label: "Completion / End Date", type: "date" },
  ],
};
