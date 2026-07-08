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
    const tables = ['support_conversations', 'projects', 'fund_releases', 'audit_cases', 'memos'];
    for (const table of tables) {
      const cols = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_name = ${table} AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      console.log(`\n=== ${table} ===`);
      cols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
    }
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await sql.end();
  }
}
run();
