# MVO Platform

A Next.js web application for validating business ideas with data-driven insights.

## Features

- **Landing Page**: Hero, process explanation, pricing, testimonials, FAQ
- **Idea Submission**: Multi-step form with validation
- **Ideas Feed**: Social media-style feed with voting
- **Validation Reports**: Detailed scorecards and recommendations
- **Admin Panel**: Dashboard for managing ideas and reports
- **Authentication**: Google OAuth via Supabase
- **Payments**: Stripe checkout integration

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- React 18
- Tailwind CSS
- Framer Motion
- Supabase (Auth & Database)
- Redux Toolkit
- Stripe
- React Hook Form + Zod
- **Architecture**: Feature-Based Architecture

## Architecture

This project uses a **Feature-Based Architecture** that organizes code around business features rather than technical layers. Each feature is self-contained and includes all necessary components, hooks, types, and utilities.

### Key Benefits

- **Separation of Concerns**: Each feature manages its own logic
- **Easier Maintenance**: Changes are localized to specific features
- **Better Testing**: Features can be tested independently
- **Scalability**: New features can be added without affecting existing ones

### Structure Overview

- **`src/core/`**: Shared business logic, services, and infrastructure
- **`src/features/`**: Feature-specific code (components, hooks, types)
- **`src/shared/`**: Cross-cutting UI components and providers
- **`src/app/`**: Next.js routing and page definitions

See `docs/architecture/feature-based-architecture.md` for detailed implementation guidelines.

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

3. Set up Supabase database:

Go to your Supabase project → SQL Editor and run the SQL from `init.sql` to create the complete database schema with all tables, enums, and policies. Then run `insert.sql` to populate with sample data.

4. Set up environment variables (`.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

5. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

**Important**: All environment variable access is centralized in `config/env.ts`. Direct `process.env` access is blocked by ESLint rules.

- Use `serverEnv` for server-side variables
- Use `clientEnv` for client-side variables (NEXT*PUBLIC*\*)

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

The project follows a **Feature-Based Architecture** where code is organized around business features rather than technical layers.

```
src/
├── app/                    # Next.js App Router (pages and layouts)
├── core/                   # Shared business logic and infrastructure
│   ├── abstractions/       # Service interfaces/contracts
│   ├── lib/               # Core utilities and services
│   │   ├── services/      # Core business services
│   │   ├── slices/        # Redux slices
│   │   └── utils/         # Utility functions
│   ├── styles/            # Global styles and design tokens
│   └── types/             # Shared TypeScript types
├── features/              # Feature-specific code
│   ├── [feature-name]/    # Each feature is self-contained
│   │   ├── components/    # Feature-specific components
│   │   ├── hooks/         # Feature-specific hooks
│   │   ├── types/         # Feature-specific types
│   │   └── utils/         # Feature-specific utilities
└── shared/                # Cross-cutting concerns
    ├── components/        # Shared UI components
    │   ├── layout/        # Layout components
    │   ├── providers/     # React context providers
    │   └── ui/            # Reusable UI components
```

## Services

The application uses a service layer for data management with Supabase:

- **IdeaService**: Manages ideas, votes, and content
- **CommentService**: Handles comments and comment voting
- **UserService**: User profile management
- **TeamService**: Team and space management
- **AdminService**: Tags, badges, and media assets

See `docs/services-usage.md` for detailed usage examples.

## Database Setup

1. Run `init.sql` in Supabase SQL Editor to create the complete schema
2. Run `insert.sql` to populate with sample data
3. All tables include Row Level Security policies for data protection

## Documentation

See `docs/` directory for detailed documentation:

- **Architecture Overview** (`docs/architecture/overview.md`)
- **Feature-Based Architecture Guide** (`docs/architecture/feature-based-architecture.md`)
- Services usage (`docs/services-usage.md`)
- UX guidelines (`docs/UX/`)
- Security insights (`docs/security-insights.md`)

## Design System

The project follows strict design principles:

- 95% neutrals, 5-10% accents
- High white space ratio
- Predictable card structure
- Limited typography (Inter, weights 400/500/600)
- Micro-animations

All styles are centralized in `styles/design-tokens.ts` for easy modification.
