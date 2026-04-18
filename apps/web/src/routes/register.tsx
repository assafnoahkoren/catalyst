import { authClient } from '@catalyst/auth/client'
import { useTranslation } from '@catalyst/i18n'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await authClient.signUp.email({
      name,
      email,
      password,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error.message ?? t('registrationFailed'))
      return
    }

    navigate({ to: '/onboarding' })
  }

  return (
    <main className='flex min-h-screen items-center justify-center p-8'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>{t('signUpTitle')}</h1>
          <p className='text-sm text-muted-foreground'>
            {t('signUpDescription')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <label htmlFor='name' className='text-sm font-medium'>{t('name')}</label>
            <input
              id='name'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder={t('namePlaceholder')}
            />
          </div>

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

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            {loading ? t('creatingAccount') : t('signUp')}
          </button>
        </form>

        <p className='text-center text-sm text-muted-foreground'>
          {t('hasAccount')}{' '}
          <Link to='/login' className='text-primary underline'>
            {t('signIn')}
          </Link>
        </p>
      </div>
    </main>
  )
}
