import fs from 'fs';
import postgres from 'postgres';

// Load .env.local
let connectionString = process.env.DATABASE_URL;
if (!connectionString && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
  if (dbUrlMatch) {
    connectionString = dbUrlMatch[1].trim();
  }
}

// Fallback to local PostgreSQL if the database URL has the placeholder password
if (connectionString && connectionString.includes('[YOUR-PASSWORD]')) {
  console.log("⚠️ DATABASE_URL contains default placeholder [YOUR-PASSWORD]. Falling back to local PostgreSQL database.");
  connectionString = "postgres://postgres:Prince@123@127.0.0.1:5432/kogi_erp_test";
}

if (!connectionString) {
  connectionString = "postgres://postgres:Prince@123@127.0.0.1:5432/kogi_erp_test";
}

console.log("Connecting to database at:", connectionString.replace(/:([^:@]+)@/, ':****@'));

// Connect to the DB
const isLocal = connectionString.includes('127.0.0.1') || connectionString.includes('localhost');
const sql = postgres(connectionString, {
  ssl: isLocal ? false : 'require'
});

async function run() {
  console.log("🏁 Starting Homepage Slides Database Migration...");
  try {
    // Get the site_configuration setting
    const [row] = await sql`
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'site_configuration' 
      LIMIT 1
    `;
    
    if (!row) {
      console.log("⚠️ No site_configuration found in database, skipping DB slide update (it will load from defaultSlides instead).");
      return;
    }

    const value = row.setting_value;
    if (!value.slides) {
      value.slides = [];
    }

    // Check if slide 5 already exists
    const hasSlide5 = value.slides.some(s => s.id === '5' || s.title === 'ON SECURITY, PEACE & PUBLIC SAFETY');
    if (hasSlide5) {
      console.log("ℹ️ Slide 5 already exists in database configuration.");
    } else {
      const newSlide = {
        id: "5",
        type: "quote",
        title: "ON SECURITY, PEACE & PUBLIC SAFETY",
        quote: "The Ododo administration remains committed to safeguarding lives and property across the state, declaring that no part of Kogi will be surrendered to criminal elements under any guise. Kogi State remains a peaceful and hospitable home for all law-abiding citizens regardless of ethnicity, religion, or occupation. However, criminality in any form will not be tolerated.",
        bgImage: "/governor-security.jpg",
        author: "H.E. Governor Ahmed Usman Ododo",
        active: true
      };
      
      value.slides.push(newSlide);
      
      // Update database
      await sql`
        UPDATE system_settings 
        SET setting_value = ${JSON.stringify(value)}::jsonb,
            updated_at = NOW()
        WHERE setting_key = 'site_configuration'
      `;
      console.log("✅ Slide 5 successfully appended and saved to database configuration!");
    }
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await sql.end();
  }
}

run();
