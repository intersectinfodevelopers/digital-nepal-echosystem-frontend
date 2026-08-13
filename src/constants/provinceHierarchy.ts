import districtLocalBodies from "@/constants/districtLocalBodies.json";

export interface ProvinceNode {
  id: string;
  label: string;
  color: string;
  districts: string[];
}

export interface LocalBody {
  name: string;
  type: string;
}

export const PROVINCE_HIERARCHY: ProvinceNode[] = [
  {
    id: "1",
    label: "Koshi",
    color: "#E53E3E",
    districts: [
      "Bhojpur",
      "Dhankuta",
      "Ilam",
      "Jhapa",
      "Khotang",
      "Morang",
      "Okhaldhunga",
      "Panchthar",
      "Sankhuwasabha",
      "Solukhumbu",
      "Sunsari",
      "Taplejung",
      "Terhathum",
      "Udayapur",
    ],
  },
  {
    id: "2",
    label: "Madhesh",
    color: "#8D6E63",
    districts: [
      "Bara",
      "Dhanusha",
      "Mahottari",
      "Parsa",
      "Rautahat",
      "Saptari",
      "Sarlahi",
      "Siraha",
    ],
  },
  {
    id: "3",
    label: "Bagmati",
    color: "#3182CE",
    districts: [
      "Bhaktapur",
      "Chitawan",
      "Dhading",
      "Dolakha",
      "Kabhrepalanchok",
      "Kathmandu",
      "Lalitpur",
      "Makawanpur",
      "Nuwakot",
      "Ramechhap",
      "Rasuwa",
      "Sindhuli",
      "Sindhupalchok",
    ],
  },
  {
    id: "4",
    label: "Gandaki",
    color: "#DD6B20",
    districts: [
      "Baglung",
      "Gorkha",
      "Kaski",
      "Lamjung",
      "Manang",
      "Mustang",
      "Myagdi",
      "Nawalparasi (East)",
      "Parbat",
      "Syangja",
      "Tanahu",
    ],
  },
  {
    id: "5",
    label: "Lumbini",
    color: "#805AD5",
    districts: [
      "Arghakhanchi",
      "Banke",
      "Bardiya",
      "Dang",
      "Gulmi",
      "Kapilbastu",
      "Nawalparasi (West)",
      "Palpa",
      "Pyuthan",
      "Rolpa",
      "Rukum (East)",
      "Rupandehi",
    ],
  },
  {
    id: "6",
    label: "Karnali",
    color: "#38A169",
    districts: [
      "Dailekh",
      "Dolpa",
      "Humla",
      "Jajarkot",
      "Jumla",
      "Kalikot",
      "Mugu",
      "Rukum (West)",
      "Salyan",
      "Surkhet",
    ],
  },
  {
    id: "7",
    label: "Sudurpashchim",
    color: "#D53F8C",
    districts: [
      "Achham",
      "Baitadi",
      "Bajhang",
      "Bajura",
      "Dadeldhura",
      "Darchula",
      "Doti",
      "Kailali",
      "Kanchanpur",
    ],
  },
];

export function normalizeDistrictKey(district: string): string {
  return district.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function getLocalBodies(district: string): LocalBody[] {
  const key = normalizeDistrictKey(district);
  const data = districtLocalBodies as Record<string, LocalBody[]>;
  return data[key] ?? [];
}
