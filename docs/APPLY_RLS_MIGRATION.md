# Apply RLS Migration

## Option 1: Via Railway CLI
```bash
railway run bash -c 'psql $DATABASE_URL' < migrations/009_add_rls_context.sql
```

## Option 2: Via Railway Dashboard
1. Go to https://railway.app
2. Select your project
3. Click on the PostgreSQL service
4. Click "Query" tab
5. Copy and paste the entire content of `migrations/009_add_rls_context.sql`
6. Click "Run Query"

## Option 3: Via Database URL
```bash
psql "your-database-url-here" < migrations/009_add_rls_context.sql
```

## Migration Content
The migration adds three functions:
- `set_user_context(user_id, user_role)` - Sets current user context
- `get_user_context()` - Gets current user context
- `clear_user_context()` - Clears user context

These are used for Row Level Security (RLS) policies.
