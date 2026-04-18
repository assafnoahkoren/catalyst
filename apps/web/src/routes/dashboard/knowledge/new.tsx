import { useTranslation } from '@catalyst/i18n'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/knowledge/new')({
  component: NewKnowledgePage,
})

type EntryType = 'TEXT' | 'QA_PAIR' | 'URL'

function NewKnowledgePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [entryType, setEntryType] = useState<EntryType>('TEXT')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (entryType === 'URL') {
        await trpcClient.knowledge.addUrl.mutate({ title, url })
      } else {
        await trpcClient.knowledge.createText.mutate({
          title,
          content: entryType === 'QA_PAIR' ? `${question}\n${answer}` : content,
          type: entryType,
          question: entryType === 'QA_PAIR' ? question : undefined,
          answer: entryType === 'QA_PAIR' ? answer : undefined,
        })
      }
      navigate({ to: '/dashboard/knowledge' as '/' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-lg space-y-6'>
      <h1 className='text-2xl font-bold'>{t('addEntry')}</h1>

      <div className='flex gap-2'>
        {(['TEXT', 'QA_PAIR', 'URL'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setEntryType(type)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              entryType === type
                ? 'bg-primary text-primary-foreground'
                : 'border text-muted-foreground hover:text-foreground'
            }`}
          >
            {type === 'TEXT' ? t('textEntry') : type === 'QA_PAIR' ? t('qaEntry') : t('urlEntry')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>{t('title')}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          />
        </div>

        {entryType === 'TEXT' && (
          <div className='space-y-2'>
            <label className='text-sm font-medium'>{t('content')}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
            />
          </div>
        )}

        {entryType === 'QA_PAIR' && (
          <>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>{t('question')}</label>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>{t('answer')}</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                rows={4}
                className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
              />
            </div>
          </>
        )}

        {entryType === 'URL' && (
          <div className='space-y-2'>
            <label className='text-sm font-medium'>{t('url')}</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              type='url'
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
            />
          </div>
        )}

        <button
          type='submit'
          disabled={loading}
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
        >
          {loading
            ? t('adding')
            : entryType === 'TEXT'
            ? t('addText')
            : entryType === 'QA_PAIR'
            ? t('addQA')
            : t('addUrl')}
        </button>
      </form>
    </div>
  )
}
