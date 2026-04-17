import { expect, test } from '@playwright/test'

test.describe('Health checks', () => {
  test('server health endpoint responds', async ({ request }) => {
    const response = await request.get('http://localhost:3001/health')
    expect(response.ok()).toBeTruthy()
    expect(await response.json()).toEqual({ status: 'ok' })
  })

  test('web app loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Catalyst')
  })
})
