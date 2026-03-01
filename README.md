# scaffold

Full-stack scaffold with a React frontend and a Rails API backend using PostgreSQL.

## Structure

- `frontend/` — React app (Vite)
- `backend/` — Rails API app (PostgreSQL)

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
bundle install
# configure database credentials in config/database.yml
bin/rails db:create db:migrate
bin/rails server
```