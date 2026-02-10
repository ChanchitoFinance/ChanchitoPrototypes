'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { ideaService } from '@/core/lib/services/ideaService'
import { analyticsService } from '@/core/lib/services/analyticsService'
import { Idea } from '@/core/types/idea'
import {
  CreatorInsights,
  DailyVoteEntry,
  formatTimeToEngagement,
  interpretSentiment,
  calculateAILift,
} from '@/core/types/analytics'
import { Button } from '@/shared/components/ui/Button'
import { Tooltip as InfoTooltip } from '@/shared/components/ui/Tooltip'
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
  Legend,
  Area,
  AreaChart,
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
  Clock,
  DollarSign,
  Sparkles,
  Brain,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Eye,
} from 'lucide-react'
import { useAppSelector } from '@/core/lib/hooks'

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

// Color palette matching the app theme
const COLORS = {
  use: '#10B981', // Green
  dislike: '#EF4444', // Red
  pay: '#3B82F6', // Blue
  accent: 'var(--color-accent)',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
}

export function UserAnalytics() {
  const t = useTranslations()
  const { user } = useAppSelector(state => state.auth)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [creatorInsights, setCreatorInsights] = useState<CreatorInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'validation' | 'trends' | 'ai'>('overview')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load both analytics sources in parallel
      const [analytics, insights] = await Promise.all([
        ideaService.getUserIdeasAnalytics(),
        user?.id ? analyticsService.getCreatorInsights(user.id) : null,
      ])
      
      setData(analytics)
      setCreatorInsights(insights)
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

  // Compute AI lift metrics
  const aiLift = useMemo(() => {
    if (!creatorInsights) return null
    return calculateAILift(creatorInsights.ideasWithAI, creatorInsights.ideasWithoutAI)
  }, [creatorInsights])

  // Format vote trends for chart
  const chartData = useMemo(() => {
    if (!creatorInsights?.dailyVoteTrends) return []
    return creatorInsights.dailyVoteTrends.slice(-14).map(entry => ({
      ...entry,
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: entry.use + entry.dislike + entry.pay,
    }))
  }, [creatorInsights])

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
              className="analytics-skeleton-bg rounded-lg p-6 shadow-sm border border-border"
            >
              <div className="animate-pulse space-y-3">
                <div className="h-4 analytics-skeleton-bar rounded w-1/2"></div>
                <div className="h-8 analytics-skeleton-bar rounded w-3/4"></div>
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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
          className="inline-flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">{t('common.refresh')}</span>
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
        {[
          { id: 'overview', label: translate('activity.analytics.tabs.overview', 'Overview'), icon: BarChart3 },
          { id: 'validation', label: translate('activity.analytics.tabs.validation', 'Validation Signals'), icon: Target },
          { id: 'trends', label: translate('activity.analytics.tabs.trends', 'Engagement Trends'), icon: Activity },
          { id: 'ai', label: translate('activity.analytics.tabs.ai', 'AI Value Insights'), icon: Sparkles },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-accent text-white'
                : 'bg-card hover:bg-card-hover text-text-secondary border border-border'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label={translate('activity.analytics.overview.total_ideas', 'Total Ideas')}
              value={data.totalIdeas}
              icon={BarChart3}
              iconColor="text-accent"
              tooltip="The total number of ideas you've published on the platform"
            />
            <StatCard
              label={translate('activity.analytics.overview.total_votes', 'Total Votes')}
              value={data.totalVotes}
              icon={ThumbsUp}
              iconColor="text-green-500"
              tooltip="Combined count of all 'use', 'dislike', and 'pay' votes received across all your ideas"
            />
            <StatCard
              label={translate('activity.analytics.overview.total_comments', 'Total Comments')}
              value={data.totalComments}
              icon={MessageCircle}
              iconColor="text-purple-500"
              tooltip="Total number of comments (both from users and AI personas) on all your ideas"
            />
            <StatCard
              label={translate('activity.analytics.overview.avg_score', 'Average Score')}
              value={Math.round(data.averageScore * 10) / 10}
              icon={TrendingUp}
              iconColor="text-orange-500"
              tooltip="Average engagement score across all your ideas, calculated from votes and sentiment"
            />
            <StatCard
              label={translate('activity.analytics.overview.engagement_rate', 'Engagement Rate')}
              value={`${Math.round(data.engagementRate)}%`}
              icon={Users}
              iconColor="text-blue-500"
              tooltip="Percentage of ideas that have received at least one vote or comment"
            />
            <StatCard
              label={translate('activity.analytics.overview.impact_score', 'Impact Score')}
              value={Math.round(data.impactScore)}
              icon={Target}
              iconColor="text-red-500"
              tooltip="Measures how impactful your ideas are based on 'use' and 'pay' votes received"
            />
            <StatCard
              label={translate('activity.analytics.overview.feasibility_score', 'Feasibility Score')}
              value={`${Math.round(data.feasibilityScore)}%`}
              icon={Lightbulb}
              iconColor="text-yellow-500"
              tooltip="Indicates how practical your ideas are perceived, calculated from positive vs. negative feedback ratio"
            />
            <StatCard
              label={translate('common.total_interactions', 'Total Interactions')}
              value={data.totalVotes + data.totalComments}
              icon={PieChartIcon}
              iconColor="text-indigo-500"
              tooltip="Sum of all votes and comments across all your ideas - a measure of community engagement"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VoteTypesChart data={data.voteTypeBreakdown} translate={translate} />
            <CategoryChart data={data.categoryBreakdown} translate={translate} />
          </div>

          {/* Best/Worst Performing Ideas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <IdeaHighlightCard
              title={translate('activity.analytics.best_idea', 'Best Performing Idea')}
              idea={data.topPerformingIdeas[0]}
              icon={TrendingUp}
              iconColor="text-green-500"
              t={t}
              metrics={[
                { label: t('common.score'), value: data.topPerformingIdeas[0]?.score },
                { label: t('common.votes'), value: data.topPerformingIdeas[0]?.votes },
              ]}
            />
            <IdeaHighlightCard
              title={translate('activity.analytics.most_interacted', 'Most Discussed')}
              idea={data.mostDiscussedIdeas[0]}
              icon={MessageCircle}
              iconColor="text-purple-500"
              t={t}
              metrics={[
                { label: t('common.comments'), value: data.mostDiscussedIdeas[0]?.commentCount },
                { label: t('common.total_interactions'), value: data.mostDiscussedIdeas[0] ? data.mostDiscussedIdeas[0].votes + data.mostDiscussedIdeas[0].commentCount : 0 },
              ]}
            />
            <IdeaHighlightCard
              title={translate('activity.analytics.worst_idea', 'Needs Improvement')}
              idea={data.worstPerformingIdeas[0]}
              icon={TrendingDown}
              iconColor="text-red-500"
              t={t}
              metrics={[
                { label: t('common.score'), value: data.worstPerformingIdeas[0]?.score },
                { label: t('common.total_interactions'), value: data.worstPerformingIdeas[0] ? data.worstPerformingIdeas[0].votes + data.worstPerformingIdeas[0].commentCount : 0 },
              ]}
            />
          </div>
        </>
      )}

      {/* Validation Signals Tab */}
      {activeTab === 'validation' && (
        <ValidationSignalsSection
          insights={creatorInsights}
          data={data}
          translate={translate}
        />
      )}

      {/* Engagement Trends Tab */}
      {activeTab === 'trends' && (
        <EngagementTrendsSection
          insights={creatorInsights}
          chartData={chartData}
          translate={translate}
        />
      )}

      {/* AI Value Insights Tab */}
      {activeTab === 'ai' && (
        <AIValueInsightsSection
          insights={creatorInsights}
          aiLift={aiLift}
          translate={translate}
        />
      )}
    </div>
  )
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  trend?: { value: number; direction: 'up' | 'down' }
  tooltip?: string
}

function StatCard({ label, value, icon: Icon, iconColor, trend, tooltip }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-text-secondary">{label}</p>
            {tooltip && <InfoTooltip content={tooltip} />}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            {trend && (
              <span className={`flex items-center text-xs ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend.direction === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </div>
  )
}

interface VoteTypesChartProps {
  data: { use: number; dislike: number; pay: number }
  translate: (key: string, fallback: string) => string
}

function VoteTypesChart({ data, translate }: VoteTypesChartProps) {
  const chartData = [
    { name: 'Use', value: data.use, color: COLORS.use },
    { name: 'Dislike', value: data.dislike, color: COLORS.dislike },
    { name: 'Pay', value: data.pay, color: COLORS.pay },
  ]

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {translate('activity.analytics.charts.vote_types_breakdown', 'Vote Types Breakdown')}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--gray-100)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
            labelStyle={{ color: 'var(--text-primary)' }}
            itemStyle={{ color: 'var(--text-secondary)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

interface CategoryChartProps {
  data: Record<string, number>
  translate: (key: string, fallback: string) => string
}

function CategoryChart({ data, translate }: CategoryChartProps) {
  const colors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899']
  
  if (Object.keys(data).length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {translate('activity.analytics.charts.category_distribution', 'Category Distribution')}
        </h3>
        <p className="text-text-secondary text-center py-8">
          {translate('activity.analytics.no_data', 'No category data available')}
        </p>
      </div>
    )
  }

  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }))

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {translate('activity.analytics.charts.category_distribution', 'Category Distribution')}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--gray-100)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
            labelStyle={{ color: 'var(--text-primary)' }}
            itemStyle={{ color: 'var(--text-secondary)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

interface IdeaHighlightCardProps {
  title: string
  idea: Idea | undefined
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  t: (key: string) => string
  metrics: Array<{ label: string; value: number | undefined }>
}

function IdeaHighlightCard({ title, idea, icon: Icon, iconColor, t, metrics }: IdeaHighlightCardProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        {title}
      </h3>
      {idea ? (
        <div className="space-y-3">
          <h4 className="font-medium text-text-primary line-clamp-2">{idea.title}</h4>
          {metrics.map((metric, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{metric.label}</span>
              <span className="font-medium text-text-primary">{metric.value ?? 0}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-text-secondary">No data available</p>
      )}
    </div>
  )
}

// =====================================================
// NEW INSIGHT SECTIONS
// =====================================================

interface ValidationSignalsSectionProps {
  insights: CreatorInsights | null
  data: AnalyticsData
  translate: (key: string, fallback: string) => string
}

function ValidationSignalsSection({ insights, data, translate }: ValidationSignalsSectionProps) {
  const payConversion = insights?.payConversionRate ?? 0
  const timeToFirstVote = insights?.avgTimeToFirstVote ?? 0
  const timeToFirstComment = insights?.avgTimeToFirstComment ?? 0
  const sentimentRatio = insights?.sentimentRatio ?? 0
  const sentimentInterpretation = interpretSentiment(sentimentRatio)

  // Calculate from local data if insights not available
  const localPayConversion = data.totalVotes > 0 
    ? (data.voteTypeBreakdown.pay / data.totalVotes) * 100 
    : 0
  
  const displayPayConversion = payConversion > 0 ? payConversion : localPayConversion

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-text-primary">{translate('activity.analytics.validation.title', 'Validation Signals')}</h3>
        </div>
        <p className="text-text-secondary text-sm">
          {translate('activity.analytics.validation.description', 'Key metrics that indicate how well your ideas are being validated by the community.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pay Conversion Rate */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            {translate('activity.analytics.validation.pay_conversion', 'Pay Conversion Rate')}
            <InfoTooltip content={translate('activity.analytics.validation.pay_conversion_tooltip', 'The percentage of voters who selected \'Would Pay\' for your ideas. Higher rates indicate strong market validation and willingness to pay for your solution.')} />
          </div>
          <div className="text-3xl font-bold text-text-primary mb-1">
            {displayPayConversion.toFixed(1)}%
          </div>
          <p className="text-xs text-text-secondary">
            {translate('activity.analytics.validation.pay_conversion_desc', '% of voters who would pay for your ideas')}
          </p>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="w-full analytics-progress-track rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(displayPayConversion, 100)}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {displayPayConversion >= 15 ? '🎯 Excellent!' : displayPayConversion >= 5 ? '👍 Good progress' : '💡 Room to grow'}
            </p>
          </div>
        </div>

        {/* Time to First Vote */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            {translate('activity.analytics.validation.time_to_vote', 'Avg Time to First Vote')}
            <InfoTooltip content={translate('activity.analytics.validation.time_to_vote_tooltip', 'Average time it takes for your ideas to receive their first vote after publishing. Faster times indicate better initial visibility and appeal.')} />
          </div>
          <div className="text-3xl font-bold text-text-primary mb-1">
            {formatTimeToEngagement(timeToFirstVote)}
          </div>
          <p className="text-xs text-text-secondary">
            {translate('activity.analytics.validation.time_to_vote_desc', 'How quickly your ideas get noticed')}
          </p>
          <div className="mt-3 pt-3 border-t border-border">
            {timeToFirstVote > 0 && (
              <p className="text-xs">
                {timeToFirstVote < 3600 ? translate('activity.analytics.validation.fast_engagement', '⚡ Fast engagement!') : timeToFirstVote < 86400 ? translate('activity.analytics.validation.within_day', '🕐 Within a day') : translate('activity.analytics.validation.few_days', '📅 Takes a few days')}
              </p>
            )}
          </div>
        </div>

        {/* Time to First Comment */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
            <MessageCircle className="w-4 h-4 text-purple-500" />
            {translate('activity.analytics.validation.time_to_comment', 'Avg Time to First Comment')}
            <InfoTooltip content={translate('activity.analytics.validation.time_to_comment_tooltip', 'How quickly discussions begin on your ideas. Faster engagement typically correlates with clearer value propositions and compelling content.')} />
          </div>
          <div className="text-3xl font-bold text-text-primary mb-1">
            {formatTimeToEngagement(timeToFirstComment)}
          </div>
          <p className="text-xs text-text-secondary">
            {translate('activity.analytics.validation.time_to_comment_desc', 'When discussions start around your ideas')}
          </p>
        </div>

        {/* Community Sentiment */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
            <Users className="w-4 h-4 text-orange-500" />
            {translate('activity.analytics.validation.community_sentiment', 'Community Sentiment')}
            <InfoTooltip content={translate('activity.analytics.validation.community_sentiment_tooltip', 'Ratio of positive feedback (\'use\' + \'pay\' votes) to negative feedback (\'dislike\' votes). Higher ratios indicate stronger market validation.')} />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="text-3xl font-bold text-text-primary">
              {sentimentRatio.toFixed(1)}:1
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              sentimentInterpretation === 'positive' ? 'sentiment-badge-positive' :
              sentimentInterpretation === 'neutral' ? 'sentiment-badge-neutral' :
              'sentiment-badge-negative'
            }`}>
              {sentimentInterpretation}
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            {translate('activity.analytics.validation.sentiment_ratio_desc', 'Positive (use + pay) vs negative (dislike) ratio')}
          </p>
        </div>
      </div>

      {/* Vote Distribution Bar */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h4 className="font-medium text-text-primary mb-4">{translate('activity.analytics.validation.vote_sentiment_breakdown', 'Vote Sentiment Breakdown')}</h4>
        <div className="flex rounded-full overflow-hidden h-4 analytics-progress-track">
          {data.totalVotes > 0 && (
            <>
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${(data.voteTypeBreakdown.use / data.totalVotes) * 100}%` }}
                title={`Use: ${data.voteTypeBreakdown.use}`}
              />
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${(data.voteTypeBreakdown.pay / data.totalVotes) * 100}%` }}
                title={`Pay: ${data.voteTypeBreakdown.pay}`}
              />
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${(data.voteTypeBreakdown.dislike / data.totalVotes) * 100}%` }}
                title={`Dislike: ${data.voteTypeBreakdown.dislike}`}
              />
            </>
          )}
        </div>
        <div className="flex justify-between mt-2 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Use ({data.voteTypeBreakdown.use})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Would Pay ({data.voteTypeBreakdown.pay})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Dislike ({data.voteTypeBreakdown.dislike})
          </span>
        </div>
      </div>
    </div>
  )
}

interface EngagementTrendsSectionProps {
  insights: CreatorInsights | null
  chartData: Array<DailyVoteEntry & { date: string; total: number }>
  translate: (key: string, fallback: string) => string
}

function EngagementTrendsSection({ insights, chartData, translate }: EngagementTrendsSectionProps) {
  const voteVelocity = insights?.voteVelocity ?? 0
  const totalViews = insights?.totalViews ?? 0
  const uniqueViewers = insights?.totalUniqueViewers ?? 0

  // Calculate peak day
  const peakDay = chartData.length > 0
    ? chartData.reduce((max, entry) => entry.total > max.total ? entry : max, chartData[0])
    : null

  const totalVotesLast14Days = chartData.reduce((sum, entry) => sum + entry.total, 0)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/20">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-text-primary">{translate('activity.analytics.trends.title', 'Engagement Trends')}</h3>
        </div>
        <p className="text-text-secondary text-sm">
          {translate('activity.analytics.trends.description', 'Track how engagement with your ideas changes over time.')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label={translate('activity.analytics.trends.vote_velocity', 'Vote Velocity')}
          value={`${voteVelocity.toFixed(1)}/${translate('activity.analytics.trends.per_day', 'day')}`}
          icon={Zap}
          iconColor="text-yellow-500"
          tooltip={translate('activity.analytics.trends.vote_velocity_tooltip', 'Average number of votes your ideas receive per day in the last 30 days. Higher velocity indicates growing momentum.')}
        />
        <StatCard
          label={translate('activity.analytics.trends.total_views', 'Total Views')}
          value={totalViews}
          icon={Eye}
          iconColor="text-blue-500"
          tooltip={translate('activity.analytics.trends.total_views_tooltip', 'Total number of times your ideas have been viewed. Each page load counts as a view.')}
        />
        <StatCard
          label={translate('activity.analytics.trends.unique_viewers', 'Unique Viewers')}
          value={uniqueViewers}
          icon={Users}
          iconColor="text-purple-500"
          tooltip={translate('activity.analytics.trends.unique_viewers_tooltip', 'Number of distinct users who have viewed your ideas. This metric helps measure your reach.')}
        />
        <StatCard
          label={translate('activity.analytics.trends.votes_14_days', 'Votes (14 days)')}
          value={totalVotesLast14Days}
          icon={ThumbsUp}
          iconColor="text-green-500"
          tooltip={translate('activity.analytics.trends.votes_14_days_tooltip', 'Total votes received in the last 14 days. Use this to track recent engagement trends.')}
        />
      </div>

      {/* Engagement Chart */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-text-primary">{translate('activity.analytics.trends.vote_activity', 'Vote Activity (Last 14 Days)')}</h4>
          {peakDay && peakDay.total > 0 && (
            <span className="text-xs text-text-secondary">
              📈 {translate('activity.analytics.trends.peak', 'Peak')}: {peakDay.date} ({peakDay.total} {translate('common.votes', 'votes')})
            </span>
          )}
        </div>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDislike" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="use" stackId="1" stroke="#10B981" fill="url(#colorUse)" name="Use" />
              <Area type="monotone" dataKey="pay" stackId="1" stroke="#3B82F6" fill="url(#colorPay)" name="Pay" />
              <Area type="monotone" dataKey="dislike" stackId="1" stroke="#EF4444" fill="url(#colorDislike)" name="Dislike" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-text-secondary">
            <Activity className="w-12 h-12 mb-4 opacity-50" />
            <p>{translate('activity.analytics.trends.no_data', 'No trend data available yet')}</p>
            <p className="text-xs mt-1">{translate('activity.analytics.trends.no_data_desc', 'Data will appear as your ideas receive engagement')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface AIValueInsightsSectionProps {
  insights: CreatorInsights | null
  aiLift: { votesLift: number; payRateLift: number } | null
  translate: (key: string, fallback: string) => string
}

function AIValueInsightsSection({ insights, aiLift, translate }: AIValueInsightsSectionProps) {
  const withAI = insights?.ideasWithAI ?? { count: 0, avgVotes: 0, avgPayRate: 0 }
  const withoutAI = insights?.ideasWithoutAI ?? { count: 0, avgVotes: 0, avgPayRate: 0 }
  const usage = insights?.aiFeatureUsage ?? { deepResearch: 0, personasEval: 0, aiComments: 0 }

  const totalAIUsage = usage.deepResearch + usage.personasEval + usage.aiComments

  // Generate recommendation based on data
  const getRecommendation = () => {
    if (totalAIUsage === 0) {
      return {
        text: "Try AI features on your next idea! AI comments and research can boost engagement.",
        emoji: "💡"
      }
    }
    if (aiLift && aiLift.votesLift > 20) {
      return {
        text: `Ideas with AI get ${aiLift.votesLift.toFixed(0)}% more votes. Keep using AI features!`,
        emoji: "🚀"
      }
    }
    if (usage.deepResearch === 0) {
      return {
        text: "Try Deep Research to get comprehensive market validation for your ideas.",
        emoji: "🔬"
      }
    }
    return {
      text: "You're leveraging AI well. Consider using Personas Evaluation for expert-level feedback.",
      emoji: "✨"
    }
  }

  const recommendation = getRecommendation()

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-text-primary">{translate('activity.analytics.ai.title', 'AI Value Insights')}</h3>
        </div>
        <p className="text-text-secondary text-sm">
          {translate('activity.analytics.ai.description', 'Compare performance of ideas with and without AI features.')}
        </p>
      </div>

      {/* AI vs Non-AI Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ideas with AI */}
        <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-lg p-6 shadow-sm border border-purple-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <h4 className="font-semibold text-text-primary">{translate('activity.analytics.ai.ideas_with_ai', 'Ideas with AI')}</h4>
            <InfoTooltip content={translate('activity.analytics.ai.ideas_with_ai_tooltip', 'Performance metrics for ideas where you used at least one AI feature (AI comments, Deep Research, or Personas Evaluation)')} />
            <span className="ml-auto text-sm font-bold count-badge-purple px-2 py-0.5 rounded">
              {withAI.count} {translate('activity.analytics.ai.ideas_unit', 'ideas')}
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">{translate('activity.analytics.ai.avg_votes', 'Avg Votes')}</span>
                <span className="font-bold text-text-primary">{withAI.avgVotes.toFixed(1)}</span>
              </div>
              <div className="w-full analytics-progress-track rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(withAI.avgVotes * 5, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">{translate('activity.analytics.ai.avg_pay_rate', 'Avg Pay Rate')}</span>
                <span className="font-bold text-text-primary">{withAI.avgPayRate.toFixed(1)}%</span>
              </div>
              <div className="w-full analytics-progress-track rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(withAI.avgPayRate, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Ideas without AI */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-text-secondary" />
            <h4 className="font-semibold text-text-primary">{translate('activity.analytics.ai.ideas_without_ai', 'Ideas without AI')}</h4>
            <InfoTooltip content={translate('activity.analytics.ai.ideas_without_ai_tooltip', 'Performance metrics for ideas where you didn\'t use any AI features. Compare with AI-enhanced ideas to measure impact.')} />
            <span className="ml-auto text-sm font-bold count-badge-gray px-2 py-0.5 rounded">
              {withoutAI.count} {translate('activity.analytics.ai.ideas_unit', 'ideas')}
            </span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">{translate('activity.analytics.ai.avg_votes', 'Avg Votes')}</span>
                <span className="font-bold text-text-primary">{withoutAI.avgVotes.toFixed(1)}</span>
              </div>
              <div className="w-full analytics-progress-track rounded-full h-2">
                <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${Math.min(withoutAI.avgVotes * 5, 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">{translate('activity.analytics.ai.avg_pay_rate', 'Avg Pay Rate')}</span>
                <span className="font-bold text-text-primary">{withoutAI.avgPayRate.toFixed(1)}%</span>
              </div>
              <div className="w-full analytics-progress-track rounded-full h-2">
                <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${Math.min(withoutAI.avgPayRate, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Lift Metrics */}
      {aiLift && (withAI.count > 0 || withoutAI.count > 0) && (
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h4 className="font-medium text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            {translate('activity.analytics.ai.ai_impact_title', 'AI Impact on Performance')}
            <InfoTooltip content={translate('activity.analytics.ai.ai_impact_tooltip', 'Shows the percentage improvement in key metrics when using AI features vs. not using them. Positive numbers indicate AI is helping your ideas perform better.')} />
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 ai-lift-card-positive rounded-lg">
              <div className={`text-3xl font-bold ${aiLift.votesLift >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {aiLift.votesLift >= 0 ? '+' : ''}{aiLift.votesLift.toFixed(1)}%
              </div>
              <div className="text-sm text-text-secondary mt-1 flex items-center justify-center gap-1">
                {translate('activity.analytics.ai.vote_lift', 'Vote Lift')}
                <InfoTooltip content={translate('activity.analytics.ai.vote_lift_tooltip', 'Percentage increase in average votes for AI-enhanced ideas compared to non-AI ideas')} />
              </div>
            </div>
            <div className="text-center p-4 ai-lift-card-blue rounded-lg">
              <div className={`text-3xl font-bold ${aiLift.payRateLift >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                {aiLift.payRateLift >= 0 ? '+' : ''}{aiLift.payRateLift.toFixed(1)}%
              </div>
              <div className="text-sm text-text-secondary mt-1 flex items-center justify-center gap-1">
                {translate('activity.analytics.ai.pay_rate_lift', 'Pay Rate Lift')}
                <InfoTooltip content={translate('activity.analytics.ai.pay_rate_lift_tooltip', 'Percentage increase in \'Would Pay\' conversion rate for AI-enhanced ideas vs. non-AI ideas')} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Feature Usage */}
      <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
        <h4 className="font-medium text-text-primary mb-4 flex items-center gap-2">
          {translate('activity.analytics.ai.feature_usage_title', 'Your AI Feature Usage')}
          <InfoTooltip content={translate('activity.analytics.ai.feature_usage_tooltip', 'Track how many times you\'ve used each AI feature across all your ideas')} />
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 ai-feature-card-purple rounded-lg">
            <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-primary">{usage.aiComments}</div>
            <div className="text-xs text-text-secondary flex items-center justify-center gap-1">
              {translate('activity.analytics.ai.ai_comments', 'AI Comments')}
              <InfoTooltip content={translate('activity.analytics.ai.ai_comments_tooltip', 'Number of ideas with AI-generated initial comments from our personas')} />
            </div>
          </div>
          <div className="text-center p-4 ai-feature-card-blue rounded-lg">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-primary">{usage.personasEval}</div>
            <div className="text-xs text-text-secondary flex items-center justify-center gap-1">
              {translate('activity.analytics.ai.personas_eval', 'Personas Eval')}
              <InfoTooltip content={translate('activity.analytics.ai.personas_eval_tooltip', 'Number of times you ran Personas Evaluation to get expert feedback from 5 AI personas')} />
            </div>
          </div>
          <div className="text-center p-4 ai-feature-card-green rounded-lg">
            <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-text-primary">{usage.deepResearch}</div>
            <div className="text-xs text-text-secondary flex items-center justify-center gap-1">
              {translate('activity.analytics.ai.deep_research', 'Deep Research')}
              <InfoTooltip content={translate('activity.analytics.ai.deep_research_tooltip', 'Number of times you ran AI Deep Research to get comprehensive market validation and competitor analysis')} />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg p-6 border border-accent/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{recommendation.emoji}</span>
          <div>
            <h4 className="font-medium text-text-primary mb-1">{translate('activity.analytics.ai.recommendation', 'Recommendation')}</h4>
            <p className="text-text-secondary text-sm">{recommendation.text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
