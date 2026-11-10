# Sweety – Blood Glucose Tracker

Sweety is a full-stack application for recording personal blood glucose readings and reviewing daily and monthly summaries. The React frontend communicates with a Node.js/Express API backed by PostgreSQL.

- `client/client/` — React 19 + Vite frontend, pages, components, and API services.
- `server/` — Node.js + Express API, database migration, and seed script.

## Features and stack

Sweety supports account registration and sign-in, protected dashboard/profile pages, glucose reading create/view/edit/delete, date-filtered history, and daily, month-to-date, and monthly reports. It uses React, Vite, JavaScript, Node.js, Express, PostgreSQL, bcrypt, JWT, and the browser Fetch API.

Profile details are read-only. Password reset, Google sign-in, profile editing, notifications, and notes are not implemented because the backend has no supporting APIs.

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 8 requirement), npm, PostgreSQL 16 or compatible, and `psql`.

## Database setup

Create the database once if it is absent:

```powershell
createdb -h localhost -p 5432 -U postgres sweety_db
```

Apply the migration from the project root:

```powershell
psql -h localhost -p 5432 -U postgres -d sweety_db -v ON_ERROR_STOP=1 -f .\server\migrations\001_create_users_and_glucose_readings.sql
```

Enter PostgreSQL credentials only at the secure prompt. The migration uses `IF NOT EXISTS` for tables and indexes; it does not repair a pre-existing table with a different definition. `glucose_readings` references users with `ON DELETE CASCADE`. The allowed slot check and unique `(user_id, reading_date, time_slot)` constraint limit accounts to four readings per day. The unique index begins with `user_id`; the date index supports report filtering.

## Backend setup

```powershell
cd D:\Sweety\server
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm install
```

Set `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and a long random `JWT_SECRET` in `server/.env`. The `.env` file is local and must not be committed. Start the backend with `npm run dev`; it verifies PostgreSQL on startup. Health check: `GET http://localhost:3000/api/health`.

## Frontend setup

In a second terminal:

```powershell
cd D:\Sweety\client\client
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm install
npm run dev
```

`VITE_API_BASE_URL` defaults to `http://localhost:3000/api`. Only public values belong in `VITE_*` variables; database credentials and JWT signing secrets must never be exposed to the frontend. The shared Fetch API service stores JWT and safe user details in browser `sessionStorage`, and attaches `Authorization: Bearer <token>` to protected API requests. The backend remains responsible for authorization.

## Demo seed

`server/scripts/seedDemo.js` creates a demo account if missing and one reading in each of the four slots. It hashes the configured password using bcrypt, uses parameterized queries and a transaction, and skips existing user/date/slot readings. Re-running the script does not replace a password or an existing reading.

Set these values in local `server/.env` (never in source control):

```text
DEMO_USER_NAME=Sweety Demo
DEMO_USER_EMAIL=demo@sweety.test
DEMO_USER_PASSWORD=
# Optional; defaults to the stable date 2024-01-15.
# DEMO_READING_DATE=YYYY-MM-DD
```

Then run `npm run seed` from `server/`. The script prints the email and date, never the password. No demo password is configured in this repository; use the local password you chose. Dates must be valid and not in the future (UTC). The stable default makes repeat runs idempotent across days as well.

## API reference

All APIs use `/api`. Routes for readings and reports require a valid JWT bearer token.

### Authentication

- `POST /api/auth/register` body `{ name, email, password }`; returns `201` with `{ message, user: { id, name, email } }`.
- `POST /api/auth/login` body `{ email, password }`; returns `200` with `{ message, token, user: { id, name, email } }`.
- Password hashes are never returned. Signup passwords must contain at least 8 characters. JWT contains the user ID and expires after one hour.

### Readings

- `POST /api/readings` body `{ reading_date: "YYYY-MM-DD", time_slot, glucose_value }`; returns `201 { reading }`.
- `GET /api/readings` returns `{ readings }`; optional `?date=YYYY-MM-DD` filter.
- `GET /api/readings/:id` returns `{ reading }`, or `404` if missing or owned by another user.
- `PUT /api/readings/:id` requires the complete reading body and returns `{ reading }`.
- `DELETE /api/readings/:id` returns `204`, or `404` if missing or owned by another user.

Allowed time slots: `Morning (fasting)`, `After breakfast`, `After lunch`, `After dinner`. Values must be whole numbers from 40 to 600 inclusive. Future dates, duplicate slots, and a fifth daily reading are rejected.

### Reports

- `GET /api/reports/daily?date=YYYY-MM-DD` reports one calendar day.
- `GET /api/reports/month-to-date?date=YYYY-MM-DD` covers the first day of that month through the selected date, inclusive.
- `GET /api/reports/monthly?month=YYYY-MM` covers that whole calendar month; omitted month defaults to the previous UTC calendar month.

Report responses contain `period`, `summary` (`highestGlucose`, `lowestGlucose`, `averageGlucose`, `totalReadings`) and `readings`. PostgreSQL calculates aggregates; average is rounded to one decimal place. Empty reports have zero readings, null high/low/average values, an empty reading array, and a message.

## Testing

`server/package.json` does not define an automated backend test command. Its available scripts are `npm start`, `npm run dev`, and `npm run seed`; none runs a test suite. Do not use `npm test` unless a test script is added. The frontend has `npm run lint` and `npm run build`, but no automated frontend test script.

### Manual backend API testing with Postman

Start PostgreSQL and the backend from `server/` using `npm run dev`. In Postman, set `baseUrl` to `http://localhost:3000/api`. Use temporary test credentials and a temporary account; do not test deletion with the demo account or its readings.

1. **Health:** send `GET {{baseUrl}}/health`. Expect `200` and `{ "status": "ok" }`.
2. **Signup:** send `POST {{baseUrl}}/auth/register` with JSON `{ "name": "Postman Test", "email": "<unique test email>", "password": "<temporary password of at least 8 characters>" }`. Expect `201`. Repeating with the same email should return `409`; invalid or missing fields return `400`.
3. **Login:** send `POST {{baseUrl}}/auth/login` with the same email and password. Expect `200`; copy `token` from the response into a Postman variable named `token`. Invalid credentials return `401`.
4. **Authenticated reading CRUD:** set Authorization to **Bearer Token** using `{{token}}`. Create a reading with `POST {{baseUrl}}/readings`, using a valid non-future `reading_date`, an allowed `time_slot`, and an integer `glucose_value` from 40 to 600. Expect `201`; save the returned reading `id` as `readingId`. `GET {{baseUrl}}/readings` and `GET {{baseUrl}}/readings/{{readingId}}` should return `200`. Update it with a complete valid body using `PUT {{baseUrl}}/readings/{{readingId}}`; expect `200`. Keep the reading until after report checks.
5. **Reports:** while the temporary reading exists, request `GET {{baseUrl}}/reports/daily?date=<reading_date>` and `GET {{baseUrl}}/reports/month-to-date?date=<reading_date>`; expect `200`. Request `GET {{baseUrl}}/reports/monthly?month=<reading month in YYYY-MM>` to verify a populated monthly report; expect `200`. Also request `GET {{baseUrl}}/reports/monthly` without a month to test the previous-calendar-month default; expect `200`, with either readings or the empty-state response.
6. **Unauthorized access:** repeat `GET {{baseUrl}}/readings` and a report request with no token, then with an invalid token. Each should return `401`.
7. **Cleanup:** delete the temporary reading with `DELETE {{baseUrl}}/readings/{{readingId}}` (expect `204`), then remove only the temporary account after testing. Deleting a user cascades to that user's readings.

The frontend checks are run from `client/client/`:

```powershell
npm run lint
npm run build
```

## Screenshots and demo recording

Screenshots and a recording are not currently included. Capture the dashboard, reading form, history/edit state, populated and empty reports, profile, and mobile navigation. Use demo data only and keep passwords, tokens, and private user information out of captures.

Suggested 2–3 minute demo: sign in; show the dashboard; add a reading and validation feedback; edit it in history; show daily, month-to-date, previous-month, and empty reports; open profile; sign out.

## Assumptions and future improvements

- Dates are ISO calendar dates. The frontend uses UTC calendar dates so reading entry matches the API's future-date validation and the default previous-month calculation.
- JWTs expire in one hour and are stored in `sessionStorage`.
- Readings have four fixed slots and no notes field.
- Possible improvements: password reset, profile editing, notification settings, automated tests, production deployment configuration, and an HttpOnly-cookie session design.

## Submission checklist

- [ ] Confirm the public repository setting and final branch contents.
- [ ] Configure local `.env` files; do not commit them.
- [ ] Apply the migration and run the seed if a demo account is required.
- [ ] Run lint/build and the end-to-end checklist.
- [ ] Capture screenshots or record the walkthrough.
- [ ] Review repository and captures for secrets and private data before submission.
