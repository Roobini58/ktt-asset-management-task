# Asset Management System

A Node.js/Express web app for tracking company assets (laptops, phones, modems, tools, etc.)
issued to employees — built to the KT Telematic Asset Management Project spec.

**Stack:** Node.js (Express) · PostgreSQL · Sequelize ORM · Pug (Jade) · Bootstrap 5 · DataTables.net

**Architecture:** Router ➔ Controller ➔ Service ➔ Repository

## Features

1. **Employee Master** — add/edit/view employees, filter active/inactive, search
2. **Asset Category Master** — add/edit/view hardware categories (Laptop, Mobile Phone, etc.)
3. **Asset Master** — add/edit/view assets, filter by category, search by make/model/serial;
   each asset has both a serial number and a unique UUID
4. **Stock View** — assets currently in stock, grouped by branch, with per-branch and
   grand total value footers
5. **Issue Asset** — assign an in-stock asset to an employee
6. **Return Asset** — return an issued asset, capturing a reason (Upgrade / Repair /
   Resignation / Other)
7. **Scrap Asset** — mark an asset obsolete; scrapped assets disappear from every page
   except **Reports** and **Asset History**
8. **Asset History** — full lifecycle timeline of an asset (Purchased → Issued → Returned →
   ... → Scrapped)

Plus a dashboard with live counts and a Reports module for the full asset register.

## Architecture & Layering

The application implements a clean **Controller - Service - Repository** design pattern:

- **Routes (`/routes`)**: Maps HTTP request verbs and paths to Controllers and connects `express-validator` middleware.
- **Controllers (`/controllers`)**: Manages HTTP requests/responses, validates input errors, calls Services, sets flash notifications, and renders Pug views (`res.render(...)`).
- **Services (`/services`)**: Implements domain business logic, handles multi-step database transactions (e.g. issuing, returning, scrapping, and recording transaction audit entries), and performs aggregate calculations.
- **Repositories (`/repositories`)**: Encapsulates Sequelize database operations (`findAll`, `findByPk`, `create`, `update`, `count`).

## Prerequisites

- Node.js 18+
- PostgreSQL 13+ running locally (or a connection string to a hosted instance)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# edit .env with your local Postgres credentials

# 3. Create the database
npm run db:create

# 4. Run migrations (creates all tables)
npm run db:migrate

# 5. Seed demo data (optional but recommended - a few employees, categories, assets)
npm run db:seed

# 6. Start the app
npm run dev      # with nodemon, auto-reload
# or
npm start
```

The app runs at **http://localhost:3000** by default (change `PORT` in `.env`).

## Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart on change) |
| `npm start` | Start normally |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:migrate:undo` | Roll back the last migration |
| `npm run db:seed` | Load demo data |
| `npm run db:reset` | Drop, re-migrate, and re-seed everything (destructive — dev only) |

## Project structure

```
asset-management/
├── app.js                 Express app entry point
├── config/config.js       Sequelize CLI + connection config (reads .env)
├── models/                Sequelize models (Employee, AssetCategory, Asset, AssetTransaction)
├── repositories/          Database access layer (Sequelize queries)
├── services/              Business logic & transaction management
├── controllers/           HTTP request handlers & view rendering
├── routes/                HTTP route definitions & validation rules
├── migrations/            DB schema migrations (run in order)
├── seeders/               Demo data
├── views/                 Pug templates, one folder per module
└── public/                Static CSS/JS
```

## Data model notes

- **Asset** has a `status` of `IN_STOCK`, `ISSUED`, or `SCRAPPED`, plus `serialNumber`
  (business-facing, unique) and `id` (UUID, the "unique id" from the spec).
- **AssetTransaction** is the audit trail: every Purchase / Issue / Return / Scrap creates
  a row here, which is what powers the Asset History page. Issue and Return also update
  `Asset.status` and `Asset.currentEmployeeId` directly for fast lookups (Stock View,
  Asset Master, etc.), so you get both a fast "current state" view and a full history
  without re-deriving state from the transaction log every time.
- Scrapping doesn't delete anything — it just flips `status` to `SCRAPPED`, so the asset
  keeps its full history and still shows up in Reports.

## Deploying / pushing to GitHub

This is a standard Express + Postgres app — no build step required. `.env` is git-ignored;
make sure whoever runs it copies `.env.example` to `.env` and fills in real DB credentials
(and a random `SESSION_SECRET`) before starting. For production, set `NODE_ENV=production`
and point `DB_HOST`/`DB_SSL=true` at your managed Postgres instance.
