/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
function load(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
function save(p,d){fs.writeFileSync(p,JSON.stringify(d,null,2),'utf8')}
const usersPath = 'data/users.json';
const backupPath = 'data/users.json.bak2';
fs.copyFileSync(usersPath, backupPath);
console.log('Backed up', usersPath, '->', backupPath);

const users = load(usersPath);
const provinces = load('data/provinces.json');
const districts = load('data/district.json');
const municipalities = load('data/municipalities.json');
const wards = load('data/wards.json');

const hasProvinceAdmin = (provId)=> users.some(u=>u.role==='PROVINCE_ADMIN' && u.jurisdiction_id===provId);
const hasMunicipalityAdmin = (munId)=> users.some(u=>u.role==='LOCAL_BODY_ADMIN' && u.jurisdiction_id===munId);

const distMap = new Map(districts.map(d=>[d.id,d]));
const munByProvince = new Map();
for(const mun of municipalities){
  const dist = distMap.get(mun.district_id);
  if(!dist) continue;
  const provId = dist.province_id;
  if(!munByProvince.has(provId)) munByProvince.set(provId,[]);
  munByProvince.get(provId).push(mun);
}

const wardMap = new Map(wards.map(w=>[w.id,w]));
const munMap = new Map(municipalities.map(m=>[m.id,m]));
const distMap2 = distMap;
const provMap = new Map(provinces.map(p=>[p.id,p]));

let added = 0;
for(const prov of provinces){
  // add province admin if missing
  if(!hasProvinceAdmin(prov.id)){
    const newProvUser = {
      id: `user-province-${prov.id}`,
      username: `${prov.id}.admin`,
      email: `${prov.id}.admin@${prov.id}.local`,
      password: 'provincepass',
      full_name: `Province Admin ${prov.name_en}`,
      phone: '9800000000',
      role: 'PROVINCE_ADMIN',
      jurisdiction_type: 'PROVINCE',
      jurisdiction_id: prov.id,
      is_active: true,
      denorm: {
        province_id: prov.id,
        province_name: prov.name_en
      }
    };
    users.push(newProvUser); added++;
  }
  // pick a municipality in this province
  const muns = munByProvince.get(prov.id) || [];
  if(muns.length===0) continue;
  // prefer METROPOLITAN or SUB_METROPOLITAN
  let pick = muns.find(m=>m.type==='METROPOLITAN' || m.type==='SUB_METROPOLITAN');
  if(!pick) pick = muns[0];
  if(!hasMunicipalityAdmin(pick.id)){
    const newMunUser = {
      id: `user-municipality-${pick.id}`,
      username: `admin.${pick.id}`,
      email: `admin.${pick.id}@${pick.id}.local`,
      password: 'municipalitypass',
      full_name: `Municipality Admin ${pick.name_en}`,
      phone: '9800000001',
      role: 'LOCAL_BODY_ADMIN',
      jurisdiction_type: 'MUNICIPALITY',
      jurisdiction_id: pick.id,
      is_active: true
    };
    // compute denorm for this new user
    const dist = distMap2.get(pick.district_id);
    const provId = dist ? dist.province_id : null;
    newMunUser.denorm = {
      ward_id: null,
      ward_name: null,
      municipality_id: pick.id,
      municipality_name: pick.name_en || null,
      district_id: dist ? dist.id : null,
      district_name: dist ? dist.name_en : null,
      province_id: provId,
      province_name: provId? (provMap.get(provId)||{}).name_en : null
    };
    users.push(newMunUser); added++;
  }
}

// Fix existing users' denorm for municipality-type jurisdiction entries and normalize keys
for(const u of users){
  if(u.jurisdiction_type === 'MUNICIPALITY' && u.jurisdiction_id){
    const mun = munMap.get(u.jurisdiction_id);
    if(mun){
      const dist = distMap2.get(mun.district_id);
      const prov = dist ? provMap.get(dist.province_id) : null;
      u.denorm = u.denorm || {};
      u.denorm.municipality_id = mun.id;
      u.denorm.municipality_name = mun.name_en || null;
      u.denorm.district_id = dist ? dist.id : null;
      u.denorm.district_name = dist ? dist.name_en : null;
      u.denorm.province_id = prov ? prov.id : null;
      u.denorm.province_name = prov ? prov.name_en : null;
    }
  }
  // ensure ward users have full denorm fields
  if(u.jurisdiction_type === 'WARD' && u.jurisdiction_id){
    const ward = wardMap.get(u.jurisdiction_id);
    const mun = ward ? munMap.get(ward.municipality_id) : null;
    const dist = mun ? distMap2.get(mun.district_id) : null;
    const prov = dist ? provMap.get(dist.province_id) : null;
    u.denorm = u.denorm || {};
    u.denorm.ward_id = ward ? ward.id : null;
    u.denorm.ward_name = ward ? ward.name_en : null;
    u.denorm.municipality_id = mun ? mun.id : null;
    u.denorm.municipality_name = mun ? mun.name_en : null;
    u.denorm.district_id = dist ? dist.id : null;
    u.denorm.district_name = dist ? dist.name_en : null;
    u.denorm.province_id = prov ? prov.id : null;
    u.denorm.province_name = prov ? prov.name_en : null;
  }
}

save(usersPath, users);
console.log('Updated', usersPath, 'added users:', added, 'total now', users.length);
