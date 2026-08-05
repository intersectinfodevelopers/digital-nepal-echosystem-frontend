"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";

export type MapLevel = "country" | "province" | "district";

export interface MapSelection {
  level: MapLevel;
  provinceId: string | null;
  provinceLabel: string | null;
  districtName: string | null;
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
  });

  const selectDistrict = useCallback(
    (provinceId: string, provinceLabel: string, districtName: string) => {
      setSelection({
        level: "district",
        provinceId,
        provinceLabel,
        districtName,
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
    });
  }, []);

  const selectProvince = useCallback((id: string, label: string) => {
    setSelection({
      level: "province",
      provinceId: id,
      provinceLabel: label,
      districtName: null,
    });
  }, []);

  const value = useMemo(
    () => ({
      selection,
      setSelection,
      selectProvince,
      selectDistrict,
      resetToCountry,
    }),
    [selection, selectProvince, selectDistrict, resetToCountry],
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
