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
  console.log('🏁 Starting Role-Based Access & E-Memo Migration...');

  try {
    await sql.begin(async sqlTrans => {
      
      // 1. System Settings (Year Lock)
      console.log(' - Ensuring system_settings for Year Lock...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value JSONB,
          description TEXT,
          updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      await sqlTrans.unsafe(`
        INSERT INTO system_settings (setting_key, setting_value, description)
        VALUES (
          'operational_year', 
          '{"current_year": 2026, "is_locked": false}', 
          'Global control for the active operational year. Super Admin toggle.'
        )
        ON CONFLICT (setting_key) DO NOTHING;
      `);

      // 2. Roles and Permissions tables enhancements
      console.log(' - Ensuring roles and permissions...');
      await sqlTrans.unsafe(`
        ALTER TABLE roles 
        ADD COLUMN IF NOT EXISTS is_system_role BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS rank_level INT DEFAULT 0;

        CREATE TABLE IF NOT EXISTS role_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
          module_name VARCHAR(100) NOT NULL,
          can_view BOOLEAN DEFAULT false,
          can_create BOOLEAN DEFAULT false,
          can_edit BOOLEAN DEFAULT false,
          can_delete BOOLEAN DEFAULT false,
          can_approve BOOLEAN DEFAULT false,
          organization_scope VARCHAR(50) DEFAULT 'mda', -- 'mda', 'global', 'department'
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(role_id, module_name)
        );
      `);

      // 3. User Scoping enhancements
      console.log(' - Enhancing user scoping & desk officer flags...');
      await sqlTrans.unsafe(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS desk_officer_enabled BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS primary_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS primary_department_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
      `);

      // 4. Notifications Table
      console.log(' - Creating notifications table...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT,
          notification_type VARCHAR(100) DEFAULT 'general',
          related_entity_type VARCHAR(100),
          related_entity_id UUID,
          priority VARCHAR(20) DEFAULT 'normal',
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          read_at TIMESTAMP WITH TIME ZONE
        );
      `);

      // 5. E-Memo Tables
      console.log(' - Expanding memos table & workflows...');
      // Ensure we have sender/recipient organization tracking for strict scoping
      await sqlTrans.unsafe(`
        ALTER TABLE memos
        ADD COLUMN IF NOT EXISTS sender_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS current_handler_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS current_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS recipient_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS workflow_stage VARCHAR(100) DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'normal';
      `);

      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS memo_audit_trails (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          memo_id UUID REFERENCES memos(id) ON DELETE CASCADE,
          actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          actor_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
          action VARCHAR(100) NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // 6. Extending core tables with organization_id, operational_year, and deleted_at (Soft Delete)
      console.log(' - Adding scoped fields to core tables...');
      const coreTables = ['projects', 'programmes', 'tasks', 'activities', 'budget_lines'];
      for (const table of coreTables) {
        await sqlTrans.unsafe(`
          ALTER TABLE ${table}
          ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
          ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
          ADD COLUMN IF NOT EXISTS operational_year INT DEFAULT 2026,
          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
        `);
      }

      console.log('✅ Migration Transaction Committed Successfully.');
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sql.end();
  }
}

run();
