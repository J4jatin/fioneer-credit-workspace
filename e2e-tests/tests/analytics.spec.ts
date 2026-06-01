import { test, expect } from '@playwright/test'

test.describe('Analytics Panel', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/analytics')
    await page.waitForSelector('text=Portfolio Analytics', { timeout: 10_000 })
  })

  test('shows analytics page title', async ({ page }) => {
    await expect(page.getByText('Portfolio Analytics')).toBeVisible()
  })

  test('shows all four KPI cards', async ({ page }) => {
    await expect(page.getByText('Total Loans')).toBeVisible()
    await expect(page.getByText('Portfolio Value', { exact: true })).toBeVisible()
    await expect(page.getByText('Avg Interest Rate')).toBeVisible()
    await expect(page.getByText('Active Loans')).toBeVisible()
  })

  test('KPI values are non-zero', async ({ page }) => {
    // Total loans should show a number > 0
    const totalLoans = page.locator('.stat-card').first().locator('.stat-value')
    const value = await totalLoans.textContent()
    expect(Number(value)).toBeGreaterThan(0)
  })

  test('shows chart section headers', async ({ page }) => {
    await expect(page.getByText('Loans by Stage')).toBeVisible()
    await expect(page.getByText('Portfolio Value Distribution')).toBeVisible()
    await expect(page.getByText('Loan Value by Stage')).toBeVisible()
  })

  test('renders recharts SVG elements', async ({ page }) => {
    // Recharts renders SVG — verify charts actually rendered
    const svgs = page.locator('svg')
    const count = await svgs.count()
    expect(count).toBeGreaterThan(0)
  })

  test('navigation back to loans works', async ({ page }) => {
    await page.getByRole('link', { name: 'Loans' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Commercial Real Estate Loans')).toBeVisible()
  })
})
