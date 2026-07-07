import postgres from "postgres";

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  database: 'kogi_erp_test',
  username: 'postgres',
  password: 'Prince@123'
});

async function run() {
  try {
    console.log("Starting recruitment schema migration...");

    // 1. Alter recruitment_campaigns
    await sql`
      ALTER TABLE recruitment_campaigns
      ADD COLUMN IF NOT EXISTS recruitment_year VARCHAR,
      ADD COLUMN IF NOT EXISTS is_closed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS eligibility_rules TEXT,
      ADD COLUMN IF NOT EXISTS vacancies_directives TEXT,
      ADD COLUMN IF NOT EXISTS application_instructions TEXT,
      ADD COLUMN IF NOT EXISTS minimum_qualification VARCHAR;
    `;
    
    // Rename public_slug to slug if it exists and slug doesn't
    const cols = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'recruitment_campaigns' AND column_name = 'public_slug'
    `;
    const hasSlug = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'recruitment_campaigns' AND column_name = 'slug'
    `;
    if (cols.length > 0 && hasSlug.length === 0) {
      await sql`ALTER TABLE recruitment_campaigns RENAME COLUMN public_slug TO slug;`;
    }

    // 2. Create recruitment_campaign_positions
    await sql`
      CREATE TABLE IF NOT EXISTS recruitment_campaign_positions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES recruitment_campaigns(id) ON DELETE CASCADE,
        position_title VARCHAR NOT NULL,
        position_code VARCHAR,
        description TEXT,
        available_slots INTEGER,
        minimum_qualification VARCHAR,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 3. Create recruitment_campaign_documents
    await sql`
      CREATE TABLE IF NOT EXISTS recruitment_campaign_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES recruitment_campaigns(id) ON DELETE CASCADE,
        document_name VARCHAR NOT NULL,
        document_key VARCHAR NOT NULL,
        is_required BOOLEAN DEFAULT true,
        allowed_file_types VARCHAR,
        max_file_size_mb INTEGER DEFAULT 5,
        instructions TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 4. Create recruitment_campaign_sections
    await sql`
      CREATE TABLE IF NOT EXISTS recruitment_campaign_sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES recruitment_campaigns(id) ON DELETE CASCADE,
        section_key VARCHAR NOT NULL,
        section_name VARCHAR NOT NULL,
        is_enabled BOOLEAN DEFAULT true,
        is_required BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 5. Alter recruitment_applications
    await sql`
      ALTER TABLE recruitment_applications
      ADD COLUMN IF NOT EXISTS lga_text VARCHAR,
      ADD COLUMN IF NOT EXISTS highest_qualification VARCHAR,
      ADD COLUMN IF NOT EXISTS professional_certification VARCHAR,
      ADD COLUMN IF NOT EXISTS work_experience_summary TEXT,
      ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS rules_acknowledged_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
    `;
    
    // Rename qualification to highest_qualification if qualification exists and highest_qualification doesn't
    const appCols = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'recruitment_applications' AND column_name = 'qualification'
    `;
    if (appCols.length > 0) {
      await sql`ALTER TABLE recruitment_applications RENAME COLUMN qualification TO highest_qualification;`.catch(() => {});
    }

    // 6. Create recruitment_application_documents
    await sql`
      CREATE TABLE IF NOT EXISTS recruitment_application_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL REFERENCES recruitment_applications(id) ON DELETE CASCADE,
        campaign_document_id UUID REFERENCES recruitment_campaign_documents(id) ON DELETE SET NULL,
        document_key VARCHAR NOT NULL,
        file_url TEXT NOT NULL,
        file_name VARCHAR,
        file_type VARCHAR,
        file_size INTEGER,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 7. Create recruitment_settings
    await sql`
      CREATE TABLE IF NOT EXISTS recruitment_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recruitment_enabled BOOLEAN DEFAULT true,
        allow_status_check BOOLEAN DEFAULT true,
        portal_base_url VARCHAR,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await sql.end();
  }
}

run();
