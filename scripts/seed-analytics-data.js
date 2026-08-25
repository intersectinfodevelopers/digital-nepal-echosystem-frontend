/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const writeJson = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
const citizens = readJson("data/citizens.json");
const wards = new Map(readJson("data/wards.json").map((item) => [item.id, item]));
const hash = (value) => [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
const pick = (items, key) => items[hash(key) % items.length];
const today = "2026-08-26";

const existingHouseholds = readJson("data/households.json");
const householdsById = new Map(existingHouseholds.map((item) => [item.id, item]));
const construction = ["RCC", "BRICK", "STONE", "MUD", "WOOD", "TEMPORARY"];
const water = ["PIPED", "WELL", "RIVER", "RAIN", "NONE"];
const poverty = ["BELOW", "NEAR", "ABOVE"];
const income = ["UNDER_5K", "5K_10K", "10K_25K", "25K_50K", "50K_100K", "OVER_100K"];
for (const citizen of citizens) {
  if (!citizen.household_id) continue;
  if (!householdsById.has(citizen.household_id)) {
    const key = citizen.household_id;
    householdsById.set(key, {
      id: key,
      ward_id: citizen.ward_id,
      head_citizen_id: citizen.id,
      monthly_income_band: pick(income, key),
      poverty_class: pick(poverty, key),
      house_type: pick(["OWNED", "RENTED", "GOVT", "SHARED"], key),
      construction_type: pick(construction, key),
      room_count: 2 + (hash(key) % 5),
      electricity: pick(["GRID", "SOLAR", "MICRO_HYDRO", "NONE"], key),
      water_source: pick(water, key),
      has_bank_account: hash(key) % 100 < 58,
    });
  }
}
writeJson("data/households.json", [...householdsById.values()]);

const employmentRows = readJson("data/employment.json");
const employmentIds = new Set(employmentRows.map((item) => item.citizen_id));
const categories = ["FARMER", "SELF_EMPLOYED", "PRIVATE_SECTOR", "GOVERNMENT", "FOREIGN_ABROAD", "STUDENT", "HOMEMAKER", "UNEMPLOYED", "RETIRED"];
const countries = ["AE", "QA", "MY", "SA", "KR", "JP"];
for (const citizen of citizens) {
  if (employmentIds.has(citizen.id)) continue;
  const category = pick(categories, citizen.id);
  employmentRows.push({
    citizen_id: citizen.id,
    category,
    income_band: pick(income, `${citizen.id}-income`),
    sub_fields: category === "FOREIGN_ABROAD" ? { country_code: pick(countries, citizen.id) } : {},
  });
}
writeJson("data/employment.json", employmentRows);

const educationRows = readJson("data/education.json");
const educationIds = new Set(educationRows.map((item) => item.citizen_id));
const levels = ["NO_FORMAL", "BASIC_1_5", "BASIC_6_8", "SECONDARY_9_10", "HIGHER_SECONDARY_11_12", "BACHELOR", "MASTER", "TECHNICAL_CERTIFICATE"];
const dropoutReasons = ["ECONOMIC_HARDSHIP", "DISTANCE_TO_SCHOOL", "HOUSEHOLD_WORK", "EARLY_MARRIAGE", "MIGRATION"];
for (const citizen of citizens) {
  if (educationIds.has(citizen.id)) continue;
  const dropout = hash(`${citizen.id}-dropout`) % 100 < 7;
  educationRows.push({
    citizen_id: citizen.id,
    level: pick(levels, `${citizen.id}-level`),
    institution_name: `Community School ${String((hash(citizen.id) % 24) + 1).padStart(2, "0")}`,
    institution_type: pick(["GOVERNMENT", "PRIVATE", "COMMUNITY"], `${citizen.id}-institution`),
    study_location: wards.get(citizen.ward_id)?.name_en ?? "Local Ward",
    is_dropout: dropout,
    dropout_reason: dropout ? pick(dropoutReasons, `${citizen.id}-reason`) : null,
    has_scholarship: hash(`${citizen.id}-scholarship`) % 100 < 14,
  });
}
writeJson("data/education.json", educationRows);

const disabilityRows = readJson("data/disability.json");
const disabilityIds = new Set(disabilityRows.map((item) => item.citizen_id));
const disabilityTypes = ["PHYSICAL", "SENSORY_VISION", "SENSORY_HEARING", "INTELLECTUAL", "PSYCHOSOCIAL", "SPEECH", "MULTIPLE"];
for (const citizen of citizens) {
  if (disabilityIds.has(citizen.id) || hash(`${citizen.id}-disability`) % 100 >= 7) continue;
  disabilityRows.push({
    citizen_id: citizen.id,
    disability_type: pick(disabilityTypes, citizen.id),
    severity_body: 1 + (hash(`${citizen.id}-body`) % 3),
    severity_activity: 1 + (hash(`${citizen.id}-activity`) % 3),
    severity_participation: 1 + (hash(`${citizen.id}-participation`) % 3),
    certificate_no: hash(citizen.id) % 2 ? `D-${String(hash(citizen.id) % 100000).padStart(5, "0")}` : null,
    certificate_expiry: "2031-12-31",
  });
}
writeJson("data/disability.json", disabilityRows);

const cardRows = readJson("data/id-cards.json");
const cardIds = new Set(cardRows.map((item) => item.citizen_id));
const cardTypes = ["FARMER", "SENIOR_CITIZEN", "SINGLE_WOMAN", "DISABILITY", "UNEMPLOYMENT"];
for (const citizen of citizens) {
  if (cardIds.has(citizen.id) || hash(`${citizen.id}-card`) % 100 >= 18) continue;
  const issued = hash(`${citizen.id}-issued`) % 100 < 72;
  cardRows.push({
    id: `card-${citizen.id.replace("cit-", "")}`,
    citizen_id: citizen.id,
    card_type: pick(cardTypes, `${citizen.id}-type`),
    status: issued ? "COLLECTED" : "PENDING_APPROVAL",
    qr_hash: `qr-${hash(citizen.id).toString(16)}`,
    issued_at: issued ? today : null,
    expires_at: issued ? "2031-08-26" : null,
    collected_at: issued ? today : null,
  });
}
writeJson("data/id-cards.json", cardRows);

const grievanceRows = readJson("data/grievances.json");
const grievanceIds = new Set(grievanceRows.map((item) => item.citizen_id));
const grievanceCategories = ["DATA_INACCURACY", "BENEFIT_DENIAL", "SERVICE_DELAY", "DOCUMENT_ERROR", "OTHER"];
const grievanceStatuses = ["RECEIVED", "IN_PROGRESS", "RESOLVED_WARD", "REFERRED_JUDICIAL", "CLOSED"];
for (const citizen of citizens) {
  if (grievanceIds.has(citizen.id) || hash(`${citizen.id}-grievance`) % 100 >= 8) continue;
  const serial = String(grievanceRows.length + 1).padStart(6, "0");
  grievanceRows.push({
    id: `grv-${serial}`,
    tracking_code: `GRV-2026-${serial}`,
    citizen_id: citizen.id,
    category: pick(grievanceCategories, citizen.id),
    status: pick(grievanceStatuses, `${citizen.id}-status`),
    filed_at: "2026-06-15T10:00:00Z",
    escalation_level: "WARD",
  });
}
writeJson("data/grievances.json", grievanceRows);

console.log(JSON.stringify({ households: householdsById.size, employment: employmentRows.length, education: educationRows.length, disability: disabilityRows.length, idCards: cardRows.length, grievances: grievanceRows.length }));
