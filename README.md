# scaffold

A full-stack scaffolding application with a **Rails API** backend (PostgreSQL) and a **React** frontend.

## Project Structure

```
scaffold/
├── backend/    # Rails 8 API (PostgreSQL)
└── frontend/   # React application (Create React App)
```

## Prerequisites

- Ruby 3.2+
- Node.js 18+
- PostgreSQL 14+

## Getting Started

### 1. Backend (Rails API)

```bash
cd backend

# Install dependencies
bundle install

# Configure database
# Edit config/database.yml if needed (username/password/host)
# Or set the DATABASE_URL environment variable

# Create and migrate the database
bin/rails db:create db:migrate

# Start the Rails server on port 3001
bin/rails server -p 3001
```

The API will be available at `http://localhost:3001`.

**CORS**: By default the backend allows requests from `http://localhost:3000`.
Override with the `CORS_ORIGINS` environment variable if needed.

### 2. Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The React app will be available at `http://localhost:3000` and will proxy
API requests to the Rails backend at `http://localhost:3001`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | *(see database.yml)* | PostgreSQL connection URL |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `RAILS_MASTER_KEY` | *(see config/master.key)* | Rails credentials master key |

## Development

Run both servers in separate terminal tabs:

```bash
# Terminal 1 – backend
cd backend && bin/rails server -p 3001

# Terminal 2 – frontend
cd frontend && npm start
```
