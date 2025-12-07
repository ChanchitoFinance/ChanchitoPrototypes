# MVO Platform

A Next.js web application for validating business ideas with data-driven insights.

## Features

- **Landing Page**: Hero, process explanation, pricing, testimonials, FAQ
- **Idea Submission**: Multi-step form with validation
- **Ideas Feed**: Social media-style feed with voting
- **Validation Reports**: Detailed scorecards and recommendations
- **Admin Panel**: Dashboard for managing ideas and reports
- **Authentication**: Google OAuth integration
- **Payments**: Stripe checkout integration

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- React 18
- Tailwind CSS
- Framer Motion
- NextAuth.js
- Stripe
- React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (`.env.local`):

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

**Important**: All environment variable access is centralized in `config/env.ts`. Direct `process.env` access is blocked by ESLint rules.

- Use `serverEnv` for server-side variables
- Use `clientEnv` for client-side variables (NEXT_PUBLIC_*)

See `docs/architecture/environment-variables.md` for details.

## Code Quality

### Linting

```bash
npm run lint
```

ESLint is configured to block direct `process.env` access. All environment variables must be accessed through `config/env.ts`.

### Formatting

```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changing files
```

## Project Structure

```
MVOPlatform/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── config/           # Configuration files (env.ts)
├── styles/           # Design system and tokens
├── docs/             # Documentation
└── public/          # Static assets
```

## Documentation

See `docs/` directory for detailed documentation:
- UX guidelines (`docs/UX/`)
- Architecture (`docs/architecture/`)

## Design System

The project follows strict design principles:
- 95% neutrals, 5-10% accents
- High white space ratio
- Predictable card structure
- Limited typography (Inter, weights 400/500/600)
- Micro-animations

All styles are centralized in `styles/design-tokens.ts` for easy modification.

## License

[Add your license here]
