require('dotenv').config();

const app = require('./src/app');
const { connectDatabase, pool } = require('./src/config/db');

const port = Number(process.env.PORT) || 3000;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Sweety API listening on port ${port}.`);
    });
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error.message);
    await pool.end();
    process.exitCode = 1;
  }
}

startServer();
