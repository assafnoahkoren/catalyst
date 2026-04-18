import { useTranslation } from '@catalyst/i18n'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { trpc, trpcClient } from '../../../lib/trpc'

export const Route = createFileRoute('/dashboard/conversations/')({
  component: ConversationsPage,
})

interface ConversationData {
  id: string
  isBot: boolean
  updatedAt: string
  customer: { id: string; name: string; phone: string | null }
}

interface MessageData {
  id: string
  direction: string
  sender: string
  body: string
  sentAt: string
}

function ConversationsPage() {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const conversationsQuery = useQuery(trpc.conversation.list.queryOptions())
  const conversations = (conversationsQuery.data ?? []) as ConversationData[]

  const messagesQuery = useQuery({
    queryKey: ['conversation', 'messages', selectedId],
    queryFn: async (): Promise<{ items: MessageData[] }> => {
      if (!selectedId) return { items: [] }
      const res = await trpcClient.conversation.getMessages.query({
        conversationId: selectedId,
        page: 1,
        pageSize: 50,
      })
      return res as unknown as { items: MessageData[] }
    },
    enabled: !!selectedId,
  })

  const messages = messagesQuery.data?.items ?? []
  const selected = conversations.find((c) => c.id === selectedId)

  const [newMessage, setNewMessage] = useState('')

  async function handleSend() {
    if (!newMessage.trim() || !selectedId) return
    await trpcClient.conversation.sendMessage.mutate({
      conversationId: selectedId,
      body: newMessage,
    })
    setNewMessage('')
    messagesQuery.refetch()
  }

  async function handleToggleBot() {
    if (!selectedId || !selected) return
    await trpcClient.conversation.toggleBot.mutate({
      conversationId: selectedId,
      isBot: !selected.isBot,
    })
    conversationsQuery.refetch()
  }

  return (
    <div className='flex h-[calc(100vh-8rem)] gap-4'>
      {/* Conversation list */}
      <div className='w-72 flex-shrink-0 space-y-1 overflow-y-auto rounded-lg border p-2'>
        {conversations.length === 0 && (
          <p className='py-4 text-center text-xs text-muted-foreground'>{t('noConversations')}</p>
        )}
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setSelectedId(conv.id)}
            className={`w-full rounded-md p-3 text-start transition-colors ${
              selectedId === conv.id ? 'bg-primary/10' : 'hover:bg-muted'
            }`}
          >
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium'>{conv.customer.name}</p>
              <span
                className={`h-2 w-2 rounded-full ${conv.isBot ? 'bg-green-500' : 'bg-orange-500'}`}
              />
            </div>
            <p className='text-xs text-muted-foreground'>{conv.customer.phone}</p>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className='flex flex-1 flex-col rounded-lg border'>
        {!selectedId
          ? (
            <div className='flex flex-1 items-center justify-center text-sm text-muted-foreground'>
              {t('noMessages')}
            </div>
          )
          : (
            <>
              {/* Chat header */}
              <div className='flex items-center justify-between border-b px-4 py-2'>
                <div>
                  <p className='text-sm font-medium'>{selected?.customer.name}</p>
                  <span className='text-xs text-muted-foreground'>
                    {selected?.isBot ? t('botActive') : t('humanMode')}
                  </span>
                </div>
                <button
                  onClick={handleToggleBot}
                  className='rounded-md border px-3 py-1 text-xs font-medium'
                >
                  {selected?.isBot ? t('takeOver') : t('returnToBot')}
                </button>
              </div>

              {/* Messages */}
              <div className='flex-1 space-y-2 overflow-y-auto p-4'>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                        msg.direction === 'OUTBOUND'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{msg.body}</p>
                      <p className='mt-1 text-xs opacity-70'>
                        {msg.sender === 'BOT' ? t('botActive') : ''}
                        {new Date(msg.sentAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className='flex gap-2 border-t p-3'>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('typeMessage')}
                  className='flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm'
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50'
                >
                  {t('send')}
                </button>
              </div>
            </>
          )}
      </div>
    </div>
  )
}
