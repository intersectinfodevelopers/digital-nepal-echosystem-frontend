/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
function load(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
const wards = load('data/wards.json');
const municipalities = load('data/municipalities.json');
const districts = load('data/district.json');
const provinces = load('data/provinces.json');

const munIds = new Set(municipalities.map(m => m.id));
const distIds = new Set(districts.map(d => d.id));
const provIds = new Set(provinces.map(p => p.id));

const invalidWards = wards.filter(w => !munIds.has(w.municipality_id)).map(w => ({ id: w.id, municipality_id: w.municipality_id }));
const invalidMunicipalities = municipalities.filter(m => !distIds.has(m.district_id)).map(m => ({ id: m.id, district_id: m.district_id }));
const invalidDistricts = districts.filter(d => !provIds.has(d.province_id)).map(d => ({ id: d.id, province_id: d.province_id }));

console.log(JSON.stringify({ invalidWards, invalidMunicipalities, invalidDistricts, counts: { wards: wards.length, municipalities: municipalities.length, districts: districts.length, provinces: provinces.length } }, null, 2));
