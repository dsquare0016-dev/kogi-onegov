import postgres from "postgres";

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  database: 'kogi_erp_test',
  username: 'postgres',
  password: 'Prince@123'
});

async function run() {
  try {
    const cols = await sql`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('development_plan_pillars', 'strategic_objectives')
      ORDER BY table_name, ordinal_position
    `;
    cols.forEach(c => {
      console.log(`${c.table_name}.${c.column_name} (${c.data_type})`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
