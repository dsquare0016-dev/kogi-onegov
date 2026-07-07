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
    const campaignsCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'recruitment_campaigns'
    `;
    console.log("RECRUITMENT CAMPAIGNS COLUMNS:");
    console.log(campaignsCols.map(c => `${c.column_name} (${c.data_type})`));

    const rows = await sql`SELECT * FROM recruitment_campaigns LIMIT 5`;
    console.log("RECRUITMENT CAMPAIGNS ROWS:");
    console.log(rows);

    const appsCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'recruitment_applications'
    `;
    console.log("\nRECRUITMENT APPLICATIONS COLUMNS:");
    console.log(appsCols.map(c => `${c.column_name} (${c.data_type})`));

    const appRows = await sql`SELECT * FROM recruitment_applications LIMIT 5`;
    console.log("RECRUITMENT APPLICATIONS ROWS:");
    console.log(appRows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
