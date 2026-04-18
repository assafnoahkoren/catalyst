import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { trpc, trpcClient } from '../../lib/trpc'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

interface Stats {
  totalCustomers: number
  newToday: number
  activeConversations: number
  totalMessages: number
}

interface FunnelItem {
  name: string
  color: string
  count: number
}

function DashboardPage() {
  const { t } = useTranslation()
  const statsQuery = useQuery(trpc.dashboard.getStats.queryOptions())
  const funnelQuery = useQuery({
    queryKey: ['dashboard', 'funnel'] as const,
    queryFn: async (): Promise<FunnelItem[]> => {
      const res = await trpcClient.dashboard.getFunnel.query()
      return res as unknown as FunnelItem[]
    },
  })

  const stats = statsQuery.data as Stats | undefined
  const funnel = funnelQuery.data ?? []

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>{t('dashboard')}</h1>

      {/* Stats cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard label={t('totalCustomers')} value={stats?.totalCustomers ?? 0} />
        <StatCard label={t('newToday')} value={stats?.newToday ?? 0} />
        <StatCard label={t('activeConversations')} value={stats?.activeConversations ?? 0} />
        <StatCard label={t('totalMessages')} value={stats?.totalMessages ?? 0} />
      </div>

      {/* Customer funnel */}
      <div className='rounded-lg border p-4'>
        <h2 className='mb-4 text-sm font-semibold'>{t('customerFunnel')}</h2>
        <div className='space-y-2'>
          {funnel.map((item) => {
            const maxCount = Math.max(...funnel.map((f) => f.count), 1)
            const width = Math.max((item.count / maxCount) * 100, 2)
            return (
              <div key={item.name} className='flex items-center gap-3'>
                <span className='w-24 text-sm'>{item.name}</span>
                <div className='flex-1'>
                  <div
                    className='h-6 rounded'
                    style={{ width: `${width}%`, backgroundColor: item.color }}
                  />
                </div>
                <span className='w-8 text-end text-sm font-medium'>{item.count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className='rounded-lg border p-4'>
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='text-2xl font-bold'>{value}</p>
    </div>
  )
}
