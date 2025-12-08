# MMA Picks App

A full-stack web application for MMA fans to predict fight outcomes, compete in global and event-specific leaderboards, and track their performance. Built with Next.js 15, Prisma, PostgreSQL, and NextAuth v5.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)

## Features

### 🎮 For Players
- **Event Listings**: Browse upcoming and past MMA events.
- **Fight Predictions**: Pick winners, methods (KO/TKO, Sub, Dec), and specific rounds.
- **Live Status**: Picks are locked automatically when an event starts.
- **Immediate Feedback**: Visual confirmation when picks are saved.
- **Leaderboards**: Compete globally or view rankings for specific events.
- **Gamification**: Earn badges for achievements (First Pick, Perfect Event, Veteran, etc.).
- **User Dashboard**: Track your pick history and performance stats.

### 🛡️ For Admins
- **Event Management**: Create and manage events.
- **Fight Management**: Add fights, set scheduled rounds.
- **Result Entry**: Input official fight results to automatically calculate scores.
- **Loading States**: Optimized UI for managing data.

### 🔐 Security & Tech
- **Authentication**: Secure signup/login with password hashing (bcrypt).
- **Role-Based Access**: Protected admin routes.
- **Database**: Robust data integrity with PostgreSQL.
- **Modern UI**: Responsive design with Dark Mode, Tailwind CSS v4, and smooth animations.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js v5 (Credentials Provider)
- **Styling**: Tailwind CSS v4
- **State/Animations**: React Server Actions, Framer Motion
- **UI Components**: Radix UI, Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database (Local or Cloud like Supabase/Neon)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/mma-picks-app.git
   cd mma-picks-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Database connection
   DATABASE_URL="postgresql://user:password@localhost:5432/mmapicks"

   # Authentication Secret (generate with `openssl rand -base64 32`)
   NEXTAUTH_SECRET="your-super-secret-key"
   
   # Optional: External API for importing events
   RAPID_API_KEY="your-rapidapi-key"
   ```

4. **Initialize the database:**
   ```bash
   npx prisma migrate dev
   npx tsx prisma/seed.ts # Seeds initial data including badges
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

- **User**: Stores auth info, roles (USER/ADMIN), and points.
- **Event**: Represents an MMA event card.
- **Fight**: Individual match-ups within an event.
- **Pick**: User's prediction for a specific fight.
- **Badge**: Achievement definitions (name, icon, description).
- **UserBadge**: Badges earned by users.

## Scoring System

- **Perfect Pick**: +10 points
- **Fighter + Round Correct**: +7 points
- **Method Correct but not round (or decision)**: +5 points
- **Only Fighter Correct**: +2 points

## Project Structure

```
src/
├── app/
│   ├── admin/         # Protected Admin Panel
│   ├── dashboard/     # User Dashboard
│   ├── events/        # Event Details & Pick Forms
│   ├── leaderboard/   # Global & Event Leaderboards
│   ├── login/         # Auth pages
│   └── register/      # Auth pages
├── components/        # Reusable UI components
├── lib/               # Utilities, Prisma client, Server Actions
└── types/             # TypeScript definitions
```

## Contributing

Contributions are welcome! Please submit a Pull Request.

## License

MIT License.
