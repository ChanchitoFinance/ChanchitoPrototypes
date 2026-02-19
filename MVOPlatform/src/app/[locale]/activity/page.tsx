'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAppSelector } from '@/core/lib/hooks'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from '@/shared/components/providers/I18nProvider'
import { Button } from '@/shared/components/ui/Button'
import {
  ArrowLeft,
  Lightbulb,
  Check,
  LogIn,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  DollarSign,
} from 'lucide-react'
import { SignalOverviewSkeleton, IdeaCardSkeleton } from '@/shared/components/ui/Skeleton'

const UserAnalytics = dynamic(
  () => import('@/features/activity/components/UserAnalytics').then(m => ({ default: m.UserAnalytics })),
  { loading: () => <SignalOverviewSkeleton />, ssr: false }
)

const UserIdeasList = dynamic(
  () => import('@/features/activity/components/UserIdeasList').then(m => ({ default: m.UserIdeasList })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <IdeaCardSkeleton key={i} />
        ))}
      </div>
    ),
    ssr: false,
  }
)

export default function ActivityPage() {
  const t = useTranslations()
  const router = useRouter()
  const { locale } = useLocale()
  const { isAuthenticated, user, profile, initialized } = useAppSelector(
    state => state.auth
  )
  const [activeTab, setActiveTab] = useState<'ideas' | 'analytics'>('ideas')

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-accent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t('status.loading')}
          </h1>
          <p className="text-text-secondary">
            {t('common.checking_authentication')}...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="w-full bg-background flex">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
              <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex items-center justify-center p-2 rounded-md font-medium transition-all"
                  style={{
                    backgroundColor: 'var(--primary-accent)',
                    color: 'var(--white)',
                    border: '2px solid transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--hover-accent)'
                    e.currentTarget.style.color = 'var(--white)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-accent)'
                    e.currentTarget.style.color = 'var(--white)'
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-text-primary">
                    {t('activity.title')}
                  </h1>
                  <p className="text-text-secondary mt-1">
                    {t('common.welcome_back')}, Guest
                  </p>
                </div>
              </div>

              <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab('ideas')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'ideas'
                      ? 'bg-gray-100 text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t('activity.my_ideas')}
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'analytics'
                      ? 'bg-gray-100 text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t('common.analytics')}
                </button>
              </div>
            </div>

            {/* Example Content for Non-Logged-In Users */}
            <div className="mt-8 bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Lightbulb className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    {t('auth.sign_in_required')}
                  </h2>
                  <p className="text-text-secondary mb-4">
                    {t('activity.example.message')}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <span className="text-text-secondary">
                        {t('activity.example.feature_1')}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <span className="text-text-secondary">
                        {t('activity.example.feature_2')}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <span className="text-text-secondary">
                        {t('activity.example.feature_3')}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push(`/${locale}/auth`)}
                    variant="primary"
                    className="mt-6 inline-flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('actions.sign_in')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Ideas tab: example cards. Analytics tab: mocked Signal Overview preview */}
            <div className="mt-8">
              {activeTab === 'ideas' ? (
                <>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    {t('activity.example.preview')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Example Idea Card 1 */}
                  <div className="card-hover overflow-hidden h-full">
                    <article className="p-4 flex flex-col h-full">
                      {/* Media Section */}
                      <div className="relative w-full aspect-video mb-3 rounded-md overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center">
                          <div className="text-center px-4">
                            <h3 className="text-lg font-bold text-text-primary line-clamp-2">
                              {t('activity.example.idea_title_1')}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex items-start justify-between gap-3 mb-3 flex-1">
                        <div className="flex-1 min-w-0 max-w-[calc(100%-80px)]">
                          <h2 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2 break-words">
                            {t('activity.example.idea_title_1')}
                          </h2>
                          <p className="text-sm text-text-secondary line-clamp-2 mb-2 break-words">
                            {t('activity.example.idea_description')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 w-16">
                          <div className="text-2xl font-semibold text-accent whitespace-nowrap">
                            85
                          </div>
                          <div className="text-xs text-text-secondary whitespace-nowrap">
                            {t('common.score')}
                          </div>
                        </div>
                      </div>

                      {/* Metrics Section */}
                      <div className="flex items-center gap-3 mb-2 min-h-[32px] overflow-hidden">
                        {/* Upvote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <ArrowUp className="w-3.5 h-3.5 text-success" />
                          <span className="text-sm font-medium">32</span>
                        </div>

                        {/* Downvote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <ArrowDown className="w-3.5 h-3.5 text-error" />
                          <span className="text-sm font-medium">8</span>
                        </div>

                        {/* Pay Vote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-sm font-medium">12</span>
                        </div>

                        {/* Comments Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="text-sm">42</span>
                        </div>
                      </div>

                      {/* Tags Section */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-2 overflow-hidden">
                        <span className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                          #SaaS
                        </span>
                        <span className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                          #Productivity
                        </span>
                      </div>

                      {/* Author and Date */}
                      <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-background">
                        <span>By Example User</span>
                        <span>2 days ago</span>
                      </div>
                    </article>
                  </div>

                  {/* Example Idea Card 2 */}
                  <div className="card-hover overflow-hidden h-full">
                    <article className="p-4 flex flex-col h-full">
                      {/* Media Section */}
                      <div className="relative w-full aspect-video mb-3 rounded-md overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-success/80 to-accent flex items-center justify-center">
                          <div className="text-center px-4">
                            <h3 className="text-lg font-bold text-text-primary line-clamp-2">
                              {t('activity.example.idea_title_2')}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex items-start justify-between gap-3 mb-3 flex-1">
                        <div className="flex-1 min-w-0 max-w-[calc(100%-80px)]">
                          <h2 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2 break-words">
                            {t('activity.example.idea_title_2')}
                          </h2>
                          <p className="text-sm text-text-secondary line-clamp-2 mb-2 break-words">
                            {t('activity.example.idea_description_2')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 w-16">
                          <div className="text-2xl font-semibold text-accent whitespace-nowrap">
                            68
                          </div>
                          <div className="text-xs text-text-secondary whitespace-nowrap">
                            {t('common.score')}
                          </div>
                        </div>
                      </div>

                      {/* Metrics Section */}
                      <div className="flex items-center gap-3 mb-2 min-h-[32px] overflow-hidden">
                        {/* Upvote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <ArrowUp className="w-3.5 h-3.5 text-success" />
                          <span className="text-sm font-medium">25</span>
                        </div>

                        {/* Downvote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <ArrowDown className="w-3.5 h-3.5 text-error" />
                          <span className="text-sm font-medium">5</span>
                        </div>

                        {/* Pay Vote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-sm font-medium">8</span>
                        </div>

                        {/* Comments Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="text-sm">18</span>
                        </div>
                      </div>

                      {/* Tags Section */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-2 overflow-hidden">
                        <span className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                          #Sustainability
                        </span>
                        <span className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                          #EcoFriendly
                        </span>
                      </div>

                      {/* Author and Date */}
                      <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-background">
                        <span>By Example User</span>
                        <span>1 week ago</span>
                      </div>
                    </article>
                  </div>

                  {/* Example Idea Card 3 */}
                  <div className="card-hover overflow-hidden h-full">
                    <article className="p-4 flex flex-col h-full">
                      {/* Media Section */}
                      <div className="relative w-full aspect-video mb-3 rounded-md overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-accent flex items-center justify-center">
                          <div className="text-center px-4">
                            <h3 className="text-lg font-bold text-text-primary line-clamp-2">
                              {t('activity.example.idea_title_3')}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex items-start justify-between gap-3 mb-3 flex-1">
                        <div className="flex-1 min-w-0 max-w-[calc(100%-80px)]">
                          <h2 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2 break-words">
                            {t('activity.example.idea_title_3')}
                          </h2>
                          <p className="text-sm text-text-secondary line-clamp-2 mb-2 break-words">
                            {t('activity.example.idea_description_3')}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 w-16">
                          <div className="text-2xl font-semibold text-accent whitespace-nowrap">
                            72
                          </div>
                          <div className="text-xs text-text-secondary whitespace-nowrap">
                            {t('common.score')}
                          </div>
                        </div>
                      </div>

                      {/* Metrics Section */}
                      <div className="flex items-center gap-3 mb-2 min-h-[32px] overflow-hidden">
                        {/* Upvote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <ArrowUp className="w-3.5 h-3.5 text-success" />
                          <span className="text-sm font-medium">28</span>
                        </div>

                        {/* Downvote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <ArrowDown className="w-3.5 h-3.5 text-error" />
                          <span className="text-sm font-medium">6</span>
                        </div>

                        {/* Pay Vote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-sm font-medium">10</span>
                        </div>

                        {/* Comments Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="text-sm">25</span>
                        </div>
                      </div>

                      {/* Tags Section */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-2 overflow-hidden">
                        <span className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                          #MobileApp
                        </span>
                        <span className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                          #Networking
                        </span>
                      </div>

                      {/* Author and Date */}
                      <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-background">
                        <span>By Example User</span>
                        <span>3 days ago</span>
                      </div>
                    </article>
                  </div>
                </div>
                </>
              ) : (
                <UserAnalytics />
              )}
            </div>
          </div>
        </main>
    </div>
  )
}

  return (
    <div className="w-full bg-background flex">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-6">
            <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center justify-center p-2 rounded-md font-medium transition-all self-start"
                style={{
                  backgroundColor: 'var(--primary-accent)',
                  color: 'var(--white)',
                  border: '2px solid transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-accent)'
                  e.currentTarget.style.color = 'var(--white)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-accent)'
                  e.currentTarget.style.color = 'var(--white)'
                }}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                  {t('activity.title')}
                </h1>
                <p className="text-text-secondary mt-1">
                  {t('common.welcome_back')},{' '}
                  {profile?.full_name || user?.email || 'User'}
                </p>
              </div>
            </div>

            <div className="flex bg-card p-1 rounded-lg w-full md:w-fit">
              <button
                onClick={() => setActiveTab('ideas')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'ideas'
                    ? 'bg-gray-100 text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t('activity.my_ideas')}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-gray-100 text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t('common.analytics')}
              </button>
            </div>
          </div>

          <div className="mt-8">
            {activeTab === 'ideas' ? (
              <UserIdeasList key="ideas-list" />
            ) : (
              <UserAnalytics key="analytics" />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
