# Ecommerce App Backend

NestJS backend for an ecommerce system. The local development stack runs the API with PostgreSQL, Redis, Kafka, and Zookeeper through Docker Compose.

## Requirements

- Node.js 20+
- npm
- Docker with Docker Compose v2

## Fresh Setup

Create your local environment file:

```bash
cp .env.example .env
```

Install dependencies for local tooling and tests:

```bash
npm install
```

Start the full local stack:

```bash
docker compose up --build
```

The API is exposed at:

```text
http://localhost:3000
```

## Local Services

Compose starts these services:

| Service   | Container             | Host port | Internal URL         |
| --------- | --------------------- | --------- | -------------------- |
| API       | `ecommerce_app`       | `3000`    | `http://app:3000`    |
| Postgres  | `ecommerce_postgres`  | `5432`    | `postgres:5432`      |
| Redis     | `ecommerce_redis`     | `6379`    | `redis://redis:6379` |
| Kafka     | `ecommerce_kafka`     | `9092`    | `kafka:29092`        |
| Zookeeper | `ecommerce_zookeeper` | `2181`    | `zookeeper:2181`     |

The app container receives a Docker-specific `DATABASE_URL` from `compose.yaml`:

```text
postgres://postgres:postgres@postgres:5432/ecommerce_app
```

Outside Docker, `.env` should point at localhost:

```text
postgres://postgres:postgres@localhost:5432/ecommerce_app
```

## Development Workflow

Run the app in Docker:

```bash
docker compose up
```

The app service runs:

```bash
npm run start:dev
```

Source code is bind-mounted into the container, and watcher polling is enabled for reliable Nest hot reload inside Docker.

For Docker Compose watch mode:

```bash
docker compose watch
```

## Database Flow

This project uses TypeORM migrations. Schema synchronization is disabled:

```ts
synchronize: false;
```

Do not rely on automatic schema sync in development. Treat migrations as the source of truth.

### Apply Migrations

Run migrations inside the app container:

```bash
docker compose exec app npm run migration:run
```

Show migration status:

```bash
docker compose exec app npm run migration:show
```

Revert the last migration:

```bash
docker compose exec app npm run migration:revert
```

### Seed Data

After migrations, seed the database:

```bash
docker compose exec app npm run seed
```

The seed script is idempotent: it uses stable IDs and conflict handling so it can be re-run without duplicating rows.

## Changing the Schema

When entities change:

1. Add or update the TypeORM entity.
2. Add a migration under `src/database/migrations`.
3. Run the migration in Docker:

```bash
docker compose exec app npm run migration:run
```

4. Update the seed script if the new schema needs baseline data.
5. Run tests:

```bash
npm test -- --runInBand
```

## Useful Commands

```bash
# Type check without writing to dist/
npx tsc --noEmit --incremental false

# Unit tests
npm test -- --runInBand

# Build
npm run build

# Check resolved Compose config
docker compose config

# Open a shell in the app container
docker compose exec app sh

# Connect to Postgres
docker compose exec postgres psql -U postgres -d ecommerce_app
```

## Notes

- `compose.yaml` is the canonical Compose file. Avoid adding `docker-compose.yml` or `docker-compose.yaml`.
- `node_modules` is stored in a Docker volume for the app container. After changing dependencies, rebuild or run `docker compose exec app npm install`.
- If local `npm run build` fails with `EACCES` in `dist/`, the directory was likely written by a container user. Remove or fix ownership before building locally.
- Postman collection names intentionally still reference the original booking collection and should not be renamed unless the Postman workspace is being migrated too.
- Kafka is available for future messaging work, but the current app code does not publish or consume Kafka messages yet.
