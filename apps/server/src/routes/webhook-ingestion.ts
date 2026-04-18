import { executeFlow, findMatchingFlows } from '@catalyst/automation'
import { handleWebhookIngestion } from '@catalyst/webhook'
import { Hono } from 'hono'

export const webhookIngestion = new Hono()

webhookIngestion.post('/:token', async (c) => {
  const token = c.req.param('token')
  const body = await c.req.json()

  const result = await handleWebhookIngestion(token, body as Record<string, unknown>)

  if (!result.success) {
    return c.json({ error: result.error }, 400)
  }

  // Fire automation triggers for NEW_CUSTOMER
  if (result.customerId && result.tenantId) {
    const flows = await findMatchingFlows({
      tenantId: result.tenantId,
      customerId: result.customerId,
      type: 'NEW_CUSTOMER',
      data: { source: 'WEBHOOK' },
    })
    for (const flow of flows) {
      executeFlow(flow, result.customerId).catch(console.error)
    }
  }

  return c.json({ success: true, customerId: result.customerId })
})
