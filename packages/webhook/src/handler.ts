import { prisma } from '@catalyst/db'

export interface WebhookResult {
  success: boolean
  customerId?: string
  error?: string
}

export async function handleWebhookIngestion(
  token: string,
  body: Record<string, unknown>,
): Promise<WebhookResult> {
  const endpoint = await prisma.webhookEndpoint.findUnique({ where: { token } })
  if (!endpoint || !endpoint.isActive) {
    return { success: false, error: 'Invalid or inactive webhook' }
  }

  const fieldMapping = endpoint.fieldMapping as Record<string, string>

  // Map external fields to customer fields
  const name = String(body[fieldMapping.name ?? 'name'] ?? body.name ?? 'Unknown')
  const email = body[fieldMapping.email ?? 'email'] as string | undefined
  const phone = body[fieldMapping.phone ?? 'phone'] as string | undefined

  // Get default status
  const defaultStatus = await prisma.customerStatus.findFirst({
    where: { tenantId: endpoint.tenantId, isDefault: true },
  })
  if (!defaultStatus) {
    return { success: false, error: 'No default status configured' }
  }

  // Build custom fields from remaining mapped fields
  const reservedKeys = new Set(['name', 'email', 'phone'])
  const customFields: Record<string, unknown> = {}
  for (const [externalKey, customerField] of Object.entries(fieldMapping)) {
    if (!reservedKeys.has(customerField) && body[externalKey] !== undefined) {
      customFields[customerField] = body[externalKey]
    }
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      email: email ?? null,
      phone: phone ?? null,
      tenantId: endpoint.tenantId,
      statusId: defaultStatus.id,
      source: 'WEBHOOK',
      customFields: customFields as never,
    },
  })

  await prisma.activity.create({
    data: {
      type: 'CREATED',
      tenantId: endpoint.tenantId,
      customerId: customer.id,
    },
  })

  return { success: true, customerId: customer.id }
}
