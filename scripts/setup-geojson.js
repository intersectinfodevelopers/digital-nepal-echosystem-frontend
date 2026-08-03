
// 
//  Scans the public/geojson directory and regenerates public/manifest.json
//  so the app knows which province and district GeoJSON files are available.
 

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GEOJSON_DIR = path.join(ROOT, 'public', 'geojson');
const PROVINCES_DIR = path.join(GEOJSON_DIR, 'provinces');
const LOCAL_BODIES_DIR = path.join(GEOJSON_DIR, 'local-bodies');
const MANIFEST_PATH = path.join(ROOT, 'public', 'manifest.json');

// Helpers

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

// Province mapping: each district GeoJSON should contain a property that tells us which province it belongs to.  We try several known property
// names and fall back to a hard-coded lookup table so the script works even
// when the GeoJSON data is incomplete.

// District → province number (1-7),
const DISTRICT_PROVINCE_MAP = {
  // Province 1 (Koshi)
  taplejung: 1, panchthar: 1, ilam: 1, jhapa: 1, morang: 1, sunsari: 1,
  dhankuta: 1, terhathum: 1, sankhuwasabha: 1, bhojpur: 1, solukhumbu: 1,
  okhaldhunga: 1, khotang: 1, udayapur: 1,

  // Province 2 (Madhesh)
  saptari: 2, siraha: 2, dhanusha: 2, mahottari: 2, sarlahi: 2,
  rautahat: 2, bara: 2, parsa: 2,

  // Province 3 (Bagmati)
  sindhupalchok: 3, rasuwa: 3, nuwakot: 3, dhading: 3, kathmandu: 3,
  bhaktapur: 3, lalitpur: 3, makawanpur: 3, chitawan: 3, dolakha: 3,
  ramechhap: 3, sindhuli: 3, kabhrepalanchok: 3,

  // Province 4 (Gandaki)
  gorkha: 4, manang: 4, mustang: 4, myagdi: 4, kaski: 4, lamjung: 4,
  tanahu: 4, syangja: 4, parbat: 4, baglung: 4, nawalparasi4: 4,

  // Province 5 (Lumbini)
  nawalparasi5: 5, rupandehi: 5, kapilbastu: 5, arghakhanchi: 5, gulmi: 5,
  palpa: 5, dang: 5, rolpa: 5, pyuthan: 5, banke: 5, bardiya: 5,
  rukum5: 5,

  // Province 6 (Karnali)
  dolpa: 6, mugu: 6, humla: 6, jumla: 6, kalikot: 6, dailekh: 6,
  jajarkot: 6, surkhet: 6, salyan: 6, rukum6: 6,

  // Province 7 (Sudurpashchim)
  kailali: 7, doti: 7, achham: 7, bajura: 7, bajhang: 7, dadeldhura: 7,
  baitadi: 7, darchula: 7, kanchanpur: 7,
};

function resolveProvince(fileName, geoJson) {
  const baseName = path.basename(fileName, '.json').toLowerCase();

  // 1. Try to read province from first feature's properties
  if (geoJson && geoJson.features && geoJson.features.length > 0) {
    const props = geoJson.features[0].properties || {};
    const raw =
      props.Province ??
      props.province ??
      props.PROVINCE ??
      props.FIRST_PROV ??
      props.id ??
      null;
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1 && n <= 7) return n;
  }

  // 2. Fall back 
  return DISTRICT_PROVINCE_MAP[baseName] ?? null;
}

// Build manifest

function buildManifest() {
  // Provinces
  const provinceFiles = listJsonFiles(PROVINCES_DIR).map(
    (f) => `geojson/provinces/${f}`
  );

  // Districts — group by province
  const districtsByProvince = {};
  const districtFiles = listJsonFiles(LOCAL_BODIES_DIR);

  for (const fileName of districtFiles) {
    const filePath = path.join(LOCAL_BODIES_DIR, fileName);
    // Read only enough to determine province (avoid slow full-parse on large files)
    const geoJson = readJsonSafe(filePath);
    const provNum = resolveProvince(fileName, geoJson);

    if (provNum === null) {
      console.warn(`  [setup-geojson] Could not determine province for: ${fileName} — skipping`);
      continue;
    }

    const key = `prov-${provNum}_districts`;
    if (!districtsByProvince[key]) districtsByProvince[key] = [];
    districtsByProvince[key].push(`geojson/local-bodies/${fileName}`);
  }

  // Sort district lists for deterministic output
  for (const key of Object.keys(districtsByProvince)) {
    districtsByProvince[key].sort();
  }

  return {
    provinces: provinceFiles,
    districts: districtsByProvince,
    municipalities: {},
  };
}

//  Main

try {
  console.log('[setup-geojson] Scanning GeoJSON files...');

  if (!fs.existsSync(GEOJSON_DIR)) {
    console.warn('[setup-geojson] public/geojson directory not found — skipping manifest generation.');
    process.exit(0);
  }

  const manifest = buildManifest();

  const provinceCount = manifest.provinces.length;
  const districtCount = Object.values(manifest.districts).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(
    `[setup-geojson] manifest.json written — ${provinceCount} provinces, ${districtCount} districts.`
  );
} catch (err) {
  console.error('[setup-geojson] Error generating manifest:', err.message);
  process.exit(1);
}
