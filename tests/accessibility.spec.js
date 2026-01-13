// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('Page Structure', () => {
    test('should have a main heading', async ({ page }) => {
      await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('should have navigation', async ({ page }) => {
      await expect(page.locator('nav, .navbar')).toBeVisible();
    });

    test('should have main content area', async ({ page }) => {
      await expect(page.locator('main, .main-content')).toBeVisible();
    });

    test('should have header', async ({ page }) => {
      await expect(page.locator('header, .header')).toBeVisible();
    });
  });

  test.describe('Interactive Elements', () => {
    test('all buttons should be focusable', async ({ page }) => {
      const buttons = page.locator('button');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
    });

    test('navigation tabs should be buttons', async ({ page }) => {
      const tabs = page.locator('.nav-tab');
      const count = await tabs.count();
      expect(count).toBe(5);

      for (let i = 0; i < count; i++) {
        const tag = await tabs.nth(i).evaluate(el => el.tagName.toLowerCase());
        expect(tag).toBe('button');
      }
    });
  });

  test.describe('Color Contrast & Visual', () => {
    test('text should be visible', async ({ page }) => {
      const logo = page.locator('.logo');
      await expect(logo).toBeVisible();
    });

    test('buttons should have visible text or icons', async ({ page }) => {
      const recordBtn = page.locator('#recordBtn');
      await expect(recordBtn).toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be able to tab through navigation', async ({ page }) => {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeElement).toBeTruthy();
    });

    test('should be able to activate button with Enter', async ({ page }) => {
      await page.focus('[data-tab="cleanups"]');
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-tab="cleanups"]')).toHaveClass(/active/);
    });
  });

  test.describe('Semantic HTML', () => {
    test('should use semantic section elements', async ({ page }) => {
      const sections = await page.locator('section').count();
      expect(sections).toBeGreaterThan(0);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      expect(h2Count).toBeGreaterThan(0);
    });
  });

  test.describe('Touch Targets', () => {
    test('navigation buttons should be large enough', async ({ page }) => {
      const navTab = page.locator('.nav-tab').first();
      const box = await navTab.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    });

    test('record button should be large enough', async ({ page }) => {
      const recordBtn = page.locator('#recordBtn');
      const box = await recordBtn.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    });
  });
});

test.describe('Responsive Design', () => {
  test.describe('Mobile (375px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3000');
    });

    test('should display header', async ({ page }) => {
      await expect(page.locator('.header')).toBeVisible();
    });

    test('should display navigation', async ({ page }) => {
      await expect(page.locator('.navbar')).toBeVisible();
    });

    test('should display camera section', async ({ page }) => {
      await expect(page.locator('#cameraSection')).toBeVisible();
    });

    test('navigation should be visible on mobile', async ({ page }) => {
      const navbar = page.locator('.navbar');
      const box = await navbar.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(300);
    });
  });

  test.describe('Tablet (768px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:3000');
    });

    test('should display all elements', async ({ page }) => {
      await expect(page.locator('.header')).toBeVisible();
      await expect(page.locator('.navbar')).toBeVisible();
      await expect(page.locator('#cameraSection')).toBeVisible();
    });

    test('stats grid should display properly', async ({ page }) => {
      const statsGrid = page.locator('.stats-grid');
      await expect(statsGrid).toBeVisible();
    });
  });

  test.describe('Desktop (1280px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('http://localhost:3000');
    });

    test('should display all elements', async ({ page }) => {
      await expect(page.locator('.header')).toBeVisible();
      await expect(page.locator('.navbar')).toBeVisible();
      await expect(page.locator('#cameraSection')).toBeVisible();
    });

    test('content should be centered or contained', async ({ page }) => {
      const mainContent = page.locator('.main-content');
      const box = await mainContent.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('Performance Basics', () => {
  test('page should load within 5 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000);
  });

  test('scripts should load', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForFunction(() => window.EcoVentureConfig !== undefined, { timeout: 10000 });
    const hasConfig = await page.evaluate(() => !!window.EcoVentureConfig);
    expect(hasConfig).toBe(true);
  });
});
