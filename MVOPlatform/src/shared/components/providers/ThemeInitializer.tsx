import { useThemeInitializer } from '@/core/hooks/useThemeInitializer'

export const ThemeInitializer = ({
  children,
}: {
  children: React.ReactNode
}) => {
  useThemeInitializer()
  return <>{children}</>
}
