'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { ideaService } from '@/core/lib/services/ideaService'
import { analyticsService } from '@/core/lib/services/analyticsService'
import { useAppSelector } from '@/core/lib/hooks'
import { Button } from '@/shared/components/ui/Button'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts'
import { BarChart3, RefreshCw, Activity, GitBranch } from 'lucide-react'
import { motion } from 'framer-motion'
import { getGlobalSignalOverviewMock } from '../data/mockSignalOverview'

const tableRowVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03, duration: 0.2 } }),
}
const chartContainerVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}
const TOOLTIP_STYLE = {
  backgroundColor: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  padding: '10px 14px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
}

const SIGNAL_COLORS = {
  dislike: '#FF944C',
  use: '#A07BCF',
  pay: '#992BFF',
}

type SignalTab = 'signal' | 'attention' | 'behavioral'

interface AnalyticsData {
  totalIdeas: number
  totalVotes: number
  totalComments: number
  voteTypeBreakdown: { use: number; dislike: number; pay: number }
}

export function UserAnalytics() {
  const t = useTranslations()
  const { user } = useAppSelector(state => state.auth)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<SignalTab>('signal')
  const [mock] = useState(() => getGlobalSignalOverviewMock())

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const analytics = await ideaService.getUserIdeasAnalytics()
      const insights = user?.id ? await analyticsService.getCreatorInsights(user.id) : null
      setData({
        totalIdeas: analytics.totalIdeas,
        totalVotes: analytics.totalVotes,
        totalComments: analytics.totalComments,
        voteTypeBreakdown: analytics.voteTypeBreakdown,
      })
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

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
      <div className="space-y-6 bg-black min-h-[320px] rounded-lg border border-white/10">
        <div className="p-6 border-b border-white/10">
          <div className="h-6 w-48 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="p-6 flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-9 w-32 bg-white/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-black rounded-lg border border-white/10">
        <p className="text-white/80 mb-4">{error}</p>
        <Button onClick={loadAnalytics} variant="outline" className="inline-flex items-center gap-2 border-white/20 text-white">
          <RefreshCw className="w-4 h-4" />
          {t('actions.try_again') || 'Try Again'}
        </Button>
      </div>
    )
  }

  if (!data || data.totalIdeas === 0) {
    return (
      <div className="text-center py-12 bg-black rounded-lg border border-white/10">
        <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">{translate('activity.signal_overview.no_data', 'No data available yet')}</h3>
        <p className="text-white/60">Create your first idea to see signal overview.</p>
      </div>
    )
  }

  const totalSignals = data.voteTypeBreakdown.use + data.voteTypeBreakdown.dislike + data.voteTypeBreakdown.pay
  const pctDislike = totalSignals > 0 ? (data.voteTypeBreakdown.dislike / totalSignals) * 100 : 0
  const pctUse = totalSignals > 0 ? (data.voteTypeBreakdown.use / totalSignals) * 100 : 0
  const pctPay = totalSignals > 0 ? (data.voteTypeBreakdown.pay / totalSignals) * 100 : 0
  const payIntentionRatio = totalSignals > 0 ? data.voteTypeBreakdown.pay / totalSignals : 0

  const tabs: { id: SignalTab; label: string; icon: typeof BarChart3 }[] = [
    { id: 'signal', label: translate('activity.signal_overview.tabs.signal_distribution', 'Signal Distribution'), icon: BarChart3 },
    { id: 'attention', label: translate('activity.signal_overview.tabs.attention_depth', 'Attention & Depth'), icon: Activity },
    { id: 'behavioral', label: translate('activity.signal_overview.tabs.behavioral_patterns', 'Behavioral Patterns'), icon: GitBranch },
  ]

  return (
    <div className="space-y-0 bg-black rounded-lg border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {translate('activity.signal_overview.title', 'Signal Overview')}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {translate('activity.signal_overview.subtitle', 'Cross-idea signal and behavioral evidence. This does not evaluate ideas. It shows external response patterns.')}
            </p>
          </div>
          <Button onClick={loadAnalytics} variant="outline" className="self-start md:self-center border-white/20 text-white hover:bg-white/10">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </Button>
        </div>
      </div>

      <div className="flex gap-0 border-b border-white/10 px-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-[#992BFF] text-white'
                : 'border-transparent text-white/60 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'signal' && (
          <SignalDistributionTab
            data={data}
            totalSignals={totalSignals}
            pctDislike={pctDislike}
            pctUse={pctUse}
            pctPay={pctPay}
            payIntentionRatio={payIntentionRatio}
            signalDriftData={mock.signalDriftLast30Days}
            translate={translate}
          />
        )}
        {activeTab === 'attention' && (
          <AttentionDepthTab mock={mock} translate={translate} />
        )}
        {activeTab === 'behavioral' && (
          <BehavioralPatternsTab mock={mock} data={data} translate={translate} />
        )}
      </div>
    </div>
  )
}

function SignalDistributionTab({
  data,
  totalSignals,
  pctDislike,
  pctUse,
  pctPay,
  payIntentionRatio,
  signalDriftData,
  translate,
}: {
  data: AnalyticsData
  totalSignals: number
  pctDislike: number
  pctUse: number
  pctPay: number
  payIntentionRatio: number
  signalDriftData: { date: string; volatility: number; reversalRate: number; voteChange: number }[]
  translate: (k: string, f: string) => string
}) {
  const barSegments = [
    { key: 'dislike', width: pctDislike, color: SIGNAL_COLORS.dislike, label: translate('activity.signal_overview.labels.dislike', 'Dislike') },
    { key: 'use', width: pctUse, color: SIGNAL_COLORS.use, label: translate('activity.signal_overview.labels.like', 'Like') },
    { key: 'pay', width: pctPay, color: SIGNAL_COLORS.pay, label: translate('activity.signal_overview.labels.id_pay_for_it', "I'd pay for it") },
  ].filter(s => s.width > 0)

  return (
    <div className="space-y-8">
      <motion.section initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
        <h3 className="text-sm font-medium text-white/80 mb-4">
          {translate('activity.signal_overview.signal_mix', 'Aggregate Signal Mix')}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">
          {translate('activity.signal_overview.signal_mix_explain', 'The stacked bar shows how all votes across your ideas are split: Dislike (would not use), Would Use, and Would Pay. Total Signals is the sum of all votes; Pay Intention Ratio is the share of votes that are Would Pay. This gives you the overall response mix without judging any single idea.')}
        </p>
        <div className="space-y-3">
          <div className="flex h-10 rounded overflow-hidden bg-white/5 group" style={{ minHeight: 40 }}>
            {barSegments.map(seg => (
              <motion.div
                key={seg.key}
                initial={{ width: 0 }}
                animate={{ width: `${seg.width}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex items-center justify-center text-xs font-medium text-white min-w-[2rem] transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: seg.color }}
                title={`${seg.label}: ${seg.width.toFixed(1)}%`}
              >
                {seg.width >= 8 ? `${seg.width.toFixed(0)}%` : ''}
              </motion.div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/60">
            <span>{translate('activity.signal_overview.labels.dislike', 'Dislike')}: {pctDislike.toFixed(1)}</span>
            <span>{translate('activity.signal_overview.labels.like', 'Like')}: {pctUse.toFixed(1)}</span>
            <span>{translate('activity.signal_overview.labels.id_pay_for_it', "I'd pay for it")}: {pctPay.toFixed(1)}</span>
            <span>Total Signals: {totalSignals}</span>
            <span>Pay Intention Ratio: {payIntentionRatio.toFixed(3)}</span>
          </div>
        </div>
      </motion.section>

      <motion.section className="pt-6 border-t border-white/10" variants={chartContainerVariants} initial="hidden" animate="visible">
        <h3 className="text-sm font-medium text-white/80 mb-4">
          {translate('activity.signal_overview.signal_drift', 'Signal Drift')}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">
          {translate('activity.signal_overview.signal_drift_explain', 'The line chart shows how vote volume changes day by day over the last 30 days. It reflects signal volatility and reversal patterns—useful to see whether response is steady or shifting over time.')}
        </p>
        {signalDriftData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={signalDriftData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                formatter={(value: number) => [value, 'Vote change']}
                cursor={{ stroke: 'rgba(153,43,255,0.4)', strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="voteChange"
                stroke="#992BFF"
                strokeWidth={1.5}
                dot={false}
                name=""
                isAnimationActive
                animationDuration={500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-white/40 text-sm">No drift data yet</div>
        )}
      </motion.section>
    </div>
  )
}

function AttentionDepthTab({
  mock,
  translate,
}: {
  mock: ReturnType<typeof getGlobalSignalOverviewMock>
  translate: (k: string, f: string) => string
}) {
  const exposureRows = [
    { label: translate('activity.signal_overview.exposure.feed_impressions', 'Total feed impressions'), value: mock.totalFeedImpressions.toLocaleString() },
    { label: translate('activity.signal_overview.exposure.reimpression_rate', 'Re-impression rate'), value: (mock.reimpressionRate * 100).toFixed(1) + '%' },
    { label: translate('activity.signal_overview.exposure.unique_viewers', 'Unique viewers'), value: mock.uniqueViewers.toLocaleString() },
    { label: translate('activity.signal_overview.exposure.avg_feed_dwell', 'Average feed dwell time (ms)'), value: mock.avgFeedDwellTimeMs.toLocaleString() },
    { label: translate('activity.signal_overview.exposure.hover_duration', 'Hover duration (desktop)'), value: `${(mock.hoverDurationDesktopMs / 1000).toFixed(1)}s` },
  ]
  const detailRows = [
    { label: translate('activity.signal_overview.detail.starts', 'Detail view starts'), value: mock.detailViewStarts.toLocaleString() },
    { label: translate('activity.signal_overview.detail.avg_dwell', 'Avg detail dwell time'), value: `${(mock.avgDetailDwellTimeMs / 1000).toFixed(1)}s` },
    { label: translate('activity.signal_overview.detail.median_dwell', 'Median dwell time'), value: `${(mock.medianDwellTimeMs / 1000).toFixed(1)}s` },
    { label: translate('activity.signal_overview.detail.scroll_depth', 'Scroll depth (avg %)'), value: mock.scrollDepthAvgPct + '%' },
    { label: translate('activity.signal_overview.detail.return_rate', 'Return to detail view rate'), value: (mock.returnToDetailRate * 100).toFixed(1) + '%' },
    { label: translate('activity.signal_overview.detail.time_between_returns', 'Time between returns'), value: `${(mock.timeBetweenReturnsSec / 3600).toFixed(1)}h` },
  ]
  const bucketLabels = ['0-2s', '2-5s', '5-10s', '10-30s', '30+s']
  const dwellChartData = mock.dwellTimeDistribution.map((v, i) => ({ name: bucketLabels[i] || `${i}`, count: v }))
  const scrollChartData = mock.scrollDepthDistribution.map((v, i) => ({ name: `${i * 20}-${(i + 1) * 20}%`, count: v }))

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-medium text-white/80 mb-2">
          {translate('activity.signal_overview.attention.exposure', 'Exposure')}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">
          {translate('activity.signal_overview.attention.exposure_explain', 'System-level metrics for how often your ideas appear in feeds, how many unique people see them, and how long they are viewed or hovered before any click. No charts—just the numbers that describe reach and surface-level attention.')}
        </p>
        <div className="analytics-table-wrap divide-y divide-white/10">
          {exposureRows.map((row, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={tableRowVariants}
              initial="hidden"
              animate="visible"
              className="analytics-table-row flex justify-between px-4 py-3 text-sm cursor-default"
            >
              <span className="text-white/70">{row.label}</span>
              <span className="text-white font-mono">{row.value}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-white/10">
        <h3 className="text-sm font-medium text-white/80 mb-2">
          {translate('activity.signal_overview.attention.detail_behavior', 'Detail View Behavior')}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">
          {translate('activity.signal_overview.attention.detail_behavior_explain', 'When someone opens an idea (detail view), these metrics show how long they stay, how far they scroll, and how often they come back. The histograms show the distribution of dwell times and scroll depth so you can see whether attention is shallow or deep.')}
        </p>
        <div className="analytics-table-wrap divide-y divide-white/10 mb-6">
          {detailRows.map((row, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={tableRowVariants}
              initial="hidden"
              animate="visible"
              className="analytics-table-row flex justify-between px-4 py-3 text-sm cursor-default"
            >
              <span className="text-white/70">{row.label}</span>
              <span className="text-white font-mono">{row.value}</span>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={chartContainerVariants} initial="hidden" animate="visible" className="rounded-lg border border-white/10 p-3 transition-colors duration-200 hover:border-white/20">
            <p className="text-white/50 text-xs mb-2">{translate('activity.signal_overview.attention.dwell_histogram', 'Dwell time distribution')}</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dwellChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" fill="rgba(153,43,255,0.6)" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={400} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div variants={chartContainerVariants} initial="hidden" animate="visible" className="rounded-lg border border-white/10 p-3 transition-colors duration-200 hover:border-white/20">
            <p className="text-white/50 text-xs mb-2">{translate('activity.signal_overview.attention.scroll_dist', 'Scroll depth distribution')}</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={scrollChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="count" fill="rgba(160,123,207,0.6)" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={400} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function BehavioralPatternsTab({
  mock,
  data,
  translate,
}: {
  mock: ReturnType<typeof getGlobalSignalOverviewMock>
  data: AnalyticsData
  translate: (k: string, f: string) => string
}) {
  const latencyRows = [
    { label: translate('activity.signal_overview.behavioral.avg_detail_to_signal', 'Avg time from detail view → signal'), value: `${mock.avgTimeDetailToSignalSec}s` },
    { label: translate('activity.signal_overview.behavioral.median_vote_latency', 'Median vote latency'), value: `${mock.medianVoteLatencySec}s` },
    { label: translate('activity.signal_overview.behavioral.pct_votes_under_10s', '% votes under 10 seconds'), value: mock.pctVotesUnder10Sec + '%' },
    { label: translate('activity.signal_overview.behavioral.pct_votes_after_comment', '% votes after comment'), value: mock.pctVotesAfterComment + '%' },
    { label: translate('activity.signal_overview.behavioral.pct_votes_after_ai_comment', '% votes after AI comment'), value: mock.pctVotesAfterAIComment + '%' },
  ]
  const commentRows = [
    { label: translate('activity.signal_overview.behavioral.comments_per_idea', 'Comments per idea'), value: mock.commentsPerIdeaAvg.toFixed(1) },
    { label: translate('activity.signal_overview.behavioral.avg_comment_length', 'Avg comment length'), value: mock.avgCommentLength },
    { label: translate('activity.signal_overview.behavioral.reply_depth', 'Reply depth'), value: mock.replyDepthAvg.toFixed(1) },
    { label: translate('activity.signal_overview.behavioral.thread_participation', 'Thread participation rate'), value: (mock.threadParticipationRate * 100).toFixed(1) + '%' },
    { label: translate('activity.signal_overview.behavioral.comment_edit_rate', 'Comment edit rate'), value: (mock.commentEditRate * 100).toFixed(1) + '%' },
    { label: translate('activity.signal_overview.behavioral.comment_upvote_ratio', 'Comment upvote/downvote ratio'), value: mock.commentUpvoteDownvoteRatio.toFixed(1) },
  ]
  const returnRows = [
    { label: translate('activity.signal_overview.behavioral.return_session_count', 'Return session count (per user avg)'), value: mock.returnSessionCountPerUser.toFixed(1) },
    { label: translate('activity.signal_overview.behavioral.engagement_decay', 'Engagement decay rate'), value: (mock.engagementDecayRate * 100).toFixed(1) + '%' },
    { label: translate('activity.signal_overview.behavioral.pct_return_7d', '% users returning within 7 days'), value: mock.pctUsersReturningWithin7Days + '%' },
  ]
  const riskRows = [
    { label: translate('activity.signal_overview.behavioral.early_exit', 'Early exit rate (< X sec)'), value: mock.earlyExitRatePct + '%' },
    { label: translate('activity.signal_overview.behavioral.high_views_low_signals', 'High views / low signals ratio'), value: mock.highViewsLowSignalsRatio.toFixed(2) },
    { label: translate('activity.signal_overview.behavioral.comments_without_votes', 'Comments without votes %'), value: mock.commentsWithoutVotesPct + '%' },
    { label: translate('activity.signal_overview.behavioral.votes_without_comments', 'Votes without comments %'), value: mock.votesWithoutCommentsPct + '%' },
    { label: translate('activity.signal_overview.behavioral.high_dwell_no_vote', 'High dwell, no vote %'), value: mock.highDwellNoVotePct + '%' },
  ]
  const replyDepthChartData = mock.replyDepthDistribution.map((v, i) => ({ name: `${i}`, count: v }))

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-medium text-white/80 mb-2">
          {translate('activity.signal_overview.behavioral.decision_latency', 'Decision Latency')}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">
          {translate('activity.signal_overview.behavioral.decision_latency_explain', 'Time from opening the idea (detail view) to casting a vote. Lower times can mean quick decisions; the share of votes after comment or after AI comment shows how many people reacted after reading discussion—a sign of more considered signal.')}
        </p>
        <div className="analytics-table-wrap divide-y divide-white/10">
          {latencyRows.map((row, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={tableRowVariants}
              initial="hidden"
              animate="visible"
              className="analytics-table-row flex justify-between px-4 py-3 text-sm cursor-default"
            >
              <span className="text-white/70">{row.label}</span>
              <span className="text-white font-mono">{row.value}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-white/10">
        <h3 className="text-sm font-medium text-white/80 mb-2">
          {translate('activity.signal_overview.behavioral.comment_depth', 'Comment Depth')}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">
          {translate('activity.signal_overview.behavioral.comment_depth_explain', 'How much people discuss: comments per idea, average length, reply depth, thread participation, and edit/upvote-downvote ratio. The reply depth distribution chart shows how conversation threads branch—no stacked bars, just clarity.')}
        </p>
        <div className="analytics-table-wrap divide-y divide-white/10 mb-4">
          {commentRows.map((row, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={tableRowVariants}
              initial="hidden"
              animate="visible"
              className="analytics-table-row flex justify-between px-4 py-3 text-sm cursor-default"
            >
              <span className="text-white/70">{row.label}</span>
              <span className="text-white font-mono">{row.value}</span>
            </motion.div>
          ))}
        </div>
        <p className="text-white/50 text-xs mb-2">{translate('activity.signal_overview.behavioral.reply_depth_dist', 'Reply depth distribution')}</p>
        <motion.div variants={chartContainerVariants} initial="hidden" animate="visible" className="rounded-lg border border-white/10 p-3 transition-colors duration-200 hover:border-white/20">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={replyDepthChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="count" fill="rgba(255,255,255,0.2)" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={400} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </section>

      <section className="pt-6 border-t border-white/10">
        <h3 className="text-sm font-medium text-white/80 mb-2">
          {translate('activity.signal_overview.behavioral.return_behavior', 'Return Behavior')}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">
          {translate('activity.signal_overview.behavioral.return_behavior_explain', 'Whether people come back: average return sessions per user, how engagement decays over time, and the share of users who return within 7 days. This reflects temporal seriousness—repeated exposure and return visits.')}
        </p>
        <div className="analytics-table-wrap divide-y divide-white/10">
          {returnRows.map((row, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={tableRowVariants}
              initial="hidden"
              animate="visible"
              className="analytics-table-row flex justify-between px-4 py-3 text-sm cursor-default"
            >
              <span className="text-white/70">{row.label}</span>
              <span className="text-white font-mono">{row.value}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-white/10">
        <h3 className="text-sm font-medium text-white/80 mb-2">
          {translate('activity.signal_overview.behavioral.risk_signals', 'Risk & Negative Signals')}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">
          {translate('activity.signal_overview.behavioral.risk_signals_explain', 'Early exit rate (leaving very quickly), high views with few signals, comments without votes, votes without comments, and high dwell with no vote. These metrics highlight potential drop-off or hesitation without labeling outcomes as good or bad—just the distribution.')}
        </p>
        <div className="analytics-table-wrap divide-y divide-white/10">
          {riskRows.map((row, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={tableRowVariants}
              initial="hidden"
              animate="visible"
              className="analytics-table-row flex justify-between px-4 py-3 text-sm cursor-default"
            >
              <span className="text-white/70">{row.label}</span>
              <span className="text-white font-mono">{row.value}</span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
