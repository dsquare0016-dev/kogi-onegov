import postgres from "postgres";

// Adjust connection parameters as needed
const sql = postgres({
  host: "127.0.0.1",
  port: 5432,
  database: "kogi_erp_test",
  username: "postgres",
  password: "Prince@123",
});

/**
 * Returns all foreign‑key columns that reference `organizations.id`.
 */
async function getOrgFkReferences() {
  const rows = await sql`
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
      AND ccu.table_name = 'organizations'
      AND ccu.column_name = 'id';
  `;
  return rows.map(r => ({ table: r.table, column: r.column }));
}

/**
 * Clean duplicate organization records.
 * Duplicates are defined as having the same name, type, and parent_id.
 * For each duplicate set we keep the record with the smallest id.
 * Dependent rows in budgets and budget_lines are removed first to avoid
 * FK violations (budgets.organization_id -> organizations.id).
 */
async function cleanDuplicates() {
  // Find groups of duplicate organizations (same name, type, parent_id)
  const dupGroups = await sql`
    SELECT name, type, parent_id, array_agg(id ORDER BY id) AS ids
    FROM organizations
    GROUP BY name, type, parent_id
    HAVING COUNT(*) > 1;
  `;

  if (dupGroups.length === 0) {
    console.log("No duplicate organizations found.");
    return;
  }

  const fkRefs = await getOrgFkReferences();

  await sql.begin(async (trx) => {
    for (const grp of dupGroups) {
      const ids = grp.ids; // ordered array of duplicate ids
      const canonicalId = ids[0]; // keep smallest id
      const duplicateIds = ids.slice(1);
      if (duplicateIds.length === 0) continue;

      console.log(`Processing duplicate group – name: ${grp.name}, type: ${grp.type}`);
      console.log(`  canonical id: ${canonicalId}, duplicates: ${duplicateIds.join(", ")}`);

      // Re‑assign foreign‑key references to the canonical id.
      for (const { table, column } of fkRefs) {
        if (table === "organizations" && column === "id") continue;
        
        // Dynamically update referencing columns
        try {
          await trx`
            UPDATE ${trx(table)}
            SET ${trx(column)} = ${canonicalId}
            WHERE ${trx(column)} = ANY(${duplicateIds});
          `;
        } catch (err) {
          console.warn(`Warning: Could not update ${table}.${column}:`, err.message);
        }
      }

      // Finally delete duplicate organization rows.
      await trx`DELETE FROM organizations WHERE id = ANY(${duplicateIds});`;
    }
  });

  console.log("Duplicate cleanup completed successfully.");
}

async function run() {
  try {
    await cleanDuplicates();
  } catch (err) {
    console.error("Error during cleanup:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
