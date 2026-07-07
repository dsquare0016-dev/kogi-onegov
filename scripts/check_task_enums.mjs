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
    const enums = await sql`
      SELECT t.typname, e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname IN ('task_status', 'workflow_status')
      ORDER BY t.typname, e.enumsortorder
    `;
    console.log("ENUM VALUES:");
    enums.forEach(ev => {
      console.log(`  ${ev.typname}: ${ev.enumlabel}`);
    });
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
