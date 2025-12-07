# Environment Variables

## Centralized Configuration

All environment variables are centralized in `config/env.ts` to prevent direct `process.env` access throughout the codebase.

## Usage

### Server-Side Variables

Import `serverEnv` for server-side environment variables:

```typescript
import { serverEnv } from '@/config/env'

// Use in API routes or server components
const clientId = serverEnv.googleClientId
```

Available server-side variables:
- `googleClientId` - Google OAuth client ID
- `googleClientSecret` - Google OAuth client secret
- `nextAuthUrl` - NextAuth URL
- `nextAuthSecret` - NextAuth secret
- `stripeSecretKey` - Stripe secret key

### Client-Side Variables

Import `clientEnv` for client-side environment variables (must be prefixed with `NEXT_PUBLIC_`):

```typescript
import { clientEnv } from '@/config/env'

// Use in client components
const adminEmail = clientEnv.adminEmail
```

Available client-side variables:
- `stripePublishableKey` - Stripe publishable key
- `adminEmail` - Admin email address

## ESLint Rule

The project includes an ESLint rule that **blocks direct `process.env` access**. All environment variable access must go through `config/env.ts`.

### Exception

The `config/env.ts` file itself is excluded from this rule, as it's the centralized location for reading environment variables.

## Validation

The `validateEnv()` function checks for required environment variables and throws an error if any are missing. This runs automatically on server-side imports.

## Example

❌ **Don't do this:**
```typescript
const apiKey = process.env.API_KEY || ''
```

✅ **Do this instead:**
```typescript
import { serverEnv } from '@/config/env'
const apiKey = serverEnv.apiKey
```

## Adding New Variables

1. Add the variable to `config/env.ts`:
   - Server-side: Add to `serverEnv` object
   - Client-side: Add to `clientEnv` object (must be `NEXT_PUBLIC_*`)

2. Add to `.env.local`:
   ```env
   YOUR_NEW_VAR=value
   ```

3. Update this documentation

4. Use the centralized config throughout the codebase

