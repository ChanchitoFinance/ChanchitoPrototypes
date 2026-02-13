/**
 * Mock data for Signal Overview and Decision Evidence metrics
 * that are not yet available from backend/analytics service.
 * Replace with real API calls when endpoints exist.
 */

export interface SignalDriftDay {
  date: string
  volatility: number
  reversalRate: number
  voteChange: number
}

export interface GlobalSignalOverviewMock {
  signalDriftLast30Days: SignalDriftDay[]
  // Attention & Depth (Tab 2)
  totalFeedImpressions: number
  reimpressionRate: number
  uniqueViewers: number
  avgFeedDwellTimeMs: number
  hoverDurationDesktopMs: number
  detailViewStarts: number
  avgDetailDwellTimeMs: number
  medianDwellTimeMs: number
  scrollDepthAvgPct: number
  returnToDetailRate: number
  timeBetweenReturnsSec: number
  dwellTimeDistribution: number[] // histogram buckets
  scrollDepthDistribution: number[] // histogram buckets
  // Behavioral (Tab 3)
  avgTimeDetailToSignalSec: number
  medianVoteLatencySec: number
  pctVotesUnder10Sec: number
  pctVotesAfterComment: number
  pctVotesAfterAIComment: number
  commentsPerIdeaAvg: number
  avgCommentLength: number
  replyDepthAvg: number
  threadParticipationRate: number
  commentEditRate: number
  commentUpvoteDownvoteRatio: number
  replyDepthDistribution: number[]
  returnSessionCountPerUser: number
  engagementDecayRate: number
  pctUsersReturningWithin7Days: number
  earlyExitRatePct: number
  highViewsLowSignalsRatio: number
  commentsWithoutVotesPct: number
  votesWithoutCommentsPct: number
  highDwellNoVotePct: number
}

export interface IdeaDecisionEvidenceMock {
  signalVolatility: number
  voteChangeOverTime: { date: string; total: number; use: number; dislike: number; pay: number }[]
  detailViews: number
  avgDwellTimeMs: number
  medianDwellTimeMs: number
  scrollDepthPct: number
  returnRate: number
  timeToFirstSignalSec: number
  timeToFirstCommentSec: number
  voteLatencyAvgSec: number
  pctVotesAfterComment: number
  pctVotesAfterAIComment: number
  commentDepth: number
  avgCommentLength: number
  earlyExitRatePct: number
  highDwellNoVotePct: number
  dwellDistribution: number[]
  segments: {
    segment: string
    signals: number
    avgDwellMs: number
    voteTypePct: { use: number; dislike: number; pay: number }
  }[]
}

function generateLast30Days(): string[] {
  const days: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function getGlobalSignalOverviewMock(): GlobalSignalOverviewMock {
  const days = generateLast30Days()
  const signalDriftLast30Days: SignalDriftDay[] = days.map((date, i) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volatility: 4 + Math.sin(i / 3) * 3 + Math.random() * 2,
    reversalRate: 2 + Math.cos(i / 5) * 1.5 + Math.random(),
    voteChange: Math.round((Math.random() - 0.4) * 20),
  }))

  // Dwell time histogram (e.g. 0-2s, 2-5s, 5-10s, 10-30s, 30+)
  const dwellTimeDistribution = [12, 28, 35, 18, 7]
  const scrollDepthDistribution = [8, 15, 22, 30, 25]
  const replyDepthDistribution = [40, 30, 18, 8, 4]

  return {
    signalDriftLast30Days,
    totalFeedImpressions: 12400,
    reimpressionRate: 0.34,
    uniqueViewers: 1820,
    avgFeedDwellTimeMs: 2400,
    hoverDurationDesktopMs: 1800,
    detailViewStarts: 3100,
    avgDetailDwellTimeMs: 8200,
    medianDwellTimeMs: 4500,
    scrollDepthAvgPct: 62,
    returnToDetailRate: 0.22,
    timeBetweenReturnsSec: 86400,
    dwellTimeDistribution,
    scrollDepthDistribution,
    avgTimeDetailToSignalSec: 45,
    medianVoteLatencySec: 28,
    pctVotesUnder10Sec: 18,
    pctVotesAfterComment: 42,
    pctVotesAfterAIComment: 12,
    commentsPerIdeaAvg: 3.2,
    avgCommentLength: 84,
    replyDepthAvg: 1.4,
    threadParticipationRate: 0.31,
    commentEditRate: 0.08,
    commentUpvoteDownvoteRatio: 2.1,
    replyDepthDistribution,
    returnSessionCountPerUser: 1.8,
    engagementDecayRate: 0.15,
    pctUsersReturningWithin7Days: 24,
    earlyExitRatePct: 31,
    highViewsLowSignalsRatio: 0.18,
    commentsWithoutVotesPct: 22,
    votesWithoutCommentsPct: 58,
    highDwellNoVotePct: 19,
  }
}

export function getIdeaDecisionEvidenceMock(_ideaId: string): IdeaDecisionEvidenceMock {
  const days = generateLast30Days().slice(-14)
  const voteChangeOverTime = days.map((date, i) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: 2 + Math.floor(Math.random() * 8),
    use: 1 + Math.floor(Math.random() * 4),
    dislike: Math.floor(Math.random() * 2),
    pay: Math.floor(Math.random() * 3),
  }))

  return {
    signalVolatility: 5.2,
    voteChangeOverTime,
    detailViews: 420,
    avgDwellTimeMs: 7600,
    medianDwellTimeMs: 4200,
    scrollDepthPct: 58,
    returnRate: 0.19,
    timeToFirstSignalSec: 120,
    timeToFirstCommentSec: 340,
    voteLatencyAvgSec: 52,
    pctVotesAfterComment: 38,
    pctVotesAfterAIComment: 14,
    commentDepth: 1.2,
    avgCommentLength: 92,
    earlyExitRatePct: 28,
    highDwellNoVotePct: 21,
    dwellDistribution: [10, 25, 32, 22, 11],
    segments: [
      { segment: 'First-time viewers', signals: 12, avgDwellMs: 3200, voteTypePct: { use: 45, dislike: 25, pay: 30 } },
      { segment: 'Returning viewers', signals: 8, avgDwellMs: 5800, voteTypePct: { use: 38, dislike: 20, pay: 42 } },
      { segment: 'Space members', signals: 15, avgDwellMs: 7100, voteTypePct: { use: 42, dislike: 18, pay: 40 } },
      { segment: 'External testers', signals: 5, avgDwellMs: 4100, voteTypePct: { use: 50, dislike: 30, pay: 20 } },
    ],
  }
}
