const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const SALT_ROUNDS = 12;

async function registerUser({ name, email, password }) {
  const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1', [email]);
  if (existing.rowCount > 0) {
    const error = new Error('Email already registered.');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
    [name, email, passwordHash],
  );

  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, name, email, password FROM users WHERE email = $1 LIMIT 1',
    [email],
  );
  return result.rows[0] || null;
}

function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

module.exports = { registerUser, findUserByEmail, verifyPassword };
