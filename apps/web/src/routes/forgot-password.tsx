import { useTranslation } from '@catalyst/i18n'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo: '/reset-password' }),
      })

      setLoading(false)

      if (!res.ok) {
        setError(t('resetFailed'))
        return
      }

      setSent(true)
    } catch {
      setLoading(false)
      setError(t('resetFailed'))
    }
  }

  return (
    <main className='flex min-h-screen items-center justify-center p-8'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>{t('forgotPasswordTitle')}</h1>
          <p className='text-sm text-muted-foreground'>
            {t('forgotPasswordDescription')}
          </p>
        </div>

        {sent
          ? (
            <div className='rounded-md bg-primary/10 p-4 text-center text-sm'>
              <p>{t('resetEmailSent')}</p>
              <Link to='/login' className='mt-2 block text-primary underline'>
                {t('backToLogin')}
              </Link>
            </div>
          )
          : (
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

              <button
                type='submit'
                disabled={loading}
                className='w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
              >
                {loading ? t('sending') : t('sendResetLink')}
              </button>

              <p className='text-center text-sm text-muted-foreground'>
                <Link to='/login' className='text-primary underline'>
                  {t('backToLogin')}
                </Link>
              </p>
            </form>
          )}
      </div>
    </main>
  )
}
