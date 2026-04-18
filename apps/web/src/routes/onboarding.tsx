import { useTranslation } from '@catalyst/i18n'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { trpcClient } from '../lib/trpc'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function OnboardingPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [language, setLanguage] = useState('en')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugManuallyEdited) {
      setSlug(slugify(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true)
    setSlug(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await trpcClient.tenant.create.mutate({ name, slug, language })
      navigate({ to: '/dashboard' as '/' })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('Slug already taken')) {
        setError(t('slugTaken'))
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='flex min-h-screen items-center justify-center p-8'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>{t('onboardingTitle')}</h1>
          <p className='text-sm text-muted-foreground'>
            {t('onboardingDescription')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <label htmlFor='orgName' className='text-sm font-medium'>
              {t('organizationName')}
            </label>
            <input
              id='orgName'
              type='text'
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              minLength={2}
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder={t('organizationNamePlaceholder')}
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='slug' className='text-sm font-medium'>
              {t('organizationSlug')}
            </label>
            <input
              id='slug'
              type='text'
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
              minLength={2}
              pattern='[a-z0-9-]+'
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder={t('organizationSlugPlaceholder')}
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='language' className='text-sm font-medium'>
              {t('selectLanguage')}
            </label>
            <select
              id='language'
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
            >
              <option value='en'>{t('languageEnglish')}</option>
              <option value='he'>{t('languageHebrew')}</option>
            </select>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            {loading ? t('creatingOrganization') : t('createOrganization')}
          </button>
        </form>
      </div>
    </main>
  )
}
