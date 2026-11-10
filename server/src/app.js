const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const readingRoutes = require('./routes/readingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/readings', readingRoutes);

module.exports = app;
