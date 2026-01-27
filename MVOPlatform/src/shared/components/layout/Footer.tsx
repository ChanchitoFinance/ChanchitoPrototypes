'use client'

import Link from 'next/link'
import { useTranslations } from '../providers/I18nProvider'

export function Footer() {
  const t = useTranslations()
  return (
    <footer className="bg-background mt-auto">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1800px] mx-auto px-6 xl:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 xl:gap-12">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('brand.full_name')}
            </h3>
            <p className="text-sm text-text-secondary">
              Waiting for signal is rational. We help you decide when to commit.
            </p>
          </div>

          <div>
            <h4 className="text-base font-medium text-text-primary mb-4">
              {t('footer.sections.product')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/ideas" className="text-sm nav-link">
                  {t('ideas.browse_ideas')}
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-sm nav-link">
                  {t('actions.submit_idea')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-medium text-text-primary mb-4">
              {t('footer.sections.company')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm nav-link">
                  {t('footer.links.about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm nav-link">
                  {t('footer.links.contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-medium text-text-primary mb-4">
              {t('footer.sections.legal')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm nav-link">
                  {t('footer.links.privacy_policy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm nav-link">
                  {t('footer.links.terms_of_service')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Extra space column for xl screens - hidden on smaller */}
          <div className="hidden xl:block" />
        </div>

        <div className="mt-12 pt-8 border-t border-border-color text-center text-sm text-text-secondary xl:flex xl:items-center xl:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {t('brand.full_name')}.{' '}
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
