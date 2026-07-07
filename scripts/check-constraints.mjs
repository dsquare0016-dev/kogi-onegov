import postgres from 'postgres';
const sql = postgres({ host:'127.0.0.1', port:5432, database:'kogi_erp_test', username:'postgres', password:'Prince@123', max:3 });

const tables = ['organizations','nominal_roll','users','roles','user_roles','memos','notifications','chat_groups','budgets','projects','programmes','development_plans'];

for (const t of tables) {
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name=${t} AND table_schema='public' ORDER BY ordinal_position`;
  const constr = await sql`
    SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name=${t} AND tc.table_schema='public'
    AND tc.constraint_type IN ('UNIQUE','PRIMARY KEY')
  `;
  const uqs = constr.filter(c => c.constraint_type === 'UNIQUE').map(c => c.column_name);
  console.log(`${t}: cols=[${cols.map(c=>c.column_name).join(',')}] unique=[${uqs.join(',')}]`);
}

await sql.end();
