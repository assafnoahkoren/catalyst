import { authClient } from '@catalyst/auth/client'
import { useTranslation } from '@catalyst/i18n'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'))
      return
    }

    setLoading(true)

    const result = await authClient.resetPassword({
      newPassword: password,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error.message ?? t('resetFailed'))
      return
    }

    navigate({ to: '/login' })
  }

  return (
    <main className='flex min-h-screen items-center justify-center p-8'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>{t('resetPasswordTitle')}</h1>
          <p className='text-sm text-muted-foreground'>
            {t('resetPasswordDescription')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <label htmlFor='password' className='text-sm font-medium'>{t('newPassword')}</label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder={t('passwordPlaceholder')}
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='confirmPassword' className='text-sm font-medium'>
              {t('confirmPassword')}
            </label>
            <input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder={t('passwordPlaceholder')}
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            {loading ? t('resetting') : t('resetPassword')}
          </button>

          <p className='text-center text-sm text-muted-foreground'>
            <Link to='/login' className='text-primary underline'>
              {t('backToLogin')}
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
