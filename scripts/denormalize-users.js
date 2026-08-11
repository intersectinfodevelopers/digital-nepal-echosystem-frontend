/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
function load(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function save(p,data){fs.writeFileSync(p,JSON.stringify(data,null,2),'utf8')}
const users = load('data/users.json');
const wards = load('data/wards.json');
const municipalities = load('data/municipalities.json');
const districts = load('data/district.json');
const provinces = load('data/provinces.json');

const wardMap = new Map(wards.map(w=>[w.id,w]));
const munMap = new Map(municipalities.map(m=>[m.id,m]));
const distMap = new Map(districts.map(d=>[d.id,d]));
const provMap = new Map(provinces.map(p=>[p.id,p]));

const out = users.map(user=>{
  const u = Object.assign({},user);
  u.denorm = {};
  if(user.jurisdiction_type === 'WARD' && user.jurisdiction_id){
    const ward = wardMap.get(user.jurisdiction_id);
    if(ward){
      u.denorm.ward_id = ward.id;
      u.denorm.ward_name = ward.name_en || null;
      const mun = munMap.get(ward.municipality_id);
      if(mun){
        u.denorm.municipality_id = mun.id;
        u.denorm.municipality_name = mun.name_en || null;
        const dist = distMap.get(mun.district_id);
        if(dist){
          u.denorm.district_id = dist.id;
          u.denorm.district_name = dist.name_en || null;
          const prov = provMap.get(dist.province_id);
          if(prov){
            u.denorm.province_id = prov.id;
            u.denorm.province_name = prov.name_en || null;
          } else { u.denorm.province_id = null; u.denorm.province_name = null }
        } else { u.denorm.district_id = null; u.denorm.district_name = null; u.denorm.province_id = null; u.denorm.province_name = null }
      } else { u.denorm.municipality_id = null; u.denorm.municipality_name = null; u.denorm.district_id = null; u.denorm.district_name = null; u.denorm.province_id = null; u.denorm.province_name = null }
    } else {
      u.denorm.ward_id = null; u.denorm.ward_name = null; u.denorm.municipality_id = null; u.denorm.municipality_name = null; u.denorm.district_id = null; u.denorm.district_name = null; u.denorm.province_id = null; u.denorm.province_name = null
    }
  } else if(user.jurisdiction_type === 'LOCAL_BODY' && user.jurisdiction_id){
    const mun = munMap.get(user.jurisdiction_id);
    if(mun){
      u.denorm.municipality_id = mun.id;
      u.denorm.municipality_name = mun.name_en || null;
      const dist = distMap.get(mun.district_id);
      if(dist){
        u.denorm.district_id = dist.id;
        u.denorm.district_name = dist.name_en || null;
        const prov = provMap.get(dist.province_id);
        if(prov){ u.denorm.province_id = prov.id; u.denorm.province_name = prov.name_en || null } else { u.denorm.province_id = null; u.denorm.province_name = null }
      } else { u.denorm.district_id = null; u.denorm.district_name = null; u.denorm.province_id = null; u.denorm.province_name = null }
    } else { u.denorm.municipality_id = null; u.denorm.municipality_name = null; u.denorm.district_id = null; u.denorm.district_name = null; u.denorm.province_id = null; u.denorm.province_name = null }
  } else if(user.jurisdiction_type === 'PROVINCE' && user.jurisdiction_id){
    const prov = provMap.get(user.jurisdiction_id);
    if(prov){ u.denorm.province_id = prov.id; u.denorm.province_name = prov.name_en || null } else { u.denorm.province_id = null; u.denorm.province_name = null }
  } else {
    // central or unknown
    u.denorm = { ward_id: null, ward_name: null, municipality_id: null, municipality_name: null, district_id: null, district_name: null, province_id: null, province_name: null }
  }
  return u;
});

save('data/users.denorm.json', out);
console.log('Wrote data/users.denorm.json with', out.length, 'records');
