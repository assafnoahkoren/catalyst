import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { trpc, trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/knowledge/')({
  component: KnowledgePage,
})

interface EntryData {
  id: string
  title: string
  type: string
  chunkCount: number
  createdAt: string
}

const TYPE_ICONS: Record<string, string> = {
  TEXT: '📝',
  QA_PAIR: '❓',
  URL: '🔗',
  FILE: '📄',
}

function KnowledgePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const entriesQuery = useQuery(trpc.knowledge.list.queryOptions())
  const entries = (entriesQuery.data ?? []) as EntryData[]

  async function handleDelete(id: string) {
    await trpcClient.knowledge.delete.mutate({ id })
    entriesQuery.refetch()
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>{t('knowledgeEntries')}</h1>
        <button
          onClick={() => navigate({ to: '/dashboard/knowledge/new' as '/' })}
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
        >
          {t('addEntry')}
        </button>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {entries.map((entry) => (
          <div key={entry.id} className='rounded-lg border p-4'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-2'>
                <span className='text-lg'>{TYPE_ICONS[entry.type] ?? '📄'}</span>
                <div>
                  <p className='text-sm font-medium'>{entry.title}</p>
                  <p className='text-xs text-muted-foreground'>
                    {entry.type} · {entry.chunkCount} {t('chunks')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                className='text-xs text-destructive hover:underline'
              >
                {t('deleteCustomer')}
              </button>
            </div>
            <p className='mt-2 text-xs text-muted-foreground'>
              {new Date(entry.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p className='py-8 text-center text-sm text-muted-foreground'>
          {t('noCustomers')}
        </p>
      )}
    </div>
  )
}
