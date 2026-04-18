import type { GreenApiConfig, SendMessageResult } from './types'

const BASE_URL = 'https://api.green-api.com'

export async function sendMessage(
  config: GreenApiConfig,
  chatId: string,
  message: string,
): Promise<SendMessageResult> {
  const url = `${BASE_URL}/waInstance${config.instanceId}/sendMessage/${config.token}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  return response.json() as Promise<SendMessageResult>
}

export async function getInstanceStatus(
  config: GreenApiConfig,
): Promise<{ stateInstance: string }> {
  const url = `${BASE_URL}/waInstance${config.instanceId}/getStateInstance/${config.token}`
  const response = await fetch(url)
  return response.json() as Promise<{ stateInstance: string }>
}
