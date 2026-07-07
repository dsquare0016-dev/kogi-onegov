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
      SELECT name, COUNT(*) as count, array_agg(id ORDER BY id) AS ids
      FROM ministries
      GROUP BY name
      HAVING COUNT(*) > 1
    `;
    console.log("DUPLICATE MINISTRIES IN ministries TABLE:");
    console.log(counts);

    const allMinistries = await sql`
      SELECT id, name, code, short_name
      FROM ministries
      ORDER BY name
    `;
    console.log("\nALL MINISTRIES:");
    console.log(allMinistries);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
