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
    // 1. Find FKs referencing ministries(id)
    const ministryFks = await sql`
      SELECT tc.table_name AS table, kcu.column_name AS column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.constraint_schema = kcu.constraint_schema
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = rc.unique_constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'ministries'
        AND ccu.column_name = 'id';
    `;
    console.log("FOREIGN KEYS REFERENCING ministries(id):");
    console.log(ministryFks);

    // 2. Find case-insensitive duplicates in ministries
    const duplicateMinistries = await sql`
      SELECT LOWER(TRIM(name)) as clean_name, COUNT(*), array_agg(id ORDER BY id) as ids, array_agg(name ORDER BY id) as names
      FROM ministries
      GROUP BY LOWER(TRIM(name))
      HAVING COUNT(*) > 1
    `;
    console.log("\nCASE-INSENSITIVE DUPLICATE MINISTRIES IN ministries:");
    console.log(duplicateMinistries);

    // 3. Find case-insensitive duplicates in organizations
    const duplicateOrgs = await sql`
      SELECT LOWER(TRIM(name)) as clean_name, type, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid) as clean_parent_id, COUNT(*), array_agg(id ORDER BY id) as ids, array_agg(name ORDER BY id) as names
      FROM organizations
      GROUP BY LOWER(TRIM(name)), type, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid)
      HAVING COUNT(*) > 1
    `;
    console.log("\nCASE-INSENSITIVE DUPLICATE ORGANIZATIONS IN organizations:");
    console.log(duplicateOrgs);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
