import { useTranslation } from '@catalyst/i18n'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    try {
      const res = await fetch('/api/auth/get-session')
      const data = await res.json()
      if (data?.session) throw redirect({ to: '/dashboard' })
    } catch (e) {
      if (e instanceof Response || (e as { to?: string })?.to) throw e
    }
  },
  component: HomePage,
})

function HomePage() {
  const { t } = useTranslation()

  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-6 p-8'>
      <h1 className='text-4xl font-bold tracking-tight'>{t('appName')}</h1>
      <p className='text-lg text-muted-foreground'>
        {t('tagline')}
      </p>
      <div className='flex gap-4'>
        <Link
          to='/login'
          className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'
        >
          {t('signIn')}
        </Link>
        <Link
          to='/register'
          className='rounded-md border border-input px-4 py-2 hover:bg-accent'
        >
          {t('signUp')}
        </Link>
      </div>
    </main>
  )
}
