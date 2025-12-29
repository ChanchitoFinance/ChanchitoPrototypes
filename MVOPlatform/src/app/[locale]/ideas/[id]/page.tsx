'use client'

import { IdeaDetail } from '@/features/ideas/components/IdeaDetail'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import { Footer } from '@/shared/components/layout/Footer'
import { useState, useEffect } from 'react'

export default function IdeaDetailPage({ params }: { params: { id: string } }) {
  const [sidebarWidth, setSidebarWidth] = useState(256) // Default to expanded width (w-64 = 256px)
  const [activeTab, setActiveTab] = useState<'home' | 'foryou'>('home')

  // Load active tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab') as
      | 'home'
      | 'foryou'
      | null
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [])

  useEffect(() => {
    // Listen for sidebar state changes
    const handleResize = () => {
      // Check if sidebar is collapsed by checking window width or sidebar element
      const sidebar = document.querySelector('aside')
      if (sidebar) {
        const width = sidebar.offsetWidth
        setSidebarWidth(width)
      }
    }

    // Initial check
    handleResize()

    // Check periodically for sidebar state changes (less frequent for better performance)
    const interval = setInterval(handleResize, 300)

    // Also listen for resize events
    window.addEventListener('resize', handleResize)

    // Use MutationObserver to detect class changes on sidebar
    const sidebar = document.querySelector('aside')
    if (sidebar) {
      const observer = new MutationObserver(() => {
        handleResize()
      })
      observer.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class'],
      })

      return () => {
        clearInterval(interval)
        window.removeEventListener('resize', handleResize)
        observer.disconnect()
      }
    }

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeTab={activeTab} />
      <div className="flex-1 flex flex-col transition-all duration-300 ml-16 md:ml-64">
        <IdeaDetail ideaId={params.id} />
        <Footer />
      </div>
    </div>
  )
}
