import { getDirection, useTranslation } from '@catalyst/i18n'
import type { SupportedLanguage } from '@catalyst/i18n'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  const { i18n } = useTranslation()
  const dir = getDirection(i18n.language as SupportedLanguage)

  return (
    <div dir={dir} className='min-h-screen bg-background text-foreground'>
      <Outlet />
    </div>
  )
}
