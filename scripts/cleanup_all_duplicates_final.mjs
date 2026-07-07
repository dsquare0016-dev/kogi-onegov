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
      console.log("Starting transactional cleanup of all duplicates...");

      // ----------------------------------------------------
      // STEP 1: Eliminate exact physical row duplicates in `ministries` table
      // ----------------------------------------------------
      console.log("Removing exact physical row duplicates in ministries table...");
      const distinctMinistries = await trx`
        SELECT DISTINCT ON (id) * FROM ministries;
      `;
      console.log(`Found ${distinctMinistries.length} unique ministries by ID.`);
      
      await trx`TRUNCATE TABLE ministries;`;
      
      // Re-insert unique records
      for (const m of distinctMinistries) {
        await trx`
          INSERT INTO ministries (
            id, name, short_name, code, description, mandate, address, email, phone, website,
            logo_url, lga, is_active, created_at, updated_at, commissioner_name,
            commissioner_phone, commissioner_email, permanent_secretary, head_user_id,
            budget, spent, score
          ) VALUES (
            ${m.id}, ${m.name}, ${m.short_name}, ${m.code}, ${m.description}, ${m.mandate}, ${m.address}, ${m.email}, ${m.phone}, ${m.website},
            ${m.logo_url}, ${m.lga}, ${m.is_active}, ${m.created_at}, ${m.updated_at}, ${m.commissioner_name},
            ${m.commissioner_phone}, ${m.commissioner_email}, ${m.permanent_secretary}, ${m.head_user_id},
            ${m.budget}, ${m.spent}, ${m.score}
          );
        `;
      }
      console.log("Successfully re-inserted clean unique-id ministries.");

      // ----------------------------------------------------
      // STEP 2: Find case-insensitive duplicate organizations
      // ----------------------------------------------------
      const dupOrgs = await trx`
        SELECT LOWER(TRIM(name)) as clean_name, type, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid) as clean_parent_id, COUNT(*), array_agg(id ORDER BY id) as ids, array_agg(name ORDER BY id) as names
        FROM organizations
        GROUP BY LOWER(TRIM(name)), type, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid)
        HAVING COUNT(*) > 1;
      `;
      console.log(`Found ${dupOrgs.length} case-insensitive duplicate groups in organizations.`);

      for (const grp of dupOrgs) {
        const ids = grp.ids;
        // Determine canonical ID. We prefer the one with mixed-case/lowercase name.
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

        // Reassign loose references in the `ministries` table if relevant
        try {
          const result = await trx`
            UPDATE ministries
            SET id = ${canonicalId}
            WHERE id = ANY(${duplicateIds});
          `;
          if (result.count > 0) {
            console.log(`  Updated ${result.count} rows in table "ministries"`);
          }
        } catch (e) {
          console.warn(`  Warning: Could not update ministries table directly:`, e.message);
        }

        // Delete duplicate records in both tables
        const delMinistries = await trx`
          DELETE FROM ministries WHERE id = ANY(${duplicateIds});
        `;
        if (delMinistries.count > 0) {
          console.log(`  Deleted ${delMinistries.count} duplicates from "ministries" table.`);
        }

        const delOrgs = await trx`
          DELETE FROM organizations WHERE id = ANY(${duplicateIds});
        `;
        console.log(`  Deleted ${delOrgs.count} duplicates from "organizations" table.`);
      }

      // ----------------------------------------------------
      // STEP 3: Clean up case-insensitive duplicates in `ministries` that might not have matched organizations
      // ----------------------------------------------------
      const dupMinistries = await trx`
        SELECT LOWER(TRIM(name)) as clean_name, COUNT(*), array_agg(id ORDER BY id) as ids, array_agg(name ORDER BY id) as names
        FROM ministries
        GROUP BY LOWER(TRIM(name))
        HAVING COUNT(*) > 1;
      `;
      console.log(`\nFound ${dupMinistries.length} duplicate groups directly in ministries table.`);

      for (const grp of dupMinistries) {
        const ids = grp.ids;
        let canonicalId = ids[0];
        let duplicateIds = ids.slice(1);

        // Find which name has mixed case
        const mixedCaseIdx = grp.names.findIndex(n => n !== n.toUpperCase());
        if (mixedCaseIdx !== -1) {
          canonicalId = ids[mixedCaseIdx];
          duplicateIds = ids.filter(id => id !== canonicalId);
        }

        console.log(`Processing duplicate ministry directly: "${grp.clean_name}"`);
        console.log(`  Canonical ID: ${canonicalId}`);
        console.log(`  Duplicate IDs to remove: ${duplicateIds.join(", ")}`);

        // Check if there is an organizations table reference to the duplicate ministry IDs and update them
        try {
          const res = await trx`
            UPDATE organizations
            SET supervising_ministry_id = ${canonicalId}
            WHERE supervising_ministry_id = ANY(${duplicateIds});
          `;
          if (res.count > 0) {
            console.log(`  Updated ${res.count} supervising_ministry_id references in organizations`);
          }
        } catch (e) {
          console.warn(`  Warning: Could not update supervising_ministry_id:`, e.message);
        }

        const delMinDirect = await trx`
          DELETE FROM ministries WHERE id = ANY(${duplicateIds});
        `;
        console.log(`  Deleted ${delMinDirect.count} direct duplicates from "ministries".`);
      }
    });

    console.log("\nAll duplicates cleaned successfully!");

  } catch (err) {
    console.error("Cleanup transaction failed:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
