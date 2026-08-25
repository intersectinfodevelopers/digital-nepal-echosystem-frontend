export const TOTAL_PROVINCES_OFFICIAL = 7;
export const TOTAL_DISTRICTS_OFFICIAL = 77;
export const TOTAL_LOCAL_LEVELS_OFFICIAL = 753;
export const TOTAL_WARDS_OFFICIAL = 6743;

export const LOCAL_LEVEL_TOTALS_OFFICIAL = {
  metropolitanCities: 6,
  subMetropolitanCities: 11,
  municipalities: 276,
  ruralMunicipalities: 460,
} as const;

export const PROVINCE_STRUCTURE_OFFICIAL = {
  "prov-1": { districts: 14, metropolitanCities: 1, subMetropolitanCities: 2, municipalities: 46, ruralMunicipalities: 88, totalLocalLevels: 137, wards: 1157 },
  "prov-2": { districts: 8, metropolitanCities: 1, subMetropolitanCities: 3, municipalities: 73, ruralMunicipalities: 59, totalLocalLevels: 136, wards: 1271 },
  "prov-3": { districts: 13, metropolitanCities: 3, subMetropolitanCities: 1, municipalities: 41, ruralMunicipalities: 74, totalLocalLevels: 119, wards: 1121 },
  "prov-4": { districts: 11, metropolitanCities: 1, subMetropolitanCities: 0, municipalities: 26, ruralMunicipalities: 58, totalLocalLevels: 85, wards: 759 },
  "prov-5": { districts: 12, metropolitanCities: 0, subMetropolitanCities: 4, municipalities: 32, ruralMunicipalities: 73, totalLocalLevels: 109, wards: 983 },
  "prov-6": { districts: 10, metropolitanCities: 0, subMetropolitanCities: 0, municipalities: 25, ruralMunicipalities: 54, totalLocalLevels: 79, wards: 718 },
  "prov-7": { districts: 9, metropolitanCities: 0, subMetropolitanCities: 1, municipalities: 33, ruralMunicipalities: 54, totalLocalLevels: 88, wards: 734 },
} as const;
