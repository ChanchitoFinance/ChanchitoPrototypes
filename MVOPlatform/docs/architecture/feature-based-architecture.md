# Feature-Based Architecture Guide

This guide provides detailed instructions for implementing and maintaining the feature-based architecture in the MVO Platform.

## What is Feature-Based Architecture?

Feature-based architecture organizes code around business features rather than technical layers. Each feature contains all the code needed to implement that specific functionality, promoting:

- **High cohesion**: Related code stays together
- **Low coupling**: Features are independent
- **Easier testing**: Features can be tested in isolation
- **Better maintainability**: Changes are localized

## Identifying Features

A feature should represent a distinct business capability. Examples from our codebase:

- **ideas**: Idea creation, display, voting, and management
- **comments**: Comment system and interactions
- **spaces**: Team collaboration spaces
- **payment**: Payment processing and checkout
- **admin**: Administrative functions

## Feature Structure

Each feature follows this structure:

```
src/features/[feature-name]/
├── components/        # React components
│   ├── ComponentName.tsx
│   ├── index.ts       # Barrel exports
│   └── ...
├── hooks/            # Feature-specific hooks (optional)
│   ├── useFeatureHook.ts
│   └── index.ts
├── types/            # Feature-specific types (optional)
│   ├── feature.types.ts
│   └── index.ts
└── utils/            # Feature-specific utilities (optional)
    ├── featureUtils.ts
    └── index.ts
```

## Implementation Guidelines

### 1. Creating a New Feature

```bash
# Create feature directory structure
mkdir -p src/features/new-feature/components

# Create initial component
touch src/features/new-feature/components/NewFeatureComponent.tsx

# Create barrel export
echo "export { NewFeatureComponent } from './NewFeatureComponent';" > src/features/new-feature/components/index.ts
```

### 2. Feature Components

- **Naming**: Use PascalCase with feature prefix (e.g., `IdeaCard`, `CommentForm`)
- **Location**: Always in `components/` subdirectory
- **Exports**: Use barrel exports in `index.ts`

```typescript
// src/features/ideas/components/IdeaCard.tsx
export function IdeaCard({ idea }: IdeaCardProps) {
  return <div>{idea.title}</div>;
}

// src/features/ideas/components/index.ts
export { IdeaCard } from './IdeaCard';
```

### 3. Feature Types

- **Location**: `types/` subdirectory within the feature
- **Naming**: Use feature name as prefix (e.g., `idea.types.ts`)
- **Export**: Include in barrel export

```typescript
// src/features/ideas/types/idea.types.ts
export interface Idea {
  id: string
  title: string
  content: string
}

// src/features/ideas/types/index.ts
export type { Idea } from './idea.types'
```

### 4. Feature Hooks

- **Location**: `hooks/` subdirectory within the feature
- **Naming**: `use[Feature][Purpose]` (e.g., `useIdeaActions`)
- **Purpose**: Feature-specific logic only

```typescript
// src/features/ideas/hooks/useIdeaActions.ts
export function useIdeaActions(ideaId: string) {
  // Feature-specific logic
}
```

## Import Rules

### ✅ Good Practices

```typescript
// Within a feature - relative imports
import { IdeaCard } from './components/IdeaCard'
import { useIdeaActions } from '../hooks/useIdeaActions'

// From core/shared - absolute imports
import { ideaService } from '@/core/lib/services/ideaService'
import { Button } from '@/shared/components/ui/Button'

// Barrel exports
import { IdeaCard, IdeaForm } from '@/features/ideas/components'
```

### ❌ Bad Practices

```typescript
// Don't import from other features directly
import { CommentCard } from '@/features/comments/components/CommentCard' // ❌

// Don't use deep imports
import { Button } from '@/shared/components/ui/Button/Button' // ❌

// Don't import implementation details
import { internalHelper } from '@/core/lib/services/ideaService/internal' // ❌
```

## Core Layer Guidelines

### Services

- **Location**: `src/core/lib/services/`
- **Interface**: Define in `src/core/abstractions/`
- **Naming**: `[entity]Service` (e.g., `ideaService`)

```typescript
// src/core/abstractions/IIdeaService.ts
export interface IIdeaService {
  getIdeaById(id: string): Promise<Idea>
  createIdea(data: CreateIdeaData): Promise<Idea>
}

// src/core/lib/services/ideaService.ts
export class IdeaService implements IIdeaService {
  async getIdeaById(id: string): Promise<Idea> {
    // Implementation
  }
}
```

### Types

- **Location**: `src/core/types/`
- **Scope**: Shared across features
- **Naming**: PascalCase interfaces, camelCase types

### Hooks

- **Location**: `src/core/hooks/`
- **Scope**: Used by multiple features
- **Naming**: `use[Purpose]` (e.g., `useAuth`)

## Shared Layer Guidelines

### UI Components

- **Location**: `src/shared/components/ui/`
- **Purpose**: Reusable across features
- **Examples**: Button, Dialog, Skeleton

### Layout Components

- **Location**: `src/shared/components/layout/`
- **Purpose**: Page structure components
- **Examples**: Header, Footer, Sidebar

### Providers

- **Location**: `src/shared/components/providers/`
- **Purpose**: React context providers
- **Examples**: AuthProvider, I18nProvider

## Testing Features

Each feature should be tested independently:

```typescript
// src/features/ideas/components/IdeaCard.test.tsx
import { IdeaCard } from './IdeaCard'
import { render } from '@testing-library/react'

describe('IdeaCard', () => {
  it('renders idea title', () => {
    // Test implementation
  })
})
```

## Common Patterns

### 1. Feature Page Components

```typescript
// src/features/ideas/components/IdeasPage.tsx
export function IdeasPage() {
  const { data: ideas } = useIdeas();

  return (
    <div>
      {ideas.map(idea => (
        <IdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
}
```

### 2. Feature Hooks

```typescript
// src/features/ideas/hooks/useIdeas.ts
export function useIdeas() {
  return useQuery({
    queryKey: ['ideas'],
    queryFn: () => ideaService.getIdeas(),
  })
}
```

### 3. Feature Utils

```typescript
// src/features/ideas/utils/ideaUtils.ts
export function formatIdeaScore(score: number): string {
  return `${score}/100`
}
```

## Migration from Other Architectures

### From Layered Architecture

1. **Identify features** from existing components
2. **Move components** to feature directories
3. **Extract shared logic** to core layer
4. **Update imports** to follow new rules
5. **Create barrel exports** for clean imports

### From Monolithic Structure

1. **Analyze dependencies** between components
2. **Group related components** into features
3. **Extract common utilities** to shared/core
4. **Update routing** to use feature components
5. **Test each feature** independently

## Troubleshooting

### Import Errors

- **Check tsconfig.json** paths configuration
- **Verify barrel exports** in index.ts files
- **Ensure feature independence** - no cross-feature imports

### Build Errors

- **Check for circular dependencies** between features
- **Verify all exports** are properly defined
- **Ensure core services** are properly abstracted

### Runtime Errors

- **Check service implementations** in core layer
- **Verify provider setup** in shared layer
- **Test feature isolation** - features should work independently

## Best Practices

1. **Keep features small**: Large features should be split
2. **Use abstractions**: Define interfaces for services
3. **Test features**: Each feature should have its own tests
4. **Document features**: Add README.md to complex features
5. **Avoid feature coupling**: Use core services for communication
6. **Consistent naming**: Follow established naming conventions
7. **Barrel exports**: Always use index.ts for clean imports

## Examples

### Adding a New Feature: Notifications

```bash
# Create structure
mkdir -p src/features/notifications/{components,hooks,types}

# Add component
# src/features/notifications/components/NotificationList.tsx

# Add types
# src/features/notifications/types/notification.types.ts

# Add hook
# src/features/notifications/hooks/useNotifications.ts

# Update core service if needed
# src/core/lib/services/notificationService.ts
```

### Using the Feature

```typescript
// In a page component
import { NotificationList } from '@/features/notifications/components';
import { useNotifications } from '@/features/notifications/hooks';

export function NotificationsPage() {
  const { notifications } = useNotifications();

  return <NotificationList notifications={notifications} />;
}
```

This architecture ensures maintainable, scalable, and testable code that can evolve with your business needs.
