import { useRouter } from 'next/navigation'
import { useLocale } from '@/components/providers/I18nProvider'

export function usePremiumRedirect() {
  const router = useRouter()
  const { locale } = useLocale()

  const redirectToPremium = () => {
    router.push(`/${locale}/premium`)
  }

  return { redirectToPremium }
}

