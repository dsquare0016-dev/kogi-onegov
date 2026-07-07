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

    const merges = [
      {
        name: 'Ministry of Finance, Budget & Economic Planning',
        canonical: 'f1bf0c84-5a25-4e0b-bff4-9749d3558a52',
        dups: ['92828e4e-d250-4aec-9522-1bd046a93c67']
      },
      {
        name: 'Ministry of Housing & Urban Development',
        canonical: '8628e418-86a4-448f-98bf-99573bf9b7d2',
        dups: ['8fde79c7-6bb8-440b-b64f-aab1cfbf23b8']
      },
      {
        name: 'Ministry of Rural & Energy Development',
        canonical: '0dffa615-13e9-4372-a514-00630fafe061',
        dups: ['4a3cc83b-16c3-4bb1-ba11-6c85a3becd33']
      },
      {
        name: 'Ministry of Women Affairs & Social Development',
        canonical: '2909ef98-6e87-4d2e-b637-c3bfb9811b14',
        dups: ['56c2e5c6-54b4-45a7-b322-3a9078d4848a']
      }
    ];

    await sql.begin(async (trx) => {
      console.log("Merging fuzzy duplicate ministries...");

      for (const item of merges) {
        console.log(`\nMerging "${item.name}":`);
        console.log(`  Canonical ID: ${item.canonical}`);
        console.log(`  Duplicate IDs to remove: ${item.dups.join(", ")}`);

        // Re-assign all foreign keys pointing to organizations(id)
        for (const { table, column } of orgFkRefs) {
          if (table === "organizations" && column === "id") continue;
          
          try {
            const result = await trx`
              UPDATE ${trx(table)}
              SET ${trx(column)} = ${item.canonical}
              WHERE ${trx(column)} = ANY(${item.dups});
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
          DELETE FROM organizations WHERE id = ANY(${item.dups});
        `;
        console.log(`  Deleted ${delOrgs.count} duplicate rows from "organizations" table.`);
      }
    });

    console.log("\nFuzzy duplicate cleanup completed successfully!");

  } catch (err) {
    console.error("Fuzzy cleanup failed:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
