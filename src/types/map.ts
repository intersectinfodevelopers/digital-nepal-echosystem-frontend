export type MapLevel = "country" | "province" | "district" | "localBody";

export interface MapSelection {
  level: MapLevel;
  provinceId: string | null;
  provinceLabel: string | null;
  districtName: string | null;
  localBodyName: string | null;
  localBodyType: string | null;
}

export type SelectionShape = MapSelection;

export interface MapSelectionContextType {
  selection: MapSelection;
  setSelection: React.Dispatch<React.SetStateAction<MapSelection>>;
  selectProvince: (id: string, label: string) => void;
  selectDistrict: (
    provinceId: string,
    provinceLabel: string,
    districtName: string,
  ) => void;
  selectLocalBody: (
    provinceId: string,
    provinceLabel: string,
    districtName: string,
    localBodyName: string,
    localBodyType?: string,
  ) => void;
  resetToCountry: () => void;
}

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  description?: string;
  totalCitizens?: number;
  totalMunicipalities?: number;
  topEmploymentCategory?: string;
  type?: "selected" | "place";
}

export interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  showResetControl?: boolean;
  vectorTilesUrl?: string;
  onClick?: (lat: number, lng: number) => void;
}
