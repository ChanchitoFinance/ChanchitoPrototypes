import type { Metadata } from 'next'
import '../globals.css'
import { Providers } from '@/shared/components/providers/Providers'
import { GoogleAnalytics } from '@/shared/components/GoogleAnalytics'
import { Sidebar } from '@/shared/components/layout/Sidebar'
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
        <div className="h-screen w-full overflow-hidden bg-background flex">
          <Sidebar />
          <main className="flex-1 overflow-y-auto ml-16 md:ml-64 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex flex-col min-h-full">
              {children}
              <Footer />
            </div>
          </main>
        </div>
      </Providers>
    </>
  )
}
