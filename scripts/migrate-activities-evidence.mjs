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
  console.log('🏁 Adding missing columns to activities table...');
  try {
    await sql.unsafe(`
      ALTER TABLE activities 
      ADD COLUMN IF NOT EXISTS location_lga VARCHAR(100) DEFAULT 'statewide',
      ADD COLUMN IF NOT EXISTS evidence_file_url TEXT;
    `);
    console.log('✅ Alter Table Activities Succeeded!');
  } catch (err) {
    console.error('❌ Alter Table Failed:', err.message);
  } finally {
    await sql.end();
  }
}

run();
