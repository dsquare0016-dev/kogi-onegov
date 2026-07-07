import postgres from 'postgres';

const sql = postgres({
  host: '127.0.0.1', port: 5432, database: 'kogi_erp_test',
  username: 'postgres', password: 'Prince@123', max: 3,
});

const GROUPS = [
  { name: 'Executive Governance Team', classification: 'confidential' },
  { name: 'GDU Operations', classification: 'restricted' },
  { name: 'Finance & Accounts Officers Forum', classification: 'internal' },
  { name: 'Project Officers Coordination', classification: 'internal' },
  { name: 'HR & Civil Service Commission', classification: 'internal' },
  { name: 'ICT & Digital Systems Support', classification: 'internal' },
  { name: 'Audit & Compliance Network', classification: 'restricted' },
  { name: 'Bureau of Public Procurement Committee', classification: 'restricted' },
  { name: 'All Staff Notice Board', classification: 'public' },
  { name: 'Health Sector Coordination', classification: 'internal' },
];

try {
  for (const g of GROUPS) {
    const [exist] = await sql`SELECT id FROM chat_groups WHERE name = ${g.name} LIMIT 1`;
    if (!exist) {
      await sql`
        INSERT INTO chat_groups (name, classification, members_count, created_at)
        VALUES (${g.name}, ${g.classification}, 0, NOW())
      `.catch(async () => {
        await sql`INSERT INTO chat_groups (name, created_at) VALUES (${g.name}, NOW())`.catch(() => {});
      });
      console.log(`  Added: ${g.name}`);
    } else {
      console.log(`  Already exists: ${g.name}`);
    }
  }
  const [cnt] = await sql`SELECT COUNT(*) as c FROM chat_groups`;
  console.log(`Total chat_groups: ${cnt.c}`);
} catch(e) {
  console.error(e.message);
} finally {
  await sql.end();
}
