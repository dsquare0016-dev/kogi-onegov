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
    // Check positions columns
    const posCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'positions'
    `;
    console.log("POSITIONS COLUMNS:");
    console.log(posCols);

    // Check if nigerian_states has rows
    const states = await sql`SELECT COUNT(*) FROM nigerian_states`;
    console.log("STATES COUNT:", states[0].count);

    // Check if lgas has rows
    const lgas = await sql`SELECT COUNT(*) FROM lgas`;
    console.log("LGAS COUNT:", lgas[0].count);

    // Check user-defined types (enums) in the DB
    const enums = await sql`
      SELECT t.typname, array_agg(e.enumlabel) as labels
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      GROUP BY t.typname
    `;
    console.log("\nENUMS IN DATABASE:");
    console.log(enums);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
