/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
function load(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
const users = load('data/users.json');
const wards = load('data/wards.json');
const municipalities = load('data/municipalities.json');
const districts = load('data/district.json');
const provinces = load('data/provinces.json');

const wardIds = new Set(wards.map(w=>w.id));
const munIds = new Set(municipalities.map(m=>m.id));
const distIds = new Set(districts.map(d=>d.id));
const provIds = new Set(provinces.map(p=>p.id));

const problems = [];
users.forEach(u=>{
  const d = u.denorm || {};
  if(u.jurisdiction_type === 'WARD'){
    if(u.jurisdiction_id && !wardIds.has(u.jurisdiction_id)) problems.push({user:u.id,problem:'jurisdiction_id missing ward',value:u.jurisdiction_id});
    if(d.municipality_id && !munIds.has(d.municipality_id)) problems.push({user:u.id,problem:'denorm.municipality_id missing',value:d.municipality_id});
    if(d.district_id && !distIds.has(d.district_id)) problems.push({user:u.id,problem:'denorm.district_id missing',value:d.district_id});
    if(d.province_id && !provIds.has(d.province_id)) problems.push({user:u.id,problem:'denorm.province_id missing',value:d.province_id});
  }
  if(u.jurisdiction_type === 'LOCAL_BODY'){
    if(u.jurisdiction_id && !munIds.has(u.jurisdiction_id)) problems.push({user:u.id,problem:'jurisdiction_id missing municipality',value:u.jurisdiction_id});
    if(d.district_id && !distIds.has(d.district_id)) problems.push({user:u.id,problem:'denorm.district_id missing',value:d.district_id});
    if(d.province_id && !provIds.has(d.province_id)) problems.push({user:u.id,problem:'denorm.province_id missing',value:d.province_id});
  }
  if(u.jurisdiction_type === 'PROVINCE'){
    if(u.jurisdiction_id && !provIds.has(u.jurisdiction_id)) problems.push({user:u.id,problem:'jurisdiction_id missing province',value:u.jurisdiction_id});
  }
});

console.log(JSON.stringify({count:users.length,problems},null,2));
