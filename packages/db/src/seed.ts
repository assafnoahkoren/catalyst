import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

async function seed() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.verification.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data')

  // Create test user (password will be set via Better Auth signup)
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@catalyst.dev',
      emailVerified: true,
    },
  })

  console.log(`Created user: ${user.email} (${user.id})`)
  console.log('\nSeed complete.')
  console.log('Note: Use the app to register/login — Better Auth handles password hashing.')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
