import { prisma } from '@catalyst/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.CORS_ORIGIN ?? 'http://localhost:5173'],
})

export type Session = typeof auth.$Infer.Session
