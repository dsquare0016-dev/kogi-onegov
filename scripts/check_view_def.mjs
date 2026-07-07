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
    const viewDef = await sql`
      SELECT view_definition 
      FROM information_schema.views 
      WHERE table_name = 'ministries'
    `;
    console.log("VIEW DEFINITION FOR ministries:");
    console.log(viewDef[0]?.view_definition);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
