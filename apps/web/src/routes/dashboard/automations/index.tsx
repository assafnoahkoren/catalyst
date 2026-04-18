import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/automations/')({
  component: AutomationsPage,
})

interface FlowData {
  id: string
  name: string
  isActive: boolean
  trigger: { type: string }
  createdAt: string
}

function AutomationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const flowsQuery = useQuery({
    queryKey: ['automation', 'list'] as const,
    queryFn: async (): Promise<FlowData[]> => {
      const res = await trpcClient.automation.list.query()
      return res as unknown as FlowData[]
    },
  })
  const flows = flowsQuery.data ?? []

  async function handleToggle(id: string, isActive: boolean) {
    await trpcClient.automation.toggleActive.mutate({ id, isActive: !isActive })
    flowsQuery.refetch()
  }

  async function handleDelete(id: string) {
    await trpcClient.automation.delete.mutate({ id })
    flowsQuery.refetch()
  }

  async function handleCreate() {
    const flow = await trpcClient.automation.create.mutate({
      name: 'New Flow',
      trigger: { type: 'NEW_CUSTOMER', config: {} },
      steps: [{ action: 'SEND_WHATSAPP', config: { template: 'Hello {{customer.name}}!' } }],
    })
    navigate({ to: `/dashboard/automations/${(flow as { id: string }).id}` as '/' })
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>{t('automationFlows')}</h1>
        <button
          onClick={handleCreate}
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
        >
          {t('createFlow')}
        </button>
      </div>

      {flows.length === 0 && (
        <p className='py-8 text-center text-sm text-muted-foreground'>{t('noFlows')}</p>
      )}

      <div className='space-y-2'>
        {flows.map((flow) => (
          <div key={flow.id} className='flex items-center justify-between rounded-md border p-4'>
            <div
              className='cursor-pointer'
              onClick={() =>
                navigate({ to: `/dashboard/automations/${flow.id}` as '/' })}
            >
              <p className='text-sm font-medium'>{flow.name}</p>
              <p className='text-xs text-muted-foreground'>{flow.trigger.type}</p>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() =>
                  handleToggle(flow.id, flow.isActive)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  flow.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {flow.isActive ? t('enabled') : t('disabled')}
              </button>
              <button
                onClick={() => handleDelete(flow.id)}
                className='text-xs text-destructive hover:underline'
              >
                {t('deleteCustomer')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
