'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Idea } from '@/core/types/idea'
import { ideaService } from '@/core/lib/services/ideaService'
import { useAppSelector } from '@/core/lib/hooks'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { toast } from 'sonner'
import { HorizontalScrollSection } from './HorizontalScrollSection'
import { TrendsSection, TrendsSectionData } from './TrendsSection'

const ARTICLES_PAGE_SIZE = 20
const ARTICLES_INITIAL = Math.ceil(ARTICLES_PAGE_SIZE * 0.6) // 12

const DISCOVER_FULL = 10
const DISCOVER_INITIAL = Math.ceil(DISCOVER_FULL * 0.6) // 6
const ACTIVE_DISCUSSION_FULL = 10
const ACTIVE_DISCUSSION_INITIAL = Math.ceil(ACTIVE_DISCUSSION_FULL * 0.6) // 6
const TOP_LIKED_FULL = 10
const TOP_LIKED_INITIAL = Math.ceil(TOP_LIKED_FULL * 0.6) // 6
const TOP_COMMENTED_FULL = 10
const TOP_COMMENTED_INITIAL = Math.ceil(TOP_COMMENTED_FULL * 0.6) // 6
const MOST_DETAILED_FULL = 5
const MOST_DETAILED_INITIAL = Math.ceil(MOST_DETAILED_FULL * 1) // 3
const PAY_INTENTION_FULL = 5
const PAY_INTENTION_INITIAL = Math.ceil(PAY_INTENTION_FULL * 1) // 3
const MOST_ITERATED_FULL = 5
const MOST_ITERATED_INITIAL = Math.ceil(MOST_ITERATED_FULL * 1) // 3

export function HomeFeed() {
  const t = useTranslations()
  const [loadingDiscover, setLoadingDiscover] = useState(true)
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [loadingTrends, setLoadingTrends] = useState(false)
  const [loadingMoreArticles, setLoadingMoreArticles] = useState(false)
  const [loadingMoreDiscover, setLoadingMoreDiscover] = useState(false)
  const [loadingMoreTrends, setLoadingMoreTrends] = useState<Record<string, boolean>>({})
  const [isVoting, setIsVoting] = useState(false)

  const discoverSentinelRef = useRef<HTMLDivElement>(null)
  const articlesSentinelRef = useRef<HTMLDivElement>(null)
  const trendsSentinelRefs = useRef<Record<string, HTMLDivElement | null>>({
    activeDiscussion: null,
    topLiked: null,
    topCommented: null,
    mostDetailed: null,
    payIntention: null,
    mostIterated: null,
  })
  const setTrendsSentinelRef = useCallback((key: string, el: HTMLDivElement | null) => {
    trendsSentinelRefs.current[key] = el
  }, [])
  const [hoveredIdeaId, setHoveredIdeaId] = useState<string | null>(null)
  const { isAuthenticated } = useAppSelector(state => state.auth)

  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([])
  const [discoverHasMore, setDiscoverHasMore] = useState(true)
  const [articles, setArticles] = useState<Idea[]>([])
  const [articlesHasMore, setArticlesHasMore] = useState(true)
  const [trendsData, setTrendsData] = useState<TrendsSectionData>({
    activeDiscussion: [],
    topLiked: [],
    topCommented: [],
    mostDetailed: [],
    payIntention: [],
    mostIterated: [],
  })
  const [trendsHasMore, setTrendsHasMore] = useState({
    activeDiscussion: true,
    topLiked: true,
    topCommented: true,
    mostDetailed: true,
    payIntention: true,
    mostIterated: true,
  })

  const articlesSectionRef = useRef<HTMLDivElement>(null)
  const trendsSectionRef = useRef<HTMLDivElement>(null)
  const articlesLoadedRef = useRef(false)
  const trendsLoadedRef = useRef(false)

  const addVotesToIdeas = useCallback(
    (ideas: Idea[], votesMap: Record<string, { use: boolean; dislike: boolean; pay: boolean }>) =>
      ideas.map(idea => ({
        ...idea,
        userVotes: votesMap[idea.id] || {
          use: false,
          dislike: false,
          pay: false,
        },
      })),
    []
  )

  const updateIdeaInAllSections = useCallback((updatedIdea: Idea) => {
    const updateIdeas = (ideas: Idea[]) =>
      ideas.map(idea => (idea.id === updatedIdea.id ? updatedIdea : idea))

    setRecentIdeas(prev => updateIdeas(prev))
    setArticles(prev => updateIdeas(prev))
    setTrendsData(prev => ({
      activeDiscussion: updateIdeas(prev.activeDiscussion),
      topLiked: updateIdeas(prev.topLiked),
      topCommented: updateIdeas(prev.topCommented),
      mostDetailed: updateIdeas(prev.mostDetailed),
      payIntention: updateIdeas(prev.payIntention),
      mostIterated: updateIdeas(prev.mostIterated),
    }))
  }, [])

  const allIdeasForKeyboard = useCallback(() => {
    return [
      ...recentIdeas,
      ...articles,
      ...trendsData.activeDiscussion,
      ...trendsData.topLiked,
      ...trendsData.topCommented,
      ...trendsData.mostDetailed,
      ...trendsData.payIntention,
      ...trendsData.mostIterated,
    ]
  }, [recentIdeas, articles, trendsData])

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!hoveredIdeaId || isVoting) return

      const allIdeas = allIdeasForKeyboard()
      const hoveredIdea = allIdeas.find(idea => idea.id === hoveredIdeaId)
      if (!hoveredIdea) return

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isAuthenticated) {
          toast.warning(t('auth.sign_in_to_vote'))
          return
        }
        setIsVoting(true)
        try {
          const updatedIdea = await ideaService.toggleVote(
            hoveredIdea.id,
            'use'
          )
          updateIdeaInAllSections(updatedIdea)
        } catch (error) {
          console.error('Error voting:', error)
        } finally {
          setIsVoting(false)
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!isAuthenticated) {
          toast.warning(t('auth.sign_in_to_vote'))
          return
        }
        setIsVoting(true)
        try {
          const updatedIdea = await ideaService.toggleVote(
            hoveredIdea.id,
            'dislike'
          )
          updateIdeaInAllSections(updatedIdea)
        } catch (error) {
          console.error('Error voting:', error)
        } finally {
          setIsVoting(false)
        }
      }
    },
    [
      hoveredIdeaId,
      isVoting,
      isAuthenticated,
      allIdeasForKeyboard,
      t,
      updateIdeaInAllSections,
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // Load Discover on mount (60% initial)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const recent = await ideaService.getRecentIdeas(DISCOVER_INITIAL)
        if (cancelled) return
        setRecentIdeas(recent)
        setDiscoverHasMore(recent.length >= DISCOVER_INITIAL)
        if (isAuthenticated && recent.length > 0) {
          const votesMap = await ideaService.getUserVotesForIdeas(
            recent.map(i => i.id)
          )
          if (!cancelled) {
            setRecentIdeas(prev => addVotesToIdeas(prev, votesMap))
          }
        }
      } catch (error) {
        if (!cancelled) console.error('Error loading discover:', error)
      } finally {
        if (!cancelled) setLoadingDiscover(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, addVotesToIdeas])

  const loadMoreDiscover = useCallback(async () => {
    if (!discoverHasMore || loadingMoreDiscover) return
    setLoadingMoreDiscover(true)
    try {
      const full = await ideaService.getRecentIdeas(DISCOVER_FULL)
      setRecentIdeas(full)
      setDiscoverHasMore(false)
      if (isAuthenticated && full.length > 0) {
        const votesMap = await ideaService.getUserVotesForIdeas(
          full.map(i => i.id)
        )
        setRecentIdeas(prev => addVotesToIdeas(prev, votesMap))
      }
    } catch (error) {
      console.error('Error loading more discover:', error)
    } finally {
      setLoadingMoreDiscover(false)
    }
  }, [isAuthenticated, addVotesToIdeas, discoverHasMore, loadingMoreDiscover])

  const loadMoreTrendsSection = useCallback(
    async (section: keyof TrendsSectionData) => {
      if (!trendsHasMore[section] || loadingMoreTrends[section]) return
      setLoadingMoreTrends(prev => ({ ...prev, [section]: true }))
      try {
        const limits = {
          activeDiscussion: ACTIVE_DISCUSSION_FULL,
          topLiked: TOP_LIKED_FULL,
          topCommented: TOP_COMMENTED_FULL,
          mostDetailed: MOST_DETAILED_FULL,
          payIntention: PAY_INTENTION_FULL,
          mostIterated: MOST_ITERATED_FULL,
        }
        const fns = {
          activeDiscussion: () =>
            ideaService.getIdeasByStatusFlag('active_discussion', limits.activeDiscussion),
          topLiked: () => ideaService.getCommunitiesFavorite(limits.topLiked),
          topCommented: () => ideaService.getMostCommented(limits.topCommented),
          mostDetailed: () => ideaService.getMostDetailedIdeas(limits.mostDetailed),
          payIntention: () =>
            ideaService.getHighestPayIntentionIdeas(limits.payIntention),
          mostIterated: () => ideaService.getMostIteratedIdeas(limits.mostIterated),
        }
        const list = await fns[section]()
        setTrendsData(prev => ({ ...prev, [section]: list }))
        setTrendsHasMore(prev => ({ ...prev, [section]: false }))
        if (isAuthenticated && list.length > 0) {
          const votesMap = await ideaService.getUserVotesForIdeas(
            list.map(i => i.id)
          )
          setTrendsData(prev => ({
            ...prev,
            [section]: addVotesToIdeas(list, votesMap),
          }))
        }
      } catch (error) {
        console.error('Error loading more trends section:', error)
      } finally {
        setLoadingMoreTrends(prev => ({ ...prev, [section]: false }))
      }
    },
    [isAuthenticated, addVotesToIdeas, trendsHasMore, loadingMoreTrends]
  )

  // Lazy load Articles when section is visible
  useEffect(() => {
    if (articlesLoadedRef.current) return
    const el = articlesSectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting || articlesLoadedRef.current) return
        articlesLoadedRef.current = true
        setLoadingArticles(true)
        ideaService
          .getArticles(ARTICLES_INITIAL, 0)
          .then(async list => {
            setArticles(list)
            setArticlesHasMore(list.length >= ARTICLES_INITIAL)
            if (isAuthenticated && list.length > 0) {
              const votesMap = await ideaService.getUserVotesForIdeas(
                list.map(i => i.id)
              )
              setArticles(prev => addVotesToIdeas(prev, votesMap))
            }
          })
          .catch(err => console.error('Error loading articles:', err))
          .finally(() => setLoadingArticles(false))
      },
      { rootMargin: '100px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isAuthenticated, addVotesToIdeas])

  // Lazy load Trends when section is visible
  useEffect(() => {
    if (trendsLoadedRef.current) return
    const el = trendsSectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting || trendsLoadedRef.current) return
        trendsLoadedRef.current = true
        setLoadingTrends(true)
        Promise.all([
          ideaService.getIdeasByStatusFlag('active_discussion', ACTIVE_DISCUSSION_INITIAL),
          ideaService.getCommunitiesFavorite(TOP_LIKED_INITIAL),
          ideaService.getMostCommented(TOP_COMMENTED_INITIAL),
          ideaService.getMostDetailedIdeas(MOST_DETAILED_INITIAL),
          ideaService.getHighestPayIntentionIdeas(PAY_INTENTION_INITIAL),
          ideaService.getMostIteratedIdeas(MOST_ITERATED_INITIAL),
        ])
          .then(
            ([
              activeDiscussion,
              topLiked,
              topCommented,
              mostDetailed,
              payIntention,
              mostIterated,
            ]) => {
              setTrendsData({
                activeDiscussion,
                topLiked,
                topCommented,
                mostDetailed,
                payIntention,
                mostIterated,
              })
              return [
                ...activeDiscussion,
                ...topLiked,
                ...topCommented,
                ...mostDetailed,
                ...payIntention,
                ...mostIterated,
              ]
            }
          )
          .then(async allTrendIdeas => {
            if (isAuthenticated && allTrendIdeas.length > 0) {
              const uniqueIds = [...new Set(allTrendIdeas.map(i => i.id))]
              const votesMap =
                await ideaService.getUserVotesForIdeas(uniqueIds)
              const addVotes = (ideas: Idea[]) =>
                addVotesToIdeas(ideas, votesMap)
              setTrendsData(prev => ({
                activeDiscussion: addVotes(prev.activeDiscussion),
                topLiked: addVotes(prev.topLiked),
                topCommented: addVotes(prev.topCommented),
                mostDetailed: addVotes(prev.mostDetailed),
                payIntention: addVotes(prev.payIntention),
                mostIterated: addVotes(prev.mostIterated),
              }))
            }
          })
          .catch(err => console.error('Error loading trends:', err))
          .finally(() => setLoadingTrends(false))
      },
      { rootMargin: '100px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isAuthenticated, addVotesToIdeas])

  const loadMoreArticles = useCallback(async () => {
    if (!articlesHasMore || loadingMoreArticles) return
    setLoadingMoreArticles(true)
    try {
      const next = await ideaService.getArticles(
        ARTICLES_PAGE_SIZE,
        articles.length
      )
      setArticles(prev => [...prev, ...next])
      setArticlesHasMore(next.length >= ARTICLES_PAGE_SIZE)
      if (isAuthenticated && next.length > 0) {
        const votesMap = await ideaService.getUserVotesForIdeas(
          next.map(i => i.id)
        )
        setArticles(prev =>
          prev.map(idea =>
            votesMap[idea.id]
              ? { ...idea, userVotes: votesMap[idea.id] }
              : idea
          )
        )
      }
    } catch (error) {
      console.error('Error loading more articles:', error)
    } finally {
      setLoadingMoreArticles(false)
    }
  }, [articles.length, articlesHasMore, loadingMoreArticles, isAuthenticated])

  // Scroll-based load more: observe sentinels and load when they enter view.
  // Trends sentinels are stored in a ref (no setState) to avoid infinite loop from ref callbacks.
  // Defer reading refs so they're set after commit (ref callbacks run in commit phase).
  const loadMoreObserverRef = useRef<IntersectionObserver | null>(null)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const refToSection = new Map<Element, string>()
      const elements: Element[] = []
      if (discoverSentinelRef.current) {
        refToSection.set(discoverSentinelRef.current, 'discover')
        elements.push(discoverSentinelRef.current)
      }
      if (articlesSentinelRef.current) {
        refToSection.set(articlesSentinelRef.current, 'articles')
        elements.push(articlesSentinelRef.current)
      }
      Object.entries(trendsSentinelRefs.current).forEach(([key, el]) => {
        if (el) {
          refToSection.set(el, key)
          elements.push(el)
        }
      })

      if (elements.length === 0) return

      loadMoreObserverRef.current?.disconnect()
      loadMoreObserverRef.current = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const section = refToSection.get(entry.target)
            if (!section) continue
            if (section === 'discover') loadMoreDiscover()
            else if (section === 'articles') loadMoreArticles()
            else loadMoreTrendsSection(section as keyof TrendsSectionData)
          }
        },
        { rootMargin: '200px', threshold: 0.1 }
      )
      elements.forEach(el => loadMoreObserverRef.current!.observe(el))
    })
    return () => {
      cancelAnimationFrame(id)
      loadMoreObserverRef.current?.disconnect()
      loadMoreObserverRef.current = null
    }
  }, [
    loadMoreDiscover,
    loadMoreArticles,
    loadMoreTrendsSection,
    // Re-run when trends have loaded so we can observe sentinels (refs are set in same commit)
    trendsData.activeDiscussion.length,
    trendsData.topLiked.length,
    trendsData.mostDetailed.length,
  ])

  return (
    <main className="flex-1 w-full px-4 md:px-6 xl:px-8 py-24 max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
      {/* Discover - 60% initial, load more when scroll sentinel is visible */}
      <div>
        <HorizontalScrollSection
          title={t('home.discover_new')}
          ideas={recentIdeas}
          loading={loadingDiscover}
          visibleCards={3}
          onIdeaHover={setHoveredIdeaId}
          hoveredIdeaId={hoveredIdeaId}
        />
        {recentIdeas.length > 0 && discoverHasMore && (
          <div ref={discoverSentinelRef} className="h-4 w-full" />
        )}
      </div>

      {/* Articles - lazy loaded when in view, load more when scroll sentinel is visible */}
      <div ref={articlesSectionRef}>
        <HorizontalScrollSection
          title={t('home.articles')}
          ideas={articles}
          loading={loadingArticles}
          visibleCards={3}
          onIdeaHover={setHoveredIdeaId}
          hoveredIdeaId={hoveredIdeaId}
        />
        {articles.length > 0 && articlesHasMore && (
          <div ref={articlesSentinelRef} className="h-4 w-full" />
        )}
      </div>

      {/* Trends - horizontal for first 3, vertical for last 3; load more on scroll */}
      <div ref={trendsSectionRef}>
        <TrendsSection
          title={t('home.trends')}
          data={trendsData}
          loading={loadingTrends}
          onIdeaHover={setHoveredIdeaId}
          hoveredIdeaId={hoveredIdeaId}
          titleActiveDiscussion={t('home.trends_active_discussion')}
          titleTopLiked={t('home.top_10_most_liked')}
          titleTopCommented={t('home.trends_top_commented')}
          titleMostDetailed={t('home.trends_most_detailed')}
          titlePayIntention={t('home.trends_pay_intention')}
          titleMostIterated={t('home.trends_most_iterated')}
          hasMore={trendsHasMore}
          setSentinelRef={setTrendsSentinelRef}
        />
      </div>
    </main>
  )
}
