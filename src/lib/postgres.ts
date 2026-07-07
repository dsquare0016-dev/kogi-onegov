import postgres from 'postgres';

// Shared connection pool configuration
const sql = postgres({
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
  database: process.env.POSTGRES_DB || 'kogi_erp_test',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 15,
  idle_timeout: 20,
  connect_timeout: 30,
});

export default sql;
