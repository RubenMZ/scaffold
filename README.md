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

**Install PostgreSQL** (if not already installed):

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu / Debian
sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Configure database credentials:**

```bash
cd backend
cp .env.example .env   # then edit .env with your Postgres user/password
```

Open `.env` and set `POSTGRES_USER` and `POSTGRES_PASSWORD` to match your local PostgreSQL superuser (on macOS/Homebrew the default user is your macOS username with no password; on Linux it is `postgres`).

> **Tip – macOS Homebrew default setup (no password needed):**  
> Leave `POSTGRES_PASSWORD` empty and set `POSTGRES_USER` to your macOS username, e.g. `ruben.medina`.

```bash
# Install dependencies
bundle install

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
| `POSTGRES_USER` | *(OS user)* | PostgreSQL username |
| `POSTGRES_PASSWORD` | *(empty)* | PostgreSQL password |
| `POSTGRES_HOST` | `localhost` | PostgreSQL host |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |
| `POSTGRES_DB` | `backend_development` | Database name (development) |
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
