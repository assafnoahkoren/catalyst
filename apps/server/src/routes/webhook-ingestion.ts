import { executeFlow, findMatchingFlows } from '@catalyst/automation'
import { prisma } from '@catalyst/db'
import { handleWebhookIngestion } from '@catalyst/webhook'
import crypto from 'crypto'
import { Hono } from 'hono'

export const webhookIngestion = new Hono()

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

webhookIngestion.post('/:token', async (c) => {
  const token = c.req.param('token')
  const rawBody = await c.req.text()

  // Look up endpoint to check if it has a secret
  const endpoint = await prisma.webhookEndpoint.findUnique({ where: { token } })
  if (!endpoint || !endpoint.isActive) {
    return c.json({ error: 'Invalid webhook' }, 400)
  }

  // Verify HMAC signature if secret is set
  if (endpoint.secret) {
    const signature = c.req.header('x-webhook-signature') ?? ''
    if (!signature) {
      return c.json({ error: 'Missing X-Webhook-Signature header' }, 401)
    }
    try {
      if (!verifySignature(rawBody, signature, endpoint.secret)) {
        return c.json({ error: 'Invalid signature' }, 401)
      }
    } catch {
      return c.json({ error: 'Invalid signature' }, 401)
    }
  }

  const body = JSON.parse(rawBody) as Record<string, unknown>
  const result = await handleWebhookIngestion(token, body)

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
