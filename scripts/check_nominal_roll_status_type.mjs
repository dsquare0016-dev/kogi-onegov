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
    const r = await sql`
      SELECT column_name, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'nominal_roll' AND column_name IN ('status', 'staff_type')
    `;
    r.forEach(x => console.log(`${x.column_name}: ${x.udt_name}`));

    for (const x of r) {
      const vals = await sql`
        SELECT e.enumlabel
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = ${x.udt_name}
      `;
      console.log(`Values for ${x.udt_name}:`);
      vals.forEach(v => console.log(`  ${v.enumlabel}`));
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
