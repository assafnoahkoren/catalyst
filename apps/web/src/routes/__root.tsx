import { getDirection, useTranslation } from '@catalyst/i18n'
import type { SupportedLanguage } from '@catalyst/i18n'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation()

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-8'>
      <div className='w-full max-w-sm space-y-4 text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
          <span className='text-2xl'>!</span>
        </div>
        <h1 className='text-xl font-bold text-foreground'>{t('somethingWentWrong')}</h1>
        <p className='text-sm text-muted-foreground'>{t('errorDescription')}</p>
        <button
          onClick={resetErrorBoundary}
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
        >
          {t('tryAgain')}
        </button>
      </div>
    </div>
  )
}

function RootLayout() {
  const { i18n } = useTranslation()
  const dir = getDirection(i18n.language as SupportedLanguage)

  return (
    <div dir={dir} className='min-h-screen bg-background text-foreground'>
      <Toaster position='top-right' richColors closeButton />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Outlet />
      </ErrorBoundary>
    </div>
  )
}
