// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Cleanups & Events System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-tab="cleanups"]');
  });

  test.describe('Cleanups Tab UI', () => {
    test('should display cleanups section', async ({ page }) => {
      await expect(page.locator('#cleanupsTab')).toBeVisible();
    });

    test('should have cleanups header', async ({ page }) => {
      await expect(page.locator('.cleanups-header')).toBeVisible();
    });

    test('should have create cleanup button', async ({ page }) => {
      await expect(page.locator('#createCleanupBtn')).toBeVisible();
    });

    test('create button should contain plus icon', async ({ page }) => {
      await expect(page.locator('#createCleanupBtn')).toContainText('Create');
    });
  });

  test.describe('Cleanup Views Toggle', () => {
    test('should have upcoming toggle', async ({ page }) => {
      await expect(page.locator('[data-view="upcoming"]')).toBeVisible();
    });

    test('should have my events toggle', async ({ page }) => {
      await expect(page.locator('[data-view="my-events"]')).toBeVisible();
    });

    test('upcoming should be active by default', async ({ page }) => {
      await expect(page.locator('[data-view="upcoming"]')).toHaveClass(/active/);
    });

    test('clicking my events should switch view', async ({ page }) => {
      await page.click('[data-view="my-events"]');
      await expect(page.locator('[data-view="my-events"]')).toHaveClass(/active/);
    });
  });

  test.describe('Upcoming Cleanups', () => {
    test('should have upcoming cleanups container', async ({ page }) => {
      await expect(page.locator('#upcomingCleanups')).toBeVisible();
    });

    test('should have cleanup list', async ({ page }) => {
      await expect(page.locator('#upcomingCleanupsList')).toBeAttached();
    });

    test('should show empty state when no events', async ({ page }) => {
      const emptyState = page.locator('#upcomingCleanupsList .cleanup-empty');
      await expect(emptyState).toBeAttached();
    });
  });

  test.describe('My Events Section', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-view="my-events"]');
    });

    test('should have my events container', async ({ page }) => {
      await expect(page.locator('#my-eventsCleanups')).toHaveClass(/active/);
    });

    test('should have my events list', async ({ page }) => {
      await expect(page.locator('#myEventsList')).toBeAttached();
    });
  });

  test.describe('Cleanup Info Card', () => {
    test('should have info card', async ({ page }) => {
      await expect(page.locator('.cleanup-info-card')).toBeVisible();
    });

    test('should explain how it works', async ({ page }) => {
      await expect(page.locator('.cleanup-info-card h4')).toContainText('How it works');
    });

    test('should mention bonus points', async ({ page }) => {
      await expect(page.locator('.cleanup-info-card')).toContainText('bonus points');
    });

    test('should mention check in', async ({ page }) => {
      await expect(page.locator('.cleanup-info-card')).toContainText('Check in');
    });
  });

  test.describe('Create Cleanup Modal', () => {
    test('should have create cleanup modal', async ({ page }) => {
      await expect(page.locator('#createCleanupModal')).toBeAttached();
    });

    test('clicking create should trigger action', async ({ page }) => {
      // The create button might show an auth modal instead if not logged in
      await page.click('#createCleanupBtn');
      await page.waitForTimeout(300);

      // Either the cleanup modal or auth modal should appear
      const cleanupModal = page.locator('#createCleanupModal');
      const authModal = page.locator('#authModal');

      const cleanupVisible = await cleanupModal.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && !el.classList.contains('hidden');
      });

      const authVisible = await authModal.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && !el.classList.contains('hidden');
      });

      // Either one should be visible (requires auth to create)
      expect(cleanupVisible || authVisible).toBe(true);
    });
  });
});

test.describe('Cleanups Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load EcoVentureCleanups module', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureCleanups !== undefined, { timeout: 10000 });
    const cleanups = await page.evaluate(() => window.EcoVentureCleanups);
    expect(cleanups).toBeTruthy();
  });

  test('should have cleanup functions', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureCleanups !== undefined, { timeout: 10000 });
    const functions = await page.evaluate(() => {
      const c = window.EcoVentureCleanups;
      if (!c) return null;
      return {
        hasSetupListeners: typeof c.setupListeners === 'function',
        hasLoadData: typeof c.loadData === 'function'
      };
    });

    if (functions) {
      expect(functions.hasSetupListeners || functions.hasLoadData).toBe(true);
    }
  });
});
