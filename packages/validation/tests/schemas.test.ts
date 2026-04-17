import { describe, expect, it } from 'vitest'
import { signInSchema, signUpSchema, userSchema } from '../src'

describe('signUpSchema', () => {
  it('accepts valid input', () => {
    const result = signUpSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects short name', () => {
    const result = signUpSchema.safeParse({
      name: 'J',
      email: 'john@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      name: 'John',
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: '1234567',
    })
    expect(result.success).toBe(false)
  })
})

describe('signInSchema', () => {
  it('accepts valid input', () => {
    const result = signInSchema.safeParse({
      email: 'john@example.com',
      password: 'any',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'john@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('userSchema', () => {
  it('accepts valid user', () => {
    const result = userSchema.safeParse({
      id: '123',
      name: 'John',
      email: 'john@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    expect(result.success).toBe(true)
  })
})
