import type { Metadata } from 'next'
import './globals.css'
import { ToasterWrapper } from '@/shared/components/ui/ToasterWrapper'

export const metadata: Metadata = {
  title: 'MVO - Validate Your Business Idea',
  description:
    'Validate your business idea in 48 hours with data-driven insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ToasterWrapper />
        {children}
      </body>
    </html>
  )
}
