'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { ideaService } from '@/core/lib/services/ideaService'
import { Idea } from '@/core/types/idea'
import { Button } from '@/shared/components/ui/Button'
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
import {
  TrendingUp,
  TrendingDown,
  MessageCircle,
  ThumbsUp,
  BarChart3,
  RefreshCw,
  Users,
  Target,
  Lightbulb,
  PieChart as PieChartIcon,
} from 'lucide-react'

interface AnalyticsData {
  totalIdeas: number
  totalVotes: number
  totalComments: number
  averageScore: number
  engagementRate: number
  impactScore: number
  feasibilityScore: number
  ideasWithStats: Array<{
    idea: Idea
    engagementRate: number
    voteDistribution: { use: number; dislike: number; pay: number }
    categoryDistribution: Record<string, number>
  }>
  topPerformingIdeas: Idea[]
  worstPerformingIdeas: Idea[]
  mostDiscussedIdeas: Idea[]
  voteTypeBreakdown: { use: number; dislike: number; pay: number }
  categoryBreakdown: Record<string, number>
}

export function UserAnalytics() {
  const t = useTranslations()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading analytics...')
      const analytics = await ideaService.getUserIdeasAnalytics()
      console.log('Loaded analytics:', analytics)
      setData(analytics)
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  // Safe translation helper
  const translate = (key: string, fallback: string = key) => {
    try {
      const result = t(key)
      return typeof result === 'string' ? result : fallback
    } catch {
      return fallback
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {translate('activity.analytics.title', 'Analytics Dashboard')}
            </h2>
            <p className="text-text-secondary">
              {translate(
                'activity.analytics.subtitle',
                'Insights about your ideas performance'
              )}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-lg p-6 shadow-sm border"
            >
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button
          onClick={loadAnalytics}
          variant="outline"
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {t('actions.try_again') || 'Try Again'}
        </Button>
      </div>
    )
  }

  if (!data || data.totalIdeas === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          {translate('activity.analytics.no_data', 'No data available yet')}
        </h3>
        <p className="text-text-secondary">
          Create your first idea to see analytics and insights.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            {translate('activity.analytics.title', 'Analytics Dashboard')}
          </h2>
          <p className="text-text-secondary">
            {translate(
              'activity.analytics.subtitle',
              'Insights about your ideas performance'
            )}
          </p>
        </div>
        <Button
          onClick={loadAnalytics}
          variant="outline"
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {t('common.refresh')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">
                {translate(
                  'activity.analytics.overview.total_ideas',
                  'Total Ideas'
                )}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {data.totalIdeas}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">
                {translate(
                  'activity.analytics.overview.total_votes',
                  'Total Votes'
                )}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {data.totalVotes}
              </p>
            </div>
            <ThumbsUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">
                {translate(
                  'activity.analytics.overview.total_comments',
                  'Total Comments'
                )}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {data.totalComments}
              </p>
            </div>
            <MessageCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">
                {translate(
                  'activity.analytics.overview.avg_score',
                  'Average Score'
                )}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {Math.round(data.averageScore * 10) / 10}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        {/* New Metrics Row */}
        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">
                {translate(
                  'activity.analytics.overview.engagement_rate',
                  'Engagement Rate'
                )}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {Math.round(data.engagementRate)}%
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">
                {translate(
                  'activity.analytics.overview.impact_score',
                  'Impact Score'
                )}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {Math.round(data.impactScore)}
              </p>
            </div>
            <Target className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">
                {translate(
                  'activity.analytics.overview.feasibility_score',
                  'Feasibility Score'
                )}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {Math.round(data.feasibilityScore)}%
              </p>
            </div>
            <Lightbulb className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">
                {translate('common.total_interactions', 'Total Interactions')}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {data.totalVotes + data.totalComments}
              </p>
            </div>
            <PieChartIcon className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vote Types Pie Chart */}
        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {translate(
              'activity.analytics.charts.vote_types_breakdown',
              'Vote Types Breakdown'
            )}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: translate('actions.up', 'Up'),
                    value: data.voteTypeBreakdown.use,
                    color: '#10B981',
                  },
                  {
                    name: translate('actions.down', 'Down'),
                    value: data.voteTypeBreakdown.dislike,
                    color: '#EF4444',
                  },
                  {
                    name: translate('actions.id_pay', 'Pay'),
                    value: data.voteTypeBreakdown.pay,
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
                  backgroundColor: 'var(--gray-100)',
                  border: '2px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {translate(
              'activity.analytics.charts.category_distribution',
              'Category Distribution'
            )}
          </h3>
          {Object.keys(data.categoryBreakdown).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(data.categoryBreakdown).map(
                    ([name, value]) => ({
                      name,
                      value,
                    })
                  )}
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
                  {Object.entries(data.categoryBreakdown).map((_, index) => {
                    const colors = [
                      '#3B82F6',
                      '#10B981',
                      '#EF4444',
                      '#F59E0B',
                      '#8B5CF6',
                      '#EC4899',
                    ]
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    )
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--gray-100)',
                    border: '2px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-secondary text-center py-8">
              {translate(
                'activity.analytics.no_data',
                'No category data available'
              )}
            </p>
          )}
        </div>
      </div>

      {/* Best/Worst Performing Ideas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            {translate('activity.analytics.best_idea', 'Best Performing Idea')}
          </h3>
          {data.topPerformingIdeas[0] ? (
            <div className="space-y-3">
              <h4 className="font-medium text-text-primary">
                {data.topPerformingIdeas[0].title}
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{t('common.score')}</span>
                <span className="font-medium text-text-primary">
                  {data.topPerformingIdeas[0].score}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{t('common.votes')}</span>
                <span className="font-medium text-text-primary">
                  {data.topPerformingIdeas[0].votes}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary">No data available</p>
          )}
        </div>

        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            {translate('activity.analytics.most_interacted', 'Most Discussed')}
          </h3>
          {data.mostDiscussedIdeas[0] ? (
            <div className="space-y-3">
              <h4 className="font-medium text-text-primary">
                {data.mostDiscussedIdeas[0].title}
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  {t('common.comments')}
                </span>
                <span className="font-medium text-text-primary">
                  {data.mostDiscussedIdeas[0].commentCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  {t('common.total_interactions')}
                </span>
                <span className="font-medium text-text-primary">
                  {data.mostDiscussedIdeas[0].votes +
                    data.mostDiscussedIdeas[0].commentCount}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary">No data available</p>
          )}
        </div>

        <div className="bg-gray-100 rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            {translate('activity.analytics.worst_idea', 'Needs Improvement')}
          </h3>
          {data.worstPerformingIdeas[0] ? (
            <div className="space-y-3">
              <h4 className="font-medium text-text-primary">
                {data.worstPerformingIdeas[0].title}
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{t('common.score')}</span>
                <span className="font-medium text-text-primary">
                  {data.worstPerformingIdeas[0].score}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  {t('common.total_interactions')}
                </span>
                <span className="font-medium text-text-primary">
                  {data.worstPerformingIdeas[0].votes +
                    data.worstPerformingIdeas[0].commentCount}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary">No data available</p>
          )}
        </div>
      </div>
    </div>
  )
}
