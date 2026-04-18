import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc, trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/settings/custom-fields')({
  component: CustomFieldsPage,
})

interface FieldData {
  id: string
  name: string
  key: string
  type: string
  options: string[]
  isRequired: boolean
  order: number
}

const FIELD_TYPES = ['TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'BOOLEAN', 'URL', 'PHONE']

function CustomFieldsPage() {
  const { t } = useTranslation()
  const fieldsQuery = useQuery(trpc.customField.list.queryOptions())
  const fields = (fieldsQuery.data ?? []) as FieldData[]
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [type, setType] = useState('TEXT')

  function handleNameChange(value: string) {
    setName(value)
    setKey(value.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, ''))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    await trpcClient.customField.create.mutate({
      name,
      key,
      type: type as 'TEXT',
      order: fields.length,
    })
    setName('')
    setKey('')
    fieldsQuery.refetch()
  }

  async function handleDelete(id: string) {
    await trpcClient.customField.delete.mutate({ id })
    fieldsQuery.refetch()
  }

  return (
    <div className='max-w-lg space-y-6'>
      <h1 className='text-2xl font-bold'>{t('customFields')}</h1>

      <div className='space-y-2'>
        {fields.map((field) => (
          <div key={field.id} className='flex items-center justify-between rounded-md border p-3'>
            <div>
              <p className='text-sm font-medium'>{field.name}</p>
              <p className='text-xs text-muted-foreground'>{field.key} · {field.type}</p>
            </div>
            <div className='flex items-center gap-2'>
              {field.isRequired && (
                <span className='rounded bg-primary/10 px-2 py-0.5 text-xs text-primary'>
                  {t('required')}
                </span>
              )}
              <button
                onClick={() =>
                  handleDelete(field.id)}
                className='text-xs text-destructive hover:underline'
              >
                {t('deleteCustomer')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className='space-y-3'>
        <div className='space-y-1'>
          <label className='text-xs font-medium'>{t('fieldName')}</label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs font-medium'>{t('fieldKey')}</label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            pattern='[a-zA-Z][a-zA-Z0-9_]*'
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono'
          />
        </div>
        <div className='space-y-1'>
          <label className='text-xs font-medium'>{t('fieldType')}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          >
            {FIELD_TYPES.map((ft) => <option key={ft} value={ft}>{ft}</option>)}
          </select>
        </div>
        <button
          type='submit'
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
        >
          {t('addField')}
        </button>
      </form>
    </div>
  )
}
