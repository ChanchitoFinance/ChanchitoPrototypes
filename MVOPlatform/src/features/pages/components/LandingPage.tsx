'use client'

import { CTA } from '@/features/landing/components/CTA'
import { FAQ } from '@/features/landing/components/FAQ'
import { Hero } from '@/features/landing/components/Hero'
import { Pricing } from '@/features/landing/components/Pricing'
import { Process } from '@/features/landing/components/Process'
import { ScorecardMockup } from '@/features/landing/components/ScorecardMockup'
import { Testimonials } from '@/features/landing/components/Testimonials'

export function LandingPage() {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col ml-16 md:ml-64">
        <main className="flex-1">
          <Hero />
          <Process />
          <ScorecardMockup />
          <Pricing />
          <Testimonials />
          <FAQ />
          <CTA />
        </main>
      </div>
    </div>
  )
}
