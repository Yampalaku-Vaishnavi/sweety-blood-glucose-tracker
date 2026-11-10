# Sweety Frontend

This React 19 + Vite JavaScript app provides the Sweety signup/sign-in views, protected dashboard, profile, glucose reading form, history, and reports.

See the repository-root README.md for complete project setup, PostgreSQL migration, demo seed, authentication, API contracts, and testing instructions.

## Run locally

From PowerShell:

    if (-not (Test-Path .env)) { Copy-Item .env.example .env }
    npm install
    npm run dev

Set VITE_API_BASE_URL in the local .env if the API is not at http://localhost:3000/api. Do not put database credentials or JWT signing secrets in frontend variables.

## Checks

    npm run lint
    npm run build

The frontend uses the shared Fetch API service and the authenticated backend endpoints described in the root README.
