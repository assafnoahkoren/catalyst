import { authClient } from '@catalyst/auth/client'
import { useTranslation } from '@catalyst/i18n'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    try {
      const res = await fetch('/api/auth/get-session')
      const data = await res.json()
      if (data?.session) throw redirect({ to: '/dashboard' })
    } catch (e) {
      if (e instanceof Response || (e as { to?: string })?.to) throw e
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await authClient.signIn.email({
      email,
      password,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error.message ?? t('signInFailed'))
      return
    }

    const params = new URLSearchParams(window.location.search)
    const redirectTo = params.get('redirect') ?? '/dashboard'
    window.location.href = redirectTo
  }

  return (
    <main className='flex min-h-screen items-center justify-center p-8'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>{t('signInTitle')}</h1>
          <p className='text-sm text-muted-foreground'>
            {t('signInDescription')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium'>{t('email')}</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder={t('emailPlaceholder')}
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='password' className='text-sm font-medium'>{t('password')}</label>
            <div className='relative'>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm'
                placeholder={t('passwordPlaceholder')}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground'
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            <Link to='/forgot-password' className='mt-1 block text-xs text-primary hover:underline'>
              {t('forgotPassword')}
            </Link>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>

        <p className='text-center text-sm text-muted-foreground'>
          {t('noAccount')}{' '}
          <Link to='/register' className='text-primary underline'>
            {t('signUp')}
          </Link>
        </p>
      </div>
    </main>
  )
}
