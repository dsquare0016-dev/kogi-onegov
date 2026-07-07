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
    const counts = await sql`
      SELECT type, COUNT(*) as count
      FROM organizations
      GROUP BY type
    `;
    console.log("ORGANIZATION COUNTS BY TYPE:");
    console.log(counts);

    const samples = await sql`
      SELECT id, name, type, parent_id
      FROM organizations
      LIMIT 10
    `;
    console.log("\nSAMPLE ORGANIZATIONS:");
    console.log(samples);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
