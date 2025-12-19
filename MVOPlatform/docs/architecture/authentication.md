# Authentication

## Implementation

Authentication is handled by Supabase with Google OAuth provider. Only Google authentication is supported (no email/password).

## Setup

### Supabase Project Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Authentication → Providers → Google
3. Enable Google provider
4. Configure OAuth credentials in Supabase dashboard
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
6. Go to SQL Editor and run the SQL from `init.sql` to create the users table and trigger

### Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### Sign In

To sign in a user with Google OAuth, dispatch the `signInWithGoogle` action from the auth slice. This initiates the OAuth flow, redirecting the user to Google for authentication, and upon success, redirects back to the callback page where the session is established.

See the implementation in [`signInWithGoogle()`](../../lib/slices/authSlice.ts).

### Sign Out

To sign out the current user, dispatch the `signOut` action. This clears the user's session with Supabase and resets the authentication state in the Redux store.

See [`signOut()`](../../lib/slices/authSlice.ts).

### Accessing Logged-In User Data

After a user successfully logs in, their data is available through the Redux auth state. You can access it using the `useAppSelector` hook from the app's hooks.

Available user data includes:

- `user`: The Supabase User object, which contains authentication details such as the user's unique ID, email address, and other OAuth-provided information.

- `profile`: The user profile fetched from the database, including additional fields like full name, role (user or admin), and timestamps for creation and updates.

To use this data in your components, select the auth state and check the `isAuthenticated` flag to ensure the user is logged in. Handle the `loading` state appropriately while authentication is being checked.

For example, you can conditionally render content based on authentication status or display user-specific information like their name or email.

See the [AuthState](../../types/auth.ts) type definition for the complete structure.

### Protected Routes

Certain routes in the application are protected and require authentication. The `AuthProvider` component automatically handles route protection by checking the authentication state. If a user attempts to access a protected route (such as /submit or /admin) without being authenticated, they are redirected to the /auth page.

Public routes remain accessible without authentication.

See [AuthProvider](../../components/providers/AuthProvider.tsx) for the route protection logic.

### Admin Access

Admin access is determined by comparing the user's profile email against a configured admin email address. If the emails match, the user is granted admin privileges. Additionally, the profile includes a `role` field that can be set to 'admin' for more granular control.

To implement admin-only features, check `profile?.email === adminEmail` or `profile?.role === 'admin'` in your components.

Set the `NEXT_PUBLIC_ADMIN_EMAIL` environment variable to specify the admin email.

See how admin checks are performed in components like [AdminPanel](../../components/pages/AdminPanel.tsx).

### Redux Store

The application uses Redux Toolkit for state management, including authentication state. The app is wrapped with both the Redux `Provider` and the `AuthProvider` in the `Providers` component to ensure the store and authentication context are available throughout the app.

See [Providers](../../components/providers/Providers.tsx) for the provider setup.
