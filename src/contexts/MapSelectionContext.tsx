"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

export type MapLevel = "country" | "province" | "district" | "localBody";

export interface MapSelection {
  level: MapLevel;
  provinceId: string | null;
  provinceLabel: string | null;
  districtName: string | null;
  localBodyName: string | null;
  localBodyType: string | null;
}

interface MapSelectionContextType {
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

const MapSelectionContext = createContext<MapSelectionContextType | undefined>(
  undefined,
);

export function MapSelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<MapSelection>({
    level: "country",
    provinceId: null,
    provinceLabel: null,
    districtName: null,
    localBodyName: null,
    localBodyType: null,
  });

  const selectLocalBody = useCallback(
    (
      provinceId: string,
      provinceLabel: string,
      districtName: string,
      localBodyName: string,
      localBodyType: string | null = null,
    ) => {
      setSelection({
        level: "localBody",
        provinceId,
        provinceLabel,
        districtName,
        localBodyName,
        localBodyType,
      });
    },
    [],
  );

  const selectDistrict = useCallback(
    (provinceId: string, provinceLabel: string, districtName: string) => {
      setSelection({
        level: "district",
        provinceId,
        provinceLabel,
        districtName,
        localBodyName: null,
        localBodyType: null,
      });
    },
    [],
  );

  const resetToCountry = useCallback(() => {
    setSelection({
      level: "country",
      provinceId: null,
      provinceLabel: null,
      districtName: null,
      localBodyName: null,
      localBodyType: null,
    });
  }, []);

  const selectProvince = useCallback((id: string, label: string) => {
    setSelection({
      level: "province",
      provinceId: id,
      provinceLabel: label,
      districtName: null,
      localBodyName: null,
      localBodyType: null,
    });
  }, []);

  const value = useMemo(
    () => ({
      selection,
      setSelection,
      selectProvince,
      selectDistrict,
      selectLocalBody,
      resetToCountry,
    }),
    [
      selection,
      selectProvince,
      selectDistrict,
      selectLocalBody,
      resetToCountry,
    ],
  );

  return (
    <MapSelectionContext.Provider value={value}>
      {children}
    </MapSelectionContext.Provider>
  );
}

export function useMapSelection() {
  const context = useContext(MapSelectionContext);
  if (!context) {
    throw new Error(
      "useMapSelection must be used within a MapSelectionProvider",
    );
  }
  return context;
}
