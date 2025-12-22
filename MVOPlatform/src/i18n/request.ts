import { getRequestConfig } from 'next-intl/server'
import en from '../../messages/en.json'
import es from '../../messages/es.json'

export default getRequestConfig(async ({ locale }) => {
  // Fallback to 'en' if locale is undefined
  const safeLocale = locale || 'en'

  return {
    locale: safeLocale,
    messages: safeLocale === 'es' ? es : en,
  }
})
