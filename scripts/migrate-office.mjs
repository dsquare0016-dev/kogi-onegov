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
  try {
    console.log('Migrating Office Management Centre tables...');

    // Table 1: office_team_assignments
    await sql`
      CREATE TABLE IF NOT EXISTS office_team_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        office_holder_user_id UUID REFERENCES users(id),
        team_member_user_id UUID REFERENCES users(id),
        organization_id UUID REFERENCES organizations(id),
        department_id UUID REFERENCES organizations(id),
        position_id UUID,
        role_in_office VARCHAR(100),
        responsibilities JSONB DEFAULT '[]'::jsonb,
        priority INTEGER DEFAULT 1,
        memo_routing_enabled BOOLEAN DEFAULT false,
        delegation_enabled BOOLEAN DEFAULT false,
        active_from DATE DEFAULT CURRENT_DATE,
        active_to DATE,
        status VARCHAR(50) DEFAULT 'active',
        assigned_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `;
    console.log('office_team_assignments created.');

    // Table 2: office_delegations
    await sql`
      CREATE TABLE IF NOT EXISTS office_delegations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        office_holder_user_id UUID REFERENCES users(id),
        delegate_user_id UUID REFERENCES users(id),
        organization_id UUID REFERENCES organizations(id),
        delegation_type VARCHAR(100),
        permissions JSONB DEFAULT '[]'::jsonb,
        start_date DATE,
        end_date DATE,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
    `;
    console.log('office_delegations created.');

    // Table 3: office_memo_routing_settings
    await sql`
      CREATE TABLE IF NOT EXISTS office_memo_routing_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        office_holder_user_id UUID REFERENCES users(id),
        organization_id UUID REFERENCES organizations(id),
        secretary_first BOOLEAN DEFAULT true,
        default_secretary_user_id UUID REFERENCES users(id),
        escalation_user_id UUID REFERENCES users(id),
        auto_notify_office_holder BOOLEAN DEFAULT true,
        auto_notify_secretary BOOLEAN DEFAULT true,
        priority_rules JSONB DEFAULT '{}'::jsonb,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('office_memo_routing_settings created.');

    // Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_office_team_holder ON office_team_assignments(office_holder_user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_office_team_member ON office_team_assignments(team_member_user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_office_team_org ON office_team_assignments(organization_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_office_team_status ON office_team_assignments(status, deleted_at);`;
    console.log('Indexes created.');

    console.log('All migrations successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

run();
