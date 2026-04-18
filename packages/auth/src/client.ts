import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: typeof globalThis !== 'undefined' && 'location' in globalThis
    ? (globalThis as unknown as { location: { origin: string } }).location.origin
    : 'http://localhost:5173',
})
