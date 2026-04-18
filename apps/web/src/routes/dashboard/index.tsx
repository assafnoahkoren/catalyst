import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc, trpcClient } from '../../lib/trpc'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

interface Stats {
  totalCustomers: number
  newToday: number
  activeConversations: number
  totalMessages: number
  conversionRate: number | null
  checklist: {
    hasCustomers: boolean
    hasKnowledgeBase: boolean
    hasTeamMembers: boolean
  }
}

interface FunnelItem {
  name: string
  color: string
  count: number
}

type DateRange = 'today' | 'week' | 'month' | 'all'

function _getDateRangeStart(range: DateRange): Date | null {
  const now = new Date()
  if (range === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (range === 'week') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return d
  }
  if (range === 'month') {
    const d = new Date(now)
    d.setMonth(d.getMonth() - 1)
    return d
  }
  return null
}

function DashboardPage() {
  const { t } = useTranslation()
  const [dateRange, setDateRange] = useState<DateRange>('all')
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
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>{t('dashboard')}</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as DateRange)}
          className='rounded-md border border-input bg-background px-3 py-1.5 text-sm'
        >
          <option value='today'>{t('dateRangeToday')}</option>
          <option value='week'>{t('dateRangeWeek')}</option>
          <option value='month'>{t('dateRangeMonth')}</option>
          <option value='all'>{t('dateRangeAll')}</option>
        </select>
      </div>

      {/* Stats cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {statsQuery.isLoading
          ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          )
          : (
            <>
              <StatCard label={t('totalCustomers')} value={stats?.totalCustomers ?? 0} />
              <StatCard label={t('newToday')} value={stats?.newToday ?? 0} />
              <StatCard label={t('activeConversations')} value={stats?.activeConversations ?? 0} />
              <StatCard label={t('totalMessages')} value={stats?.totalMessages ?? 0} />
              <StatCard
                label={t('conversionRate')}
                value={stats?.conversionRate !== null ? stats?.conversionRate ?? 0 : 0}
                suffix={stats?.conversionRate !== null ? '%' : 'N/A'}
              />
            </>
          )}
      </div>

      {/* Onboarding checklist for new orgs */}
      {stats
        && (!stats.checklist.hasCustomers || !stats.checklist.hasKnowledgeBase
          || !stats.checklist.hasTeamMembers)
        && (
          <div className='rounded-lg border bg-primary/5 p-4'>
            <h2 className='mb-3 text-sm font-semibold'>{t('getStarted')}</h2>
            <div className='space-y-2 text-sm'>
              <div
                className={`flex items-center gap-2 ${
                  stats.checklist.hasCustomers ? 'text-green-600 line-through' : ''
                }`}
              >
                {stats.checklist.hasCustomers ? '✓' : '○'} {t('checklistAddCustomer')}
              </div>
              <div
                className={`flex items-center gap-2 ${
                  stats.checklist.hasKnowledgeBase ? 'text-green-600 line-through' : ''
                }`}
              >
                {stats.checklist.hasKnowledgeBase ? '✓' : '○'} {t('checklistAddKB')}
              </div>
              <div
                className={`flex items-center gap-2 ${
                  stats.checklist.hasTeamMembers ? 'text-green-600 line-through' : ''
                }`}
              >
                {stats.checklist.hasTeamMembers ? '✓' : '○'} {t('checklistInviteTeam')}
              </div>
            </div>
          </div>
        )}

      {/* Customer funnel */}
      <div className='rounded-lg border p-4'>
        <h2 className='mb-4 text-sm font-semibold'>{t('customerFunnel')}</h2>
        {funnelQuery.isLoading ? <FunnelSkeleton /> : (
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
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className='rounded-lg border p-4'>
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='text-2xl font-bold'>{suffix === 'N/A' ? 'N/A' : `${value}${suffix ?? ''}`}</p>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className='animate-pulse rounded-lg border p-4'>
      <div className='h-4 w-24 rounded bg-muted' />
      <div className='mt-2 h-8 w-16 rounded bg-muted' />
    </div>
  )
}

function FunnelSkeleton() {
  return (
    <div className='animate-pulse space-y-2'>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className='flex items-center gap-3'>
          <div className='h-4 w-24 rounded bg-muted' />
          <div className='flex-1'>
            <div className='h-6 rounded bg-muted' style={{ width: `${80 - i * 10}%` }} />
          </div>
          <div className='h-4 w-8 rounded bg-muted' />
        </div>
      ))}
    </div>
  )
}
