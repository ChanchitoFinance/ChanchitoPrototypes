import type { Metadata } from 'next'
import '../globals.css'
import { Providers } from '@/components/providers/Providers'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

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
    <html suppressHydrationWarning>
      <body>
        <GoogleAnalytics />
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  )
}
