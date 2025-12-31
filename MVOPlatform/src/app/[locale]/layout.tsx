import type { Metadata } from 'next'
import '../globals.css'
import { Providers } from '@/shared/components/providers/Providers'
import { GoogleAnalytics } from '@/shared/components/GoogleAnalytics'
import { SidebarWrapper } from '@/shared/components/layout/SidebarWrapper'
import { Footer } from '@/shared/components/layout/Footer'

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

export const metadata: Metadata = {
  title: 'MVO - Validate Your Business Idea',
  description:
    'Validate your business idea in 48 hours with data-driven insights',
}

export default async function RootLayout({ children, params }: Props) {
  const locale = (await params).locale as 'en' | 'es'
  return (
    <>
      <GoogleAnalytics />
      <Providers locale={locale}>
        <SidebarWrapper>
          {children}
          <Footer />
        </SidebarWrapper>
      </Providers>
    </>
  )
}
