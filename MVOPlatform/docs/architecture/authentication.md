# Authentication

## Implementation

Authentication is handled by NextAuth.js with Google OAuth provider.

## Setup

### Environment Variables

Add to `.env.local`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

## Usage

### Sign In

```tsx
import { signIn } from 'next-auth/react'

<Button onClick={() => signIn('google')}>
  Sign In with Google
</Button>
```

### Sign Out

```tsx
import { signOut } from 'next-auth/react'

<Button onClick={() => signOut()}>
  Sign Out
</Button>
```

### Check Session

```tsx
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()

if (status === 'loading') return <div>Loading...</div>
if (!session) return <div>Not authenticated</div>
```

### Protected Routes

Use server-side or client-side checks:

```tsx
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function ProtectedComponent() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) {
    router.push('/')
    return null
  }

  return <div>Protected content</div>
}
```

## Admin Access

Admin access is controlled by email check:

```tsx
if (session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
  // Show admin features
}
```

Set `NEXT_PUBLIC_ADMIN_EMAIL` in `.env.local`.

## Session Provider

Wrap the app with SessionProvider in `components/providers/Providers.tsx`:

```tsx
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

