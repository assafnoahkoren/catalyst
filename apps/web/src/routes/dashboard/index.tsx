import { useTranslation } from '@catalyst/i18n'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className='text-2xl font-bold'>{t('dashboard')}</h1>
    </div>
  )
}
