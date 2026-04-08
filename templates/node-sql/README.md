# Node SQL Template

Direct PostgreSQL access template for cloud functions that need raw SQL instead of GraphQL.

## When to Use

- Direct SQL queries (complex joins, raw performance)
- Bulk operations (batch inserts/updates)
- pgvector operations (embedding inserts with `vector` type)
- Database admin tasks

## Usage

In your `handler.json`:

```json
{
  "name": "my-sql-function",
  "version": "1.0.0",
  "description": "Function using direct SQL",
  "type": "node-sql"
}
```

## Handler Pattern

```typescript
import type { FunctionHandler } from './types';

const handler: FunctionHandler = async (params, context) => {
  const { pool, log, job } = context;

  // pool is automatically provided
  const result = await pool.query('SELECT * FROM my_table WHERE id = $1', [params.id]);

  log.info('Query executed', { rows: result.rowCount });

  return { rows: result.rows };
};

export default handler;
```

## Context

| Field | Type | Description |
|-------|------|-------------|
| `pool` | `pg.Pool` | PostgreSQL connection pool |
| `log` | `Logger` | Structured logger |
| `env` | `Record<string, string>` | Environment variables |
| `job.jobId` | `string?` | Job ID from X-Job-Id header |
| `job.workerId` | `string?` | Worker ID from X-Worker-Id header |
| `job.databaseId` | `string?` | Database ID from X-Database-Id header |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PGHOST` | PostgreSQL host |
| `PGPORT` | PostgreSQL port (default: 5432) |
| `PGDATABASE` | Database name |
| `PGUSER` | Database user |
| `PGPASSWORD` | Database password |
