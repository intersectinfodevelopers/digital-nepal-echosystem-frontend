/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);

const citizens = readJson("data/citizens.json");
const wards = readJson("data/wards.json");
const municipalities = new Map(readJson("data/municipalities.json").map((item) => [item.id, item]));
const districts = new Map(readJson("data/district.json").map((item) => [item.id, item]));

const names = [
  ["Ram", "Bahadur", "Thapa"],
  ["Sita", "Kumari", "Limbu"],
  ["Krishna", "Prasad", "Adhikari"],
];
const occupations = ["FARMER", "BUSINESS", "GOVERNMENT"];
const literacy = ["BASIC", "INTERMEDIATE", "ADVANCED"];
const existingByWard = new Map();
for (const citizen of citizens) {
  existingByWard.set(citizen.ward_id, (existingByWard.get(citizen.ward_id) || 0) + 1);
}

let nextNumber = citizens.length + 1;
for (const ward of wards) {
  const municipality = municipalities.get(ward.municipality_id);
  const district = municipality ? districts.get(municipality.district_id) : null;
  const existing = existingByWard.get(ward.id) || 0;
  const needed = Math.max(0, 3 - existing);

  for (let index = 0; index < needed; index += 1) {
    const [first, middle, last] = names[index % names.length];
    const serial = String(nextNumber).padStart(4, "0");
    citizens.push({
      id: `cit-${serial}`,
      ward_id: ward.id,
      household_id: `hh-${serial}`,
      citizenship_number: `99${serial}01`,
      name_np: `${first} ${middle} ${last}`,
      name_en: `${first} ${middle} ${last}`,
      nid_masked: `****${serial.slice(-4)}`,
      sex: index % 2 === 0 ? "MALE" : "FEMALE",
      dob: `19${80 + index}-0${index + 1}-1${index + 1}`,
      tole: ward.name_en,
      digital_literacy: literacy[index % literacy.length],
      has_smartphone: index !== 0,
      consent_recorded_at: "2026-06-10T10:00:00Z",
      consent_channel: index === 0 ? "WARD_OFFICE" : "FIELD",
      nid_verified: index !== 2,
      is_active: true,
      sync_status: index === 2 ? "pending" : "synced",
      created_at: "2026-06-10T10:00:00Z",
      employment_category: occupations[index % occupations.length],
      place_name: ward.name_en,
    });
    nextNumber += 1;
  }
}

writeJson("data/citizens.json", citizens);
console.log(`Seeded ${citizens.length} citizen records across ${wards.length} wards.`);