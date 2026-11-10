CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS glucose_readings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  time_slot TEXT NOT NULL CHECK (time_slot IN (
    'Morning (fasting)',
    'After breakfast',
    'After lunch',
    'After dinner'
  )),
  glucose_value INTEGER NOT NULL CHECK (glucose_value BETWEEN 40 AND 600),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT glucose_readings_user_date_slot_unique
    UNIQUE (user_id, reading_date, time_slot)
);

CREATE INDEX IF NOT EXISTS glucose_readings_reading_date_idx
  ON glucose_readings (reading_date);