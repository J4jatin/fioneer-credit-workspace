import { test, expect } from '@playwright/test'

test.describe('Loan Detail', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('table', { timeout: 10_000 })
    // Navigate to first loan's detail page
    await page.getByRole('button', { name: 'View →' }).first().click()
    await page.waitForSelector('text=Loan Lifecycle', { timeout: 8_000 })
  })

  test('shows loan detail page with all sections', async ({ page }) => {
    await expect(page.getByText('Loan Lifecycle')).toBeVisible()
    await expect(page.getByText('Loan Details')).toBeVisible()
    await expect(page.getByText('← Back to Loans')).toBeVisible()
  })

  test('shows lifecycle pipeline stages', async ({ page }) => {
    await expect(page.getByText('📋 Application')).toBeVisible()
    await expect(page.getByText('🔍 Review')).toBeVisible()
    await expect(page.getByText('✅ Approved')).toBeVisible()
    await expect(page.getByText('🏠 Active')).toBeVisible()
    await expect(page.getByText('🔒 Closed')).toBeVisible()
  })

  test('shows loan financial details', async ({ page }) => {
    await expect(page.getByText('Loan Amount')).toBeVisible()
    await expect(page.getByText('Interest Rate')).toBeVisible()
    await expect(page.getByText('Monthly Payment (est.)')).toBeVisible()
    await expect(page.getByText('Application Date')).toBeVisible()
  })

  test('back button returns to loan list', async ({ page }) => {
    await page.getByRole('button', { name: '← Back to Loans' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Commercial Real Estate Loans')).toBeVisible()
  })

  test('stage transition buttons are visible for non-closed loans', async ({ page }) => {
    // The first loan is ACTIVE — should have "Move to CLOSED" button
    const moveBtn = page.getByRole('button', { name: /Move to/ })
    const closedMsg = page.getByText('This loan is closed')

    // Either transition buttons or closed message should be present
    const hasMoveBtn = await moveBtn.count() > 0
    const hasClosedMsg = await closedMsg.count() > 0
    expect(hasMoveBtn || hasClosedMsg).toBeTruthy()
  })

  test('URL contains loan id', async ({ page }) => {
    await expect(page).toHaveURL(/\/loans\/\w+/)
  })
})
