import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc, trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/settings/pipeline')({
  component: PipelinePage,
})

interface StatusData {
  id: string
  name: string
  color: string
  order: number
  isDefault: boolean
  isClosed: boolean
}

function PipelinePage() {
  const { t } = useTranslation()
  const statusesQuery = useQuery(trpc.customerStatus.list.queryOptions())
  const statuses = (statusesQuery.data ?? []) as StatusData[]
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6B7280')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    await trpcClient.customerStatus.create.mutate({
      name: newName,
      color: newColor,
      order: statuses.length,
    })
    setNewName('')
    statusesQuery.refetch()
  }

  async function handleDelete(id: string) {
    await trpcClient.customerStatus.delete.mutate({ id })
    statusesQuery.refetch()
  }

  return (
    <div className='max-w-lg space-y-6'>
      <h1 className='text-2xl font-bold'>{t('pipeline')}</h1>

      <div className='space-y-2'>
        {statuses.map((status) => (
          <div key={status.id} className='flex items-center gap-3 rounded-md border p-3'>
            <div className='h-4 w-4 rounded-full' style={{ backgroundColor: status.color }} />
            <span className='flex-1 text-sm font-medium'>{status.name}</span>
            {status.isDefault && (
              <span className='rounded bg-primary/10 px-2 py-0.5 text-xs text-primary'>
                {t('default')}
              </span>
            )}
            {status.isClosed && (
              <span className='rounded bg-muted px-2 py-0.5 text-xs'>{t('closed')}</span>
            )}
            {!status.isDefault && (
              <button
                onClick={() => handleDelete(status.id)}
                className='text-xs text-destructive hover:underline'
              >
                {t('deleteCustomer')}
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className='flex items-end gap-2'>
        <div className='flex-1 space-y-1'>
          <label className='text-xs font-medium'>{t('statusName')}</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs font-medium'>{t('color')}</label>
          <input
            type='color'
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className='h-9 w-12 rounded border'
          />
        </div>
        <button
          type='submit'
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
        >
          {t('addStatus')}
        </button>
      </form>
    </div>
  )
}
