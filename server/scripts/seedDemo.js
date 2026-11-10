require('dotenv').config();

const bcrypt = require('bcrypt');
const { pool } = require('../src/config/db');

const demoReadings = [
  ['Morning (fasting)', 110],
  ['After breakfast', 128],
  ['After lunch', 142],
  ['After dinner', 119],
];

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

async function seedDemo() {
  const name = (process.env.DEMO_USER_NAME || 'Sweety Demo').trim();
  const email = (process.env.DEMO_USER_EMAIL || 'demo@sweety.test').trim().toLowerCase();
  const password = process.env.DEMO_USER_PASSWORD;
  const readingDate = process.env.DEMO_READING_DATE || '2024-01-15';
  const today = new Date().toISOString().slice(0, 10);

  if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('Set DEMO_USER_NAME and a valid DEMO_USER_EMAIL before seeding.');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Set DEMO_USER_PASSWORD to a local password of at least 8 characters.');
  }
  if (!isValidDate(readingDate) || readingDate > today) {
    throw new Error('DEMO_READING_DATE must be a valid date that is not in the future.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let user = await client.query('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1', [email]);
    let userId = user.rows[0]?.id;

    if (!userId) {
      const passwordHash = await bcrypt.hash(password, 12);
      const inserted = await client.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [name, email, passwordHash],
      );
      userId = inserted.rows[0]?.id;
      if (!userId) {
        user = await client.query('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1', [email]);
        userId = user.rows[0]?.id;
      }
    }

    if (!userId) throw new Error('Unable to find or create the demo user.');

    for (const [timeSlot, glucoseValue] of demoReadings) {
      await client.query(
        `INSERT INTO glucose_readings (user_id, reading_date, time_slot, glucose_value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ON CONSTRAINT glucose_readings_user_date_slot_unique DO NOTHING`,
        [userId, readingDate, timeSlot, glucoseValue],
      );
    }

    await client.query('COMMIT');
    console.log(`Demo account is ready (${email}); four sample slots are present for ${readingDate}.`);
    console.log('The demo password is not printed. Re-running this script does not replace an existing password or readings.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDemo().catch((error) => {
  console.error('Demo seed failed:', error.message);
  process.exitCode = 1;
});
