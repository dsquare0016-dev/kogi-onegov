import postgres from 'postgres';

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  database: 'kogi_erp_test',
  username: 'postgres',
  password: 'Prince@123',
  max: 3,
});

async function run() {
  console.log('🏁 Adding unique constraint to system_settings...');
  try {
    await sql.unsafe(`
      ALTER TABLE system_settings 
      ADD CONSTRAINT system_settings_key_unique UNIQUE (setting_key);
    `);
    console.log('✅ Added unique constraint successfully!');
  } catch (err) {
    console.log('  ⚠️ Constraint notice (likely already exists):', err.message);
  } finally {
    await sql.end();
  }
}

run();
