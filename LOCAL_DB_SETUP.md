# Local Database Setup Guide

## 1. Create the Database in pgAdmin 4
1.  Open **pgAdmin 4**.
2.  In the browser tree on the left, expand **Servers**.
3.  If prompted, enter your master password (or the password you set during installation).
4.  Right-click on **Databases** > **Create** > **Database...**
5.  **Name**: Enter `mma-picks-dev` (or any name you prefer).
6.  Click **Save**.

## 2. Construct Your Connection String
Your connection string format is:
`postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`

- **USER**: Usually `postgres`
- **PASSWORD**: The password you use to open the server in pgAdmin.
- **HOST**: Usually `localhost`
- **PORT**: Usually `5432`
- **DATABASE_NAME**: `mma-picks-dev`

**Example:**
`postgresql://postgres:mysecretpassword@localhost:5432/mma-picks-dev`

## 3. Update Your Project
1.  Open the file `.env.local` in your editor.
2.  Find or add the `DATABASE_URL` variable.
3.  Paste your new local connection string.

```env
# .env.local
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mma-picks-dev"
# If you have DIRECT_URL, you can set it to the same value for local dev
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mma-picks-dev"
```

## 4. Initialize the Database
Open your terminal (VS Code usually) and run:

```bash
# Push the schema to your new local database
npx prisma db push

# (Optional) Seed it with initial data if you have a seed script
npx prisma db seed
```

Now, when you run `npm run dev`, it will use this local database!
