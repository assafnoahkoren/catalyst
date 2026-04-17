import { expect, test } from '@playwright/test'

test.describe('Auth pages', () => {
  test('login page has email and password fields', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible()
  })

  test('register page has name, email, and password fields', async ({ page }) => {
    await page.goto('/register')

    await expect(page.getByLabel('Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
  })

  test('login form validates required fields', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign In' }).click()

    // HTML5 validation prevents submission — email field should be invalid
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('register form validates required fields', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: 'Register' }).click()

    const nameInput = page.getByLabel('Name')
    await expect(nameInput).toHaveAttribute('required', '')
  })
})
