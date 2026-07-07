import postgres from 'postgres';
import crypto from 'crypto';

const sql = postgres({
  host: '127.0.0.1', port: 5432, database: 'kogi_erp_test',
  username: 'postgres', password: 'Prince@123', max: 3,
});

function hashPassword(plain) {
  return 'sha256:' + crypto.createHash('sha256').update(plain).digest('hex');
}

try {
  // Test login for superadmin
  const email = 'superadmin@kogistate.gov.ng';
  const pass = 'Admin@1234';
  
  const [user] = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  console.log('User found:', !!user, 'email:', user?.email, 'staff_id:', user?.staff_id);
  console.log('is_active:', user?.is_active, 'status:', user?.status);
  
  const hash = user?.password_hash || '';
  const inputHash = 'sha256:' + crypto.createHash('sha256').update(pass).digest('hex');
  console.log('Password match:', inputHash === hash);
  
  // Get nominal roll
  const [nr] = await sql`SELECT * FROM nominal_roll WHERE email = ${email} LIMIT 1`;
  console.log('NR found:', !!nr, 'name:', nr ? `${nr.first_name} ${nr.last_name}` : 'N/A');
  
  // Get roles
  const roles = await sql`
    SELECT r.name FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = ${user?.id}
  `;
  console.log('Roles:', roles.map(r => r.name));
  
  // Check organizations
  const [orgCnt] = await sql`SELECT COUNT(*) as c FROM organizations`;
  console.log('\nOrganizations total:', orgCnt.c);
  
  // Ministry count
  const [minCnt] = await sql`SELECT COUNT(*) as c FROM organizations WHERE type = 'ministry'`;
  console.log('Ministries:', minCnt.c);
  
  // Projects
  const [projCnt] = await sql`SELECT COUNT(*) as c FROM projects`;
  console.log('Projects:', projCnt.c);

  // Budget
  const [budgetCnt] = await sql`SELECT COUNT(*) as c FROM budgets`;
  const [budgetSum] = await sql`SELECT COALESCE(SUM(total_allocated),0) as total FROM budgets`;
  console.log('Budgets:', budgetCnt.c, 'Total allocated: ₦', Number(budgetSum.total).toLocaleString());

  // Notifications 
  const [notifCnt] = await sql`SELECT COUNT(*) as c FROM notifications`;
  console.log('Notifications:', notifCnt.c);

  // Nominal roll
  const [nrCnt] = await sql`SELECT COUNT(*) as c FROM nominal_roll`;
  console.log('Nominal roll staff:', nrCnt.c);

  console.log('\n✅ Database verification complete');
} catch(e) {
  console.error('Error:', e.message);
} finally {
  await sql.end();
}
