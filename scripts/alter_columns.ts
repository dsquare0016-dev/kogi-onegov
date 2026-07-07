import sql from '../src/lib/postgres.ts';

async function run() {
  try {
    await sql`ALTER TABLE nominal_roll ADD COLUMN IF NOT EXISTS state_of_origin_id UUID`;
    await sql`ALTER TABLE nominal_roll ADD COLUMN IF NOT EXISTS lga_id UUID`;
    console.log("Columns added successfully");
  } catch(e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}

run();
