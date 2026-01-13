// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Profile System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-tab="profile"]');
  });

  test.describe('Profile Tab UI', () => {
    test('should display profile section', async ({ page }) => {
      await expect(page.locator('#profileTab')).toBeVisible();
    });

    test('should have profile section', async ({ page }) => {
      await expect(page.locator('.profile-section')).toBeVisible();
    });

    test('should show logged out state when not authenticated', async ({ page }) => {
      await expect(page.locator('#profileLoggedOut')).toBeVisible();
    });
  });

  test.describe('Logged Out Profile', () => {
    test('should have hero section', async ({ page }) => {
      await expect(page.locator('.profile-hero')).toBeVisible();
    });

    test('should have globe icon', async ({ page }) => {
      await expect(page.locator('.hero-icon')).toContainText('🌍');
    });

    test('should have join title', async ({ page }) => {
      await expect(page.locator('.profile-hero h2')).toContainText('Join EcoVenture');
    });

    test('should have create account button', async ({ page }) => {
      await expect(page.locator('#showSignUpBtn')).toBeVisible();
    });

    test('should have sign in button', async ({ page }) => {
      await expect(page.locator('#showSignInBtn')).toBeVisible();
    });
  });

  test.describe('Auth Features Display', () => {
    test('should show auth features', async ({ page }) => {
      await expect(page.locator('.auth-features')).toBeVisible();
    });

    test('should mention cloud sync', async ({ page }) => {
      await expect(page.locator('.auth-features')).toContainText('Cloud sync');
    });

    test('should mention leaderboards', async ({ page }) => {
      await expect(page.locator('.auth-features')).toContainText('leaderboards');
    });

    test('should mention friends', async ({ page }) => {
      await expect(page.locator('.auth-features')).toContainText('friends');
    });

    test('should mention any device', async ({ page }) => {
      await expect(page.locator('.auth-features')).toContainText('any device');
    });
  });

  test.describe('Level Progress (Home Tab)', () => {
    test('should show current level', async ({ page }) => {
      await page.click('[data-tab="home"]');
      await expect(page.locator('#currentLevel')).toBeVisible();
    });

    test('should show next level', async ({ page }) => {
      await page.click('[data-tab="home"]');
      await expect(page.locator('#nextLevel')).toBeVisible();
    });

    test('should have progress bar', async ({ page }) => {
      await page.click('[data-tab="home"]');
      await expect(page.locator('#levelProgressFill')).toBeAttached();
    });
  });
});

test.describe('Stats Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('Home Stats Grid', () => {
    test('should display stats section', async ({ page }) => {
      await expect(page.locator('#statsSection')).toBeVisible();
    });

    test('should have 4 stat cards', async ({ page }) => {
      const cards = page.locator('.stat-card');
      await expect(cards).toHaveCount(4);
    });

    test('stat cards should have icons', async ({ page }) => {
      const icons = page.locator('.stat-icon');
      await expect(icons).toHaveCount(4);
    });

    test('stat cards should have values', async ({ page }) => {
      const values = page.locator('.stat-value');
      // May have more than 4 values if profile is also loaded
      const count = await values.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('stat cards should have labels', async ({ page }) => {
      const labels = page.locator('.stat-label');
      // May have more than 4 labels if profile is also loaded
      const count = await labels.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });
  });

  test.describe('Stat Card Content', () => {
    test('should show Points label', async ({ page }) => {
      await expect(page.locator('.stat-label')).toContainText(['Points']);
    });

    test('should show Submissions label', async ({ page }) => {
      await expect(page.locator('.stat-label')).toContainText(['Submissions']);
    });

    test('should show Day Streak label', async ({ page }) => {
      await expect(page.locator('.stat-label')).toContainText(['Day Streak']);
    });

    test('should show Level label', async ({ page }) => {
      await expect(page.locator('.stat-label')).toContainText(['Level']);
    });
  });

  test.describe('Stat Icons', () => {
    test('should have trophy icon for points', async ({ page }) => {
      await expect(page.locator('.stat-icon')).toContainText(['🏆']);
    });

    test('should have package icon for submissions', async ({ page }) => {
      await expect(page.locator('.stat-icon')).toContainText(['📦']);
    });

    test('should have fire icon for streak', async ({ page }) => {
      await expect(page.locator('.stat-icon')).toContainText(['🔥']);
    });
  });
});

test.describe('Level System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should start at Eco Beginner', async ({ page }) => {
    const level = await page.locator('#currentLevel').textContent();
    expect(level).toContain('Eco Beginner');
  });

  test('should show next level as Litter Picker', async ({ page }) => {
    const nextLevel = await page.locator('#nextLevel').textContent();
    expect(nextLevel).toContain('Litter Picker');
  });

  test('progress bar should start at 0%', async ({ page }) => {
    const fill = page.locator('#levelProgressFill');
    const style = await fill.getAttribute('style');
    expect(style).toContain('0%');
  });
});
