import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc, trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/settings/')({
  component: SettingsPage,
})

interface TenantData {
  id: string
  name: string
  slug: string
  language: string
  greenApiInstance: string | null
  greenApiToken: string | null
}

function SettingsPage() {
  const { t } = useTranslation()
  const tenantQuery = useQuery(trpc.tenant.getCurrent.queryOptions())
  const tenant = tenantQuery.data as TenantData | undefined
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    await trpcClient.tenant.update.mutate({
      name: form.get('name') as string,
      language: form.get('language') as string,
      greenApiInstance: form.get('greenApiInstance') as string || undefined,
      greenApiToken: form.get('greenApiToken') as string || undefined,
    })
    tenantQuery.refetch()
    setSaving(false)
  }

  if (!tenant) return null

  return (
    <div className='max-w-lg space-y-6'>
      <h1 className='text-2xl font-bold'>{t('tenantSettings')}</h1>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>{t('organizationName')}</label>
          <input
            name='name'
            defaultValue={tenant.name}
            required
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>{t('selectLanguage')}</label>
          <select
            name='language'
            defaultValue={tenant.language}
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          >
            <option value='en'>{t('languageEnglish')}</option>
            <option value='he'>{t('languageHebrew')}</option>
          </select>
        </div>
        <h2 className='pt-4 text-lg font-semibold'>{t('whatsappConfig')}</h2>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>{t('instanceId')}</label>
          <input
            name='greenApiInstance'
            defaultValue={tenant.greenApiInstance ?? ''}
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>{t('apiToken')}</label>
          <input
            name='greenApiToken'
            type='password'
            defaultValue={tenant.greenApiToken ?? ''}
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          />
        </div>
        <button
          type='submit'
          disabled={saving}
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
        >
          {t('update')}
        </button>
      </form>
    </div>
  )
}
