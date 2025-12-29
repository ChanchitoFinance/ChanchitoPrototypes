'use client'

import { Footer } from '@/shared/components/layout/Footer'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { Button } from '@/shared/components/ui/Button'
import { Crown, Check } from 'lucide-react'

export function PremiumPage() {
  const t = useTranslations()

  return (
    <div className="h-screen w-full overflow-hidden bg-background flex">
      <div className="flex-1 flex flex-col overflow-hidden ml-16 md:ml-64">
        <main className="flex-1 overflow-y-auto flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex-1">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
              <div className="text-center mb-12">
                <div className="flex justify-center mb-4">
                  <Crown className="w-16 h-16 text-accent" />
                </div>
                <h1 className="text-4xl font-bold text-text-primary mb-4">
                  {t('premium.title')}
                </h1>
                <p className="text-lg text-text-secondary">
                  {t('premium.description')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 border border-border-color rounded-lg">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    {t('premium.features.title')}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary">
                        {t('premium.features.private_spaces')}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary">
                        {t('premium.features.invite_members')}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary">
                        {t('premium.features.advanced_analytics')}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 border border-accent/30 rounded-lg bg-accent/5">
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    {t('premium.pricing.title')}
                  </h3>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-accent mb-2">
                      $29<span className="text-lg text-text-secondary">/mo</span>
                    </div>
                    <p className="text-text-secondary">
                      {t('premium.pricing.description')}
                    </p>
                  </div>
                  <Button variant="primary" className="w-full">
                    {t('premium.subscribe')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}

