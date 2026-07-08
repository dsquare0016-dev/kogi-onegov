import sql from '../src/lib/postgres.js';

async function main() {
  console.log("Starting KPIs Migration...");
  try {
    await sql`ALTER TABLE development_kpis ADD COLUMN IF NOT EXISTS pillar_id UUID`;
    console.log("✅ development_kpis table updated with pillar_id.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}
main();
