const { pool } = require('../config/db');

const readingFields = `
  id,
  reading_date,
  time_slot,
  glucose_value,
  created_at,
  updated_at
`;

async function createReading({ userId, readingDate, timeSlot, glucoseValue }) {
  const count = await pool.query(
    'SELECT COUNT(*)::int AS total FROM glucose_readings WHERE user_id = $1 AND reading_date = $2',
    [userId, readingDate],
  );
  if (count.rows[0].total >= 4) {
    const error = new Error('Daily reading limit reached.');
    error.code = 'DAILY_LIMIT';
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO glucose_readings (user_id, reading_date, time_slot, glucose_value)
     VALUES ($1, $2, $3, $4)
     RETURNING ${readingFields}`,
    [userId, readingDate, timeSlot, glucoseValue],
  );
  return result.rows[0];
}

async function listReadings(userId, date) {
  const query = date
    ? pool.query(
      `SELECT ${readingFields} FROM glucose_readings
       WHERE user_id = $1 AND reading_date = $2
       ORDER BY reading_date DESC, time_slot`,
      [userId, date],
    )
    : pool.query(
      `SELECT ${readingFields} FROM glucose_readings
       WHERE user_id = $1
       ORDER BY reading_date DESC, time_slot`,
      [userId],
    );
  const result = await query;
  return result.rows;
}

async function findReading(userId, id) {
  const result = await pool.query(
    `SELECT ${readingFields} FROM glucose_readings WHERE user_id = $1 AND id = $2`,
    [userId, id],
  );
  return result.rows[0] || null;
}

async function updateReading({ id, userId, readingDate, timeSlot, glucoseValue }) {
  const result = await pool.query(
    `UPDATE glucose_readings
     SET reading_date = $1, time_slot = $2, glucose_value = $3, updated_at = CURRENT_TIMESTAMP
     WHERE id = $4 AND user_id = $5
     RETURNING ${readingFields}`,
    [readingDate, timeSlot, glucoseValue, id, userId],
  );
  return result.rows[0] || null;
}

async function deleteReading(userId, id) {
  const result = await pool.query(
    'DELETE FROM glucose_readings WHERE user_id = $1 AND id = $2 RETURNING id',
    [userId, id],
  );
  return result.rowCount > 0;
}

module.exports = { createReading, listReadings, findReading, updateReading, deleteReading };
