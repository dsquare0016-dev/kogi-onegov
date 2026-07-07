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
  console.log('🏁 Starting Relational Alignments, Budget, and Setup Migration...');

  try {
    // 1. Alter type org_type enum values
    console.log('🎨 Extending org_type enum values...');
    try {
      await sql.unsafe(`ALTER TYPE org_type ADD VALUE IF NOT EXISTS 'executive_office'`);
      await sql.unsafe(`ALTER TYPE org_type ADD VALUE IF NOT EXISTS 'bureau'`);
      await sql.unsafe(`ALTER TYPE org_type ADD VALUE IF NOT EXISTS 'authority'`);
      await sql.unsafe(`ALTER TYPE org_type ADD VALUE IF NOT EXISTS 'special_office'`);
    } catch (e) {
      console.log('  ⚠️ org_type extension notice (likely already has values):', e.message);
    }

    // 2. Extend organizations table
    console.log('🏢 Extending organizations table with relational fields...');
    await sql.unsafe(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS supervising_ministry_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS desk_officer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    `);

    // 3. Create development_plan_pillars table
    console.log('🏛 Creating development_plan_pillars table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS development_plan_pillars (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        plan_year_start INTEGER NOT NULL DEFAULT 2026,
        plan_year_end INTEGER NOT NULL DEFAULT 2058,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 4. Create strategic_objectives table
    console.log('🎯 Creating strategic_objectives table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS strategic_objectives (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pillar_id UUID REFERENCES development_plan_pillars(id) ON DELETE CASCADE,
        objective_title VARCHAR(255) NOT NULL,
        objective_code VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 5. Create organization_strategic_objectives table
    console.log('🔗 Creating organization_strategic_objectives table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS organization_strategic_objectives (
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        strategic_objective_id UUID REFERENCES strategic_objectives(id) ON DELETE CASCADE,
        PRIMARY KEY (organization_id, strategic_objective_id)
      );
    `);

    // 6. Create budget_years table
    console.log('📅 Creating budget_years table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS budget_years (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        year INTEGER NOT NULL UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 7. Create budget_line_items table
    console.log('💰 Creating budget_line_items table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS budget_line_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        budget_year_id UUID REFERENCES budget_years(id) ON DELETE CASCADE,
        budget_code VARCHAR(100) NOT NULL,
        line_item_name VARCHAR(255) NOT NULL,
        description TEXT,
        approved_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        released_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        utilized_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        available_balance DECIMAL(18,2) GENERATED ALWAYS AS (approved_amount - utilized_amount) STORED,
        status VARCHAR(50) DEFAULT 'active',
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(organization_id, budget_year_id, budget_code)
      );
    `);

    // 8. Seeding budget years, pillars, strategic objectives, and alignments
    console.log('🌱 Seeding budget years...');
    const [yr2026] = await sql`
      INSERT INTO budget_years (year, is_active) VALUES (2026, true)
      ON CONFLICT (year) DO UPDATE SET is_active = true RETURNING id
    `;
    const [yr2027] = await sql`
      INSERT INTO budget_years (year, is_active) VALUES (2027, true)
      ON CONFLICT (year) DO UPDATE SET is_active = true RETURNING id
    `;

    console.log('🌱 Seeding development plan pillars...');
    const pillars = [
      { name: 'Infrastructure Development & Utilities', description: 'Power grid, solar micro-grid, clean water plants, Lokoja–Ajaokuta road reconstruction, etc.' },
      { name: 'Agriculture & Food Security', description: 'Cassava value chain initiative, agro-processing zone expansion, and extension services.' },
      { name: 'Education & Human Capital', description: 'Vocational training, smart schools digital program, and primary school renovations.' },
      { name: 'Healthcare & Social Services', description: 'Universal health coverage expansion, specialist hospitals, and elderly outreach.' },
      { name: 'Public Service & Digital Governance', description: 'Statewide digital ID rollout, e-Procurement portal, and relational ERP systems.' }
    ];

    const pillarIds = [];
    for (const p of pillars) {
      const [row] = await sql`
        INSERT INTO development_plan_pillars (name, description, plan_year_start, plan_year_end, status)
        VALUES (${p.name}, ${p.description}, 2026, 2058, 'active')
        ON CONFLICT DO NOTHING
        RETURNING id
      `;
      if (row) {
        pillarIds.push(row.id);
      } else {
        const [existing] = await sql`SELECT id FROM development_plan_pillars WHERE name = ${p.name} LIMIT 1`;
        if (existing) pillarIds.push(existing.id);
      }
    }

    console.log('🌱 Seeding strategic objectives...');
    const objectives = [
      { pillar_idx: 0, title: 'Road Infrastructure & Corridor Security', code: 'SO-INFRA-01', description: 'Reconstruct state highways and secure major trade pathways.' },
      { pillar_idx: 0, title: 'Rural Clean Water & Sanitation Access', code: 'SO-INFRA-02', description: 'Construct water plants and establish local utility systems.' },
      { pillar_idx: 1, title: 'Agro-processing & Market Linkage', code: 'SO-AGRIC-01', description: 'Enhance direct market channels and processing zones.' },
      { pillar_idx: 2, title: 'Digital Literacy & Primary School Upgrade', code: 'SO-EDU-01', description: 'Roll out student tablets and improve local primary schools.' },
      { pillar_idx: 4, title: 'E-Government Integration & ERP Modernization', code: 'SO-GOV-01', description: 'Migrate state agency systems onto real-time relational architecture.' }
    ];

    const objIds = [];
    for (const obj of objectives) {
      const pillarId = pillarIds[obj.pillar_idx] || null;
      if (pillarId) {
        const [row] = await sql`
          INSERT INTO strategic_objectives (pillar_id, objective_title, objective_code, description, status)
          VALUES (${pillarId}, ${obj.title}, ${obj.code}, ${obj.description}, 'active')
          ON CONFLICT (objective_code) DO NOTHING
          RETURNING id
        `;
        if (row) {
          objIds.push(row.id);
        } else {
          const [existing] = await sql`SELECT id FROM strategic_objectives WHERE objective_code = ${obj.code} LIMIT 1`;
          if (existing) objIds.push(existing.id);
        }
      }
    }

    // Link MoFEP (Ministry of Finance) and Works to strategic objectives
    console.log('🌱 Creating organization alignments...');
    const [mofep] = await sql`SELECT id FROM organizations WHERE name LIKE '%Finance%' LIMIT 1`;
    const [mow] = await sql`SELECT id FROM organizations WHERE name LIKE '%Works%' LIMIT 1`;

    if (mofep) {
      for (const objId of objIds) {
        await sql`
          INSERT INTO organization_strategic_objectives (organization_id, strategic_objective_id)
          VALUES (${mofep.id}, ${objId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    if (mow && objIds[0]) {
      await sql`
        INSERT INTO organization_strategic_objectives (organization_id, strategic_objective_id)
        VALUES (${mow.id}, ${objIds[0]})
        ON CONFLICT DO NOTHING
      `;
    }

    // Seed default Budget Line Items for MoFEP and Works
    console.log('🌱 Seeding budget line items...');
    if (mofep && yr2026) {
      await sql`
        INSERT INTO budget_line_items (organization_id, budget_year_id, budget_code, line_item_name, description, approved_amount, utilized_amount, status)
        VALUES 
          (${mofep.id}, ${yr2026.id}, 'MOFEP-2026-CAP-01', 'Capital Infrastructure & ERP Funding', 'Primary allocation for Kogi Gov ERP project', 250000000.00, 150000000.00, 'active'),
          (${mofep.id}, ${yr2026.id}, 'MOFEP-2026-REC-01', 'MoFEP Operations Recurrent Expenses', 'Office operations budget', 50000000.00, 12000000.00, 'active')
        ON CONFLICT DO NOTHING
      `;
    }

    if (mow && yr2026) {
      await sql`
        INSERT INTO budget_line_items (organization_id, budget_year_id, budget_code, line_item_name, description, approved_amount, utilized_amount, status)
        VALUES 
          (${mow.id}, ${yr2026.id}, 'MOW-2026-CAP-01', 'Lokoja-Ajaokuta Road Construction Phase 2', 'Highway rehabilitation funding', 1500000000.00, 450000000.00, 'active')
        ON CONFLICT DO NOTHING
      `;
    }

    // Update existing executive offices to have organization_type = 'executive_office'
    console.log('🏢 Restructuring Executive Offices...');
    const execOfficeNames = [
      'Office of the Executive Governor',
      'Office of the Deputy Governor',
      'Office of the SSG',
      'Chief of Staff Office',
      'Office of the Head of Service',
      'Governance Delivery Unit',
      'System Administration',
      'Office of the Auditor General',
      'Office of the Accountant General'
    ];

    for (const name of execOfficeNames) {
      await sql`
        UPDATE organizations 
        SET type = 'executive_office'::org_type
        WHERE name = ${name}
      `;
    }

    console.log('✅ Relational Setup Migration Succeeded!');
  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
    console.error(err.stack);
  } finally {
    await sql.end();
  }
}

run();
