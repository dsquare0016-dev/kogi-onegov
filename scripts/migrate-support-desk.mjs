import postgres from 'postgres';

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  database: 'kogi_erp_test',
  username: 'postgres',
  password: 'Prince@123',
  max: 3,
});

async function migrate() {
  try {
    console.log("Starting Live Support Desk migration...");

    // 1. support_conversations
    await sql`
      CREATE TABLE IF NOT EXISTS support_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_number VARCHAR(50) NOT NULL UNIQUE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        department_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
        staff_id VARCHAR(100),
        user_full_name VARCHAR(255) NOT NULL,
        user_title VARCHAR(255),
        user_email VARCHAR(255) NOT NULL,
        issue_category VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        priority VARCHAR(50) NOT NULL DEFAULT 'Normal',
        status VARCHAR(50) NOT NULL DEFAULT 'Open',
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        closed_at TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Created support_conversations table");

    // 2. support_messages
    await sql`
      CREATE TABLE IF NOT EXISTS support_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES support_conversations(id) ON DELETE CASCADE,
        sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        sender_type VARCHAR(50) NOT NULL,
        message_body TEXT NOT NULL,
        attachment_url TEXT,
        attachment_name VARCHAR(255),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Created support_messages table");

    // 3. support_internal_notes
    await sql`
      CREATE TABLE IF NOT EXISTS support_internal_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES support_conversations(id) ON DELETE CASCADE,
        note TEXT NOT NULL,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Created support_internal_notes table");

    // 4. support_conversation_status_history
    await sql`
      CREATE TABLE IF NOT EXISTS support_conversation_status_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES support_conversations(id) ON DELETE CASCADE,
        previous_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("Created support_conversation_status_history table");

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

migrate();
