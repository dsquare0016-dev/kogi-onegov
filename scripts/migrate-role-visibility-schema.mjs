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
  console.log('🏁 Starting Role-Based Visibility & Schema Migration...');

  try {
    // 1. Extend organizations table
    console.log('🏢 Extending organizations table...');
    await sql.unsafe(`
      ALTER TABLE organizations
      ADD COLUMN IF NOT EXISTS organization_name TEXT,
      ADD COLUMN IF NOT EXISTS organization_code TEXT,
      ADD COLUMN IF NOT EXISTS organization_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS parent_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
    `);

    // Sync values & add triggers to keep legacy and new organization columns aligned
    await sql.unsafe(`
      UPDATE organizations 
      SET organization_name = COALESCE(organization_name, name),
          organization_code = COALESCE(organization_code, code),
          organization_type = COALESCE(organization_type, type::text),
          parent_organization_id = COALESCE(parent_organization_id, parent_id);
    `);

    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION sync_org_legacy_new() 
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.name IS DISTINCT FROM OLD.name THEN
          NEW.organization_name := NEW.name;
        ELSIF NEW.organization_name IS DISTINCT FROM OLD.organization_name THEN
          NEW.name := NEW.organization_name;
        END IF;

        IF NEW.code IS DISTINCT FROM OLD.code THEN
          NEW.organization_code := NEW.code;
        ELSIF NEW.organization_code IS DISTINCT FROM OLD.organization_code THEN
          NEW.code := NEW.organization_code;
        END IF;

        IF NEW.parent_id IS DISTINCT FROM OLD.parent_id THEN
          NEW.parent_organization_id := NEW.parent_id;
        ELSIF NEW.parent_organization_id IS DISTINCT FROM OLD.parent_organization_id THEN
          NEW.parent_id := NEW.parent_organization_id;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_sync_org_legacy_new ON organizations;
      CREATE TRIGGER trg_sync_org_legacy_new
      BEFORE INSERT OR UPDATE ON organizations
      FOR EACH ROW EXECUTE FUNCTION sync_org_legacy_new();
    `);

    // 2. Recreate departments view with requested columns
    console.log('🏢 Recreating departments view...');
    await sql.unsafe(`
      DROP VIEW IF EXISTS departments CASCADE;
      CREATE VIEW departments AS
      SELECT o.id,
             o.name,
             parent.name AS parent_name,
             initcap((parent.type)::text) AS parent_type,
             concat_ws(' '::text, hp.title, hp.first_name, hp.last_name) AS head,
             COALESCE(ps.overall_score, (0)::numeric) AS score,
             o.parent_id,
             o.parent_id AS organization_id,
             o.name AS department_name,
             o.code AS department_code,
             o.head_user_id,
             o.status,
             o.created_at,
             o.updated_at
      FROM ((((organizations o
        LEFT JOIN organizations parent ON ((parent.id = o.parent_id)))
        LEFT JOIN users hu ON ((hu.id = o.head_user_id)))
        LEFT JOIN user_profiles hp ON ((hp.user_id = hu.id)))
        LEFT JOIN performance_scores ps ON ((ps.organization_id = o.id)))
      WHERE (o.type = 'department'::org_type);
    `);

    // 3. Recreate units view with requested columns
    console.log('🏢 Recreating units view...');
    await sql.unsafe(`
      DROP VIEW IF EXISTS units CASCADE;
      CREATE VIEW units AS
      SELECT o.id,
             o.name,
             parent.name AS parent_department,
             initcap((parent.type)::text) AS parent_type,
             o.parent_id,
             o.parent_id AS department_id,
             o.name AS unit_name,
             o.code AS unit_code,
             o.head_user_id,
             o.status,
             o.created_at,
             o.updated_at
      FROM (organizations o
        LEFT JOIN organizations parent ON ((parent.id = o.parent_id)))
      WHERE (o.type = 'unit'::org_type);
    `);

    // 4. Create user_posting table
    console.log('📜 Creating user_posting table...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS user_posting (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        department_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        unit_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        office_title VARCHAR(255),
        start_date DATE DEFAULT CURRENT_DATE,
        end_date DATE,
        is_current BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 5. Extend user_permissions table
    console.log('🔑 Extending user_permissions table...');
    await sql.unsafe(`
      ALTER TABLE user_permissions
      ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS permission_scope VARCHAR(100) DEFAULT 'mda';
    `);

    // 6. Extend development_objectives (which is a view of development_goals)
    console.log('🎯 Extending development_goals and recreating development_objectives view...');
    await sql.unsafe(`
      ALTER TABLE development_goals
      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS objective_code VARCHAR(100),
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    `);

    await sql.unsafe(`
      UPDATE development_goals
      SET objective_code = COALESCE(objective_code, target_unit);
    `);

    await sql.unsafe(`
      DROP VIEW IF EXISTS development_objectives CASCADE;
      CREATE VIEW development_objectives AS
      SELECT id,
             pillar_id,
             title,
             title AS objective_name,
             objective_code,
             organization_id,
             status,
             COALESCE(description, ''::text) AS description,
             COALESCE(target_unit, ''::text) AS timeline,
             target_value,
             baseline_value,
             weight,
             created_at
      FROM development_goals;
    `);

    // 7. Extend budget_lines table
    console.log('💰 Extending budget_lines table...');
    await sql.unsafe(`
      ALTER TABLE budget_lines
      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS development_objective_id UUID REFERENCES development_goals(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS budget_code VARCHAR(100),
      ADD COLUMN IF NOT EXISTS budget_name TEXT,
      ADD COLUMN IF NOT EXISTS approved_amount DECIMAL(18,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT 2026;
    `);

    await sql.unsafe(`
      UPDATE budget_lines
      SET budget_code = COALESCE(budget_code, code),
          budget_name = COALESCE(budget_name, title),
          approved_amount = COALESCE(approved_amount, allocated_amount);
    `);

    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION sync_budget_line_legacy_new() 
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.code IS DISTINCT FROM OLD.code THEN
          NEW.budget_code := NEW.code;
        ELSIF NEW.budget_code IS DISTINCT FROM OLD.budget_code THEN
          NEW.code := NEW.budget_code;
        END IF;

        IF NEW.title IS DISTINCT FROM OLD.title THEN
          NEW.budget_name := NEW.title;
        ELSIF NEW.budget_name IS DISTINCT FROM OLD.budget_name THEN
          NEW.title := NEW.budget_name;
        END IF;

        IF NEW.allocated_amount IS DISTINCT FROM OLD.allocated_amount THEN
          NEW.approved_amount := NEW.allocated_amount;
        ELSIF NEW.approved_amount IS DISTINCT FROM OLD.approved_amount THEN
          NEW.allocated_amount := NEW.approved_amount;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_sync_budget_line_legacy_new ON budget_lines;
      CREATE TRIGGER trg_sync_budget_line_legacy_new
      BEFORE INSERT OR UPDATE ON budget_lines
      FOR EACH ROW EXECUTE FUNCTION sync_budget_line_legacy_new();
    `);

    // 8. Extend programmes, projects, activities
    console.log('📦 Extending programmes, projects, and activities...');
    await sql.unsafe(`
      ALTER TABLE programmes
      ADD COLUMN IF NOT EXISTS programme_name TEXT;
    `);
    
    await sql.unsafe(`
      UPDATE programmes SET programme_name = COALESCE(programme_name, title);
    `);

    await sql.unsafe(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS development_objective_id UUID REFERENCES development_goals(id) ON DELETE SET NULL;
    `);

    await sql.unsafe(`
      ALTER TABLE activities
      ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS assigned_user UUID REFERENCES users(id) ON DELETE SET NULL;
    `);

    // 9. Create permissions helper tables
    console.log('🛡️ Creating dashboard and menu permissions tables...');
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS dashboard_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id VARCHAR(100) NOT NULL,
        widget_name VARCHAR(100) NOT NULL,
        can_view BOOLEAN DEFAULT TRUE,
        UNIQUE (role_id, widget_name)
      );

      CREATE TABLE IF NOT EXISTS menu_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id VARCHAR(100) NOT NULL,
        menu_name VARCHAR(100) NOT NULL,
        can_view BOOLEAN DEFAULT TRUE,
        can_create BOOLEAN DEFAULT TRUE,
        can_edit BOOLEAN DEFAULT TRUE,
        can_delete BOOLEAN DEFAULT TRUE,
        can_export BOOLEAN DEFAULT TRUE,
        UNIQUE (role_id, menu_name)
      );

      CREATE TABLE IF NOT EXISTS notification_scope (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        department_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        unit_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        role_id VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS government_house (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        director_general_id UUID REFERENCES users(id) ON DELETE SET NULL,
        office_name VARCHAR(255) DEFAULT 'Government House Secretariat',
        status VARCHAR(50) DEFAULT 'active'
      );
    `);

    // 10. Rename Governor's Office to Government House
    console.log('🏛️ Renaming Governor\'s Office / Office of the Executive Governor to Government House...');
    await sql`
      UPDATE organizations
      SET name = 'Government House',
          organization_name = 'Government House',
          type = 'executive_office'
      WHERE name = 'Office of the Executive Governor' OR name = 'Governor''s Office' OR code = 'OEG';
    `;
    
    await sql`
      UPDATE organizations
      SET type = 'executive_office'
      WHERE name = 'Office of the Deputy Governor' OR code = 'ODG';
    `;

    // 11. Populate user_posting with current postings from user records
    console.log('🌱 Populating user_posting records...');
    const users = await sql`SELECT id, primary_organization_id FROM users`;
    for (const u of users) {
      if (u.primary_organization_id) {
        const [existPost] = await sql`SELECT id FROM user_posting WHERE user_id = ${u.id} LIMIT 1`;
        if (!existPost) {
          let title = 'Staff';
          const [roleNameRow] = await sql`
            SELECT r.name 
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = ${u.id} AND ur.is_active = true
            LIMIT 1
          `;
          if (roleNameRow) title = roleNameRow.name;

          await sql`
            INSERT INTO user_posting (user_id, organization_id, office_title, is_current)
            VALUES (${u.id}, ${u.primary_organization_id}, ${title}, true)
          `;
        }
      }
    }

    // 12. Create indexes for performance optimization
    console.log('⚡ Creating performance indexes...');
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS idx_org_parent ON organizations (parent_id);
      
      CREATE INDEX IF NOT EXISTS idx_user_posting_user ON user_posting (user_id);
      CREATE INDEX IF NOT EXISTS idx_user_posting_org ON user_posting (organization_id);
      CREATE INDEX IF NOT EXISTS idx_user_posting_dept ON user_posting (department_id);
      
      CREATE INDEX IF NOT EXISTS idx_user_perms_user ON user_permissions (user_id);
      CREATE INDEX IF NOT EXISTS idx_user_perms_org ON user_permissions (organization_id);
      
      CREATE INDEX IF NOT EXISTS idx_dev_obj_org ON development_goals (organization_id);
      CREATE INDEX IF NOT EXISTS idx_budget_lines_org ON budget_lines (organization_id);
      CREATE INDEX IF NOT EXISTS idx_budget_lines_obj ON budget_lines (development_objective_id);
      
      CREATE INDEX IF NOT EXISTS idx_programmes_org ON programmes (organization_id);
      CREATE INDEX IF NOT EXISTS idx_projects_org ON projects (organization_id);
      CREATE INDEX IF NOT EXISTS idx_projects_prog ON projects (programme_id);
      CREATE INDEX IF NOT EXISTS idx_projects_obj ON projects (development_objective_id);
      
      CREATE INDEX IF NOT EXISTS idx_activities_proj ON activities (project_id);
      CREATE INDEX IF NOT EXISTS idx_activities_org ON activities (organization_id);
      CREATE INDEX IF NOT EXISTS idx_activities_dept ON activities (department_id);
      CREATE INDEX IF NOT EXISTS idx_activities_user ON activities (assigned_user);
      
      CREATE INDEX IF NOT EXISTS idx_nominal_roll_org ON nominal_roll (mother_organization_id);
      CREATE INDEX IF NOT EXISTS idx_nominal_roll_dept ON nominal_roll (current_organization_id);
    `);

    console.log('✅ Visibility Restructure Schema Migration Succeeded!');
  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
    console.error(err.stack);
  } finally {
    await sql.end();
  }
}

run();
