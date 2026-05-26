const { execSync } = require('child_process');
try {
  const result = execSync('coral.exe sql --format json "SELECT schema_name, table_name FROM coral.tables LIMIT 2"');
  console.log('OUTPUT:', result.toString().substring(0, 500));
} catch (e) {
  console.log('Error:', e.message);
  console.log('Stderr:', e.stderr?.toString());
}
