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
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'financial_metrics'
    `;
    console.log("FINANCIAL_METRICS COLUMNS:");
    console.log(cols);

    const rows = await sql`SELECT * FROM financial_metrics LIMIT 5`;
    console.log("FINANCIAL_METRICS ROWS:");
    console.log(rows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
