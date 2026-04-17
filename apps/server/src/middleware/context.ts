import type { Session } from '@catalyst/auth/server'

export interface Context {
  user: Session['user'] | null
  session: Session['session'] | null
}
