import postgres from 'postgres';

// Check for standard Vercel Postgres variable first, then fallback to DATABASE_URL
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// Determine if we are in a production environment (like Vercel)
const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

let sql: postgres.Sql;

if (connectionString) {
  // Use the provided connection string securely
  sql = postgres(connectionString, {
    max: 15,
    idle_timeout: 20,
    connect_timeout: 30,
    ssl: isProd ? 'require' : false, // Many production DBs (Supabase/Vercel) require SSL
  });
} else if (!isProd) {
  // Allow localhost fallback ONLY for local development
  sql = postgres({
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
    database: process.env.POSTGRES_DB || 'kogi_erp_test',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
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
