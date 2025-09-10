# Shortly - Advanced URL Shortener

A production-ready URL shortener built with Next.js, featuring comprehensive analytics, user authentication, and a modern dashboard.

## Features

- 🚀 **Lightning Fast**: Redis-cached redirects for optimal performance
- 📊 **Advanced Analytics**: Time-series charts and detailed click tracking
- 🔐 **Secure Authentication**: Google OAuth integration with NextAuth
- 🎨 **Modern UI**: Beautiful interface built with Shadcn/UI
- 📱 **Responsive Design**: Optimized for all device sizes
- 🔗 **Custom Links**: Create branded short codes and descriptions
- 🌍 **Link-in-Bio**: Public profile pages for sharing multiple links
- ⚡ **Asynchronous Tracking**: Non-blocking click analytics

## Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript
- **UI Components**: Shadcn/UI, Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Cache**: Redis (Upstash) for fast redirects
- **Charts**: Recharts for analytics visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Neon PostgreSQL database
- An Upstash Redis database
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Spgtx/shortly.git
cd shortly
npm install
```

2. Copy the environment variables:
```bash
cp .env.example .env.local
```

3. Fill in your environment variables in `.env.local`:
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
DATABASE_URL=your-neon-database-url
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🚀 Live Demo

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://shortly-lemon-rho.vercel.app/)


## Architecture

### Cache-First Redirects
- Redirect lookups check Redis first for sub-millisecond response times
- Database queries only occur on cache misses
- Automatic cache population for new links

### Asynchronous Analytics
- Click tracking is non-blocking to maintain fast redirects
- Background API calls log detailed analytics data
- Real-time dashboard updates with rich visualizations

### Clean Code Structure
- Dependency injection for database and Redis clients
- Service layer pattern for business logic separation
- TypeScript throughout for type safety
- Modular component architecture

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Random secret for NextAuth.js |
| `NEXTAUTH_URL` | Your application URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `DATABASE_URL` | Neon PostgreSQL connection string |

## Database Schema

The application uses a well-structured PostgreSQL schema:

- **users**: User authentication and profile data
- **links**: Shortened URL data with metadata
- **clicks**: Detailed analytics and tracking data
- **accounts/sessions**: NextAuth.js authentication tables

## API Endpoints

- `GET /api/links` - Get user's links
- `POST /api/links` - Create new short link
- `DELETE /api/links/[id]` - Delete a link
- `GET /api/analytics/[id]` - Get link analytics
- `POST /api/track-click` - Log click events


## Contributing

Contributions are welcome!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
