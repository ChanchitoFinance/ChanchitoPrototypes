'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { commentService } from '@/core/lib/services/commentService'
import { Idea } from '@/core/types/idea'
import { Comment } from '@/core/types/comment'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { BarChart3, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getIdeaDecisionEvidenceMock } from '@/features/activity/data/mockSignalOverview'

const rowVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.03, duration: 0.2 } }),
}
const chartVariants = { hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } } }
const TOOLTIP_STYLE = { backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }

const SIGNAL_COLORS = {
  dislike: '#FF944C',
  use: '#A07BCF',
  pay: '#992BFF',
}

interface IdeaAnalyticsProps {
  ideaId: string
  idea: Idea
  isOwner: boolean
}

export function IdeaAnalytics({ ideaId, idea, isOwner }: IdeaAnalyticsProps) {
  const t = useTranslations()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const mock = useMemo(() => getIdeaDecisionEvidenceMock(ideaId), [ideaId])

  useEffect(() => {
    if (isOwner) {
      loadComments()
    }
  }, [ideaId, isOwner])

  const loadComments = async () => {
    try {
      setLoading(true)
      setError(null)
      const loadedComments = await commentService.getComments(ideaId)
      setComments(loadedComments)
    } catch (err) {
      console.error('Error loading comments for analytics:', err)
      setError('Failed to load comments')
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

  if (!isOwner) return null

  const totalVotes =
    idea.votesByType.use + idea.votesByType.dislike + idea.votesByType.pay
  const usePct = totalVotes > 0 ? (idea.votesByType.use / totalVotes) * 100 : 0
  const dislikePct = totalVotes > 0 ? (idea.votesByType.dislike / totalVotes) * 100 : 0
  const payPct = totalVotes > 0 ? (idea.votesByType.pay / totalVotes) * 100 : 0

  const barSegments = [
    { key: 'dislike', width: dislikePct, color: SIGNAL_COLORS.dislike },
    { key: 'use', width: usePct, color: SIGNAL_COLORS.use },
    { key: 'pay', width: payPct, color: SIGNAL_COLORS.pay },
  ].filter(s => s.width > 0)

  const avgCommentLength =
    comments.length > 0
      ? Math.round(
          comments.reduce((sum, c) => sum + (c.content?.length ?? 0), 0) / comments.length
        )
      : mock.avgCommentLength

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={loading && !isExpanded}
        className="w-full flex items-center justify-between p-4 rounded-lg transition-colors border border-white/10 bg-black hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-[#992BFF]" />
          <div className="text-left">
            <h2 className="text-lg font-semibold text-white">
              {translate('activity.decision_evidence.title', 'Decision Evidence')}
            </h2>
            <p className="text-sm text-white/60">
              {translate('activity.decision_evidence.subtitle', 'External signal and behavioral data for this decision.')}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-white/60" />
        </motion.div>
      </button>

      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            key="decision-evidence-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 rounded-lg border border-white/10 bg-black overflow-hidden"
          >
            {loading ? (
              <div className="p-6 space-y-4">
                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
              </div>
            ) : error ? (
              <div className="p-6 border border-white/10 rounded-lg bg-white/5">
                <p className="text-white/80">{error}</p>
              </div>
            ) : (
              <div className="p-6 space-y-8">
                {/* SECTION 1 — SIGNAL COMPOSITION */}
                <section>
                  <h3 className="text-sm font-medium text-white/80 mb-2">
                    {translate('activity.decision_evidence.signal_composition', 'Signal Composition')}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">
                    {translate('activity.decision_evidence.signal_composition_explain', 'Vote breakdown for this idea only: share of Dislike, Would Use, and Would Pay, total signals, and how the mix changed over time (volatility and time-series). No recommendation—just the composition and trend.')}
                  </p>
                  <div className="flex h-10 rounded overflow-hidden bg-white/5 mb-4" style={{ minHeight: 40 }}>
                    {barSegments.length > 0 ? (
                      barSegments.map(seg => (
                        <motion.div
                          key={seg.key}
                          initial={{ width: 0 }}
                          animate={{ width: `${seg.width}%` }}
                          transition={{ duration: 0.45, ease: 'easeOut' }}
                          className="flex items-center justify-center text-xs font-medium text-white min-w-[2rem] transition-all duration-200 hover:brightness-110"
                          style={{ backgroundColor: seg.color }}
                        >
                          {seg.width >= 8 ? `${seg.width.toFixed(0)}%` : ''}
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center w-full text-white/40 text-sm">No signals yet</div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/60 mb-4">
                    <span>{translate('activity.decision_evidence.labels.dislike', 'Dislike')}: {dislikePct.toFixed(1)}</span>
                    <span>{translate('activity.decision_evidence.labels.like', 'Like')}: {usePct.toFixed(1)}</span>
                    <span>{translate('activity.decision_evidence.labels.id_pay_for_it', "I'd pay for it")}: {payPct.toFixed(1)}</span>
                    <span>Total signals: {totalVotes}</span>
                    <span>Signal volatility: {mock.signalVolatility}%</span>
                  </div>
                  {mock.voteChangeOverTime?.length > 0 && (
                    <motion.div variants={chartVariants} initial="hidden" animate="visible" className="rounded-lg border border-white/10 p-3 hover:border-white/20 transition-colors duration-200">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={mock.voteChangeOverTime} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                          <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: 'rgba(153,43,255,0.4)', strokeWidth: 1 }} />
                          <Line type="monotone" dataKey="total" stroke="#992BFF" strokeWidth={1.5} dot={false} isAnimationActive animationDuration={400} animationEasing="ease-out" />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </section>

                <div className="border-t border-white/10" />

                {/* SECTION 2 — ATTENTION & DEPTH */}
                <section>
                  <h3 className="text-sm font-medium text-white/80 mb-2">
                    {translate('activity.decision_evidence.attention_depth', 'Attention & Depth')}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">
                    {translate('activity.decision_evidence.attention_depth_explain', 'How this idea is consumed: detail views, average and median dwell time, scroll depth, return rate, and time to first signal or comment. The dwell distribution chart shows how long people stay before leaving or acting.')}
                  </p>
                  <div className="analytics-table-wrap divide-y divide-white/10 mb-4">
                    {[
                      { label: translate('activity.decision_evidence.detail_views', 'Detail views'), value: mock.detailViews },
                      { label: translate('activity.decision_evidence.avg_dwell', 'Avg dwell time'), value: `${(mock.avgDwellTimeMs / 1000).toFixed(1)}s` },
                      { label: translate('activity.decision_evidence.median_dwell', 'Median dwell time'), value: `${(mock.medianDwellTimeMs / 1000).toFixed(1)}s` },
                      { label: translate('activity.decision_evidence.scroll_depth', 'Scroll depth'), value: mock.scrollDepthPct + '%' },
                      { label: translate('activity.decision_evidence.return_rate', 'Return rate'), value: (mock.returnRate * 100).toFixed(1) + '%' },
                      { label: translate('activity.decision_evidence.time_to_first_signal', 'Time to first signal'), value: `${mock.timeToFirstSignalSec}s` },
                      { label: translate('activity.decision_evidence.time_to_first_comment', 'Time to first comment'), value: `${mock.timeToFirstCommentSec}s` },
                    ].map((row, i) => (
                      <motion.div
                        key={i}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="analytics-table-row flex justify-between px-4 py-3 text-sm cursor-default"
                      >
                        <span className="text-white/70">{row.label}</span>
                        <span className="text-white font-mono">{typeof row.value === 'number' ? row.value.toLocaleString() : row.value}</span>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-white/50 text-xs mb-2">
                    {translate('activity.decision_evidence.dwell_distribution', 'Dwell distribution')}
                  </p>
                  <motion.div variants={chartVariants} initial="hidden" animate="visible" className="rounded-lg border border-white/10 p-3 hover:border-white/20 transition-colors duration-200">
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart
                        data={mock.dwellDistribution.map((v, i) => ({ name: ['0-2s', '2-5s', '5-10s', '10-30s', '30+s'][i] ?? i, count: v }))}
                        margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                        <Bar dataKey="count" fill="rgba(153,43,255,0.6)" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={400} animationEasing="ease-out" />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </section>

                <div className="border-t border-white/10" />

                {/* SECTION 3 — BEHAVIORAL CONTEXT */}
                <section>
                  <h3 className="text-sm font-medium text-white/80 mb-2">
                    {translate('activity.decision_evidence.behavioral_context', 'Behavioral Context')}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-4 max-w-2xl">
                    {translate('activity.decision_evidence.behavioral_context_explain', 'Vote latency, the share of votes that happen after a comment or after an AI comment, comment depth and length, early exit rate, and high-dwell-no-vote share. Optional segment table below breaks this down by first-time viewers, returning viewers, space members, and external testers—signals, avg dwell, and vote type percentages per segment.')}
                  </p>
                  <div className="analytics-table-wrap divide-y divide-white/10 mb-4">
                    {[
                      { label: translate('activity.decision_evidence.vote_latency', 'Vote latency'), value: `${mock.voteLatencyAvgSec}s` },
                      { label: translate('activity.decision_evidence.votes_after_comment', 'Votes after comment %'), value: mock.pctVotesAfterComment + '%' },
                      { label: translate('activity.decision_evidence.votes_after_ai_comment', 'Votes after AI comment %'), value: mock.pctVotesAfterAIComment + '%' },
                      { label: translate('activity.decision_evidence.comment_depth', 'Comment depth'), value: mock.commentDepth },
                      { label: translate('activity.decision_evidence.avg_comment_length', 'Avg comment length'), value: avgCommentLength },
                      { label: translate('activity.decision_evidence.early_exit', 'Early exit rate'), value: mock.earlyExitRatePct + '%' },
                      { label: translate('activity.decision_evidence.high_dwell_no_vote', 'High dwell / no vote %'), value: mock.highDwellNoVotePct + '%' },
                    ].map((row, i) => (
                      <motion.div
                        key={i}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="analytics-table-row flex justify-between px-4 py-3 text-sm cursor-default"
                      >
                        <span className="text-white/70">{row.label}</span>
                        <span className="text-white font-mono">{row.value}</span>
                      </motion.div>
                    ))}
                  </div>
                  {mock.segments?.length > 0 && (
                    <>
                      <p className="text-white/50 text-sm leading-relaxed mb-2 max-w-2xl">
                        {translate('activity.decision_evidence.segment_table_explain', 'Breakdown by audience type: First-time viewers, Returning viewers, Space members, and External testers. Each row shows how many signals that segment gave, their average dwell time on the idea, and the vote mix (Use %, Dislike %, Pay %) for that segment. Use this to see whether different audiences respond differently.')}
                      </p>
                      <motion.div variants={chartVariants} initial="hidden" animate="visible" className="overflow-x-auto analytics-table-wrap">
                        <table className="w-full text-sm">
                          <thead>
                            <tr>
                              <th className="text-left px-4 py-3 text-white/70 font-medium">Segment</th>
                              <th className="text-right px-4 py-3 text-white/70 font-medium">Signals</th>
                              <th className="text-right px-4 py-3 text-white/70 font-medium">Avg Dwell</th>
                              <th className="text-right px-4 py-3 text-white/70 font-medium">{translate('activity.decision_evidence.labels.like', 'Like')}</th>
                              <th className="text-right px-4 py-3 text-white/70 font-medium">{translate('activity.decision_evidence.labels.dislike', 'Dislike')}</th>
                              <th className="text-right px-4 py-3 text-white/70 font-medium">{translate('activity.decision_evidence.labels.id_pay_for_it', "I'd pay for it")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mock.segments.map((seg, i) => (
                              <motion.tr
                                key={i}
                                custom={i}
                                variants={rowVariants}
                                initial="hidden"
                                animate="visible"
                              >
                                <td className="px-4 py-3 text-white/90">{seg.segment}</td>
                                <td className="px-4 py-3 text-right font-mono text-white">{seg.signals}</td>
                                <td className="px-4 py-3 text-right font-mono text-white">{(seg.avgDwellMs / 1000).toFixed(1)}s</td>
                                <td className="px-4 py-3 text-right font-mono text-white/80">{seg.voteTypePct.use}%</td>
                                <td className="px-4 py-3 text-right font-mono text-white/80">{seg.voteTypePct.dislike}%</td>
                                <td className="px-4 py-3 text-right font-mono text-white/80">{seg.voteTypePct.pay}%</td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    </>
                  )}
                </section>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
