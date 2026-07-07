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
    const constraints = await sql`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'ministries'::regclass
    `;
    console.log("MINISTRIES TABLE CONSTRAINTS:");
    console.log(constraints);

    const dupRowsCheck = await sql`
      SELECT id, COUNT(*) 
      FROM ministries 
      GROUP BY id 
      HAVING COUNT(*) > 1
    `;
    console.log("\nDUPLICATE IDS IN ministries:");
    console.log(dupRowsCheck);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
