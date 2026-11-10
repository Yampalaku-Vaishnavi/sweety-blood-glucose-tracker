const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function connectDatabase() {
  const missing = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
    .filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('PostgreSQL connection established.');
  } finally {
    client.release();
  }
}

module.exports = { pool, connectDatabase };
