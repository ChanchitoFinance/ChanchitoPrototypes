'use client'

import { useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/components/providers/I18nProvider'
import { UserIdeasList, UserAnalytics } from '@/components/activity'
import { Button } from '@/components/ui/Button'
import { Sidebar } from '@/components/layout/Sidebar'
import {
  ArrowLeft,
  Lightbulb,
  Check,
  LogIn,
  ThumbsUp,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  Users,
  Target,
  RefreshCw,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

export default function ActivityPage() {
  const t = useTranslations()
  const router = useRouter()
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
      <div className="h-screen w-full overflow-hidden bg-background flex">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="p-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-text-primary">
                    {t('activity.title')}
                  </h1>
                  <p className="text-text-secondary mt-1">
                    {t('common.welcome_back')}, Guest
                  </p>
                </div>
              </div>

              <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab('ideas')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'ideas'
                      ? 'bg-gray-700 text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t('activity.my_ideas')}
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'analytics'
                      ? 'bg-gray-700 text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t('common.analytics')}
                </button>
              </div>
            </div>

            {/* Example Content for Non-Logged-In Users */}
            <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-6">
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
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-text-secondary">
                        {t('activity.example.feature_1')}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-text-secondary">
                        {t('activity.example.feature_2')}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-text-secondary">
                        {t('activity.example.feature_3')}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push('/auth')}
                    variant="primary"
                    className="mt-6 inline-flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('actions.sign_in')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Example Cards Preview */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {t('activity.example.preview')}
              </h3>

              {activeTab === 'ideas' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Example Idea Card 1 */}
                  <div className="card-hover overflow-hidden h-full">
                    <article className="p-4 flex flex-col h-full">
                      {/* Media Section */}
                      <div className="relative w-full aspect-video mb-3 rounded-md overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
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
                          <ArrowUp className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-sm font-medium">32</span>
                        </div>

                        {/* Downvote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <ArrowDown className="w-3.5 h-3.5 text-red-500" />
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
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
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
                          <ArrowUp className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-sm font-medium">25</span>
                        </div>

                        {/* Downvote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <ArrowDown className="w-3.5 h-3.5 text-red-500" />
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
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
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
                          <ArrowUp className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-sm font-medium">28</span>
                        </div>

                        {/* Downvote Metric */}
                        <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                          <ArrowDown className="w-3.5 h-3.5 text-red-500" />
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
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary">
                        {t('activity.analytics.title')}
                      </h2>
                      <p className="text-text-secondary">
                        {t('activity.analytics.subtitle')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="inline-flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t('common.refresh')}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-secondary mb-1">
                            {t('activity.analytics.overview.total_ideas')}
                          </p>
                          <p className="text-2xl font-bold text-text-primary">
                            12
                          </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-accent" />
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-secondary mb-1">
                            {t('activity.analytics.overview.total_votes')}
                          </p>
                          <p className="text-2xl font-bold text-text-primary">
                            128
                          </p>
                        </div>
                        <ThumbsUp className="w-8 h-8 text-green-500" />
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-secondary mb-1">
                            {t('activity.analytics.overview.total_comments')}
                          </p>
                          <p className="text-2xl font-bold text-text-primary">
                            85
                          </p>
                        </div>
                        <MessageCircle className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-secondary mb-1">
                            {t('activity.analytics.overview.avg_score')}
                          </p>
                          <p className="text-2xl font-bold text-text-primary">
                            75.2
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-secondary mb-1">
                            {t('activity.analytics.overview.engagement_rate')}
                          </p>
                          <p className="text-2xl font-bold text-text-primary">
                            68%
                          </p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-secondary mb-1">
                            {t('activity.analytics.overview.impact_score')}
                          </p>
                          <p className="text-2xl font-bold text-text-primary">
                            82
                          </p>
                        </div>
                        <Target className="w-8 h-8 text-red-500" />
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-secondary mb-1">
                            {t('activity.analytics.overview.feasibility_score')}
                          </p>
                          <p className="text-2xl font-bold text-text-primary">
                            74%
                          </p>
                        </div>
                        <Lightbulb className="w-8 h-8 text-yellow-500" />
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-secondary mb-1">
                            {t('common.total_interactions')}
                          </p>
                          <p className="text-2xl font-bold text-text-primary">
                            213
                          </p>
                        </div>
                        <PieChartIcon className="w-8 h-8 text-indigo-500" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-text-primary mb-4">
                        {t('activity.analytics.charts.vote_types_breakdown')}
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: t('actions.up'),
                                value: 65,
                                color: '#10B981',
                              },
                              {
                                name: t('actions.down'),
                                value: 10,
                                color: '#EF4444',
                              },
                              {
                                name: t('actions.id_pay'),
                                value: 25,
                                color: '#3B82F6',
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { color: '#10B981' },
                              { color: '#EF4444' },
                              { color: '#3B82F6' },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--gray-800)',
                              border: '2px solid var(--border-color)',
                              borderRadius: 'var(--border-radius-md)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-text-primary mb-4">
                        {t('activity.analytics.charts.category_distribution')}
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'SaaS', value: 40 },
                              { name: 'Mobile', value: 30 },
                              { name: 'Sustainability', value: 20 },
                              { name: 'Productivity', value: 10 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {['#3B82F6', '#10B981', '#EF4444', '#F59E0B'].map(
                              (color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              )
                            )}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--gray-800)',
                              border: '2px solid var(--border-color)',
                              borderRadius: 'var(--border-radius-md)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        {t('activity.analytics.best_idea')}
                      </h3>
                      <div className="space-y-3">
                        <h4 className="font-medium text-text-primary">
                          {t('activity.example.idea_title_1')}
                        </h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">
                            {t('common.score')}
                          </span>
                          <span className="font-medium text-text-primary">
                            85
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">
                            {t('common.votes')}
                          </span>
                          <span className="font-medium text-text-primary">
                            52
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-purple-500" />
                        {t('activity.analytics.most_interacted')}
                      </h3>
                      <div className="space-y-3">
                        <h4 className="font-medium text-text-primary">
                          {t('activity.example.idea_title_3')}
                        </h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">
                            {t('common.comments')}
                          </span>
                          <span className="font-medium text-text-primary">
                            25
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">
                            {t('common.total_interactions')}
                          </span>
                          <span className="font-medium text-text-primary">
                            77
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 shadow-sm border">
                      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        {t('activity.analytics.worst_idea')}
                      </h3>
                      <div className="space-y-3">
                        <h4 className="font-medium text-text-primary">
                          {t('activity.example.idea_title_2')}
                        </h4>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">
                            {t('common.score')}
                          </span>
                          <span className="font-medium text-text-primary">
                            68
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">
                            {t('common.total_interactions')}
                          </span>
                          <span className="font-medium text-text-primary">
                            43
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background flex">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  {t('activity.title')}
                </h1>
                <p className="text-text-secondary mt-1">
                  {t('common.welcome_back')},{' '}
                  {profile?.full_name || user?.email || 'User'}
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
