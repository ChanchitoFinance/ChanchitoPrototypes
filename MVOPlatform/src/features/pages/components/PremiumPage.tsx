'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTranslations, useLocale } from '@/shared/components/providers/I18nProvider'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { loadUserCredits } from '@/core/lib/slices/creditsSlice'
import { signInWithGoogle } from '@/core/lib/slices/authSlice'
import { supabase } from '@/core/lib/supabase'
import { Crown, Check, Zap, Star, Users, ArrowRight, Sparkles } from 'lucide-react'

const coinPackages = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: 19,
    coins: 100,
    features: ['100 coins', 'Run analysis', 'Spend coins to go deeper'],
    icon: Zap,
    accent: 'var(--primary-accent)',
  },
  {
    id: 'builder' as const,
    name: 'Builder',
    price: 49,
    coins: 250,
    features: ['250 coins', 'Run analysis', 'Spend coins to go deeper'],
    icon: Star,
    accent: 'var(--premium-cta)',
    featured: true,
  },
  {
    id: 'operator' as const,
    name: 'Operator',
    price: 89,
    coins: 500,
    features: ['500 coins', 'Run analysis', 'Spend coins to go deeper'],
    icon: Users,
    accent: 'var(--accent-alt)',
  },
]

function isSafeReturnUrl(value: string | null) {
  if (!value) return false
  // Only allow same-app paths to avoid open redirects
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
}

export function PremiumPage() {
  const t = useTranslations()
  const { locale } = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  const { user } = useAppSelector(state => state.auth)
  const { loading: creditsLoading } = useAppSelector(state => state.credits)

  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    const loadCredits = async () => {
      let userId = user?.id
      if (!userId) {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        userId = session?.user?.id
      }
      if (userId) {
        dispatch(loadUserCredits(userId))
      }
    }
    loadCredits()
  }, [user, dispatch])

  // Optional: allow preselecting via URL (?plan=builder) so the UI can highlight it
  const preselectedPlan = useMemo(() => {
    const plan = searchParams?.get('plan')
    if (!plan) return null
    return coinPackages.some(p => p.id === plan) ? plan : null
  }, [searchParams])

  const handlePlanClick = (planId: string) => {
    const checkoutPath = `/${locale}/checkout?plan=${planId}`

    if (user) {
      router.push(checkoutPath)
      return
    }

    // Go straight to Google sign-in; callback will send them back to auth then to checkout
    if (typeof sessionStorage !== 'undefined' && isSafeReturnUrl(checkoutPath)) {
      sessionStorage.setItem('authReturnUrl', checkoutPath)
    }
    dispatch(signInWithGoogle())
  }

  return (
    <main className="relative z-10 container-section padding-section">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(600px 300px at 50% 0%, rgba(153,43,255,0.22), transparent 60%), radial-gradient(500px 260px at 20% 30%, rgba(160,123,207,0.18), transparent 55%), radial-gradient(500px 260px at 80% 40%, rgba(196,163,224,0.14), transparent 55%)',
          filter: 'blur(0px)',
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center spacing-section"
      >
        <motion.div
          className="flex justify-center mb-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="rounded-lg"
            style={{
              padding: 'var(--spacing-md)',
              border: '2px solid var(--border-color)',
              backgroundColor: 'rgba(160, 123, 207, 0.08)',
              boxShadow: 'var(--shadow-card)',
            }}
            whileHover={{ scale: 1.04, rotate: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Crown className="w-12 h-12" style={{ color: 'var(--premium-cta)' }} />
          </motion.div>
        </motion.div>

        <h1 className="text-heading-2" style={{ marginBottom: 'var(--spacing-sm)' }}>
          {t('premium.get_more_coins_title')}
        </h1>
        <p className="text-body-large">{t('premium.get_more_coins_subtitle')}</p>

        <motion.div
          className="mt-6 inline-flex items-center gap-2 badge-base"
          style={{
            backgroundColor: 'rgba(160, 123, 207, 0.10)',
            border: '2px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
          whileHover={{ y: -2 }}
        >
          <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            {t('premium.coins_no_expire')}
          </span>
        </motion.div>
      </motion.div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {coinPackages.map((pkg, index) => {
          const Icon = pkg.icon
          const isHovered = hoveredId === pkg.id
          const isFeatured = Boolean(pkg.featured)
          const isSelected = preselectedPlan === pkg.id

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              onHoverStart={() => setHoveredId(pkg.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="relative overflow-hidden"
              style={{
                borderRadius: 'var(--border-radius-lg)',
              }}
            >
              {/* Animated border glow */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-px"
                animate={{
                  opacity: isHovered || isFeatured || isSelected ? 1 : 0.45,
                }}
                transition={{ duration: 0.25 }}
                style={{
                  borderRadius: 'var(--border-radius-lg)',
                  background: `radial-gradient(800px 220px at 50% 0%, ${pkg.accent}55, transparent 60%)`,
                }}
              />

              <motion.div
                className="relative card-white"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                style={{
                  borderRadius: 'var(--border-radius-lg)',
                  border:
                    isFeatured || isSelected
                      ? `2px solid ${pkg.accent}`
                      : '2px solid var(--border-color)',
                  backgroundColor: 'var(--gray-100)',
                  boxShadow: isHovered ? 'var(--shadow-hover)' : 'var(--shadow-card)',
                }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="flex items-center justify-center"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--border-radius-md)',
                        border: '2px solid var(--border-color)',
                        backgroundColor: 'rgba(160, 123, 207, 0.08)',
                      }}
                      animate={{ rotate: isHovered ? 6 : 0, scale: isHovered ? 1.04 : 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Icon className="w-5 h-5" style={{ color: pkg.accent }} />
                    </motion.div>

                    <div>
                      <h3
                        className="text-label"
                        style={{
                          fontSize: 'var(--font-size-lg)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {pkg.name}
                      </h3>
                      {isFeatured && (
                        <span
                          className="badge-base"
                          style={{
                            display: 'inline-block',
                            marginTop: 'var(--spacing-xs)',
                            backgroundColor: 'rgba(153, 43, 255, 0.14)',
                            color: 'var(--text-primary)',
                            border: `2px solid ${pkg.accent}`,
                          }}
                        >
                          {t('premium.most_popular')}
                        </span>
                      )}
                    </div>
                  </div>

                  <motion.div
                    className="badge-base"
                    style={{
                      backgroundColor: 'rgba(160, 123, 207, 0.10)',
                      border: '2px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                    }}
                    animate={{ y: isHovered ? -2 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {pkg.coins} {t('premium.coins_label')}
                  </motion.div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div
                    className="text-heading-2"
                    style={{
                      fontSize: 'var(--font-size-3xl)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 'var(--spacing-sm)',
                    }}
                  >
                    <span style={{ color: pkg.accent }}>${pkg.price}</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {t('premium.one_time')}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2"
                      initial={false}
                      animate={{ x: isHovered ? 2 : 0, opacity: isHovered ? 1 : 0.92 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: pkg.accent }} />
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA (always render, never blocked) */}
                <motion.button
                  type="button"
                  onClick={() => handlePlanClick(pkg.id)}
                  disabled={creditsLoading}
                  className="w-full interactive-base disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!creditsLoading ? { scale: 1.02 } : undefined}
                  whileTap={!creditsLoading ? { scale: 0.98 } : undefined}
                  style={{
                    backgroundColor: isFeatured ? 'var(--premium-cta)' : 'var(--primary-accent)',
                    color: 'var(--white)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-size-sm)',
                    border: '2px solid transparent',
                    boxShadow: isHovered ? 'var(--shadow-hover)' : 'var(--shadow-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-sm)',
                  }}
                  onMouseEnter={e => {
                    if (!creditsLoading) e.currentTarget.style.opacity = '0.92'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  <span>
                    {t('premium.get_coins_button').replace('{count}', String(pkg.coins))}
                  </span>
                  <motion.span
                    aria-hidden
                    animate={{ x: isHovered ? 4 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </motion.button>

                {/* Small helper text */}
                <motion.p
                  className="mt-3 text-center"
                  style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}
                  animate={{ opacity: isHovered ? 1 : 0.9 }}
                >
                  {user
                    ? t('premium.secure_checkout_note')
                    : t('premium.sign_in_to_continue')}
                </motion.p>

                {/* Decorative animated dots */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{
                    right: 14,
                    top: 14,
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    backgroundColor: pkg.accent,
                    opacity: 0.6,
                  }}
                  animate={{ scale: isHovered ? 1.4 : 1, opacity: isHovered ? 0.9 : 0.55 }}
                  transition={{ duration: 0.25 }}
                />
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="text-center mt-10"
        style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}
      >
        <p>{t('premium.billing_disclaimer')}</p>
      </motion.div>
    </main>
  )
}

