import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { trpc, trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/settings/team')({
  component: TeamPage,
})

interface MemberData {
  id: string
  role: string
  user: { id: string; name: string; email: string; image: string | null }
}

function TeamPage() {
  const { t } = useTranslation()
  const membersQuery = useQuery(trpc.tenant.getMembers.queryOptions())
  const members = (membersQuery.data ?? []) as MemberData[]
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER')

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    try {
      await trpcClient.tenant.invite.mutate({ email, role })
      setEmail('')
      membersQuery.refetch()
      toast.success(t('invite'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('somethingWentWrong'))
    }
  }

  async function handleRemove(memberId: string) {
    try {
      await trpcClient.tenant.removeMember.mutate({ memberId })
      membersQuery.refetch()
      toast.success(t('remove'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('somethingWentWrong'))
    }
  }

  return (
    <div className='max-w-lg space-y-6'>
      <h1 className='text-2xl font-bold'>{t('teamMembers')}</h1>

      <form onSubmit={handleInvite} className='flex gap-2'>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type='email'
          required
          placeholder={t('inviteEmail')}
          className='flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm'
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
          className='rounded-md border border-input bg-background px-2 text-sm'
        >
          <option value='MEMBER'>{t('member')}</option>
          <option value='ADMIN'>{t('admin')}</option>
        </select>
        <button
          type='submit'
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
        >
          {t('invite')}
        </button>
      </form>

      <div className='space-y-2'>
        {members.map((m) => (
          <div key={m.id} className='flex items-center justify-between rounded-md border p-3'>
            <div>
              <p className='text-sm font-medium'>{m.user.name}</p>
              <p className='text-xs text-muted-foreground'>{m.user.email}</p>
            </div>
            <div className='flex items-center gap-2'>
              <span className='rounded bg-muted px-2 py-0.5 text-xs'>
                {m.role === 'OWNER' ? t('owner') : m.role === 'ADMIN' ? t('admin') : t('member')}
              </span>
              {m.role !== 'OWNER' && (
                <button
                  onClick={() => handleRemove(m.id)}
                  className='text-xs text-destructive hover:underline'
                >
                  {t('remove')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
