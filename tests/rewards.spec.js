// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Rewards & Redemption System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-tab="redeem"]');
  });

  test.describe('Redeem Tab UI', () => {
    test('should display redeem section', async ({ page }) => {
      await expect(page.locator('#redeemTab')).toBeVisible();
    });

    test('should have rewards title', async ({ page }) => {
      await expect(page.locator('#redeemTab h2, .redeem-section h2')).toBeVisible();
    });

    test('should have rewards grid', async ({ page }) => {
      await expect(page.locator('.rewards-grid, #rewardsGrid')).toBeAttached();
    });

    test('should have points balance card', async ({ page }) => {
      await expect(page.locator('.points-balance-card')).toBeVisible();
    });

    test('should show available points', async ({ page }) => {
      await expect(page.locator('#redeemPointsBalance')).toBeAttached();
    });
  });

  test.describe('Rewards Categories', () => {
    test('should have category buttons', async ({ page }) => {
      await expect(page.locator('.rewards-categories')).toBeVisible();
    });

    test('should have All category', async ({ page }) => {
      await expect(page.locator('[data-category="all"]')).toBeVisible();
    });

    test('should have Gift Cards category', async ({ page }) => {
      await expect(page.locator('[data-category="gift_card"]')).toBeVisible();
    });

    test('should have Donations category', async ({ page }) => {
      await expect(page.locator('[data-category="donation"]')).toBeVisible();
    });

    test('All should be active by default', async ({ page }) => {
      await expect(page.locator('[data-category="all"]')).toHaveClass(/active/);
    });
  });

  test.describe('Redemption History', () => {
    test('should have redemption history section', async ({ page }) => {
      await expect(page.locator('.redemption-history')).toBeVisible();
    });

    test('should have history title', async ({ page }) => {
      await expect(page.locator('.redemption-history h3')).toContainText('Redemption History');
    });

    test('should have history list', async ({ page }) => {
      await expect(page.locator('#redemptionHistoryList')).toBeAttached();
    });
  });
});

test.describe('Rewards Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load EcoVentureRewards module', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureRewards !== undefined, { timeout: 10000 });
    const rewards = await page.evaluate(() => window.EcoVentureRewards);
    expect(rewards).toBeTruthy();
  });

  test('should have reward functions', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureRewards !== undefined, { timeout: 10000 });
    const functions = await page.evaluate(() => {
      const r = window.EcoVentureRewards;
      if (!r) return null;
      return {
        hasInit: typeof r.init === 'function',
        hasLoad: typeof r.loadRewards === 'function' || typeof r.getAvailableRewards === 'function'
      };
    });

    if (functions) {
      expect(functions.hasInit || functions.hasLoad).toBe(true);
    }
  });
});

test.describe('Points Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display points in header', async ({ page }) => {
    await expect(page.locator('#headerPoints')).toBeVisible();
    await expect(page.locator('#headerPoints')).toContainText('pts');
  });

  test('should display total points in stats', async ({ page }) => {
    await expect(page.locator('#totalPoints')).toBeVisible();
  });

  test('points should be a number', async ({ page }) => {
    const points = await page.locator('#totalPoints').textContent();
    expect(parseInt(points)).not.toBeNaN();
  });
});
