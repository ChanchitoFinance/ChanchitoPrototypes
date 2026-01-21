# Architecture Overview

This document provides an overview of the MVO Platform architecture, which follows a **Feature-Based Architecture** pattern.

## Architecture Pattern: Feature-Based Architecture

The application is organized around **features** rather than technical layers. Each feature contains all the code (components, services, types, hooks, etc.) needed to implement that specific functionality. This approach provides better separation of concerns, easier maintenance, and clearer boundaries between different parts of the application.

### Why Feature-Based Architecture?

- **Separation of Concerns**: Each feature is self-contained and doesn't depend on other features
- **Easier Maintenance**: Changes to one feature don't affect others
- **Better Code Organization**: Related code is grouped together
- **Scalability**: New features can be added without affecting existing ones
- **Team Collaboration**: Multiple teams can work on different features simultaneously

## Directory Structure

```
src/
├── app/                    # Next.js App Router (pages and layouts)
├── core/                   # Shared business logic and infrastructure
│   ├── abstractions/       # Service interfaces/contracts
│   ├── hooks/             # Shared custom hooks
│   ├── lib/               # Core utilities and services
│   │   ├── constants/     # Application constants
│   │   ├── hooks.ts       # Redux hooks
│   │   ├── services/      # Core business services
│   │   ├── slices/        # Redux slices
│   │   ├── store.ts       # Redux store configuration
│   │   ├── supabase.ts    # Database client
│   │   └── utils/         # Utility functions
│   ├── styles/            # Global styles and design tokens
│   └── types/             # Shared TypeScript types
├── features/              # Feature-specific code
│   └── [feature-name]/    # Each feature is self-contained
│       ├── components/    # Feature-specific components
│       ├── hooks/         # Feature-specific hooks (optional)
│       ├── types/         # Feature-specific types (optional)
│       └── utils/         # Feature-specific utilities (optional)
└── shared/                # Cross-cutting concerns
    ├── components/        # Shared UI components
    │   ├── layout/        # Layout components (Header, Footer, Sidebar)
    │   ├── providers/     # React context providers
    │   └── ui/            # Reusable UI components
    ├── hooks/             # Shared custom hooks
    └── styles/            # Shared styles
```

## Core Layer (`src/core/`)

Contains shared business logic and infrastructure that multiple features might use:

- **Services**: Core business logic (ideaService, commentService, userService, etc.)
- **Types**: Shared TypeScript interfaces and types
- **Hooks**: Shared custom hooks used across features
- **Utils**: Utility functions for common operations
- **Store**: Redux store configuration and slices
- **Constants**: Application-wide constants

## Features Layer (`src/features/`)

Each feature is a self-contained module with all necessary code:

### Feature Structure

```
features/[feature-name]/
├── components/        # React components specific to this feature
├── hooks/            # Custom hooks specific to this feature (optional)
├── types/            # TypeScript types specific to this feature (optional)
└── utils/            # Utility functions specific to this feature (optional)
```

### Current Features

- **activity**: User activity tracking and analytics
- **admin**: Administrative dashboard and data management
- **comments**: Comment system and interactions
- **foryou**: Personalized content feed
- **home**: Homepage and main feed
- **ideas**: Idea creation, display, and management
- **landing**: Landing page components
- **pages**: Page-level components (Premium, Landing, etc.)
- **payment**: Payment processing and checkout
- **report**: Reporting and analytics

## Shared Layer (`src/shared/`)

Contains cross-cutting concerns used across multiple features:

- **Components**: Reusable UI components (buttons, dialogs, etc.)
- **Layout**: Page layout components (header, footer, sidebar)
- **Providers**: React context providers (auth, i18n, etc.)
- **Hooks**: Shared custom hooks
- **Styles**: Global styles and design system

## App Layer (`src/app/`)

Next.js App Router structure for routing and page definitions.

## How to Add a New Feature

1. **Create the feature directory**:

   ```bash
   mkdir -p src/features/[new-feature]/components
   ```

2. **Add feature-specific components** in `components/` subdirectory

3. **Create feature-specific types** (optional) in `types/` subdirectory

4. **Add feature-specific hooks** (optional) in `hooks/` subdirectory

5. **Add feature-specific utilities** (optional) in `utils/` subdirectory

6. **Update routing** in `src/app/` to use the new feature components

## How to Add Shared Components

1. **For UI components**: Add to `src/shared/components/ui/`
2. **For layout components**: Add to `src/shared/components/layout/`
3. **For providers**: Add to `src/shared/components/providers/`

## How to Add Core Services

1. **Create service interface** in `src/core/abstractions/`
2. **Implement service** in `src/core/lib/services/`
3. **Add types** to `src/core/types/`
4. **Add Redux slice** (if needed) to `src/core/lib/slices/`

## Import Guidelines

- **Within a feature**: Use relative imports (`./components/ComponentName`)
- **From core/shared**: Use absolute imports (`@/core/lib/services/ideaService`)
- **From other features**: Avoid direct imports - use core services instead
- **Feature independence**: Features should not import from other features directly

## Key Technologies

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **File Storage**: AWS S3 via Supabase Storage
- **Architecture Pattern**: Feature-Based Architecture
