'use client'

import { useState, useEffect } from 'react'
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
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  MessageCircle,
  ThumbsUp,
  Lightbulb,
  Target,
  Users,
  BarChart3,
  ChevronDown,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

  // Safe translation helper
  const translate = (key: string, fallback: string = key) => {
    try {
      const result = t(key)
      return typeof result === 'string' ? result : fallback
    } catch {
      return fallback
    }
  }

  if (!isOwner) {
    return null
  }

  // Calculate vote percentages
  const totalVotes =
    idea.votesByType.use + idea.votesByType.dislike + idea.votesByType.pay
  const usePercentage =
    totalVotes > 0 ? (idea.votesByType.use / totalVotes) * 100 : 0
  const dislikePercentage =
    totalVotes > 0 ? (idea.votesByType.dislike / totalVotes) * 100 : 0
  const payPercentage =
    totalVotes > 0 ? (idea.votesByType.pay / totalVotes) * 100 : 0

  // Get top voted comments
  const topVotedComments = [...comments]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 3)

  // Calculate feasibility and impact scores
  const feasibilityScore =
    totalVotes > 0
      ? Math.min(
          100,
          ((idea.votesByType.use - idea.votesByType.dislike) /
            (totalVotes + 1)) *
            50 +
            50
        )
      : 0
  const impactScore = Math.min(
    100,
    payPercentage * 3 + (comments.length > 0 ? 20 : 0)
  )

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={loading && !isExpanded}
        className="w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--gray-50)',
          border: '1px solid var(--border-color)',
        }}
        onMouseEnter={e => {
          if (!loading || isExpanded) {
            e.currentTarget.style.backgroundColor = 'var(--gray-100)'
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'var(--gray-50)'
        }}
      >
        <div className="flex items-center gap-3">
          <BarChart3
            className="w-6 h-6"
            style={{ color: 'var(--primary-accent)' }}
          />
          <div className="text-left">
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {translate(
                'activity.analytics.idea_analytics.title',
                'Idea Analytics'
              )}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {translate(
                'activity.analytics.idea_analytics.subtitle',
                'Detailed insights about this idea'
              )}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown
            className="w-5 h-5"
            style={{ color: 'var(--text-secondary)' }}
          />
        </motion.div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            key="analytics-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <div
              className="rounded-lg p-8 shadow-sm"
              style={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border-color)',
              }}
            >
              {loading ? (
                <div className="space-y-4">
                  <div
                    className="h-4 rounded w-3/4 animate-pulse"
                    style={{ backgroundColor: 'var(--gray-200)' }}
                  ></div>
                  <div
                    className="h-4 rounded w-1/2 animate-pulse"
                    style={{ backgroundColor: 'var(--gray-200)' }}
                  ></div>
                  <div
                    className="h-4 rounded w-2/3 animate-pulse"
                    style={{ backgroundColor: 'var(--gray-200)' }}
                  ></div>
                </div>
              ) : error ? (
                <div
                  className="p-6 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(255, 148, 76, 0.1)',
                    border: '1px solid var(--error)',
                  }}
                >
                  <p style={{ color: 'var(--error)' }}>{error}</p>
                </div>
              ) : (
                <div>
                  {/* Score Explanation */}
                  <div className="mb-8 bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <span>
                        {translate(
                          'activity.analytics.idea_analytics.score_explanation',
                          'Score Explanation'
                        )}
                      </span>
                    </h3>
                    <p className="text-text-secondary mb-4">
                      {translate(
                        'activity.analytics.idea_analytics.score_description',
                        'This score reflects the overall market validation of your idea. Higher scores indicate stronger market potential.'
                      )}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">
                          {translate('common.overall_score', 'Overall Score')}
                        </p>
                        <p className="text-3xl font-bold text-text-primary">
                          {idea.score}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-secondary mb-1">
                          {translate(
                            'common.feasibility_score',
                            'Feasibility Score'
                          )}
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(feasibilityScore)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-secondary mb-1">
                          {translate('common.impact_score', 'Impact Score')}
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.round(impactScore)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vote Meaning */}
                  <div className="mb-8 bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-3">
                      <ThumbsUp className="w-6 h-6 text-blue-500 flex-shrink-0" />
                      <span>
                        {translate(
                          'activity.analytics.idea_analytics.vote_meaning',
                          'What Votes Mean'
                        )}
                      </span>
                    </h3>
                    <p className="text-text-secondary mb-6">
                      {translate(
                        'activity.analytics.idea_analytics.vote_meaning_description',
                        'Votes help determine the feasibility and impact of your idea:'
                      )}
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-gray-300 font-bold">↑</span>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {translate('actions.up', 'I would use this')} (
                            {idea.votesByType.use}{' '}
                            {translate('common.votes', 'votes')} -{' '}
                            {Math.round(usePercentage)}%)
                          </p>
                          <p className="text-sm text-text-secondary">
                            {translate(
                              'activity.analytics.idea_analytics.up_vote',
                              'Indicates market demand'
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-gray-300 font-bold">↓</span>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {translate('actions.down', "I wouldn't use this")} (
                            {idea.votesByType.dislike}{' '}
                            {translate('common.votes', 'votes')} -{' '}
                            {Math.round(dislikePercentage)}%)
                          </p>
                          <p className="text-sm text-text-secondary">
                            {translate(
                              'activity.analytics.idea_analytics.down_vote',
                              'Indicates potential issues'
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-gray-300 font-bold">$</span>
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">
                            {translate(
                              'actions.id_pay',
                              'I would pay for this'
                            )}{' '}
                            ({idea.votesByType.pay}{' '}
                            {translate('common.votes', 'votes')} -{' '}
                            {Math.round(payPercentage)}%)
                          </p>
                          <p className="text-sm text-text-secondary">
                            {translate(
                              'activity.analytics.idea_analytics.pay_vote',
                              'Strongest validation signal'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vote Distribution Chart */}
                    <div className="mt-6">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: translate('actions.up', 'Use'),
                                value: idea.votesByType.use,
                                color: '#10B981',
                              },
                              {
                                name: translate('actions.down', 'Dislike'),
                                value: idea.votesByType.dislike,
                                color: '#EF4444',
                              },
                              {
                                name: translate('actions.id_pay', 'Pay'),
                                value: idea.votesByType.pay,
                                color: '#3B82F6',
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={60}
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
                              backgroundColor: '#ffffff',
                              border: '2px solid var(--border-color)',
                              borderRadius: 'var(--border-radius-md)',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Ideas Performance Chart */}
                  <div className="mb-8 bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-accent flex-shrink-0" />
                      <span>
                        {translate(
                          'activity.analytics.charts.ideas_performance',
                          'Idea Performance'
                        )}
                      </span>
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          {
                            name: translate('common.score', 'Score'),
                            value: idea.score,
                            color: 'var(--accent)',
                          },
                          {
                            name: translate('common.votes', 'Votes'),
                            value: totalVotes,
                            color: '#10B981',
                          },
                          {
                            name: translate('common.comments', 'Comments'),
                            value: comments.length,
                            color: '#A78BFA',
                          },
                        ]}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border-color)"
                        />
                        <XAxis
                          dataKey="name"
                          stroke="var(--text-secondary)"
                          fontSize={12}
                        />
                        <YAxis stroke="var(--text-secondary)" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '2px solid #374151',
                            borderRadius: '8px',
                            color: '#ffffff',
                          }}
                          formatter={(value, name, props) => [
                            `${value}`,
                            props.payload.name ===
                            translate('common.score', 'Score')
                              ? translate('common.idea_score', 'Idea Score')
                              : props.payload.name ===
                                  translate('common.votes', 'Votes')
                                ? translate('common.total_votes', 'Total Votes')
                                : props.payload.name ===
                                    translate('common.comments', 'Comments')
                                  ? translate(
                                      'common.total_comments',
                                      'Total Comments'
                                    )
                                  : props.payload.name,
                          ]}
                        />
                        <Bar
                          dataKey="value"
                          radius={[4, 4, 0, 0]}
                          fill="var(--accent)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Sentiment Analysis Chart */}
                  <div className="mb-8 bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-orange-500 flex-shrink-0" />
                      <span>
                        {translate(
                          'activity.analytics.charts.sentiment_analysis',
                          'Sentiment Analysis'
                        )}
                      </span>
                    </h3>
                    <p className="text-text-secondary text-sm mb-4">
                      {translate(
                        'activity.analytics.idea_analytics.sentiment_description',
                        'This chart shows the overall sentiment of your idea based on user votes. "Use" votes indicate positive interest, "Pay" votes show strong validation, and "Dislike" votes suggest concerns.'
                      )}
                    </p>
                    {totalVotes > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart
                            data={[
                              {
                                dimension: translate('actions.up', 'Would Use'),
                                value: Math.round(usePercentage),
                              },
                              {
                                dimension: translate(
                                  'actions.id_pay',
                                  'Would Pay'
                                ),
                                value: Math.round(payPercentage),
                              },
                              {
                                dimension: translate(
                                  'actions.down',
                                  'Would Not Use'
                                ),
                                value: Math.round(dislikePercentage),
                              },
                            ]}
                          >
                            <PolarGrid
                              stroke="#818589"
                              strokeWidth={1}
                              strokeOpacity={0.5}
                            />
                            <PolarAngleAxis
                              dataKey="dimension"
                              tick={{
                                fill: 'var(--text-secondary)',
                                fontSize: 12,
                              }}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 100]}
                              tick={{
                                fill: 'var(--text-secondary)',
                                fontSize: 12,
                              }}
                              tickCount={5}
                            />
                            <Radar
                              name={translate(
                                'activity.analytics.idea_analytics.sentiment_analysis',
                                'Sentiment'
                              )}
                              dataKey="value"
                              stroke="#8B5CF6"
                              fill="#8B5CF6"
                              fillOpacity={0.4}
                              strokeWidth={3}
                              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '2px solid #374151',
                                borderRadius: '8px',
                                color: '#ffffff',
                              }}
                              formatter={(value, name) => [
                                `${value}%`,
                                translate('common.votes', 'Votes'),
                              ]}
                              labelFormatter={label => `${label}`}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <span className="text-green-600 font-semibold">
                              {Math.round(usePercentage)}%
                            </span>
                            <span className="text-sm text-text-secondary ml-1">
                              {translate('actions.up', 'Would Use')}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-600 font-semibold">
                              {Math.round(payPercentage)}%
                            </span>
                            <span className="text-sm text-text-secondary ml-1">
                              {translate('actions.id_pay', 'Would Pay')}
                            </span>
                          </div>
                          <div>
                            <span className="text-red-600 font-semibold">
                              {Math.round(dislikePercentage)}%
                            </span>
                            <span className="text-sm text-text-secondary ml-1">
                              {translate('actions.down', 'Would Not Use')}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-text-secondary text-center py-8">
                        {translate(
                          'activity.analytics.no_data',
                          'No votes available for sentiment analysis'
                        )}
                      </p>
                    )}
                  </div>

                  {/* Most Voted Comments */}
                  {topVotedComments.length > 0 && (
                    <div className="mb-8 bg-card rounded-lg p-6 border border-border">
                      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-purple-500 flex-shrink-0" />
                        <span>
                          {translate(
                            'activity.analytics.idea_analytics.most_voted_comments',
                            'Most Voted Comments'
                          )}
                        </span>
                      </h3>
                      <div className="space-y-4">
                        {topVotedComments.map((comment, index) => (
                          <div
                            key={comment.id}
                            className="bg-card rounded-lg p-4 border border-border"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <span className="text-text-secondary font-bold text-sm">
                                  #{index + 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-text-primary mb-1">
                                  {comment.author} - {comment.upvotes}{' '}
                                  {translate('actions.up', 'upvotes')}
                                </p>
                                <p className="text-text-secondary text-sm">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assessment Summary */}
                  <div className="bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-3">
                      <Target className="w-6 h-6 text-blue-500 flex-shrink-0" />
                      <span>
                        {translate(
                          'activity.analytics.idea_analytics.feasibility_assessment',
                          'Feasibility Assessment'
                        )}
                      </span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-text-secondary mb-2">
                          {translate(
                            'common.market_potential',
                            'Market Potential'
                          )}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-500 h-2.5 rounded-full"
                            style={{ width: `${impactScore}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-green-600 font-medium mt-1">
                          {impactScore > 70
                            ? translate('common.high', 'High')
                            : impactScore > 40
                              ? translate('common.medium', 'Medium')
                              : translate('common.low', 'Low')}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-text-secondary mb-2">
                          {translate('common.feasibility_score', 'Feasibility')}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-500 h-2.5 rounded-full"
                            style={{ width: `${feasibilityScore}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-blue-600 font-medium mt-1">
                          {feasibilityScore > 70
                            ? translate('common.high', 'High')
                            : feasibilityScore > 40
                              ? translate('common.medium', 'Medium')
                              : translate('common.low', 'Low')}
                        </p>
                      </div>
                    </div>

                    <h4 className="font-medium text-text-primary mb-2">
                      {translate(
                        'activity.analytics.idea_analytics.suggestions',
                        'Suggestions for Improvement'
                      )}
                    </h4>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      {dislikePercentage > 20 && (
                        <li className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>
                            {translate(
                              'activity.analytics.idea_analytics.suggestion_1',
                              "Consider addressing concerns from users who wouldn't use this product"
                            )}
                          </span>
                        </li>
                      )}
                      {payPercentage < 10 && (
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>
                            {translate(
                              'activity.analytics.idea_analytics.suggestion_2',
                              'Explore ways to increase perceived value to encourage more "I would pay" votes'
                            )}
                          </span>
                        </li>
                      )}
                      {comments.length === 0 && (
                        <li className="flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>
                            {translate(
                              'activity.analytics.idea_analytics.suggestion_3',
                              'Encourage more user feedback and discussion to validate your idea further'
                            )}
                          </span>
                        </li>
                      )}
                      {!idea.tags.length && (
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span>
                            {translate(
                              'activity.analytics.idea_analytics.suggestion_4',
                              'Add relevant tags to help users discover your idea'
                            )}
                          </span>
                        </li>
                      )}
                      {dislikePercentage <= 20 &&
                        payPercentage >= 10 &&
                        comments.length > 0 &&
                        idea.tags.length > 0 && (
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span>
                              {translate(
                                'activity.analytics.idea_analytics.all_good',
                                'Your idea is performing well! Keep up the great work and continue engaging with your audience.'
                              )}
                            </span>
                          </li>
                        )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
