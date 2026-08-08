const fs = require('fs');
const path = require('path');

function fail(msg) {
  console.error('SMOKE TEST FAILED:', msg);
  process.exit(1);
}

// Check Avatar component exists and exports Avatar
const avatarPath = path.join(__dirname, '..', 'src', 'components', 'ui', 'Avatar.tsx');
if (!fs.existsSync(avatarPath)) {
  fail('Avatar component not found at src/components/ui/Avatar.tsx');
}

const avatarSrc = fs.readFileSync(avatarPath, 'utf8');
if (!/export\s+function\s+Avatar\s*\(/.test(avatarSrc)) {
  fail('Avatar component does not export `Avatar` function');
}

console.log('SMOKE TESTS PASSED: Basic component checks OK');
process.exit(0);
