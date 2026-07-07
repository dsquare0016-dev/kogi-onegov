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
  console.log('🏁 Adding missing columns to system_modules...');
  try {
    await sql.unsafe(`
      ALTER TABLE system_modules 
      ADD COLUMN IF NOT EXISTS module_key VARCHAR(100),
      ADD COLUMN IF NOT EXISTS updated_by UUID;
    `);
    console.log('✅ Alter Table system_modules Succeeded!');
  } catch (err) {
    console.error('❌ Alter Table Failed:', err.message);
  } finally {
    await sql.end();
  }
}

run();
