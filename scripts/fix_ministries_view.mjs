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
    console.log("Dropping and recreating ministries VIEW to avoid duplicates from loose LEFT JOINs...");
    
    await sql`
      CREATE OR REPLACE VIEW ministries AS
      SELECT o.id,
        o.name,
        o.short_name,
        o.code,
        o.description,
        COALESCE(obs.total_allocated, (0)::numeric) AS budget,
        COALESCE(obs.total_spent, (0)::numeric) AS spent,
        COALESCE(ps.overall_score, (0)::numeric) AS score,
        concat_ws(' '::text, ch.title, ch.first_name, ch.last_name) AS commissioner_name,
        ch.phone AS commissioner_phone,
        u.email AS commissioner_email,
        concat_ws(' '::text, psuser.title, psuser.first_name, psuser.last_name) AS permanent_secretary,
        o.head_user_id,
        o.is_active,
        o.created_at,
        o.updated_at
      FROM organizations o
        LEFT JOIN organization_budget_summary obs ON obs.organization_id = o.id
        LEFT JOIN performance_scores ps ON ps.organization_id = o.id
        LEFT JOIN (
          SELECT ur.organization_id, ur.user_id
          FROM user_roles ur
          JOIN roles r ON r.id = ur.role_id AND r.name = 'commissioner'
          WHERE ur.is_active = true
        ) ur_comm ON ur_comm.organization_id = o.id
        LEFT JOIN users u ON u.id = ur_comm.user_id
        LEFT JOIN user_profiles ch ON ch.user_id = ur_comm.user_id
        LEFT JOIN (
          SELECT ur.organization_id, ur.user_id
          FROM user_roles ur
          JOIN roles r ON r.id = ur.role_id AND r.name = 'permanent_secretary'
          WHERE ur.is_active = true
        ) ur_ps ON ur_ps.organization_id = o.id
        LEFT JOIN user_profiles psuser ON psuser.user_id = ur_ps.user_id
      WHERE o.type = 'ministry'::org_type;
    `;
    
    console.log("VIEW ministries updated successfully!");

    // Query ministries view to verify duplicates are gone
    const rows = await sql`
      SELECT id, name, COUNT(*) 
      FROM ministries 
      GROUP BY id, name 
      HAVING COUNT(*) > 1
    `;
    console.log("Remaining duplicates in ministries view:", rows);

  } catch (err) {
    console.error("Failed to update view:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
