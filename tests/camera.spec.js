// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Camera & Recording System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test.describe('Camera UI Elements', () => {
    test('should have video preview element', async ({ page }) => {
      await expect(page.locator('#videoPreview')).toBeAttached();
    });

    test('should have video overlay', async ({ page }) => {
      await expect(page.locator('#videoOverlay')).toBeVisible();
    });

    test('should have recording indicator', async ({ page }) => {
      await expect(page.locator('#recordingIndicator')).toBeAttached();
    });

    test('should have rec time display', async ({ page }) => {
      await expect(page.locator('#recTime')).toBeAttached();
    });

    test('should have switch camera button', async ({ page }) => {
      const btn = page.locator('#switchCameraBtn');
      await expect(btn).toBeVisible();
      await expect(btn).toHaveAttribute('title', 'Switch Camera');
    });

    test('should have record button', async ({ page }) => {
      await expect(page.locator('#recordBtn')).toBeVisible();
    });

    test('should have detect button', async ({ page }) => {
      const btn = page.locator('#detectBtn');
      await expect(btn).toBeVisible();
      await expect(btn).toHaveAttribute('title', 'Live Detection');
    });

    test('record button should be disabled initially', async ({ page }) => {
      await expect(page.locator('#recordBtn')).toBeDisabled();
    });

    test('detect button should be disabled initially', async ({ page }) => {
      await expect(page.locator('#detectBtn')).toBeDisabled();
    });
  });

  test.describe('Video Container', () => {
    test('should have video container', async ({ page }) => {
      await expect(page.locator('.video-container')).toBeVisible();
    });

    test('video should have autoplay attribute', async ({ page }) => {
      await expect(page.locator('#videoPreview')).toHaveAttribute('autoplay', '');
    });

    test('video should have playsinline attribute', async ({ page }) => {
      await expect(page.locator('#videoPreview')).toHaveAttribute('playsinline', '');
    });

    test('video should be muted', async ({ page }) => {
      await expect(page.locator('#videoPreview')).toHaveAttribute('muted', '');
    });
  });

  test.describe('Processing Section', () => {
    test('should have processing section', async ({ page }) => {
      await expect(page.locator('#processingSection')).toBeAttached();
    });

    test('processing section should be hidden initially', async ({ page }) => {
      await expect(page.locator('#processingSection')).toHaveClass(/hidden/);
    });

    test('should have processing status text', async ({ page }) => {
      await expect(page.locator('#processingStatus')).toBeAttached();
    });

    test('should have progress bar', async ({ page }) => {
      await expect(page.locator('#progressFill')).toBeAttached();
    });

    test('should have spinner animation', async ({ page }) => {
      await expect(page.locator('.spinner')).toBeAttached();
    });
  });

  test.describe('Results Section', () => {
    test('should have results section', async ({ page }) => {
      await expect(page.locator('#resultsSection')).toBeAttached();
    });

    test('results section should be hidden initially', async ({ page }) => {
      await expect(page.locator('#resultsSection')).toHaveClass(/hidden/);
    });

    test('should have results card', async ({ page }) => {
      await expect(page.locator('#resultsCard')).toBeAttached();
    });

    test('should have new recording button', async ({ page }) => {
      await expect(page.locator('#newRecordingBtn')).toBeAttached();
      await expect(page.locator('#newRecordingBtn')).toContainText('Record Another');
    });
  });

  test.describe('Instructions', () => {
    test('should display instructions section', async ({ page }) => {
      await expect(page.locator('#instructions')).toBeVisible();
    });

    test('should have correct title', async ({ page }) => {
      await expect(page.locator('#instructions h3')).toContainText('How to earn points');
    });

    test('should have 4 steps', async ({ page }) => {
      const steps = page.locator('#instructions ol li');
      await expect(steps).toHaveCount(4);
    });

    test('should mention public place', async ({ page }) => {
      await expect(page.locator('#instructions')).toContainText('public place');
    });

    test('should mention recording', async ({ page }) => {
      await expect(page.locator('#instructions')).toContainText('Record');
    });

    test('should mention disposal', async ({ page }) => {
      await expect(page.locator('#instructions')).toContainText('disposal');
    });

    test('should mention rewards', async ({ page }) => {
      await expect(page.locator('#instructions')).toContainText('rewards');
    });
  });

  test.describe('Camera Overlay Interaction', () => {
    test('clicking overlay should attempt camera start', async ({ page }) => {
      const overlay = page.locator('#videoOverlay');
      await expect(overlay).toBeVisible();
      await overlay.click();
      await page.waitForTimeout(500);
    });

    test('overlay should have camera icon', async ({ page }) => {
      await expect(page.locator('.camera-icon')).toBeVisible();
    });

    test('overlay should have tap instruction text', async ({ page }) => {
      await expect(page.locator('.overlay-content p')).toContainText('Tap to start camera');
    });
  });
});

test.describe('Camera Module Functions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load EcoVentureCamera module', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureCamera !== undefined, { timeout: 10000 });
    const camera = await page.evaluate(() => window.EcoVentureCamera);
    expect(camera).toBeTruthy();
  });

  test('should have required camera functions', async ({ page }) => {
    await page.waitForFunction(() => window.EcoVentureCamera !== undefined, { timeout: 10000 });
    const functions = await page.evaluate(() => {
      const cam = window.EcoVentureCamera;
      if (!cam) return null;
      return {
        hasInit: typeof cam.init === 'function' || typeof cam.initCamera === 'function',
        hasStop: typeof cam.stopCamera === 'function' || typeof cam.stop === 'function'
      };
    });

    if (functions) {
      expect(functions.hasInit || functions.hasStop).toBe(true);
    }
  });
});

test.describe('Recording Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('MAX_RECORDING_TIME should be 30 seconds', async ({ page }) => {
    const config = await page.evaluate(() => window.EcoVentureConfig.CONFIG);
    expect(config.MAX_RECORDING_TIME).toBe(30);
  });

  test('MIN_RECORDING_TIME should be 3 seconds', async ({ page }) => {
    const config = await page.evaluate(() => window.EcoVentureConfig.CONFIG);
    expect(config.MIN_RECORDING_TIME).toBe(3);
  });

  test('DETECTION_INTERVAL should be 250ms', async ({ page }) => {
    const config = await page.evaluate(() => window.EcoVentureConfig.CONFIG);
    expect(config.DETECTION_INTERVAL).toBe(250);
  });

  test('MIN_CONFIDENCE should be 0.10', async ({ page }) => {
    const config = await page.evaluate(() => window.EcoVentureConfig.CONFIG);
    expect(config.MIN_CONFIDENCE).toBe(0.10);
  });
});
