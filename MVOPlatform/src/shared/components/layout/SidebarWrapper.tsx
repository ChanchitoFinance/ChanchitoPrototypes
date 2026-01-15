'use client'

import { MainLayout } from './MainLayout'

interface SidebarWrapperProps {
  children: React.ReactNode
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  return <MainLayout>{children}</MainLayout>
}
