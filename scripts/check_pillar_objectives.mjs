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
    const colsPillars = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'development_pillars'
    `;
    console.log("DEVELOPMENT_PILLARS COLUMNS:");
    console.log(colsPillars.map(c => `${c.column_name} (${c.data_type})`));

    const colsObjs = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'development_objectives'
    `;
    console.log("DEVELOPMENT_OBJECTIVES COLUMNS:");
    console.log(colsObjs.map(c => `${c.column_name} (${c.data_type})`));

    const colsKpis = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'development_kpis'
    `;
    console.log("DEVELOPMENT_KPIS COLUMNS:");
    console.log(colsKpis.map(c => `${c.column_name} (${c.data_type})`));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
