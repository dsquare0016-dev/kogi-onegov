import postgres from "postgres";

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  database: 'kogi_erp_test',
  username: 'postgres',
  password: 'Prince@123'
});

async function run() {
  const tablesToCheck = [
    'departments', 'units', 'development_objectives', 'budget_lines',
    'programmes', 'projects', 'activities'
  ];

  for (const t of tablesToCheck) {
    try {
      const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${t}
        ORDER BY ordinal_position
      `;
      console.log(`\nTABLE ${t.toUpperCase()}:`);
      if (cols.length === 0) {
        console.log("  (Does not exist or has no columns)");
      } else {
        cols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
      }
    } catch (err) {
      console.error(`Error for ${t}:`, err.message);
    }
  }
  await sql.end();
  process.exit(0);
}

run();
