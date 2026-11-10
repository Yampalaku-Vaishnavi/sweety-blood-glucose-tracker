const { pool } = require('../config/db');

async function createReport(userId, startDate, endDate) {
  const [summaryResult, readingsResult] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*)::int AS total_readings,
         MAX(glucose_value) AS highest_glucose,
         MIN(glucose_value) AS lowest_glucose,
         ROUND(AVG(glucose_value)::numeric, 1) AS average_glucose
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date >= $2::date AND reading_date <= $3::date`,
      [userId, startDate, endDate],
    ),
    pool.query(
      `SELECT id, reading_date::text AS reading_date, time_slot, glucose_value
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date >= $2::date AND reading_date <= $3::date
       ORDER BY reading_date ASC, time_slot ASC`,
      [userId, startDate, endDate],
    ),
  ]);

  const row = summaryResult.rows[0];
  const totalReadings = row.total_readings;
  return {
    summary: {
      highestGlucose: row.highest_glucose,
      lowestGlucose: row.lowest_glucose,
      averageGlucose: row.average_glucose === null ? null : Number(row.average_glucose),
      totalReadings,
    },
    readings: readingsResult.rows,
  };
}

async function getDailyReport(userId, date) {
  return createReport(userId, date, date);
}

async function getMonthToDateReport(userId, startDate, endDate) {
  return createReport(userId, startDate, endDate);
}

async function getMonthlyReport(userId, startDate, endDate) {
  return createReport(userId, startDate, endDate);
}

module.exports = { getDailyReport, getMonthToDateReport, getMonthlyReport };
