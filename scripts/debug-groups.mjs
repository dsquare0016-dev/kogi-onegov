import postgres from 'postgres';

const sql = postgres({
  host: '127.0.0.1', port: 5432, database: 'kogi_erp_test',
  username: 'postgres', password: 'Prince@123', max: 3,
});

try {
  // Try direct insert
  console.log('Attempting insert...');
  const result = await sql`
    INSERT INTO chat_groups (name, classification, members_count, created_at)
    VALUES ('Test Group Alpha', 'internal', 0, NOW())
    RETURNING id, name
  `;
  console.log('Insert result:', JSON.stringify(result));
  
  const [cnt] = await sql`SELECT COUNT(*) as c FROM chat_groups`;
  console.log('Count after insert:', cnt.c);
  
} catch(e) {
  console.error('Insert error:', e.message, e.code);
  // Try without classification
  try {
    const result = await sql`
      INSERT INTO chat_groups (name, members_count, created_at)
      VALUES ('Test Group Beta', 0, NOW())
      RETURNING id, name
    `;
    console.log('Insert without classification result:', JSON.stringify(result));
  } catch(e2) {
    console.error('Second attempt error:', e2.message);
  }
} finally {
  await sql.end();
}
