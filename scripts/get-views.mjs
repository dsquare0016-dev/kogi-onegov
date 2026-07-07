import postgres from 'postgres';
const sql = postgres({ host:'127.0.0.1', port:5432, database:'kogi_erp_test', username:'postgres', password:'Prince@123', max:3 });

const views = ['ministries','departments','agencies','units'];
for (const v of views) {
  const [def] = await sql`SELECT definition FROM pg_views WHERE viewname = ${v} AND schemaname = 'public'`;
  console.log(`\n=== VIEW: ${v} ===`);
  console.log(def?.definition || '(not found)');
}
await sql.end();
