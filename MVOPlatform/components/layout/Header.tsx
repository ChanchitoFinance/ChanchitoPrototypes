'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { UserMenu } from '@/components/ui/UserMenu'
import { clientEnv } from '@/config/env'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border-color">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-text-primary">
          MVO Platform
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/ideas"
            className="text-base font-normal text-text-secondary hover:text-text-primary transition-colors"
          >
            Ideas
          </Link>
          <Link
            href="/submit"
            className="text-base font-normal text-text-secondary hover:text-text-primary transition-colors"
          >
            Submit Idea
          </Link>

          {session ? (
            <>
              {session.user?.email === clientEnv.adminEmail && (
                <Link
                  href="/admin"
                  className="text-base font-normal text-text-secondary hover:text-text-primary transition-colors"
                >
                  Admin
                </Link>
              )}
              <UserMenu user={session.user} onSignOut={() => signOut()} />
            </>
          ) : (
            <Button onClick={() => signIn('google')} variant="primary">
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

