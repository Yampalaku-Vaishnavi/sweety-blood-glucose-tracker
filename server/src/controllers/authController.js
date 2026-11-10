const jwt = require('jsonwebtoken');
const { registerUser, findUserByEmail, verifyPassword } = require('../services/authService');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
  const { name, email, password } = req.body || {};

  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }

  try {
    const user = await registerUser({ name: name.trim(), email: normalizedEmail, password });
    return res.status(201).json({
      message: 'Registration successful.',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error.code === 'EMAIL_EXISTS' || error.code === '23505') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    console.error('Registration failed:', error.message);
    return res.status(500).json({ message: 'Unable to register at this time.' });
  }
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Invalid email or password.' });
  }

  try {
    const user = await findUserByEmail(normalizedEmail);
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Authentication is not configured.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ message: 'Unable to log in at this time.' });
  }
}

module.exports = { register, login };
