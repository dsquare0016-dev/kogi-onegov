import postgres from "postgres";

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  database: 'kogi_erp_test',
  username: 'postgres',
  password: 'Prince@123'
});

async function run() {
  const tables = [
    'recruitment_campaigns',
    'recruitment_campaign_positions',
    'recruitment_campaign_documents',
    'recruitment_campaign_sections',
    'recruitment_applications',
    'recruitment_application_documents',
    'recruitment_status_history',
    'recruitment_settings'
  ];
  
  try {
    for (const t of tables) {
      const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${t}
        ORDER BY ordinal_position
      `;
      if (cols.length === 0) {
        console.log(`\nTable: ${t} - NOT FOUND`);
      } else {
        console.log(`\nTable: ${t}`);
        cols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
