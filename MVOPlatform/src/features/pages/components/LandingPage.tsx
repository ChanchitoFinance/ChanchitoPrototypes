'use client'

import { CTA } from '@/features/landing/components/CTA'
import { FAQ } from '@/features/landing/components/FAQ'
import { Hero } from '@/features/landing/components/Hero'
import { Pricing } from '@/features/landing/components/Pricing'
import { Process } from '@/features/landing/components/Process'
import { ScorecardMockup } from '@/features/landing/components/ScorecardMockup'
import { Testimonials } from '@/features/landing/components/Testimonials'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/core/lib/hooks'
import {
  signInWithGoogle,
  acceptTermsAndConditions,
} from '@/core/lib/slices/authSlice'
import { useEffect, useState } from 'react'
import { TermsAcceptanceModal } from '@/shared/components/ui/TermsAcceptanceModal'

export function LandingPage() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, user, profile } = useAppSelector(state => state.auth)
  const currentLocale = pathname.startsWith('/es') ? 'es' : 'en'
  const [showTermsModal, setShowTermsModal] = useState(false)

  // Check if terms are accepted after user is authenticated
  useEffect(() => {
    if (isAuthenticated && profile) {
      if (!profile.terms_and_conditions_accepted || !(profile.nda_accepted === true)) {
        setShowTermsModal(true)
      } else {
        router.push(`/${currentLocale}/home`)
      }
    }
  }, [isAuthenticated, profile, currentLocale, router])

  const handleSignInClick = () => {
    // Directly sign in without checking terms first
    dispatch(signInWithGoogle())
  }

  const handleTermsAccepted = async () => {
    if (user?.id) {
      setShowTermsModal(false)
      // Save terms acceptance to database
      await dispatch(acceptTermsAndConditions(user.id))
      // Navigate to home after accepting terms
      router.push(`/${currentLocale}/home`)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href={`/${currentLocale}/home`}
              className="text-xl font-bold text-primary"
            >
              MVO
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href={`/${currentLocale}/home`}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Home
              </Link>
              <button
                onClick={handleSignInClick}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="pt-16">
        <Hero />
        <Process />
        <ScorecardMockup />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </div>
      <TermsAcceptanceModal
        isOpen={showTermsModal && !pathname?.includes('/terms') && !pathname?.includes('/nda')}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccepted}
        userEmail={user?.email}
      />
    </>
  )
}
