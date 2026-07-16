"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "@/components/Map";

import citizens from "../../../../data/citizens.json";
import districts from "../../../../data/district.json";
import employment from "../../../../data/employment.json";
import municipalities from "../../../../data/municipalities.json";
import provinces from "../../../../data/provinces.json";
import wards from "../../../../data/wards.json";

const LeafletMap = dynamic(() => import("@/components/Map"), { ssr: false });

const provinceCoordinates = [
  { id: "prov-1", lat: 27.05, lng: 87.26 },
  { id: "prov-2", lat: 26.87, lng: 85.91 },
  { id: "prov-3", lat: 27.7, lng: 85.33 },
  { id: "prov-4", lat: 28.25, lng: 84.43 },
  { id: "prov-5", lat: 27.8, lng: 83 },
  { id: "prov-6", lat: 29, lng: 82.17 },
  { id: "prov-7", lat: 29.29, lng: 80.57 },
];

function getProvinceId(wardId: string) {
  const ward = wards.find((ward) => ward.id === wardId);
  const municipality = municipalities.find(
    (municipality) => municipality.id === ward?.municipality_id,
  );
  const district = districts.find(
    (district) => district.id === municipality?.district_id,
  );

  return district?.province_id;
}

function getTopEmployment(provinceCitizenIds: string[]) {
  const provinceEmployment = employment.filter((record) =>
    provinceCitizenIds.includes(record.citizen_id),
  );

  if (provinceEmployment.length === 0) return "No data";

  const categories = provinceEmployment.map((record) => record.category);
  const topCategory = categories.sort(
    (a, b) =>
      categories.filter((category) => category === b).length -
      categories.filter((category) => category === a).length,
  )[0];

  return topCategory.replaceAll("_", " ");
}

const provinceMarkers: MapMarker[] = provinces.map((province) => {
  const coordinates = provinceCoordinates.find(
    (item) => item.id === province.id,
  )!;
  const provinceMunicipalities = municipalities.filter((municipality) => {
    const district = districts.find(
      (district) => district.id === municipality.district_id,
    );
    return district?.province_id === province.id;
  });
  const provinceCitizens = citizens.filter(
    (citizen) => getProvinceId(citizen.ward_id) === province.id,
  );

  return {
    lat: coordinates.lat,
    lng: coordinates.lng,
    label: province.name_en,
    totalCitizens: provinceCitizens.length,
    totalMunicipalities: provinceMunicipalities.length,
    topEmploymentCategory: getTopEmployment(
      provinceCitizens.map((citizen) => citizen.id),
    ),
  };
});

export default function NationalMapPage() {
  return (
    <main className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">National Map</h1>
      <p className="text-gray-600">
        Province-level overview. Individual citizen locations are not displayed.
      </p>
      <LeafletMap
        center={[28.3949, 84.124]}
        zoom={7}
        markers={provinceMarkers}
        height="600px"
        showResetControl
      />
    </main>
  );
}
