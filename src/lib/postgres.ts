import postgres from 'postgres';
import dns from 'dns/promises';

// Check for standard Vercel Postgres variable first, then fallback to DATABASE_URL
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const envVarName = process.env.POSTGRES_URL ? 'POSTGRES_URL' : 'DATABASE_URL';

// Determine if we are in a production environment (like Vercel)
const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

let sql: postgres.Sql;

if (connectionString) {
  // Extract hostname to perform pre-flight DNS validation
  let hostname = '';
  try {
    const url = new URL(connectionString);
    hostname = url.hostname;
  } catch (err) {
    console.error(`CRITICAL: Invalid connection string format in ${envVarName}.`);
  }

  if (hostname) {
    try {
      // Perform pre-flight DNS resolution check
      await dns.lookup(hostname);
    } catch (err: any) {
      if (err.code === 'ENOTFOUND') {
        const errorMsg = `FATAL: Hostname [${hostname}] from environment variable ${envVarName} cannot be resolved. Please ensure you are using the correct Supabase Connection Pooler URL (e.g., aws-0-eu-west-1.pooler.supabase.com) rather than the direct db.* URL.`;
        console.error(`=======================================================`);
        console.error(`🚨 FATAL DATABASE CONNECTION ERROR 🚨`);
        console.error(errorMsg);
        console.error(`=======================================================`);
        throw new Error(errorMsg);
      }
    }
  }

  // Use the provided connection string securely
  sql = postgres(connectionString, {
    max: 15,
    idle_timeout: 20,
    connect_timeout: 30,
    ssl: 'require', // Strictly passed to enforce secure connections
  });
} else if (!isProd) {
  // Allow localhost fallback ONLY for local development
  sql = postgres({
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
    database: process.env.POSTGRES_DB || 'kogi_erp_test',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'Prince@123',
    max: 15,
    idle_timeout: 20,
    connect_timeout: 30,
  });
} else {
  // We are in production but have no connection string! 
  // Throw a clear predictable error rather than crashing on 127.0.0.1 connection attempts.
  const missingDbError = () => {
    throw new Error("Database not connected: Missing DATABASE_URL or POSTGRES_URL in production environment.");
  };

  sql = new Proxy((() => {}) as any, {
    apply: () => missingDbError(),
    get: () => missingDbError(),
  });
}

export default sql;
