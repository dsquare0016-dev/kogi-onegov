import sql from '../src/lib/postgres.js';

async function main() {
  console.log("Starting SPI Formula Migration...");

  try {
    // 1. Insert default SPI formula
    // First, ensure system_settings has a unique constraint on setting_key if it doesn't
    await sql`
      ALTER TABLE system_settings ADD CONSTRAINT system_settings_setting_key_key UNIQUE (setting_key)
      EXCEPTION WHEN duplicate_table THEN
        -- Do nothing if the constraint already exists
    `;

    await sql`
      INSERT INTO system_settings (id, setting_key, setting_value, description)
      VALUES (
        gen_random_uuid(), 
        'spi_formula', 
        '{"projects_delivery": 30, "budget_performance": 25, "dev_plan_alignment": 20, "task_completion": 15, "audit_compliance": 10}', 
        'Weights for calculating the State Performance Index (SPI)'
      )
      ON CONFLICT (setting_key) DO UPDATE
      SET setting_value = EXCLUDED.setting_value,
          description = EXCLUDED.description;
    `;
    console.log("✅ SPI formula configuration inserted/updated.");

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
