const {
  createReading,
  listReadings,
  findReading,
  updateReading,
  deleteReading,
} = require('../services/readingService');

const timeSlots = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateReading(body) {
  const errors = [];
  if (!body || typeof body !== 'object') return ['A JSON request body is required.'];

  if (!isDate(body.reading_date)) {
    errors.push('reading_date must be a valid date in YYYY-MM-DD format.');
  } else if (body.reading_date > new Date().toISOString().slice(0, 10)) {
    errors.push('reading_date cannot be in the future.');
  }

  if (typeof body.time_slot !== 'string' || !timeSlots.includes(body.time_slot)) {
    errors.push(`time_slot must be one of: ${timeSlots.join(', ')}.`);
  }

  if (!Number.isInteger(body.glucose_value) || body.glucose_value < 40 || body.glucose_value > 600) {
    errors.push('glucose_value must be a whole number between 40 and 600 inclusive.');
  }

  return errors;
}

function validId(value) {
  return typeof value === 'string' && /^[1-9]\d*$/.test(value);
}

function isDuplicateSlot(error) {
  return error.code === '23505' && error.constraint === 'glucose_readings_user_date_slot_unique';
}

function handleError(res, error, action) {
  if (isDuplicateSlot(error)) {
    return res.status(409).json({ message: 'A reading already exists for this date and time slot.' });
  }
  console.error(`${action} failed:`, error.message);
  return res.status(500).json({ message: `Unable to ${action} reading at this time.` });
}

async function create(req, res) {
  const errors = validateReading(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  try {
    const reading = await createReading({
      userId: req.user.id,
      readingDate: req.body.reading_date,
      timeSlot: req.body.time_slot,
      glucoseValue: req.body.glucose_value,
    });
    return res.status(201).json({ reading });
  } catch (error) {
    if (error.code === 'DAILY_LIMIT') {
      return res.status(409).json({ message: 'Maximum four readings are allowed per user per day.' });
    }
    return handleError(res, error, 'create');
  }
}

async function list(req, res) {
  let date;
  if (req.query.date !== undefined) {
    if (!isDate(req.query.date)) {
      return res.status(400).json({ message: 'date filter must be a valid date in YYYY-MM-DD format.' });
    }
    date = req.query.date;
  }

  try {
    const readings = await listReadings(req.user.id, date);
    return res.status(200).json({ readings });
  } catch (error) {
    return handleError(res, error, 'retrieve');
  }
}

async function getById(req, res) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Reading ID must be a positive integer.' });

  try {
    const reading = await findReading(req.user.id, req.params.id);
    if (!reading) return res.status(404).json({ message: 'Reading not found.' });
    return res.status(200).json({ reading });
  } catch (error) {
    return handleError(res, error, 'retrieve');
  }
}

async function update(req, res) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Reading ID must be a positive integer.' });
  const errors = validateReading(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  try {
    const reading = await updateReading({
      id: req.params.id,
      userId: req.user.id,
      readingDate: req.body.reading_date,
      timeSlot: req.body.time_slot,
      glucoseValue: req.body.glucose_value,
    });
    if (!reading) return res.status(404).json({ message: 'Reading not found.' });
    return res.status(200).json({ reading });
  } catch (error) {
    return handleError(res, error, 'update');
  }
}

async function remove(req, res) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Reading ID must be a positive integer.' });

  try {
    const deleted = await deleteReading(req.user.id, req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Reading not found.' });
    return res.status(204).end();
  } catch (error) {
    return handleError(res, error, 'delete');
  }
}

module.exports = { create, list, getById, update, remove };
