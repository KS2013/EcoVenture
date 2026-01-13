// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Leaderboard System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-tab="leaderboard"]');
  });

  test.describe('Leaderboard UI', () => {
    test('should display leaderboard section', async ({ page }) => {
      await expect(page.locator('.leaderboard-section')).toBeVisible();
    });

    test('should have leaderboard title', async ({ page }) => {
      await expect(page.locator('.leaderboard-section h2')).toContainText('Leaderboards');
    });

    test('should have toggle buttons', async ({ page }) => {
      await expect(page.locator('.leaderboard-toggle')).toBeVisible();
    });

    test('should have area leaderboard option', async ({ page }) => {
      await expect(page.locator('[data-leaderboard="area"]')).toBeVisible();
    });

    test('should have friends leaderboard option', async ({ page }) => {
      await expect(page.locator('[data-leaderboard="friends"]')).toBeVisible();
    });

    test('should have global leaderboard option', async ({ page }) => {
      await expect(page.locator('[data-leaderboard="global"]')).toBeVisible();
    });
  });

  test.describe('Leaderboard Toggle', () => {
    test('area should be active by default', async ({ page }) => {
      await expect(page.locator('[data-leaderboard="area"]')).toHaveClass(/active/);
    });

    test('clicking friends should switch view', async ({ page }) => {
      await page.click('[data-leaderboard="friends"]');
      await expect(page.locator('[data-leaderboard="friends"]')).toHaveClass(/active/);
    });

    test('clicking global should switch view', async ({ page }) => {
      await page.click('[data-leaderboard="global"]');
      await expect(page.locator('[data-leaderboard="global"]')).toHaveClass(/active/);
    });

    test('clicking area after other should switch back', async ({ page }) => {
      await page.click('[data-leaderboard="friends"]');
      await page.click('[data-leaderboard="area"]');
      await expect(page.locator('[data-leaderboard="area"]')).toHaveClass(/active/);
    });
  });

  test.describe('Area Leaderboard', () => {
    test('should have area leaderboard container', async ({ page }) => {
      await expect(page.locator('#areaLeaderboard')).toBeVisible();
    });

    test('should have area name display', async ({ page }) => {
      await expect(page.locator('#currentAreaName')).toBeAttached();
    });

    test('should have change area button', async ({ page }) => {
      await expect(page.locator('#changeAreaBtn')).toBeAttached();
    });

    test('should have your area rank card', async ({ page }) => {
      await expect(page.locator('#yourAreaRank')).toBeAttached();
    });
  });

  test.describe('Friends Leaderboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-leaderboard="friends"]');
    });

    test('should have friends leaderboard container', async ({ page }) => {
      await expect(page.locator('#friendsLeaderboard')).toHaveClass(/active/);
    });

    test('should have friend code card', async ({ page }) => {
      await expect(page.locator('#friendCodeCard')).toBeAttached();
    });

    test('should have add friend button', async ({ page }) => {
      await expect(page.locator('#addFriendBtn')).toBeVisible();
    });

    test('should have copy friend code button', async ({ page }) => {
      await expect(page.locator('#copyFriendCodeBtn')).toBeVisible();
    });
  });

  test.describe('Global Leaderboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-leaderboard="global"]');
    });

    test('should have global leaderboard container', async ({ page }) => {
      await expect(page.locator('#globalLeaderboard')).toHaveClass(/active/);
    });

    test('should have your global rank card', async ({ page }) => {
      await expect(page.locator('#yourGlobalRank')).toBeAttached();
    });

    test('should have global leaderboard list', async ({ page }) => {
      await expect(page.locator('#globalLeaderboardList')).toBeAttached();
    });
  });
});

test.describe('Friends System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load EcoVentureFriends module', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureFriends !== undefined, { timeout: 10000 });
    const friends = await page.evaluate(() => window.EcoVentureFriends);
    expect(friends).toBeTruthy();
  });

  test('should have friend functions', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureFriends !== undefined, { timeout: 10000 });
    const functions = await page.evaluate(() => {
      const f = window.EcoVentureFriends;
      if (!f) return null;
      return {
        hasSetupListeners: typeof f.setupListeners === 'function'
      };
    });

    if (functions) {
      expect(functions.hasSetupListeners).toBe(true);
    }
  });
});

test.describe('Leaderboard Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForFunction(() => window.EcoVentureLeaderboard !== undefined, { timeout: 10000 });
  });

  test('should load EcoVentureLeaderboard module', async ({ page }) => {
    const leaderboard = await page.evaluate(() => window.EcoVentureLeaderboard);
    expect(leaderboard).toBeTruthy();
  });

  test('should have leaderboard functions', async ({ page }) => {
    const functions = await page.evaluate(() => {
      const lb = window.EcoVentureLeaderboard;
      if (!lb) return null;
      return {
        hasInit: typeof lb.init === 'function',
        hasLoad: typeof lb.loadLeaderboard === 'function' || typeof lb.loadAreaLeaderboard === 'function'
      };
    });

    if (functions) {
      expect(functions.hasInit || functions.hasLoad).toBe(true);
    }
  });
});
