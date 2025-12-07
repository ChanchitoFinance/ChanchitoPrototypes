# Architecture Overview

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: NextAuth.js (Google OAuth)
- **Payments**: Stripe
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React

## Project Structure

```
MVOPlatform/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin panel
│   ├── ideas/             # Ideas feed and detail pages
│   ├── submit/            # Idea submission
│   ├── payment/           # Payment success/cancel
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/             # Admin components
│   ├── forms/             # Form components
│   ├── ideas/             # Idea-related components
│   ├── landing/           # Landing page components
│   ├── layout/            # Layout components
│   ├── pages/             # Page-level components
│   ├── providers/         # Context providers
│   ├── report/            # Report components
│   └── ui/                # Reusable UI components
├── styles/                # Style system
│   ├── design-tokens.ts   # Design tokens
│   └── card-styles.ts     # Card styling utilities
├── docs/                  # Documentation
│   ├── UX/                # UX documentation
│   └── architecture/      # Architecture documentation
└── public/                # Static assets
```

## Key Features

### Pages
1. **Landing Page** (`/`)
   - Hero section
   - Process explanation
   - Pricing tiers
   - Scorecard mockup
   - Testimonials
   - FAQ
   - CTA

2. **Ideas Feed** (`/ideas`)
   - Social media-style feed
   - Infinite scroll (placeholder)
   - Voting system
   - Card-based layout

3. **Idea Submission** (`/submit`)
   - Multi-step form
   - Authentication required
   - Form validation

4. **Idea Report** (`/ideas/[id]`)
   - Detailed validation report
   - Score breakdown
   - Recommendations
   - Download/Share options

5. **Admin Panel** (`/admin`)
   - Dashboard overview
   - Report management
   - Statistics

### Authentication
- Google OAuth via NextAuth.js
- Session management
- Protected routes

### Payments
- Stripe integration
- Checkout flow
- Success/Cancel pages

## Design System

All styling is centralized:
- Design tokens in `styles/design-tokens.ts`
- Tailwind configuration
- Reusable components in `components/ui/`

## State Management

- React hooks for local state
- NextAuth for session state
- No global state management library (can be added if needed)

