import { protectedProcedure, router } from '../lib/trpc'

export const authRouter = router({
  getSession: protectedProcedure.query(({ ctx }) => {
    return {
      user: ctx.user,
      session: ctx.session,
    }
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),
})
