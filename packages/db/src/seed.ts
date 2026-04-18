import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

async function seed() {
  console.log('Seeding database...')

  // Clean existing data (order matters for relations)
  await prisma.automationLog.deleteMany()
  await prisma.scheduledTask.deleteMany()
  await prisma.automationFlow.deleteMany()
  await prisma.webhookEndpoint.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.note.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.customerStatus.deleteMany()
  await prisma.customFieldDefinition.deleteMany()
  await prisma.knowledgeEntry.deleteMany()
  await prisma.tenantMember.deleteMany()
  await prisma.tenant.deleteMany()
  await prisma.verification.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data')

  // Create test user (id must be a string since Better Auth manages User IDs)
  const user = await prisma.user.create({
    data: {
      id: 'demo-user-seed-id-00001',
      name: 'Demo User',
      email: 'demo@catalyst.dev',
      emailVerified: true,
    },
  })

  // Create demo tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Company',
      slug: 'demo',
      language: 'en',
      plan: 'pro',
    },
  })

  // Add user as owner
  await prisma.tenantMember.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      role: 'OWNER',
      joinedAt: new Date(),
    },
  })

  // Create customer statuses
  const statuses = await Promise.all([
    prisma.customerStatus.create({
      data: { name: 'New', color: '#3B82F6', order: 0, isDefault: true, tenantId: tenant.id },
    }),
    prisma.customerStatus.create({
      data: { name: 'Contacted', color: '#8B5CF6', order: 1, tenantId: tenant.id },
    }),
    prisma.customerStatus.create({
      data: { name: 'Qualified', color: '#F59E0B', order: 2, tenantId: tenant.id },
    }),
    prisma.customerStatus.create({
      data: { name: 'Proposal', color: '#F97316', order: 3, tenantId: tenant.id },
    }),
    prisma.customerStatus.create({
      data: { name: 'Won', color: '#22C55E', order: 4, isClosed: true, tenantId: tenant.id },
    }),
    prisma.customerStatus.create({
      data: { name: 'Lost', color: '#EF4444', order: 5, isClosed: true, tenantId: tenant.id },
    }),
  ])

  // Create custom field definitions
  await prisma.customFieldDefinition.create({
    data: { name: 'Budget', key: 'budget', type: 'NUMBER', tenantId: tenant.id, order: 0 },
  })
  await prisma.customFieldDefinition.create({
    data: {
      name: 'Interest Level',
      key: 'interest_level',
      type: 'SELECT',
      options: ['Low', 'Medium', 'High'],
      tenantId: tenant.id,
      order: 1,
    },
  })

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '1234567890',
        tenantId: tenant.id,
        statusId: statuses[0]!.id,
        source: 'MANUAL',
        tags: ['vip'],
        customFields: { budget: 50000, interest_level: 'High' },
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '0987654321',
        tenantId: tenant.id,
        statusId: statuses[1]!.id,
        source: 'WEBHOOK',
        customFields: { budget: 20000, interest_level: 'Medium' },
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Carol Davis',
        email: 'carol@example.com',
        tenantId: tenant.id,
        statusId: statuses[2]!.id,
        source: 'MANUAL',
        customFields: { budget: 75000, interest_level: 'High' },
      },
    }),
    prisma.customer.create({
      data: {
        name: 'David Wilson',
        phone: '5551234567',
        tenantId: tenant.id,
        statusId: statuses[3]!.id,
        source: 'MANUAL',
        customFields: { budget: 10000, interest_level: 'Low' },
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Eve Martinez',
        email: 'eve@example.com',
        phone: '5559876543',
        tenantId: tenant.id,
        statusId: statuses[4]!.id,
        source: 'WEBHOOK',
        customFields: { budget: 100000, interest_level: 'High' },
      },
    }),
  ])

  // Create activities for customers
  for (const customer of customers) {
    await prisma.activity.create({
      data: {
        type: 'CREATED',
        tenantId: tenant.id,
        customerId: customer.id,
        actorId: user.id,
      },
    })
  }

  // Create a conversation with messages
  const conversation = await prisma.conversation.create({
    data: {
      tenantId: tenant.id,
      customerId: customers[0]!.id,
      channel: 'WHATSAPP',
      isBot: false,
    },
  })

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        direction: 'INBOUND',
        sender: 'CUSTOMER',
        body: 'Hi, I need help with pricing.',
      },
      {
        conversationId: conversation.id,
        direction: 'OUTBOUND',
        sender: 'BOT',
        body: 'Hello! I can help you with that. What product are you interested in?',
      },
      {
        conversationId: conversation.id,
        direction: 'INBOUND',
        sender: 'CUSTOMER',
        body: 'The enterprise plan.',
      },
      {
        conversationId: conversation.id,
        direction: 'OUTBOUND',
        sender: 'HUMAN',
        body: 'Great choice! Let me connect you with our sales team.',
      },
    ],
  })

  // Create a note
  await prisma.note.create({
    data: {
      body: 'Interested in enterprise plan. Follow up next week.',
      tenantId: tenant.id,
      customerId: customers[0]!.id,
      authorId: user.id,
    },
  })

  // Create a knowledge entry
  await prisma.knowledgeEntry.create({
    data: {
      title: 'Pricing FAQ',
      content:
        'Our enterprise plan starts at $99/month. It includes unlimited users, priority support, and custom integrations.',
      type: 'TEXT',
      chunkCount: 1,
      tenantId: tenant.id,
    },
  })

  // Create an automation flow
  await prisma.automationFlow.create({
    data: {
      name: 'Welcome New Customers',
      isActive: true,
      trigger: { type: 'NEW_CUSTOMER', config: {} },
      steps: [
        {
          action: 'SEND_WHATSAPP',
          config: { template: 'Welcome {{customer.name}}! How can we help you today?' },
        },
        { action: 'WAIT', config: { delayMs: 86400000 } },
        {
          action: 'SEND_WHATSAPP',
          config: {
            template: 'Hi {{customer.name}}, just checking in. Do you have any questions?',
          },
        },
      ],
      tenantId: tenant.id,
    },
  })

  // Create a webhook endpoint
  await prisma.webhookEndpoint.create({
    data: {
      token: 'demo-webhook-token-12345',
      fieldMapping: { name: 'name', email: 'email', phone: 'phone' },
      tenantId: tenant.id,
    },
  })

  console.log(`Created tenant: ${tenant.name} (${tenant.slug})`)
  console.log(`Created user: ${user.email} (${user.id})`)
  console.log(`Created ${customers.length} customers`)
  console.log(`Created ${statuses.length} statuses`)
  console.log('Created sample conversation, notes, knowledge entry, automation, webhook')
  console.log('\nSeed complete.')
  console.log('Note: Use the app to register/login — Better Auth handles password hashing.')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
