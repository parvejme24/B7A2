# DevPulse

**Internal Tech Issue & Feature Tracker** — A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## Live URL

> Deploy the backend to Render, Railway, or Vercel and update this section with your production URL.

Local development: `http://localhost:3000`

## Features

- User registration and JWT-based authentication
- Role-based access control (`contributor`, `maintainer`)
- Create, list, view, update, and delete issues
- Filter issues by type and status; sort by newest or oldest
- Reporter details included without SQL JOINs (separate batched queries)
- Centralized error handling and consistent API response format

## Tech Stack

| Technology | Usage |
|------------|-------|
| Node.js 24+ | Runtime |
| TypeScript | Type-safe backend |
| Express.js | Modular REST API |
| PostgreSQL (Neon) | Database via native `pg` driver |
| Raw SQL | Direct `pool.query()` — no ORM, no JOINs |
| bcrypt | Password hashing (salt rounds 8–12) |
| jsonwebtoken | JWT auth |
| http-status-codes | Consistent HTTP status references |

## Project Structure

```
src/
├── config/          # Environment & database pool
├── middleware/      # Auth, error handling
├── modules/
│   ├── auth/        # Signup & login
│   └── issues/      # Issue CRUD
├── utils/           # Responses, errors, validators
├── scripts/         # Database initialization
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## Setup

### Prerequisites

- Node.js 24.x or higher
- PostgreSQL database (Neon, Supabase, or ElephantSQL)

### Installation

```bash
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm run db:init
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `BCRYPT_SALT_ROUNDS` | bcrypt rounds (8–12, default: 10) |
| `CORS_ORIGIN` | Allowed CORS origin(s) |

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |

### Issues

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/issues` | Authenticated | Create a new issue |
| GET | `/api/issues` | Public | List all issues (filter/sort) |
| GET | `/api/issues/:id` | Public | Get single issue |
| PATCH | `/api/issues/:id` | Authenticated | Update issue (role rules apply) |
| DELETE | `/api/issues/:id` | Maintainer | Delete an issue |

**Authorization header:** `Authorization: <JWT_TOKEN>`

### Query Parameters (GET /api/issues)

| Param | Values | Default |
|-------|--------|---------|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | (none) |
| `status` | `open`, `in_progress`, `resolved` | (none) |

## Database Schema

### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| name | VARCHAR | Required |
| email | VARCHAR | Unique, required |
| password | VARCHAR | bcrypt hash, never returned |
| role | VARCHAR | `contributor` (default) or `maintainer` |
| created_at | TIMESTAMPTZ | Auto on insert |
| updated_at | TIMESTAMPTZ | Auto on update |

### `issues`

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| title | VARCHAR(150) | Required, max 150 chars |
| description | TEXT | Required, min 20 chars |
| type | VARCHAR | `bug` or `feature_request` |
| status | VARCHAR | `open` (default), `in_progress`, `resolved` |
| reporter_id | INTEGER | References user (app-level validation) |
| created_at | TIMESTAMPTZ | Auto on insert |
| updated_at | TIMESTAMPTZ | Auto on update |

## Deployment

1. Push code to GitHub
2. Connect to [Render](https://render.com), [Railway](https://railway.app), or [Vercel](https://vercel.com)
3. Set environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.)
4. Run `npm run db:init` once against your production database
5. Set start command: `npm start`

## License

MIT
