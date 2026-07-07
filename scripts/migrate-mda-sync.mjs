import postgres from 'postgres';

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  database: 'kogi_erp_test',
  username: 'postgres',
  password: 'Prince@123',
  max: 3,
});

async function run() {
  console.log('🏁 Starting Complete MDA Sync Schema Migration...');

  try {
    await sql.begin(async sqlTrans => {
      // 1. Audit Tables
      console.log(' - Ensuring audit_cases & audit_findings tables...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS audit_cases (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'open',
          priority VARCHAR(50) DEFAULT 'medium',
          organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
          assigned_auditor_id UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS audit_findings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          case_id UUID REFERENCES audit_cases(id) ON DELETE CASCADE,
          finding_title VARCHAR(255) NOT NULL,
          finding_details TEXT,
          risk_level VARCHAR(50) DEFAULT 'low',
          is_resolved BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // 2. Treasury/Accountant Tables
      console.log(' - Ensuring payment_requests & treasury_actions tables...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS payment_requests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
          budget_line_id UUID REFERENCES budget_lines(id) ON DELETE SET NULL,
          amount NUMERIC(15, 2) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS treasury_actions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          request_id UUID REFERENCES payment_requests(id) ON DELETE CASCADE,
          action_type VARCHAR(50) NOT NULL,
          notes TEXT,
          actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // 3. Organization columns
      console.log(' - Altering organizations to add missing columns...');
      await sqlTrans.unsafe(`
        ALTER TABLE organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE organizations ADD COLUMN IF NOT EXISTS operational_year VARCHAR(10);
        ALTER TABLE organizations ADD COLUMN IF NOT EXISTS permission_scope VARCHAR(50) DEFAULT 'default';
      `);

      console.log('✅ Migration successful!');
    });
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sql.end();
  }
}

run();
