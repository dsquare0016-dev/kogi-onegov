import path from 'path';

// Force production mode to bypass localhost fallback
process.env.NODE_ENV = 'production';

async function testConnection() {
  console.log('Testing connection initialization...');
  
  // Import the postgres module. This will trigger the top-level DNS check.
  const sql = (await import('../src/lib/postgres.ts')).default;
  
  // Wait a moment for the async DNS lookup to print its errors if any
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Test complete.');
  process.exit(0);
}

testConnection().catch(console.error);
