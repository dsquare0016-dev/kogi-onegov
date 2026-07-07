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
  console.log('🏁 Starting PostgreSQL Email Engine, Staff ID, and Recruitment Migration...');

  try {
    await sql.begin(async sqlTrans => {
      // 1. Alter type user_status enum values
      console.log(' - Extending user_status enum values...');
      try {
        await sqlTrans.unsafe(`ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'resigned'`);
        await sqlTrans.unsafe(`ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'dismissed'`);
        await sqlTrans.unsafe(`ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'terminated'`);
        await sqlTrans.unsafe(`ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'sacked'`);
      } catch (e) {
        console.log('   ⚠️ user_status enum extension notice:', e.message);
      }

      // 2. Create workforce_categories table
      console.log(' - Creating workforce_categories table...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS workforce_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Seed workforce_categories
      console.log(' - Seeding workforce_categories...');
      const categories = [
        { code: 'CS', name: 'Civil Service', desc: 'Civil Servant workforce category' },
        { code: 'PO', name: 'Political Office Holder', desc: 'Political Office Holder category' },
        { code: 'JD', name: 'Judiciary', desc: 'Judicial officers and staff' },
        { code: 'LG', name: 'Local Government Service', desc: 'Local government administrative staff' },
        { code: 'CT', name: 'Contract Staff', desc: 'Contractual workers' },
        { code: 'AH', name: 'Ad-hoc Staff', desc: 'Temporary or Ad-hoc workers' },
      ];

      for (const cat of categories) {
        await sqlTrans`
          INSERT INTO workforce_categories (code, name, description)
          VALUES (${cat.code}, ${cat.name}, ${cat.desc})
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description
        `;
      }

      // 3. Create smtp_settings table
      console.log(' - Creating smtp_settings table...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS smtp_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          host VARCHAR(255) NOT NULL,
          port INTEGER NOT NULL DEFAULT 587,
          username VARCHAR(255),
          password TEXT, -- Encrypted string
          sender_name VARCHAR(255),
          sender_email VARCHAR(255),
          encryption_type VARCHAR(50) DEFAULT 'STARTTLS',
          is_enabled BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Seed empty or default local mock SMTP config
      const [existingSmtp] = await sqlTrans`SELECT id FROM smtp_settings LIMIT 1`;
      if (!existingSmtp) {
        console.log(' - Seeding default mock SMTP settings...');
        await sqlTrans`
          INSERT INTO smtp_settings (host, port, username, password, sender_name, sender_email, encryption_type, is_enabled)
          VALUES ('smtp.mailtrap.io', 2525, 'mock_user', 'mock_pass', 'Kogi OneGov ERP Portal', 'noreply@kogistate.gov.ng', 'STARTTLS', true)
        `;
      }

      // 4. Create email logs and queue tables
      console.log(' - Creating email logs and queue tables...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS email_notification_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          recipient_email VARCHAR(255) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          template_name VARCHAR(100),
          status VARCHAR(50) DEFAULT 'Sent',
          error_message TEXT,
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB
        );
      `);

      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS email_notification_queue (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          recipient_email VARCHAR(255) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          body_html TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'PendingApproval', -- PendingApproval, Approved, Rejected
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
          approved_at TIMESTAMP WITH TIME ZONE
        );
      `);

      // 5. Create password_reset_tokens table
      console.log(' - Creating password_reset_tokens table...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          is_used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // 6. Create recruitment tables
      console.log(' - Creating recruitment campaign and application tables...');
      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS recruitment_campaigns (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          workforce_category_id UUID REFERENCES workforce_categories(id) ON DELETE SET NULL,
          organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
          department_id UUID,
          application_start_date DATE,
          application_end_date DATE,
          is_active BOOLEAN DEFAULT TRUE,
          public_slug VARCHAR(255) UNIQUE NOT NULL,
          public_url VARCHAR(255),
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS recruitment_applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          campaign_id UUID REFERENCES recruitment_campaigns(id) ON DELETE CASCADE,
          application_number VARCHAR(100) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          middle_name VARCHAR(100),
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          date_of_birth DATE NOT NULL,
          gender VARCHAR(20) NOT NULL,
          state_of_origin VARCHAR(100) NOT NULL,
          lga_id UUID REFERENCES lgas(id) ON DELETE SET NULL,
          address TEXT NOT NULL,
          qualification VARCHAR(255) NOT NULL,
          position_applied_for VARCHAR(255) NOT NULL,
          uploaded_cv TEXT,
          uploaded_credentials TEXT,
          application_status VARCHAR(50) DEFAULT 'Submitted', -- Submitted, Under Review, Shortlisted, Screening, Interview, Successful, Unsuccessful, Added to Nominal Roll
          screening_score INTEGER,
          interview_score INTEGER,
          final_decision TEXT,
          remarks TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await sqlTrans.unsafe(`
        CREATE TABLE IF NOT EXISTS recruitment_status_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          application_id UUID REFERENCES recruitment_applications(id) ON DELETE CASCADE,
          previous_status VARCHAR(50),
          new_status VARCHAR(50) NOT NULL,
          changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
          remarks TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Seed a default campaign if empty
      const [existingCamp] = await sqlTrans`SELECT id FROM recruitment_campaigns LIMIT 1`;
      if (!existingCamp) {
        console.log(' - Seeding default active recruitment campaign...');
        const [csCat] = await sqlTrans`SELECT id FROM workforce_categories WHERE code = 'CS' LIMIT 1`;
        if (csCat) {
          await sqlTrans`
            INSERT INTO recruitment_campaigns (title, description, workforce_category_id, application_start_date, application_end_date, is_active, public_slug)
            VALUES ('2026 General Civil Service Recruitment', 'Statewide recruitment for public administrators, engineers, and teachers.', ${csCat.id}, '2026-07-01', '2026-12-31', true, 'general-2026')
          `;
        }
      }

      // 7. Alter nominal_roll columns
      console.log(' - Altering nominal_roll columns...');
      await sqlTrans.unsafe(`
        ALTER TABLE nominal_roll
        ADD COLUMN IF NOT EXISTS old_staff_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS workforce_category_id UUID REFERENCES workforce_categories(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS employment_year INTEGER,
        ADD COLUMN IF NOT EXISTS retirement_year INTEGER,
        ADD COLUMN IF NOT EXISTS serial_number INTEGER,
        ADD COLUMN IF NOT EXISTS inactive_reason TEXT,
        ADD COLUMN IF NOT EXISTS inactive_effective_date DATE,
        ADD COLUMN IF NOT EXISTS inactive_approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS inactive_document_url TEXT;
      `);

      // 8. Migrate existing staff records to new Staff ID format
      console.log(' - Migrating existing staff records to new Staff ID format...');
      const [csCat] = await sqlTrans`SELECT id FROM workforce_categories WHERE code = 'CS' LIMIT 1`;
      
      if (csCat) {
        const staffList = await sqlTrans`
          SELECT id, staff_id, employment_date, retirement_due_date 
          FROM nominal_roll
          ORDER BY created_at ASC
        `;

        let seq = 1;
        for (const row of staffList) {
          // If staff_id is already in the new format (e.g. starts with KGS/CS/), skip or re-process
          if (row.staff_id && row.staff_id.startsWith('KGS/CS/')) {
            seq++;
            continue; 
          }

          const empDate = row.employment_date ? new Date(row.employment_date) : new Date('2025-01-01');
          const retDate = row.retirement_due_date ? new Date(row.retirement_due_date) : null;

          const empYear = empDate.getFullYear();
          const retYear = retDate ? retDate.getFullYear() : (empYear + 35);

          const serialPadded = String(seq).padStart(6, '0');
          const empYearShort = String(empYear).slice(-2);
          const retYearShort = String(retYear).slice(-2);

          const newStaffId = `KGS/CS/${serialPadded}/${empYearShort}/${retYearShort}`;

          console.log(`   🔁 Migrating staff: ${row.staff_id} -> ${newStaffId}`);

          // Update nominal roll
          await sqlTrans`
            UPDATE nominal_roll SET
              old_staff_id = staff_id,
              staff_id = ${newStaffId},
              workforce_category_id = ${csCat.id},
              employment_year = ${empYear},
              retirement_year = ${retYear},
              serial_number = ${seq}
            WHERE id = ${row.id}
          `;

          // Update users table too
          await sqlTrans`
            UPDATE users SET
              staff_id = ${newStaffId}
            WHERE nominal_roll_id = ${row.id} OR staff_id = ${row.staff_id}
          `;

          seq++;
        }
      }

      console.log('✅ Migration Transaction Completed Successfully!');
    });
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
