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
  console.log('🏁 Adding missing columns to tasks table...');
  try {
    await sql.unsafe(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Medium',
      ADD COLUMN IF NOT EXISTS start_date DATE;
    `);
    console.log('✅ Alter Table Tasks Succeeded!');
  } catch (err) {
    console.error('❌ Alter Table Failed:', err.message);
  } finally {
    await sql.end();
  }
}

run();
