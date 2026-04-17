import { expect, test } from '@playwright/test'

test.describe('Home page', () => {
  test('displays heading and navigation links', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Catalyst' })).toBeVisible()
    await expect(page.getByText('Full-stack monorepo starter')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible()
  })

  test('Sign In link navigates to login page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Sign In' }).click()
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
  })

  test('Register link navigates to register page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Register' }).click()
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
  })
})
