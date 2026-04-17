import { authClient } from '@catalyst/auth/client'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await authClient.signUp.email({
      name,
      email,
      password,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error.message ?? 'Registration failed')
      return
    }

    navigate({ to: '/' })
  }

  return (
    <main className='flex min-h-screen items-center justify-center p-8'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-bold'>Create Account</h1>
          <p className='text-sm text-muted-foreground'>
            Fill in your details to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <label htmlFor='name' className='text-sm font-medium'>Name</label>
            <input
              id='name'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder='Your name'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium'>Email</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder='you@example.com'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='password' className='text-sm font-medium'>Password</label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              placeholder='••••••••'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className='text-center text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link to='/login' className='text-primary underline'>
            Sign In
          </Link>
        </p>
      </div>
    </main>
  )
}
