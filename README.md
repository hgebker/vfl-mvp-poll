# VFL MVP Polls

A SvelteKit app for voting on MVPs.

## Developing

Install dependencies:

```sh
npm install
```

Copy `.env.example` to `.env` and fill in the values:

```sh
cp .env.example .env
```

- `DATABASE_URL` — path to the local sqlite file (e.g. `local.db`)
- `SESSION_SECRET` — signing secret for session cookies, generate with `openssl rand -hex 32`

Push the schema to your local database:

```sh
npm run db:push
```

Seed a team to sign in with:

```sh
TEAM_NAME="Your Team" TEAM_PASSCODE="your-passcode" npm run db:seed
```

Start the dev server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Deploying

Pushes to `main` and version tags (`x.y.z`) build and publish two Docker images:

- `hgebker/vfl-mvp-polls` — the app
- `hgebker/vfl-mvp-polls:migrator` — runs `drizzle-kit migrate`

### 1. Migrate

```sh
docker run --rm \
  -e DATABASE_URL=/data/prod.db \
  -v prod-data:/data \
  hgebker/vfl-mvp-polls:migrator
```

### 2. Seed

Seeds the single team this app runs for. Safe to re-run — it skips if the team already exists.

```sh
docker run --rm \
  -e DATABASE_URL=/data/prod.db \
  -e TEAM_NAME="Your Team" \
  -e TEAM_PASSCODE="a real passcode" \
  -v prod-data:/data \
  --entrypoint npx \
  hgebker/vfl-mvp-polls:migrator tsx src/lib/server/db/seed.ts
```

### 3. Run

```sh
docker run -d \
  -e DATABASE_URL=/data/prod.db \
  -e SESSION_SECRET=<generated secret> \
  -p 3000:3000 \
  -v prod-data:/data \
  hgebker/vfl-mvp-polls:<tag>
```

Use the same persistent volume for all three steps — the sqlite database must survive container restarts.
