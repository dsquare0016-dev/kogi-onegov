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
  console.log('🏁 Starting Organizational Structure Restructure DB Migration...');

  try {
    // 1. Extend organizations table
    console.log('🏢 Extending organizations table...');
    await sql.unsafe(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS logo_url TEXT,
      ADD COLUMN IF NOT EXISTS official_title TEXT,
      ADD COLUMN IF NOT EXISTS commissioner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS permanent_secretary_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    `);

    // 2. Extend nominal_roll table
    console.log('👥 Extending nominal_roll table...');
    await sql.unsafe(`
      ALTER TABLE nominal_roll 
      ADD COLUMN IF NOT EXISTS official_title TEXT,
      ADD COLUMN IF NOT EXISTS reporting_officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
    `);

    // 3. Create positions table
    console.log('💼 Creating positions table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS positions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        official_title VARCHAR(255) NOT NULL,
        office_name VARCHAR(255) NOT NULL,
        org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        reporting_line UUID REFERENCES positions(id) ON DELETE SET NULL,
        access_level VARCHAR(50),
        dashboard VARCHAR(100),
        permissions TEXT[],
        approval_authority BOOLEAN DEFAULT FALSE,
        workflow_level INTEGER DEFAULT 1,
        vacancy_status VARCHAR(50) DEFAULT 'vacant',
        current_occupant_id UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 4. Create staff_postings table
    console.log('📜 Creating staff_postings table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS staff_postings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
        effective_date DATE DEFAULT CURRENT_DATE,
        posting_type VARCHAR(50) DEFAULT 'initial',
        posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
        previous_org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 5. Seed default Positions / Titles
    console.log('🌱 Seeding default positions...');
    
    // Get SSG office and MoFEP to link default positions
    const [ssgOrg] = await sql`SELECT id FROM organizations WHERE name = 'Office of the SSG' OR code = 'OSSG' LIMIT 1`;
    const [govOrg] = await sql`SELECT id FROM organizations WHERE name = 'Office of the Executive Governor' OR code = 'OEG' LIMIT 1`;
    const [financeOrg] = await sql`SELECT id FROM organizations WHERE name = 'Ministry of Finance, Budget & Economic Planning' OR code = 'MOFEP' LIMIT 1`;
    
    const defaultPositions = [
      { official_title: 'His Excellency', office_name: 'Executive Governor', org_id: govOrg?.id || null, access_level: 'governor', dashboard: 'governor' },
      { official_title: 'His Excellency', office_name: 'Deputy Governor', org_id: govOrg?.id || null, access_level: 'deputy_governor', dashboard: 'deputy' },
      { official_title: 'Secretary to the State Government', office_name: 'SSG Office', org_id: ssgOrg?.id || null, access_level: 'ssg', dashboard: 'ssg' },
      { official_title: 'Honourable Commissioner', office_name: 'Commissioner for Finance', org_id: financeOrg?.id || null, access_level: 'commissioner', dashboard: 'mda' },
      { official_title: 'Permanent Secretary', office_name: 'Perm Sec Finance', org_id: financeOrg?.id || null, access_level: 'perm_secretary', dashboard: 'mda' },
      { official_title: 'Director', office_name: 'Director of Planning', org_id: financeOrg?.id || null, access_level: 'director', dashboard: 'mda' },
      { official_title: 'Head of Department', office_name: 'HOD Budget', org_id: financeOrg?.id || null, access_level: 'director', dashboard: 'mda' },
    ];

    for (const pos of defaultPositions) {
      const [exist] = await sql`SELECT id FROM positions WHERE office_name = ${pos.office_name} LIMIT 1`;
      if (!exist) {
        await sql`
          INSERT INTO positions (official_title, office_name, org_id, access_level, dashboard, vacancy_status)
          VALUES (${pos.official_title}, ${pos.office_name}, ${pos.org_id}, ${pos.access_level}, ${pos.dashboard}, 'vacant')
        `;
      }
    }

    console.log('✅ Migration succeeded!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err.stack);
  } finally {
    await sql.end();
  }
}

run();
