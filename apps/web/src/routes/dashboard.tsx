import { authClient } from '@catalyst/auth/client'
import { useTranslation } from '@catalyst/i18n'
import { createFileRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

const NAV_ITEMS = [
  { key: 'dashboard', path: '/dashboard' },
  { key: 'customers', path: '/dashboard/customers' },
  { key: 'conversations', path: '/dashboard/conversations' },
  { key: 'knowledgeBase', path: '/dashboard/knowledge' },
  { key: 'automations', path: '/dashboard/automations' },
  { key: 'webhooks', path: '/dashboard/webhooks' },
  { key: 'settings', path: '/dashboard/settings' },
] as const

function DashboardLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleSignOut() {
    await authClient.signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className='flex h-screen'>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
          onKeyDown={() => {}}
          role='presentation'
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-60 flex-col border-e bg-card transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        }`}
      >
        <div className='flex h-14 items-center border-b px-4'>
          <span className='text-lg font-semibold'>{t('appName')}</span>
        </div>

        <nav className='flex-1 space-y-1 p-2'>
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path)
            return (
              <a
                key={item.key}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault()
                  setSidebarOpen(false)
                  navigate({ to: item.path as '/' })
                }}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {t(item.key)}
              </a>
            )
          })}
        </nav>

        <div className='border-t p-2'>
          <button
            onClick={handleSignOut}
            className='w-full rounded-md px-3 py-2 text-start text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <header className='flex h-14 items-center gap-4 border-b px-4'>
          <button
            onClick={() => setSidebarOpen(true)}
            className='text-muted-foreground lg:hidden'
          >
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M3 12h18M3 6h18M3 18h18' />
            </svg>
          </button>
          <div className='flex-1' />
          <input
            type='search'
            placeholder={t('search')}
            className='w-64 rounded-md border border-input bg-background px-3 py-1.5 text-sm'
          />
        </header>

        {/* Page content */}
        <main className='flex-1 overflow-auto p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
