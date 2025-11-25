# MMA Picks App

A full-stack web application for MMA fans to predict fight outcomes and compete with others. Built with Next.js, Prisma, and NextAuth.

![MMA Picks App](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)

## Features

- 🥊 **Event Listings** - Browse upcoming and past MMA events
- 🎯 **Fight Predictions** - Pick winners, methods, and rounds
- 📊 **Scoring System** - Earn points for accurate predictions
- 👤 **User Dashboard** - Track your picks and total points
- 🔐 **Authentication** - Secure account creation and login
- ✨ **Modern UI** - Dark theme with smooth animations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Prisma + SQLite
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **UI Components**: Radix UI
- **Notifications**: Sonner
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/mma-picks-app.git
cd mma-picks-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file in the root directory
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
RAPID_API_KEY="your-rapidapi-key" # Optional: for MMA Stats API
```

4. Set up the database:
```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

- **User** - Authentication and points tracking
- **Event** - MMA events with dates and images
- **Fight** - Individual fights with results
- **Pick** - User predictions with points awarded

## Scoring System

- **Winner Correct**: +10 points
- **Method Correct**: +5 points
- **Round Correct**: +5 points (for finishes)
- **Perfect Pick Bonus**: +10 points

## Project Structure

```
mma-picks-app/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── src/
│   ├── app/
│   │   ├── actions.ts     # Server actions
│   │   ├── dashboard/     # User dashboard
│   │   ├── events/        # Event pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── components/        # React components
│   ├── lib/               # Utilities and configs
│   └── types/             # TypeScript types
└── package.json
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)

### Adding New Events

Update the mock data in `src/lib/mma-api.ts` and reseed the database:
```bash
npx prisma migrate reset --force
npx tsx prisma/seed.ts
```

## Deployment

This app can be deployed to Vercel, Netlify, or any platform that supports Next.js.

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or personal use.

## Acknowledgments

- MMA Stats API for event data
- Next.js team for the amazing framework
- Vercel for hosting solutions
