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
  try {
    console.log('Migrating positions table...');
    await sql`
      ALTER TABLE positions 
      ADD COLUMN IF NOT EXISTS supervises UUID[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS max_approval_amount NUMERIC(15,2),
      ADD COLUMN IF NOT EXISTS scope VARCHAR(100) DEFAULT 'Own Department',
      ADD COLUMN IF NOT EXISTS dashboard_theme VARCHAR(50) DEFAULT 'Default',
      ADD COLUMN IF NOT EXISTS notification_access TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS ai_access TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active'
    `;
    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

run();
