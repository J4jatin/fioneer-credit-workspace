import { test, expect } from '@playwright/test'

test.describe('Loan Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for loans to load from API
    await page.waitForSelector('table', { timeout: 10_000 })
  })

  test('shows page title and navigation', async ({ page }) => {
    await expect(page.getByText('Fioneer Credit Workspace')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Loans' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Analytics' })).toBeVisible()
  })

  test('loads loan list with correct columns', async ({ page }) => {
    await expect(page.getByText('Commercial Real Estate Loans')).toBeVisible()
    await expect(page.getByText('BORROWER')).toBeVisible()
    await expect(page.getByText('LOAN AMOUNT')).toBeVisible()
    await expect(page.getByText('STAGE')).toBeVisible()
    // Pre-seeded data
    await expect(page.getByText('Anna Müller')).toBeVisible()
    await expect(page.getByText('Thomas Weber')).toBeVisible()
  })

  test('displays correct stage badges', async ({ page }) => {
    await expect(page.getByText('ACTIVE').first()).toBeVisible()
    await expect(page.getByText('REVIEW').first()).toBeVisible()
    await expect(page.getByText('APPROVED').first()).toBeVisible()
  })

  test('filters loans by stage', async ({ page }) => {
    // Click REVIEW filter
    await page.getByRole('button', { name: 'REVIEW' }).click()
    await page.waitForTimeout(500)

    // Only Thomas Weber should be visible (REVIEW stage)
    await expect(page.getByText('Thomas Weber')).toBeVisible()
    await expect(page.getByText('Anna Müller')).not.toBeVisible()
  })

  test('filters loans by ACTIVE stage', async ({ page }) => {
    await page.getByRole('button', { name: 'ACTIVE' }).click()
    await page.waitForTimeout(500)

    await expect(page.getByText('Anna Müller')).toBeVisible()
    await expect(page.getByText('Thomas Weber')).not.toBeVisible()
  })

  test('resets filter with ALL button', async ({ page }) => {
    // Filter first
    await page.getByRole('button', { name: 'REVIEW' }).click()
    await page.waitForTimeout(300)
    // Reset
    await page.getByRole('button', { name: 'ALL' }).click()
    await page.waitForTimeout(500)

    await expect(page.getByText('Anna Müller')).toBeVisible()
    await expect(page.getByText('Thomas Weber')).toBeVisible()
  })

  test('searches loans by borrower name', async ({ page }) => {
    await page.getByPlaceholder('Search borrower or address...').fill('Anna')
    await page.waitForTimeout(600)

    await expect(page.getByText('Anna Müller')).toBeVisible()
    await expect(page.getByText('Thomas Weber')).not.toBeVisible()
  })

  test('searches loans by address', async ({ page }) => {
    await page.getByPlaceholder('Search borrower or address...').fill('Dresden')
    await page.waitForTimeout(600)

    await expect(page.getByText('Anna Müller')).toBeVisible()
    await expect(page.getByText('Thomas Weber')).not.toBeVisible()
  })

  test('shows no results for unknown search term', async ({ page }) => {
    await page.getByPlaceholder('Search borrower or address...').fill('XXXXXXUNKNOWN')
    await page.waitForTimeout(600)
    await expect(page.getByText('No loans found')).toBeVisible()
  })

  test('creates a new loan', async ({ page }) => {
    await page.getByRole('button', { name: '+ New Loan' }).click()
    await expect(page.getByText('Create New Loan Application')).toBeVisible()

    await page.getByPlaceholder('e.g. Max Müller').fill('Test Borrower')
    await page.getByPlaceholder('e.g. Hauptstr. 1, Berlin').fill('Test Str. 1, Dresden')
    await page.getByPlaceholder('e.g. 500000').fill('300000')
    await page.getByPlaceholder('e.g. 3.5').fill('3.5')

    await page.getByRole('button', { name: 'Submit Application' }).click()
    await page.waitForTimeout(1000)

    // New loan should appear in the list
    await expect(page.getByText('Test Borrower')).toBeVisible()
  })

  test('navigates to loan detail on View click', async ({ page }) => {
    await page.getByRole('button', { name: 'View →' }).first().click()
    await expect(page).toHaveURL(/\/loans\//)
    await expect(page.getByText('Loan Lifecycle')).toBeVisible()
  })
})
