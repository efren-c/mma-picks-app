@echo off
set DATABASE_URL=file:./dev.db
npx prisma generate
