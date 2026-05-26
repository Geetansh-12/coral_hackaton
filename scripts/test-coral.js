const { execSync } = require('child_process');
try {
  const result = execSync('coral.exe sql --format json "SELECT * FROM \'test.csv\'"');
  console.log(result.toString());
} catch (e) {
  console.log('Error:', e.message);
  console.log('Stderr:', e.stderr?.toString());
}
