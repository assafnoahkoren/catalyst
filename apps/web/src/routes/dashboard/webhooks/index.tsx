import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/webhooks/')({
  component: WebhooksPage,
})

interface WebhookData {
  id: string
  token: string
  isActive: boolean
  fieldMapping: Record<string, string>
  createdAt: string
}

function WebhooksPage() {
  const { t } = useTranslation()
  const webhooksQuery = useQuery({
    queryKey: ['webhook', 'list'] as const,
    queryFn: async (): Promise<WebhookData[]> => {
      const res = await trpcClient.webhook.list.query()
      return res as unknown as WebhookData[]
    },
  })
  const webhooks = webhooksQuery.data ?? []
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const baseUrl = window.location.origin

  async function handleCreate() {
    await trpcClient.webhook.create.mutate({
      fieldMapping: { name: 'name', email: 'email', phone: 'phone' },
    })
    webhooksQuery.refetch()
  }

  async function handleDelete(id: string) {
    await trpcClient.webhook.delete.mutate({ id })
    webhooksQuery.refetch()
  }

  function handleCopy(token: string, id: string) {
    navigator.clipboard.writeText(`${baseUrl}/api/webhook/${token}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>{t('webhookEndpoints')}</h1>
        <button
          onClick={handleCreate}
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
        >
          {t('createWebhook')}
        </button>
      </div>

      {webhooks.length === 0 && (
        <p className='py-8 text-center text-sm text-muted-foreground'>{t('noWebhooks')}</p>
      )}

      <div className='space-y-4'>
        {webhooks.map((webhook) => (
          <div key={webhook.id} className='rounded-lg border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <span
                  className={`h-2 w-2 rounded-full ${
                    webhook.isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span className='text-xs'>{webhook.isActive ? t('active') : t('inactive')}</span>
              </div>
              <button
                onClick={() => handleDelete(webhook.id)}
                className='text-xs text-destructive hover:underline'
              >
                {t('deleteCustomer')}
              </button>
            </div>

            <div className='mt-3 space-y-2'>
              <label className='text-xs font-medium text-muted-foreground'>{t('webhookUrl')}</label>
              <div className='flex gap-2'>
                <code className='flex-1 rounded bg-muted px-3 py-1.5 text-xs'>
                  {baseUrl}/api/webhook/{webhook.token}
                </code>
                <button
                  onClick={() => handleCopy(webhook.token, webhook.id)}
                  className='rounded border px-2 py-1 text-xs'
                >
                  {copiedId === webhook.id ? t('copied') : t('copyUrl')}
                </button>
              </div>
            </div>

            <div className='mt-3'>
              <label className='text-xs font-medium text-muted-foreground'>
                {t('curlExample')}
              </label>
              <pre className='mt-1 overflow-x-auto rounded bg-muted p-2 text-xs'>
                {`curl -X POST ${baseUrl}/api/webhook/${webhook.token} \\
  -H "Content-Type: application/json" \\
  -d '{"name":"John","email":"john@example.com","phone":"1234567890"}'`}
              </pre>
            </div>

            <p className='mt-2 text-xs text-muted-foreground'>
              {new Date(webhook.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
