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
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'positions' AND table_schema = 'public'
    ORDER BY ordinal_position
  `;
  console.log('\n=== positions columns ===');
  cols.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) nullable:${c.is_nullable}`));
} catch(e) {
  console.error('Error:', e.message);
} finally {
  await sql.end();
}
