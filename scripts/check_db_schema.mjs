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
    const orgCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'organizations'
      ORDER BY ordinal_position
    `;
    console.log("ORGANIZATIONS COLUMNS:");
    orgCols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));

    // Get enum values for org_type or type
    const enumVals = await sql`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'org_type'
    `;
    console.log("\nORG_TYPE ENUM VALUES:");
    enumVals.forEach(v => console.log(`  ${v.enumlabel}`));

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log("\nALL TABLES:");
    console.log(tables.map(t => t.table_name).join(", "));

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
