// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('EcoVenture App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('Page Load & Header', () => {
    test('should load the app and display header', async ({ page }) => {
      await expect(page).toHaveTitle(/EcoVenture/);
      await expect(page.locator('.logo')).toContainText('EcoVenture');
    });

    test('should display points badge in header', async ({ page }) => {
      await expect(page.locator('#headerPoints')).toBeVisible();
      await expect(page.locator('#headerPoints')).toContainText('pts');
    });

    test('should display auth button', async ({ page }) => {
      await expect(page.locator('#authBtn')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should have all navigation tabs', async ({ page }) => {
      await expect(page.locator('[data-tab="home"]')).toBeVisible();
      await expect(page.locator('[data-tab="cleanups"]')).toBeVisible();
      await expect(page.locator('[data-tab="quests"]')).toBeVisible();
      await expect(page.locator('[data-tab="shop"]')).toBeVisible();
      await expect(page.locator('[data-tab="profile"]')).toBeVisible();
    });

    test('should switch to Cleanups tab when clicked', async ({ page }) => {
      await page.click('[data-tab="cleanups"]');
      await expect(page.locator('#cleanupsTab')).toBeVisible();
      await expect(page.locator('[data-tab="cleanups"]')).toHaveClass(/active/);
    });

    test('should switch to Quests tab when clicked', async ({ page }) => {
      await page.click('[data-tab="quests"]');
      await expect(page.locator('#questsTab')).toBeVisible();
      await expect(page.locator('[data-tab="quests"]')).toHaveClass(/active/);
    });

    test('should switch to Shop tab when clicked', async ({ page }) => {
      await page.click('[data-tab="shop"]');
      await expect(page.locator('#shopTab')).toBeVisible();
      await expect(page.locator('[data-tab="shop"]')).toHaveClass(/active/);
    });

    test('should switch to Profile tab when clicked', async ({ page }) => {
      await page.click('[data-tab="profile"]');
      await expect(page.locator('#profileTab')).toBeVisible();
      await expect(page.locator('[data-tab="profile"]')).toHaveClass(/active/);
    });

    test('should return to Home tab when clicked', async ({ page }) => {
      await page.click('[data-tab="profile"]');
      await page.click('[data-tab="home"]');
      await expect(page.locator('#homeTab')).toBeVisible();
      await expect(page.locator('[data-tab="home"]')).toHaveClass(/active/);
    });
  });

  test.describe('Home Tab - Camera Section', () => {
    test('should display camera section', async ({ page }) => {
      await expect(page.locator('#cameraSection')).toBeVisible();
    });

    test('should display video overlay initially', async ({ page }) => {
      await expect(page.locator('#videoOverlay')).toBeVisible();
    });

    test('should have camera control buttons', async ({ page }) => {
      await expect(page.locator('#switchCameraBtn')).toBeVisible();
      await expect(page.locator('#recordBtn')).toBeVisible();
      await expect(page.locator('#detectBtn')).toBeVisible();
    });

    test('should display instructions', async ({ page }) => {
      await expect(page.locator('#instructions')).toBeVisible();
      await expect(page.locator('#instructions h3')).toContainText('How to earn points');
    });
  });

  test.describe('Home Tab - Stats Section', () => {
    test('should display stats section', async ({ page }) => {
      await expect(page.locator('#statsSection')).toBeVisible();
    });

    test('should display all stat cards', async ({ page }) => {
      await expect(page.locator('#totalPoints')).toBeVisible();
      await expect(page.locator('#submissions')).toBeVisible();
      await expect(page.locator('#streak')).toBeVisible();
      await expect(page.locator('#levelName')).toBeVisible();
    });

    test('should display level progress', async ({ page }) => {
      await expect(page.locator('#levelProgress')).toBeVisible();
      await expect(page.locator('#currentLevel')).toBeVisible();
      await expect(page.locator('#nextLevel')).toBeVisible();
    });
  });

  test.describe('Auth Banner', () => {
    test('should display auth banner when not logged in', async ({ page }) => {
      await expect(page.locator('#authBanner')).toBeVisible();
      await expect(page.locator('#authBannerBtn')).toContainText('Sign In');
    });
  });

  test.describe('Cleanups Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-tab="cleanups"]');
    });

    test('should display cleanups section', async ({ page }) => {
      await expect(page.locator('.cleanups-section')).toBeVisible();
    });

    test('should have create cleanup button', async ({ page }) => {
      await expect(page.locator('#createCleanupBtn')).toBeVisible();
    });

    test('should have view toggle buttons', async ({ page }) => {
      await expect(page.locator('[data-view="upcoming"]')).toBeVisible();
      await expect(page.locator('[data-view="my-events"]')).toBeVisible();
    });

    test('should switch between upcoming and my events', async ({ page }) => {
      await page.click('[data-view="my-events"]');
      await expect(page.locator('[data-view="my-events"]')).toHaveClass(/active/);
      await expect(page.locator('#my-eventsCleanups')).toHaveClass(/active/);
    });
  });

  test.describe('Leaderboard Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => switchTab('leaderboard'));
    });

    test('should display leaderboard section', async ({ page }) => {
      await expect(page.locator('.leaderboard-section')).toBeVisible();
    });

    test('should have leaderboard toggle', async ({ page }) => {
      await expect(page.locator('.leaderboard-toggle')).toBeVisible();
    });
  });

  test.describe('Redeem Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => switchTab('redeem'));
    });

    test('should display redeem section', async ({ page }) => {
      await expect(page.locator('#redeemTab')).toBeVisible();
    });
  });

  test.describe('Profile Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-tab="profile"]');
    });

    test('should display profile section', async ({ page }) => {
      await expect(page.locator('#profileTab')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('.header')).toBeVisible();
      await expect(page.locator('.navbar')).toBeVisible();
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('.header')).toBeVisible();
      await expect(page.locator('.navbar')).toBeVisible();
    });
  });
});
