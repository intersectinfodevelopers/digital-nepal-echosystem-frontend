/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);

const districts = readJson("data/district.json");
const municipalities = readJson("data/municipalities.json");
const wards = readJson("data/wards.json");
const provinceNames = {
  "prov-2": ["Madhesh", "Dhanusha", ["Janakpurdham Sub-Metropolitan City", "Bateshwar Rural Municipality"]],
  "prov-3": ["Bagmati", "Kathmandu", ["Kathmandu Metropolitan City", "Kakani Rural Municipality"]],
  "prov-4": ["Gandaki", "Kaski", ["Pokhara Metropolitan City", "Machhapuchchhre Rural Municipality"]],
  "prov-5": ["Lumbini", "Rupandehi", ["Butwal Sub-Metropolitan City", "Ruru Rural Municipality"]],
  "prov-6": ["Karnali", "Surkhet", ["Birendranagar Municipality", "Chandannath Municipality"]],
  "prov-7": ["Sudurpashchim", "Kailali", ["Dhangadhi Sub-Metropolitan City", "Bhimdatta Municipality"]],
};

const nextId = (items, prefix) => {
  const numbers = items
    .map((item) => item.id.match(new RegExp(`^${prefix}-(\\d+)$`)))
    .filter(Boolean)
    .map((match) => Number(match[1]));
  return Math.max(0, ...numbers) + 1;
};

let nextDistrict = nextId(districts, "dist");
let nextMunicipality = nextId(municipalities, "mun");
let nextWard = nextId(wards, "ward");

for (const [provinceId, [provinceName, districtName, municipalityNames]] of Object.entries(provinceNames)) {
  if (!districts.some((district) => district.province_id === provinceId)) {
    districts.push({ id: `dist-${String(nextDistrict).padStart(2, "0")}`, province_id: provinceId, name_np: districtName, name_en: districtName });
    nextDistrict += 1;
  }
  const district = districts.find((item) => item.province_id === provinceId);
  for (const municipalityName of municipalityNames) {
    if (municipalities.some((municipality) => municipality.name_en === municipalityName)) continue;
    const municipalityId = `mun-${String(nextMunicipality).padStart(3, "0")}`;
    municipalities.push({ id: municipalityId, district_id: district.id, name_np: municipalityName, name_en: municipalityName, type: municipalityName.includes("Rural") ? "RURAL_MUNICIPALITY" : municipalityName.includes("Metropolitan") ? "METROPOLITAN" : municipalityName.includes("Sub-Metropolitan") ? "SUB_METROPOLITAN" : "MUNICIPALITY" });
    nextMunicipality += 1;
    for (let wardNo = 1; wardNo <= 2; wardNo += 1) {
      wards.push({ id: `ward-${String(nextWard).padStart(3, "0")}`, municipality_id: municipalityId, ward_no: wardNo, name_np: `${municipalityName} Ward No. ${wardNo}`, name_en: `${municipalityName} Ward No. ${wardNo}` });
      nextWard += 1;
    }
  }
}

const municipalityWardIds = new Set(wards.map((ward) => ward.municipality_id));
for (const municipality of municipalities) {
  if (municipalityWardIds.has(municipality.id)) continue;
  wards.push({ id: `ward-${String(nextWard).padStart(3, "0")}`, municipality_id: municipality.id, ward_no: 1, name_np: `${municipality.name_en} Ward No. 1`, name_en: `${municipality.name_en} Ward No. 1` });
  nextWard += 1;
}

writeJson("data/district.json", districts);
writeJson("data/municipalities.json", municipalities);
writeJson("data/wards.json", wards);
console.log(`Prepared ${districts.length} districts, ${municipalities.length} municipalities, and ${wards.length} wards.`);