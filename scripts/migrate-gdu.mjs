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
    console.log('Migrating GDU Command Centre tables...');

    // Extend support_conversations
    await sql`
      ALTER TABLE support_conversations
      ADD COLUMN IF NOT EXISTS request_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS receiving_organization_id UUID,
      ADD COLUMN IF NOT EXISTS workflow_stage VARCHAR(100),
      ADD COLUMN IF NOT EXISTS escalation_level VARCHAR(50),
      ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS linked_memo_id UUID,
      ADD COLUMN IF NOT EXISTS linked_project_id UUID,
      ADD COLUMN IF NOT EXISTS linked_budget_id UUID,
      ADD COLUMN IF NOT EXISTS linked_programme_id UUID,
      ADD COLUMN IF NOT EXISTS linked_activity_id UUID,
      ADD COLUMN IF NOT EXISTS audit_trail JSONB DEFAULT '[]'::jsonb
    `;
    console.log('support_conversations extended.');

    // Extend projects
    await sql`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS evidence_url TEXT
    `;
    console.log('projects extended.');

    // Extend fund_releases
    await sql`
      ALTER TABLE fund_releases
      ADD COLUMN IF NOT EXISTS approval_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS treasury_officer_id UUID,
      ADD COLUMN IF NOT EXISTS evidence_url TEXT
    `;
    console.log('fund_releases extended.');

    // Extend audit_cases
    await sql`
      ALTER TABLE audit_cases
      ADD COLUMN IF NOT EXISTS offender_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS severity VARCHAR(50),
      ADD COLUMN IF NOT EXISTS recommended_action TEXT,
      ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS evidence_url TEXT
    `;
    console.log('audit_cases extended.');

    console.log('All migrations successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

run();
