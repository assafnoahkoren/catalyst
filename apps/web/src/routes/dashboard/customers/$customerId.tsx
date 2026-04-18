import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { trpc, trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/customers/$customerId')({
  component: CustomerDetailPage,
})

interface CustomerData {
  id: string
  name: string
  email: string | null
  phone: string | null
  tags: string[]
  status: { id: string; name: string; color: string }
  createdAt: string
}

interface ActivityItem {
  id: string
  type: string
  data: Record<string, unknown>
  createdAt: string
  actorId: string | null
}

interface NoteItem {
  id: string
  body: string
  createdAt: string
  authorId: string
}

function CustomerDetailPage() {
  const { customerId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [noteBody, setNoteBody] = useState('')

  const customerQuery = useQuery({
    queryKey: ['customer', 'getById', customerId] as const,
    queryFn: async (): Promise<CustomerData> => {
      const res = await trpcClient.customer.getById.query({ id: customerId })
      return res as unknown as CustomerData
    },
  })
  const activitiesQuery = useQuery({
    queryKey: ['activity', 'list', customerId] as const,
    queryFn: async (): Promise<{ items: ActivityItem[] }> => {
      const res = await trpcClient.activity.list.query({ customerId, page: 1, pageSize: 50 })
      return res as unknown as { items: ActivityItem[] }
    },
  })
  const notesQuery = useQuery({
    queryKey: ['note', 'list', customerId] as const,
    queryFn: async (): Promise<NoteItem[]> => {
      const res = await trpcClient.note.list.query({ customerId })
      return res as unknown as NoteItem[]
    },
  })

  const statusesQuery = useQuery(trpc.customerStatus.list.queryOptions())
  const statuses = (statusesQuery.data ?? []) as Array<{ id: string; name: string; color: string }>

  const customer = customerQuery.data
  const activities = activitiesQuery.data?.items ?? []
  const notes = notesQuery.data ?? []

  async function handleStatusChange(newStatusId: string) {
    try {
      await trpcClient.customer.changeStatus.mutate({ id: customerId, statusId: newStatusId })
      customerQuery.refetch()
      activitiesQuery.refetch()
      toast.success(t('update'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('somethingWentWrong'))
    }
  }

  async function handleFieldSave(field: string, value: string | undefined) {
    try {
      await trpcClient.customer.update.mutate({
        id: customerId,
        [field]: value,
      })
      customerQuery.refetch()
      toast.success(t('update'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('somethingWentWrong'))
    }
  }

  async function handleAddNote() {
    if (!noteBody.trim()) return
    await trpcClient.note.create.mutate({ customerId, body: noteBody })
    setNoteBody('')
    notesQuery.refetch()
    activitiesQuery.refetch()
  }

  if (customerQuery.isLoading) {
    return (
      <div className='animate-pulse space-y-4'>
        <div className='h-8 w-48 rounded bg-muted' />
        <div className='h-4 w-32 rounded bg-muted' />
      </div>
    )
  }

  if (!customer) {
    return <div className='text-muted-foreground'>Customer not found</div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <button
          onClick={() => navigate({ to: '/dashboard/customers' as '/' })}
          className='text-sm text-muted-foreground hover:text-foreground'
        >
          {t('back')}
        </button>
        <h1 className='text-2xl font-bold'>
          <EditableField
            value={customer.name}
            onSave={(val) => handleFieldSave('name', val)}
            className='text-2xl font-bold'
          />
        </h1>
        <select
          value={customer.status.id}
          onChange={(e) => handleStatusChange(e.target.value)}
          className='rounded-full border-0 px-2 py-0.5 text-xs font-medium text-white'
          style={{ backgroundColor: customer.status.color }}
        >
          {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Customer info */}
        <div className='space-y-4 lg:col-span-1'>
          <div className='rounded-lg border p-4'>
            <h2 className='mb-3 text-sm font-semibold'>{t('customerDetails')}</h2>
            <dl className='space-y-2 text-sm'>
              <div>
                <dt className='text-muted-foreground'>{t('email')}</dt>
                <dd>
                  <EditableField
                    value={customer.email ?? ''}
                    onSave={(val) => handleFieldSave('email', val || undefined)}
                    placeholder='-'
                  />
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>{t('phone')}</dt>
                <dd>
                  <EditableField
                    value={customer.phone ?? ''}
                    onSave={(val) => handleFieldSave('phone', val || undefined)}
                    placeholder='-'
                  />
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>{t('tags')}</dt>
                <dd className='flex flex-wrap gap-1'>
                  {customer.tags.length === 0 && '-'}
                  {customer.tags.map((tag) => (
                    <span key={tag} className='rounded bg-muted px-1.5 py-0.5 text-xs'>
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className='text-muted-foreground'>{t('createdAt')}</dt>
                <dd>{new Date(customer.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          {/* Add note */}
          <div className='rounded-lg border p-4'>
            <h2 className='mb-3 text-sm font-semibold'>{t('addNote')}</h2>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder={t('notePlaceholder')}
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              rows={3}
            />
            <button
              onClick={handleAddNote}
              disabled={!noteBody.trim()}
              className='mt-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
            >
              {t('save')}
            </button>
          </div>
        </div>

        {/* Activity + Notes timeline */}
        <div className='space-y-4 lg:col-span-2'>
          <div className='rounded-lg border p-4'>
            <h2 className='mb-3 text-sm font-semibold'>{t('activityTimeline')}</h2>
            <div className='space-y-3'>
              {activities.length === 0 && notes.length === 0 && (
                <p className='text-sm text-muted-foreground'>No activity yet</p>
              )}
              {activities.map((activity) => (
                <div key={activity.id} className='flex gap-3 border-b pb-3 last:border-0'>
                  <div className='mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary' />
                  <div className='text-sm'>
                    <p>{formatActivity(activity, t)}</p>
                    <p className='text-xs text-muted-foreground'>
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {notes.length > 0 && (
            <div className='rounded-lg border p-4'>
              <h2 className='mb-3 text-sm font-semibold'>{t('notes')}</h2>
              <div className='space-y-3'>
                {notes.map((note) => (
                  <div key={note.id} className='rounded-md bg-muted/50 p-3 text-sm'>
                    <p>{note.body}</p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EditableField({
  value,
  onSave,
  placeholder = '',
  className = '',
}: {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setEditValue(value)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function save() {
    setEditing(false)
    if (editValue !== value) {
      onSave(editValue)
    }
  }

  function cancel() {
    setEditing(false)
    setEditValue(value)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') cancel()
        }}
        className={`rounded border border-input bg-background px-1 py-0.5 text-sm outline-none focus:ring-1 focus:ring-primary ${className}`}
      />
    )
  }

  return (
    <span
      onClick={startEdit}
      className={`cursor-pointer rounded px-1 py-0.5 hover:bg-muted ${className}`}
      title='Click to edit'
    >
      {value || placeholder}
    </span>
  )
}

function formatActivity(
  activity: ActivityItem,
  t: (key: string) => string,
): string {
  const data = activity.data as Record<string, string>
  switch (activity.type) {
    case 'STATUS_CHANGE':
      return `${t('statusChange')}: ${data.from} → ${data.to}`
    case 'CREATED':
      return t('customerCreated')
    case 'NOTE':
      return t('noteAdded')
    case 'ASSIGNMENT':
      return t('assignmentChanged')
    default:
      return activity.type
  }
}
