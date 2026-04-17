import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center gap-6 p-8'>
      <h1 className='text-4xl font-bold tracking-tight'>Catalyst</h1>
      <p className='text-lg text-muted-foreground'>
        Full-stack monorepo starter
      </p>
      <div className='flex gap-4'>
        <Link
          to='/login'
          className='rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'
        >
          Sign In
        </Link>
        <Link
          to='/register'
          className='rounded-md border border-input px-4 py-2 hover:bg-accent'
        >
          Register
        </Link>
      </div>
    </main>
  )
}
