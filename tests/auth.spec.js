// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Authentication System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('Auth UI Elements', () => {
    test('should display auth button in header', async ({ page }) => {
      await expect(page.locator('#authBtn')).toBeVisible();
    });

    test('should display auth banner', async ({ page }) => {
      await expect(page.locator('#authBanner')).toBeVisible();
    });

    test('auth banner should have sign in button', async ({ page }) => {
      await expect(page.locator('#authBannerBtn')).toBeVisible();
      await expect(page.locator('#authBannerBtn')).toContainText('Sign In');
    });

    test('auth banner should have lock icon', async ({ page }) => {
      await expect(page.locator('.auth-banner-icon')).toContainText('🔐');
    });

    test('auth banner should encourage sign in', async ({ page }) => {
      await expect(page.locator('.auth-banner-text')).toContainText('Sign in to compete');
    });
  });

  test.describe('Auth Modal', () => {
    test('should have auth modal in DOM', async ({ page }) => {
      await expect(page.locator('#authModal')).toBeAttached();
    });

    test('auth modal should be hidden initially', async ({ page }) => {
      const modal = page.locator('#authModal');
      const isHidden = await modal.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display === 'none' || el.classList.contains('hidden');
      });
      expect(isHidden).toBe(true);
    });

    test('clicking auth button should open modal', async ({ page }) => {
      await page.click('#authBtn');
      await page.waitForTimeout(300);
      const modal = page.locator('#authModal');
      const isVisible = await modal.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && !el.classList.contains('hidden');
      });
      expect(isVisible).toBe(true);
    });

    test('clicking auth banner button should open modal', async ({ page }) => {
      await page.click('#authBannerBtn');
      await page.waitForTimeout(300);
      const modal = page.locator('#authModal');
      const isVisible = await modal.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && !el.classList.contains('hidden');
      });
      expect(isVisible).toBe(true);
    });
  });

  test.describe('Profile Tab Auth State', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('[data-tab="profile"]');
    });

    test('should show logged out state', async ({ page }) => {
      await expect(page.locator('#profileLoggedOut')).toBeVisible();
    });

    test('should have create account button', async ({ page }) => {
      await expect(page.locator('#showSignUpBtn')).toBeVisible();
    });

    test('should have sign in button', async ({ page }) => {
      await expect(page.locator('#showSignInBtn')).toBeVisible();
    });

    test('should show auth features', async ({ page }) => {
      await expect(page.locator('.auth-features')).toBeVisible();
    });

    test('should mention cloud sync', async ({ page }) => {
      await expect(page.locator('.auth-features')).toContainText('Cloud sync');
    });

    test('should mention leaderboards', async ({ page }) => {
      await expect(page.locator('.auth-features')).toContainText('leaderboards');
    });
  });
});

test.describe('Auth Module Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load EcoVentureAuth module', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureAuth !== undefined, { timeout: 10000 });
    const auth = await page.evaluate(() => window.EcoVentureAuth);
    expect(auth).toBeTruthy();
  });

  test('should have init function', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureAuth !== undefined, { timeout: 10000 });
    const hasInit = await page.evaluate(() => {
      const auth = window.EcoVentureAuth;
      return typeof auth.init === 'function' || typeof auth.isConfigured === 'function';
    });
    expect(hasInit).toBe(true);
  });

  test('should have auth related functions', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureAuth !== undefined, { timeout: 10000 });
    const functions = await page.evaluate(() => {
      const auth = window.EcoVentureAuth;
      return {
        hasSignUp: typeof auth.signUp === 'function',
        hasSignIn: typeof auth.signIn === 'function',
        hasSignOut: typeof auth.signOut === 'function',
        hasGetUser: typeof auth.getCurrentUser === 'function',
        hasIsConfigured: typeof auth.isConfigured === 'function'
      };
    });

    // At least some auth functions should exist
    const hasAnyAuth = functions.hasSignUp || functions.hasSignIn || functions.hasSignOut || functions.hasGetUser || functions.hasIsConfigured;
    expect(hasAnyAuth).toBe(true);
  });

  test('should have profile functions', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureAuth !== undefined, { timeout: 10000 });
    const functions = await page.evaluate(() => {
      const auth = window.EcoVentureAuth;
      return {
        hasGetProfile: typeof auth.getUserProfile === 'function',
        hasUpdateProfile: typeof auth.updateUserProfile === 'function',
        hasSaveSubmission: typeof auth.saveSubmission === 'function'
      };
    });

    const hasAnyProfile = functions.hasGetProfile || functions.hasUpdateProfile || functions.hasSaveSubmission;
    expect(hasAnyProfile).toBe(true);
  });

  test('should have submission and stats functions', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureAuth !== undefined, { timeout: 10000 });
    const functions = await page.evaluate(() => {
      const auth = window.EcoVentureAuth;
      return {
        hasCreateSubmission: typeof auth.createSubmission === 'function',
        hasGetHistory: typeof auth.getSubmissionHistory === 'function',
        hasGetWeeklyStats: typeof auth.getWeeklyStats === 'function'
      };
    });
    expect(functions.hasCreateSubmission || functions.hasGetHistory || functions.hasGetWeeklyStats).toBe(true);
  });
});
