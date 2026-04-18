import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/automations/$flowId')({
  component: FlowEditorPage,
})

interface StepData {
  action: string
  config: Record<string, unknown>
}

interface FlowData {
  id: string
  name: string
  isActive: boolean
  trigger: { type: string; config: Record<string, unknown> }
  steps: StepData[]
}

const TRIGGER_TYPES = ['STATUS_CHANGE', 'NEW_CUSTOMER', 'MESSAGE_RECEIVED', 'TIME_BASED']
const ACTION_TYPES = ['SEND_WHATSAPP', 'CHANGE_STATUS', 'ASSIGN_TO', 'WAIT', 'CONDITION']

function FlowEditorPage() {
  const { flowId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const flowQuery = useQuery({
    queryKey: ['automation', 'getById', flowId] as const,
    queryFn: async (): Promise<FlowData> => {
      const res = await trpcClient.automation.getById.query({ id: flowId })
      return res as unknown as FlowData
    },
  })

  const flow = flowQuery.data
  const [name, setName] = useState('')
  const [triggerType, setTriggerType] = useState('')
  const [steps, setSteps] = useState<StepData[]>([])
  const [initialized, setInitialized] = useState(false)

  if (flow && !initialized) {
    setName(flow.name)
    setTriggerType(flow.trigger.type)
    setSteps(flow.steps)
    setInitialized(true)
  }

  function addStep() {
    setSteps([...steps, { action: 'SEND_WHATSAPP', config: { template: '' } }])
  }

  function removeStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index))
  }

  function updateStep(index: number, updates: Partial<StepData>) {
    setSteps(steps.map((s, i) => (i === index ? { ...s, ...updates } : s)))
  }

  async function handleSave() {
    await trpcClient.automation.update.mutate({
      id: flowId,
      name,
      trigger: { type: triggerType as 'STATUS_CHANGE', config: {} },
      steps: steps.map((s) => ({ action: s.action as 'SEND_WHATSAPP', config: s.config })),
    })
    navigate({ to: '/dashboard/automations' as '/' })
  }

  if (!flow) return null

  return (
    <div className='max-w-2xl space-y-6'>
      <div className='flex items-center gap-4'>
        <button
          onClick={() => navigate({ to: '/dashboard/automations' as '/' })}
          className='text-sm text-muted-foreground hover:text-foreground'
        >
          {t('back')}
        </button>
        <h1 className='text-2xl font-bold'>{t('automationFlows')}</h1>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>{t('flowName')}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>{t('trigger')}</label>
          <select
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value)}
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          >
            {TRIGGER_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className='space-y-3'>
          <label className='text-sm font-medium'>{t('steps')}</label>
          {steps.map((step, index) => (
            <div key={index} className='rounded-md border p-3'>
              <div className='flex items-center justify-between'>
                <select
                  value={step.action}
                  onChange={(e) => updateStep(index, { action: e.target.value })}
                  className='rounded border bg-background px-2 py-1 text-sm'
                >
                  {ACTION_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <button
                  onClick={() => removeStep(index)}
                  className='text-xs text-destructive'
                >
                  {t('remove')}
                </button>
              </div>

              {step.action === 'SEND_WHATSAPP' && (
                <div className='mt-2'>
                  <label className='text-xs text-muted-foreground'>{t('template')}</label>
                  <textarea
                    value={(step.config.template as string) ?? ''}
                    onChange={(e) =>
                      updateStep(index, { config: { ...step.config, template: e.target.value } })}
                    rows={2}
                    className='w-full rounded border bg-background px-2 py-1 text-sm'
                    placeholder='Hello {{customer.name}}!'
                  />
                </div>
              )}

              {step.action === 'WAIT' && (
                <div className='mt-2'>
                  <label className='text-xs text-muted-foreground'>{t('delayHours')}</label>
                  <input
                    type='number'
                    value={((step.config.delayMs as number) ?? 0) / 3600000}
                    onChange={(e) =>
                      updateStep(index, { config: { delayMs: Number(e.target.value) * 3600000 } })}
                    className='w-24 rounded border bg-background px-2 py-1 text-sm'
                  />
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addStep}
            className='w-full rounded-md border border-dashed py-2 text-sm text-muted-foreground hover:text-foreground'
          >
            + {t('addStep')}
          </button>
        </div>

        <button
          onClick={handleSave}
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground'
        >
          {t('save')}
        </button>
      </div>
    </div>
  )
}
