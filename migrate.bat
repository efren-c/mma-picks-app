@echo off
set DATABASE_URL=file:./dev.db
npx prisma migrate dev --name add_user_role
