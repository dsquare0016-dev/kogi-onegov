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
  console.log('🏁 Starting PostgreSQL Administrative Setup Migration...');

  try {
    await sql.begin(async sqlTrans => {
      // 1. Create nigerian_states table
      console.log(' - Creating nigerian_states table...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS nigerian_states (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          state_name VARCHAR(100) UNIQUE NOT NULL,
          state_code VARCHAR(10) UNIQUE NOT NULL,
          geopolitical_zone VARCHAR(50),
          capital VARCHAR(100),
          status VARCHAR(20) DEFAULT 'Active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // 2. Seed nigerian_states
      console.log(' - Seeding nigerian_states...');
      const states = [
        { name: 'Abia', code: 'AB', zone: 'South East', capital: 'Umuahia' },
        { name: 'Adamawa', code: 'AD', zone: 'North East', capital: 'Yola' },
        { name: 'Akwa Ibom', code: 'AK', zone: 'South South', capital: 'Uyo' },
        { name: 'Anambra', code: 'AN', zone: 'South East', capital: 'Awka' },
        { name: 'Bauchi', code: 'BA', zone: 'North East', capital: 'Bauchi' },
        { name: 'Bayelsa', code: 'BY', zone: 'South South', capital: 'Yenagoa' },
        { name: 'Benue', code: 'BE', zone: 'North Central', capital: 'Makurdi' },
        { name: 'Borno', code: 'BO', zone: 'North East', capital: 'Maiduguri' },
        { name: 'Cross River', code: 'CR', zone: 'South South', capital: 'Calabar' },
        { name: 'Delta', code: 'DE', zone: 'South South', capital: 'Asaba' },
        { name: 'Ebonyi', code: 'EB', zone: 'South East', capital: 'Abakaliki' },
        { name: 'Edo', code: 'ED', zone: 'South South', capital: 'Benin City' },
        { name: 'Ekiti', code: 'EK', zone: 'South West', capital: 'Ado Ekiti' },
        { name: 'Enugu', code: 'EN', zone: 'South East', capital: 'Enugu' },
        { name: 'Gombe', code: 'GO', zone: 'North East', capital: 'Gombe' },
        { name: 'Imo', code: 'IM', zone: 'South East', capital: 'Owerri' },
        { name: 'Jigawa', code: 'JI', zone: 'North West', capital: 'Dutse' },
        { name: 'Kaduna', code: 'KD', zone: 'North West', capital: 'Kaduna' },
        { name: 'Kano', code: 'KN', zone: 'North West', capital: 'Kano' },
        { name: 'Katsina', code: 'KT', zone: 'North West', capital: 'Katsina' },
        { name: 'Kebbi', code: 'KE', zone: 'North West', capital: 'Birnin Kebbi' },
        { name: 'Kogi', code: 'KO', zone: 'North Central', capital: 'Lokoja' },
        { name: 'Kwara', code: 'KW', zone: 'North Central', capital: 'Ilorin' },
        { name: 'Lagos', code: 'LA', zone: 'South West', capital: 'Ikeja' },
        { name: 'Nasarawa', code: 'NA', zone: 'North Central', capital: 'Lafia' },
        { name: 'Niger', code: 'NI', zone: 'North Central', capital: 'Minna' },
        { name: 'Ogun', code: 'OG', zone: 'South West', capital: 'Abeokuta' },
        { name: 'Ondo', code: 'ON', zone: 'South West', capital: 'Akure' },
        { name: 'Osun', code: 'OS', zone: 'South West', capital: 'Osogbo' },
        { name: 'Oyo', code: 'OY', zone: 'South West', capital: 'Ibadan' },
        { name: 'Plateau', code: 'PL', zone: 'North Central', capital: 'Jos' },
        { name: 'Rivers', code: 'RI', zone: 'South South', capital: 'Port Harcourt' },
        { name: 'Sokoto', code: 'SO', zone: 'North West', capital: 'Sokoto' },
        { name: 'Taraba', code: 'TA', zone: 'North East', capital: 'Jalingo' },
        { name: 'Yobe', code: 'YO', zone: 'North East', capital: 'Damaturu' },
        { name: 'Zamfara', code: 'ZA', zone: 'North West', capital: 'Gusau' },
        { name: 'FCT', code: 'FC', zone: 'North Central', capital: 'Abuja' }
      ];

      for (const s of states) {
        await sqlTrans`
          INSERT INTO nigerian_states (state_name, state_code, geopolitical_zone, capital)
          VALUES (${s.name}, ${s.code}, ${s.zone}, ${s.capital})
          ON CONFLICT (state_name) DO NOTHING
        `;
      }

      // 3. Ensure lgas table columns and seed
      console.log(' - Adjusting columns on lgas table...');
      await sqlTrans.unsafe(`
        ALTER TABLE lgas 
        ADD COLUMN IF NOT EXISTS senatorial_district VARCHAR(50),
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active';
      `);

      console.log(' - Seeding Kogi LGAs...');
      const kogiLgas = [
        { name: 'Adavi', code: 'ADA', district: 'Central', hq: 'Ogaminana' },
        { name: 'Ajaokuta', code: 'AJA', district: 'Central', hq: 'Egain' },
        { name: 'Ankpa', code: 'ANK', district: 'East', hq: 'Ankpa' },
        { name: 'Bassa', code: 'BAS', district: 'East', hq: 'Oguma' },
        { name: 'Dekina', code: 'DEK', district: 'East', hq: 'Dekina' },
        { name: 'Ibaji', code: 'IBA', district: 'East', hq: 'Onyedega' },
        { name: 'Idah', code: 'IDA', district: 'East', hq: 'Idah' },
        { name: 'Igalamela-Odolu', code: 'IGA', district: 'East', hq: 'Ajaka' },
        { name: 'Ijumu', code: 'IJU', district: 'West', hq: 'Iyara' },
        { name: 'Kabba/Bunu', code: 'KAB', district: 'West', hq: 'Kabba' },
        { name: 'Koton Karfe', code: 'KOT', district: 'West', hq: 'Koton Karfe' },
        { name: 'Lokoja', code: 'LOK', district: 'West', hq: 'Lokoja' },
        { name: 'Mopa-Muro', code: 'MOP', district: 'West', hq: 'Mopa' },
        { name: 'Ofu', code: 'OFU', district: 'East', hq: 'Ogwolawo' },
        { name: 'Ogori-Magongo', code: 'OGO', district: 'Central', hq: 'Akpafa' },
        { name: 'Okehi', code: 'OKE', district: 'Central', hq: 'Obangede' },
        { name: 'Okene', code: 'OKN', district: 'Central', hq: 'Okene' },
        { name: 'Olamaboro', code: 'OLA', district: 'East', hq: 'Okpo' },
        { name: 'Omala', code: 'OMA', district: 'East', hq: 'Abejukolo' },
        { name: 'Yagba East', code: 'YAE', district: 'West', hq: 'Isanlu' },
        { name: 'Yagba West', code: 'YAW', district: 'West', hq: 'Odo-Ere' }
      ];

      for (const l of kogiLgas) {
        await sqlTrans`
          INSERT INTO lgas (code, name, headquarters, senatorial_district, population, land_area, annual_budget, status)
          VALUES (${l.code}, ${l.name}, ${l.hq}, ${l.district}, 150000, 250.0, 1200000000.0, 'Active')
          ON CONFLICT (name) DO NOTHING
        `;
      }

      // 4. Create other admin configurations tables
      console.log(' - Creating platform_settings table...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS platform_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          platform_name VARCHAR(150),
          short_platform_name VARCHAR(50),
          government_name VARCHAR(150),
          state_name VARCHAR(50),
          managing_institution VARCHAR(150),
          portal_url VARCHAR(255),
          current_governor_name VARCHAR(150),
          deputy_governor_name VARCHAR(150),
          dg_coordinator_name VARCHAR(150),
          default_report_prepared_by VARCHAR(150),
          default_report_prepared_for VARCHAR(150),
          development_plan_period VARCHAR(100),
          default_currency VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Seed default platform settings
      await sqlTrans.unsafe(`
        INSERT INTO platform_settings (
          platform_name, short_platform_name, government_name, state_name, managing_institution,
          portal_url, current_governor_name, deputy_governor_name, dg_coordinator_name,
          default_report_prepared_by, default_report_prepared_for, development_plan_period, default_currency
        ) VALUES (
          'Kogi OneGov', 'OneGov', 'Kogi State Government', 'Kogi', 'Office of the Governor',
          'https://erp.kogistate.gov.ng', 'H.E. Alhaji Ahmed Usman Ododo', 'H.E. Comrade Joel Salifu', 'Hon. Abdulkareem Asuku',
          'Government Delivery Unit', 'The Executive Governor', '2024 - 2027', 'NGN (₦)'
        ) ON CONFLICT DO NOTHING;
      `);

      console.log(' - Creating login_page_settings table...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS login_page_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          welcome_message TEXT,
          footer_text VARCHAR(255),
          enable_animation BOOLEAN DEFAULT TRUE,
          enable_captcha BOOLEAN DEFAULT FALSE,
          background_image_url TEXT,
          logo_url TEXT,
          hero_text TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await sqlTrans.unsafe(`
        INSERT INTO login_page_settings (welcome_message, footer_text, enable_animation, enable_captcha)
        VALUES ('Sign in to the Kogi State Governance Delivery Platform', 'Powered by GDU', true, false)
        ON CONFLICT DO NOTHING;
      `);

      console.log(' - Creating maintenance_settings table...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS maintenance_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          maintenance_enabled BOOLEAN DEFAULT FALSE,
          maintenance_message TEXT,
          activated_by UUID,
          activated_at TIMESTAMP WITH TIME ZONE,
          deactivated_at TIMESTAMP WITH TIME ZONE
        );
      `);

      await sqlTrans.unsafe(`
        INSERT INTO maintenance_settings (maintenance_enabled, maintenance_message)
        VALUES (false, 'System Under Scheduled Maintenance. Please try again later.')
        ON CONFLICT DO NOTHING;
      `);

      console.log(' - Creating legal_documents table...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS legal_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          document_type VARCHAR(50) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          status VARCHAR(20) DEFAULT 'draft',
          version VARCHAR(20) DEFAULT '1.0',
          updated_by UUID,
          published_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      console.log(' - Creating ai_settings table...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS ai_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          enable_chatbot_globally BOOLEAN DEFAULT TRUE,
          index_budget_data BOOLEAN DEFAULT TRUE,
          index_project_data BOOLEAN DEFAULT TRUE,
          index_activity_logs BOOLEAN DEFAULT TRUE,
          index_generated_reports BOOLEAN DEFAULT TRUE,
          allow_report_generation BOOLEAN DEFAULT TRUE,
          allow_recommendations BOOLEAN DEFAULT TRUE,
          allow_dashboard_insights BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await sqlTrans.unsafe(`
        INSERT INTO ai_settings (enable_chatbot_globally) VALUES (true) ON CONFLICT DO NOTHING;
      `);

      console.log(' - Creating master_override_settings, delegated_super_admins, system_locks, deleted_records...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS master_override_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          master_password_hash VARCHAR(255) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS delegated_super_admins (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID UNIQUE NOT NULL,
          delegated_by UUID,
          assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS system_locks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          is_locked BOOLEAN DEFAULT FALSE,
          locked_by UUID,
          locked_at TIMESTAMP WITH TIME ZONE
        );
        CREATE TABLE IF NOT EXISTS deleted_records (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          entity_type VARCHAR(100) NOT NULL,
          entity_id UUID NOT NULL,
          record_snapshot JSONB NOT NULL,
          deleted_by UUID,
          deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          restored_by UUID,
          restored_at TIMESTAMP WITH TIME ZONE,
          purge_locked BOOLEAN DEFAULT FALSE,
          status VARCHAR(50) DEFAULT 'Soft Deleted'
        );
      `);

      // 5. Add state_id to nominal_roll and applicants
      console.log(' - Referencing state_id in nominal_roll and applicants...');
      await sqlTrans.unsafe(`
        ALTER TABLE nominal_roll 
        ADD COLUMN IF NOT EXISTS state_id UUID REFERENCES nigerian_states(id);
        
        ALTER TABLE applicants 
        ADD COLUMN IF NOT EXISTS state_id UUID REFERENCES nigerian_states(id);
      `);

      // Create indexes for performance
      console.log(' - Creating indexes for performance...');
      await sqlTrans.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_nominal_roll_state_id ON nominal_roll(state_id);
        CREATE INDEX IF NOT EXISTS idx_applicants_state_id ON applicants(state_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      `);
    });

    console.log('✅ PostgreSQL Administrative Setup Migration Completed Successfully!');
  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
  } finally {
    await sql.end();
  }
}

run();
