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

  return c.json({ success: true, customerId: result.customerId })
})
