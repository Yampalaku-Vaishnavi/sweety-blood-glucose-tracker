const {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
} = require('../services/reportService');

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function dateError(res) {
  return res.status(400).json({ message: 'date must be a valid calendar date in YYYY-MM-DD format.' });
}

function handleError(res, error) {
  console.error('Report generation failed:', error.message);
  return res.status(500).json({ message: 'Unable to generate the report at this time.' });
}

async function daily(req, res) {
  if (!isValidDate(req.query.date)) return dateError(res);

  try {
    const report = await getDailyReport(req.user.id, req.query.date);
    return res.status(200).json({
      period: { startDate: req.query.date, endDate: req.query.date },
      ...report,
      ...(report.summary.totalReadings === 0 ? { message: 'No readings found for this date.' } : {}),
    });
  } catch (error) {
    return handleError(res, error);
  }
}

async function monthToDate(req, res) {
  if (!isValidDate(req.query.date)) return dateError(res);
  const startDate = `${req.query.date.slice(0, 7)}-01`;

  try {
    const report = await getMonthToDateReport(req.user.id, startDate, req.query.date);
    return res.status(200).json({
      period: { startDate, endDate: req.query.date },
      ...report,
      ...(report.summary.totalReadings === 0 ? { message: 'No readings found in this month-to-date period.' } : {}),
    });
  } catch (error) {
    return handleError(res, error);
  }
}

function parseMonth(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value) || value.startsWith('0000')) return null;
  const month = Number(value.slice(5, 7));
  if (month < 1 || month > 12) return null;

  const startDate = `${value}-01`;
  const year = Number(value.slice(0, 4));
  const endDate = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  return { month: value, startDate, endDate };
}

function previousMonthPeriod() {
  const now = new Date();
  const firstOfCurrentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastOfPreviousMonth = new Date(firstOfCurrentMonth.getTime() - 24 * 60 * 60 * 1000);
  const startDate = new Date(Date.UTC(lastOfPreviousMonth.getUTCFullYear(), lastOfPreviousMonth.getUTCMonth(), 1))
    .toISOString().slice(0, 10);
  return {
    month: startDate.slice(0, 7),
    startDate,
    endDate: lastOfPreviousMonth.toISOString().slice(0, 10),
  };
}

async function monthly(req, res) {
  const period = req.query.month === undefined
    ? previousMonthPeriod()
    : parseMonth(req.query.month);
  if (!period) {
    return res.status(400).json({ message: 'month must be a valid month in YYYY-MM format.' });
  }

  try {
    const report = await getMonthlyReport(req.user.id, period.startDate, period.endDate);
    return res.status(200).json({
      month: period.month,
      period: { startDate: period.startDate, endDate: period.endDate },
      ...report,
      ...(report.summary.totalReadings === 0 ? { message: 'No readings found for this month.' } : {}),
    });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { daily, monthToDate, monthly };
