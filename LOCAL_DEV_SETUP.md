# Local Development Configuration Notes

## Current Setup (Development)

The local `.env` file needs to be updated with `DIRECT_URL` for the PostgreSQL schema to work.

### Add to your `.env` file:

```env
# For local SQLite development (both point to same file)
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"
```

### Full `.env` example for local development:

```env
# Database - SQLite
DATABASE_URL="file:./dev.db"
DIRECT_URL="file:./dev.db"

# Authentication  
NEXTAUTH_SECRET="your-actual-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email
RESEND_API_KEY="re_your_actual_api_key"
```

## Production Setup (Vercel)

On Vercel, these variables will be automatically set when you provision Postgres:

```env
DATABASE_URL="${POSTGRES_PRISMA_URL}"
DIRECT_URL="${POSTGRES_URL_NON_POOLING}"
```

## Migration Status

✅ **Completed:**
- Updated `schema.prisma` to use PostgreSQL
- Added connection pooling support (`directUrl`)
- Generated Prisma Client for PostgreSQL

⚠️ **Action Required:**
Add `DIRECT_URL="file:./dev.db"` to your `.env` file for local development to continue working.

## Next Steps

1. Update your local `.env` file with `DIRECT_URL`
2. Follow the Vercel Deployment Guide to deploy
3. Vercel will automatically configure PostgreSQL variables
