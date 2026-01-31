'use client'

import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const t = useTranslations()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-text-primary mb-4">
            {t('terms.page_title')}
          </h1>
          <p className="text-text-secondary text-sm">
            {t('terms.last_updated')}
          </p>
        </div>

        {/* General Provisions */}
        <section className="mb-8 p-6 bg-gray-50 border border-border-color rounded-lg">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            {t('terms.general_provisions.title')}
          </h2>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-primary-accent mt-1">•</span>
              <span>{t('terms.general_provisions.user_responsibility')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-accent mt-1">•</span>
              <span>{t('terms.general_provisions.platform_license')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-accent mt-1">•</span>
              <span>
                {t('terms.general_provisions.no_originality_guarantee')}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-accent mt-1">•</span>
              <span>
                {t('terms.general_provisions.publishing_responsibility')}
              </span>
            </li>
          </ul>
        </section>

        {/* Sections */}
        <div className="space-y-8">
          {/* 1. Definitions */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.definitions.title')}
            </h2>
            <div className="space-y-2 text-text-secondary leading-relaxed">
              <p>{t('terms.definitions.content_def')}</p>
              <p>{t('terms.definitions.publish_def')}</p>
              <p>{t('terms.definitions.attribution_def')}</p>
            </div>
          </section>

          {/* 2. Ownership and License */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.ownership.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.ownership.ownership_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.ownership.ownership_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.ownership.license_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.ownership.license_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.ownership.deletion_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.ownership.deletion_content')}
                </p>
              </div>
            </div>
          </section>

          {/* 3. Public Content */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.public_content.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.public_content.exposure_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.public_content.exposure_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.public_content.sensitive_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.public_content.sensitive_content')}
                </p>
              </div>
            </div>
          </section>

          {/* 4. User Responsibility */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.user_responsibility.title')}
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {t('terms.user_responsibility.content')}
            </p>
          </section>

          {/* 5. Appropriation */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.appropriation.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.appropriation.prohibition_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.appropriation.prohibition_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.appropriation.similar_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.appropriation.similar_content')}
                </p>
              </div>
            </div>
          </section>

          {/* 6. Disputes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.disputes.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.disputes.external_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.disputes.external_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.disputes.internal_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.disputes.internal_content')}
                </p>
              </div>
            </div>
          </section>

          {/* 7. Reports */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.reports.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.reports.how_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.reports.how_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.reports.include_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.reports.include_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.reports.temporary_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.reports.temporary_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.reports.outcomes_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.reports.outcomes_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.reports.appeal_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.reports.appeal_content')}
                </p>
              </div>
            </div>
          </section>

          {/* 8. Sanctions */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.sanctions.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.sanctions.strikes_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.sanctions.strikes_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.sanctions.abuse_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.sanctions.abuse_content')}
                </p>
              </div>
            </div>
          </section>

          {/* 9. Administrator Actions */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.admin_actions.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.admin_actions.discretion_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.admin_actions.discretion_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.admin_actions.enforcement_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.admin_actions.enforcement_content')}
                </p>
              </div>
            </div>
          </section>

          {/* 10. Prohibited Content */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.prohibited_content.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.prohibited_content.forbidden_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.prohibited_content.forbidden_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.prohibited_content.monitoring_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.prohibited_content.monitoring_content')}
                </p>
              </div>
            </div>
          </section>

          {/* 11. Transparency */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.transparency.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.transparency.logs_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.transparency.logs_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.transparency.limitation_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.transparency.limitation_content')}
                </p>
              </div>
            </div>
          </section>

          {/* 12. Liability */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              {t('terms.liability.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.liability.third_party_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t('terms.liability.third_party_content')}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  {t('terms.liability.commitment_title')}
                </h3>
                <p className="text-text-secondary leading-relaxed mb-3">
                  {t('terms.liability.commitment_content')}
                </p>
                <ul className="space-y-2 text-text-secondary ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-accent mt-1">•</span>
                    <span>{t('terms.liability.timestamps')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-accent mt-1">•</span>
                    <span>{t('terms.liability.version_history')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-accent mt-1">•</span>
                    <span>{t('terms.liability.revision_history')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Footer note */}
        <div className="mt-12 pt-8 border-t border-border-color">
          <p className="text-text-secondary text-sm text-center">
            © 2026 {t('brand.full_name')}. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </div>
  )
}
