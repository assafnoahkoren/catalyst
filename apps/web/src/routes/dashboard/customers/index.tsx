import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc, trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/customers/')({
  component: CustomersPage,
})

type ViewMode = 'kanban' | 'table'

function CustomersPage() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (localStorage.getItem('customers-view') as ViewMode) || 'kanban',
  )

  function handleViewChange(mode: ViewMode) {
    setViewMode(mode)
    localStorage.setItem('customers-view', mode)
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>{t('customers')}</h1>
        <div className='flex gap-2'>
          <div className='flex rounded-md border'>
            <button
              onClick={() => handleViewChange('kanban')}
              className={`px-3 py-1.5 text-sm font-medium ${
                viewMode === 'kanban'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('kanbanView')}
            </button>
            <button
              onClick={() => handleViewChange('table')}
              className={`px-3 py-1.5 text-sm font-medium ${
                viewMode === 'table'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('tableView')}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'kanban' ? <KanbanBoard /> : <div>{t('tableView')}</div>}
    </div>
  )
}

interface CustomerItem {
  id: string
  name: string
  phone: string | null
  statusId: string
  assignedToId: string | null
}

interface StatusItem {
  id: string
  name: string
  color: string
  order: number
}

function KanbanBoard() {
  const { t } = useTranslation()

  const statusesQuery = useQuery(trpc.customerStatus.list.queryOptions())
  const customersQuery = useQuery(
    trpc.customer.list.queryOptions({ page: 1, pageSize: 200 }),
  )

  if (statusesQuery.isLoading || customersQuery.isLoading) {
    return <div className='flex gap-4'>{[1, 2, 3].map((i) => <ColumnSkeleton key={i} />)}</div>
  }

  const statuses = (statusesQuery.data ?? []) as StatusItem[]
  const customers =
    ((customersQuery.data as { items?: CustomerItem[] })?.items ?? []) as CustomerItem[]

  async function handleDrop(customerId: string, newStatusId: string) {
    await trpcClient.customer.changeStatus.mutate({ id: customerId, statusId: newStatusId })
    customersQuery.refetch()
  }

  return (
    <div className='flex gap-4 overflow-x-auto pb-4'>
      {statuses.map((status) => {
        const columnCustomers = customers.filter((c) => c.statusId === status.id)
        return (
          <div
            key={status.id}
            className='flex w-72 flex-shrink-0 flex-col rounded-lg border bg-muted/30'
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const customerId = e.dataTransfer.getData('customerId')
              if (customerId) handleDrop(customerId, status.id)
            }}
          >
            <div
              className='rounded-t-lg border-b px-3 py-2'
              style={{ borderTopColor: status.color, borderTopWidth: 3 }}
            >
              <div className='flex items-center justify-between'>
                <span className='text-sm font-semibold'>{status.name}</span>
                <span className='rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
                  {columnCustomers.length}
                </span>
              </div>
            </div>

            <div className='flex-1 space-y-2 p-2'>
              {columnCustomers.length === 0 && (
                <p className='py-4 text-center text-xs text-muted-foreground'>
                  {t('noCustomers')}
                </p>
              )}
              {columnCustomers.map((customer) => (
                <div
                  key={customer.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('customerId', customer.id)}
                  className='cursor-grab rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing'
                >
                  <p className='text-sm font-medium'>{customer.name}</p>
                  {customer.phone && (
                    <p className='text-xs text-muted-foreground'>{customer.phone}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ColumnSkeleton() {
  return (
    <div className='w-72 flex-shrink-0 animate-pulse rounded-lg border bg-muted/30'>
      <div className='border-b px-3 py-2'>
        <div className='h-4 w-20 rounded bg-muted' />
      </div>
      <div className='space-y-2 p-2'>
        {[1, 2, 3].map((i) => <div key={i} className='h-16 rounded-md bg-muted' />)}
      </div>
    </div>
  )
}
