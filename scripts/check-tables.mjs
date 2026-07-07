import postgres from 'postgres';

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  database: 'kogi_erp_test',
  username: 'postgres',
  password: 'Prince@123',
  max: 3,
});

try {
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  console.log('=== TABLES ===');
  tables.forEach(t => console.log(t.table_name));

  // Check enum types
  const enums = await sql`
    SELECT typname, enumlabel 
    FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    ORDER BY typname, enumsortorder
  `;
  console.log('\n=== ENUMS ===');
  const byType = {};
  enums.forEach(e => {
    if (!byType[e.typname]) byType[e.typname] = [];
    byType[e.typname].push(e.enumlabel);
  });
  Object.entries(byType).forEach(([k, v]) => console.log(`${k}: ${v.join(', ')}`));

  // Check users table columns
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'users' AND table_schema = 'public'
    ORDER BY ordinal_position
  `;
  console.log('\n=== users columns ===');
  cols.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) nullable:${c.is_nullable}`));

  // Current users count
  const [uc] = await sql`SELECT COUNT(*) as cnt FROM users`;
  console.log('\n=== users count ===', uc.cnt);

  // Current org count
  const [oc] = await sql`SELECT COUNT(*) as cnt FROM organizations`;
  console.log('=== organizations count ===', oc.cnt);

} catch(e) {
  console.error('Error:', e.message);
} finally {
  await sql.end();
}
