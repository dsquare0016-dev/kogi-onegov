import postgres from "postgres";

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  database: 'kogi_erp_test',
  username: 'postgres',
  password: 'Prince@123'
});

async function run() {
  const tables = ['lgas', 'system_modules', 'audit_logs', 'organizations', 'budget_years', 'budget_line_items'];
  try {
    for (const t of tables) {
      const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${t}
        ORDER BY ordinal_position
      `;
      console.log(`\nTable: ${t}`);
      cols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
