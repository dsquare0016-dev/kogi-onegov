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
    // Get referencing foreign keys for organizations(id)
    const orgFkRefs = await sql`
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
    
    await sql.begin(async (trx) => {
      console.log("Starting case-insensitive duplicate cleanup in organizations table...");

      // Find all case-insensitive duplicate groups
      const dupOrgs = await trx`
        SELECT LOWER(TRIM(name)) as clean_name, type, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid) as clean_parent_id, COUNT(*), array_agg(id ORDER BY id) as ids, array_agg(name ORDER BY id) as names
        FROM organizations
        GROUP BY LOWER(TRIM(name)), type, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid)
        HAVING COUNT(*) > 1;
      `;
      console.log(`Found ${dupOrgs.length} case-insensitive duplicate groups.`);

      for (const grp of dupOrgs) {
        const ids = grp.ids;
        // Determine canonical ID. We prefer the one with mixed-case name.
        let canonicalId = ids[0];
        let duplicateIds = ids.slice(1);
        
        // Find which name has mixed case
        const mixedCaseIdx = grp.names.findIndex(n => n !== n.toUpperCase());
        if (mixedCaseIdx !== -1) {
          canonicalId = ids[mixedCaseIdx];
          duplicateIds = ids.filter(id => id !== canonicalId);
        }

        console.log(`\nProcessing case-insensitive duplicate group: "${grp.clean_name}" (${grp.type})`);
        console.log(`  Canonical ID: ${canonicalId}`);
        console.log(`  Duplicate IDs to remove: ${duplicateIds.join(", ")}`);

        // Re-assign all foreign keys pointing to organizations(id)
        for (const { table, column } of orgFkRefs) {
          if (table === "organizations" && column === "id") continue;
          
          try {
            const result = await trx`
              UPDATE ${trx(table)}
              SET ${trx(column)} = ${canonicalId}
              WHERE ${trx(column)} = ANY(${duplicateIds});
            `;
            if (result.count > 0) {
              console.log(`  Updated ${result.count} rows in table "${table}" (column "${column}")`);
            }
          } catch (err) {
            console.warn(`  Warning: Could not update ${table}.${column}:`, err.message);
          }
        }

        // Delete duplicate records from organizations table
        const delOrgs = await trx`
          DELETE FROM organizations WHERE id = ANY(${duplicateIds});
        `;
        console.log(`  Deleted ${delOrgs.count} duplicates from "organizations" table.`);
      }
    });

    console.log("\nCase-insensitive duplicate cleanup in organizations completed successfully!");

  } catch (err) {
    console.error("Cleanup transaction failed:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
