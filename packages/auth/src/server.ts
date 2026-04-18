import { prisma } from '@catalyst/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // In production, send email via a service (e.g., Resend, SendGrid)
      // For now, log the reset URL for development
      console.log(`[Auth] Password reset link for ${user.email}: ${url}`)
    },
  },
  trustedOrigins: [process.env.CORS_ORIGIN ?? 'http://localhost:5173'],
})

export type Session = typeof auth.$Infer.Session
