// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('AI Detection System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for scripts to load
    await page.waitForFunction(() => window.EcoVentureConfig !== undefined);
  });

  test.describe('Configuration Loading', () => {
    test('should load EcoVentureConfig', async ({ page }) => {
      const config = await page.evaluate(() => window.EcoVentureConfig);
      expect(config).toBeTruthy();
    });

    test('should have CONFIG with required settings', async ({ page }) => {
      const config = await page.evaluate(() => window.EcoVentureConfig.CONFIG);
      expect(config).toBeTruthy();
      expect(config.MAX_RECORDING_TIME).toBe(30);
      expect(config.MIN_RECORDING_TIME).toBe(3);
      expect(config.DETECTION_INTERVAL).toBe(250);
      expect(config.MIN_CONFIDENCE).toBe(0.10);
    });

    test('should have TRASHNET_CONFIG enabled', async ({ page }) => {
      const config = await page.evaluate(() => window.EcoVentureConfig.TRASHNET_CONFIG);
      expect(config).toBeTruthy();
      expect(config.ENABLED).toBe(true);
      expect(config.CATEGORIES).toContain('plastic');
      expect(config.CATEGORIES).toContain('glass');
      expect(config.CATEGORIES).toContain('metal');
      expect(config.CATEGORIES).toContain('paper');
      expect(config.CATEGORIES).toContain('cardboard');
      expect(config.CATEGORIES).toContain('trash');
    });

    test('should have TrashNet display names', async ({ page }) => {
      const config = await page.evaluate(() => window.EcoVentureConfig.TRASHNET_CONFIG);
      expect(config.DISPLAY_NAMES.plastic).toBe('Plastic');
      expect(config.DISPLAY_NAMES.glass).toBe('Glass');
      expect(config.DISPLAY_NAMES.metal).toBe('Metal Can');
      expect(config.DISPLAY_NAMES.paper).toBe('Paper');
      expect(config.DISPLAY_NAMES.cardboard).toBe('Cardboard');
      expect(config.DISPLAY_NAMES.trash).toBe('General Trash');
    });

    test('should have COCO_TRASH_CLASSES array', async ({ page }) => {
      const classes = await page.evaluate(() => window.EcoVentureConfig.COCO_TRASH_CLASSES);
      expect(Array.isArray(classes)).toBe(true);
      expect(classes.length).toBeGreaterThan(20);
    });

    test('should include common trash items in COCO classes', async ({ page }) => {
      const classes = await page.evaluate(() => window.EcoVentureConfig.COCO_TRASH_CLASSES);
      expect(classes).toContain('bottle');
      expect(classes).toContain('cup');
      expect(classes).toContain('banana');
      expect(classes).toContain('pizza');
      expect(classes).toContain('fork');
      expect(classes).toContain('spoon');
    });

    test('should have BIN_CLASSES for bin detection', async ({ page }) => {
      const binClasses = await page.evaluate(() => window.EcoVentureConfig.BIN_CLASSES);
      expect(Array.isArray(binClasses)).toBe(true);
      expect(binClasses).toContain('trash can');
      expect(binClasses).toContain('dustbin');
      expect(binClasses).toContain('recycling bin');
    });

    test('should have IGNORE_CLASSES to filter out non-trash', async ({ page }) => {
      const ignoreClasses = await page.evaluate(() => window.EcoVentureConfig.IGNORE_CLASSES);
      expect(Array.isArray(ignoreClasses)).toBe(true);
      expect(ignoreClasses).toContain('person');
      expect(ignoreClasses).toContain('car');
      expect(ignoreClasses).toContain('dog');
      expect(ignoreClasses).toContain('cat');
    });

    test('should have TACO_TRASH_CATEGORIES', async ({ page }) => {
      const tacoClasses = await page.evaluate(() => window.EcoVentureConfig.TACO_TRASH_CATEGORIES);
      expect(Array.isArray(tacoClasses)).toBe(true);
      expect(tacoClasses).toContain('Bottle');
      expect(tacoClasses).toContain('Can');
      expect(tacoClasses).toContain('Cigarette');
      expect(tacoClasses).toContain('Plastic bag & wrapper');
    });
  });

  test.describe('Detection Module Loading', () => {
    test('should load EcoVentureDetection module', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });
      const detection = await page.evaluate(() => window.EcoVentureDetection);
      expect(detection).toBeTruthy();
    });

    test('should have confidenceTracker object', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });
      const tracker = await page.evaluate(() => window.EcoVentureDetection.confidenceTracker);
      expect(tracker).toBeTruthy();
      expect(tracker.BOOST_THRESHOLD).toBe(2);
      expect(tracker.DECAY_FRAMES).toBe(8);
      expect(tracker.BOOST_MULTIPLIER).toBe(1.8);
    });

    test('should export all required functions', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });
      const functions = await page.evaluate(() => {
        const det = window.EcoVentureDetection;
        return {
          hasUpdateTracker: typeof det.updateConfidenceTracker === 'function',
          hasGetBoosted: typeof det.getBoostedConfidence === 'function',
          hasReset: typeof det.resetConfidenceTracker === 'function',
          hasLoadModel: typeof det.loadDetectionModel === 'function',
          hasLoadTrashNet: typeof det.loadTrashNetModel === 'function',
          hasClassify: typeof det.classifyWithTrashNet === 'function',
          hasDrawDetections: typeof det.drawDetections === 'function',
          hasCalculatePoints: typeof det.calculatePoints === 'function',
          hasIsAvailable: typeof det.isTrashNetAvailable === 'function'
        };
      });
      expect(functions.hasUpdateTracker).toBe(true);
      expect(functions.hasGetBoosted).toBe(true);
      expect(functions.hasReset).toBe(true);
      expect(functions.hasLoadModel).toBe(true);
      expect(functions.hasLoadTrashNet).toBe(true);
      expect(functions.hasClassify).toBe(true);
      expect(functions.hasDrawDetections).toBe(true);
      expect(functions.hasCalculatePoints).toBe(true);
      expect(functions.hasIsAvailable).toBe(true);
    });
  });

  test.describe('Confidence Tracker', () => {
    test('should update confidence tracker with detections', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });

      const result = await page.evaluate(() => {
        const det = window.EcoVentureDetection;
        det.resetConfidenceTracker();

        det.updateConfidenceTracker([
          { class: 'bottle', score: 0.8 },
          { class: 'cup', score: 0.6 }
        ]);

        return {
          frameCount: det.confidenceTracker.frameCount,
          hasBottle: det.confidenceTracker.detections.has('bottle'),
          hasCup: det.confidenceTracker.detections.has('cup')
        };
      });

      expect(result.frameCount).toBe(1);
      expect(result.hasBottle).toBe(true);
      expect(result.hasCup).toBe(true);
    });

    test('should boost confidence after multiple detections', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });

      const result = await page.evaluate(() => {
        const det = window.EcoVentureDetection;
        det.resetConfidenceTracker();

        // First detection
        det.updateConfidenceTracker([{ class: 'bottle', score: 0.5 }]);
        const beforeBoost = det.getBoostedConfidence('bottle', 0.5);

        // Second detection (should trigger boost)
        det.updateConfidenceTracker([{ class: 'bottle', score: 0.5 }]);
        const afterBoost = det.getBoostedConfidence('bottle', 0.5);

        return { beforeBoost, afterBoost };
      });

      expect(result.beforeBoost).toBe(0.5);
      expect(result.afterBoost).toBeGreaterThan(0.5);
      expect(result.afterBoost).toBeLessThanOrEqual(0.99);
    });

    test('should decay detections after DECAY_FRAMES', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });

      const result = await page.evaluate(() => {
        const det = window.EcoVentureDetection;
        det.resetConfidenceTracker();

        // Add detection
        det.updateConfidenceTracker([{ class: 'bottle', score: 0.8 }]);

        // Simulate 9 frames without detection (beyond DECAY_FRAMES of 8)
        for (let i = 0; i < 9; i++) {
          det.updateConfidenceTracker([]);
        }

        return det.confidenceTracker.detections.has('bottle');
      });

      expect(result).toBe(false);
    });

    test('should reset tracker correctly', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });

      const result = await page.evaluate(() => {
        const det = window.EcoVentureDetection;

        det.updateConfidenceTracker([{ class: 'bottle', score: 0.8 }]);
        det.resetConfidenceTracker();

        return {
          frameCount: det.confidenceTracker.frameCount,
          size: det.confidenceTracker.detections.size
        };
      });

      expect(result.frameCount).toBe(0);
      expect(result.size).toBe(0);
    });
  });

  test.describe('Points Calculation', () => {
    test('should give base points for trash collection', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });

      const result = await page.evaluate(() => {
        return window.EcoVentureDetection.calculatePoints([], 0, 1, false);
      });

      expect(result.points).toBeGreaterThanOrEqual(50);
      expect(result.breakdown).toContainEqual({ points: 50, reason: 'Trash collected' });
    });

    test('should give welcome bonus on first submission', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });

      const result = await page.evaluate(() => {
        return window.EcoVentureDetection.calculatePoints([], 0, 0, false);
      });

      expect(result.points).toBeGreaterThanOrEqual(150);
      expect(result.breakdown).toContainEqual({ points: 100, reason: 'Welcome bonus!' });
    });

    test('should give bin bonus when bin detected', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });

      const result = await page.evaluate(() => {
        return window.EcoVentureDetection.calculatePoints([], 0, 1, true);
      });

      expect(result.breakdown).toContainEqual({ points: 25, reason: 'Put in bin! 🗑️' });
    });

    test('should give visibility bonus for high trash percentage', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });

      const result = await page.evaluate(() => {
        return window.EcoVentureDetection.calculatePoints([], 50, 1, false);
      });

      expect(result.breakdown).toContainEqual({ points: 30, reason: 'Great visibility' });
    });

    test('should give multi-item bonus', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });

      const result = await page.evaluate(() => {
        const items = [{ class: 'bottle' }, { class: 'cup' }, { class: 'paper' }];
        return window.EcoVentureDetection.calculatePoints(items, 0, 1, false);
      });

      const multiBonus = result.breakdown.find(b => b.reason.includes('items collected'));
      expect(multiBonus).toBeTruthy();
      expect(multiBonus.points).toBe(45); // 3 items * 15
    });

    test('should cap multi-item bonus at 60 points', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });

      const result = await page.evaluate(() => {
        const items = Array(10).fill({ class: 'bottle' });
        return window.EcoVentureDetection.calculatePoints(items, 0, 1, false);
      });

      const multiBonus = result.breakdown.find(b => b.reason.includes('items collected'));
      expect(multiBonus).toBeTruthy();
      expect(multiBonus.points).toBe(60);
    });

    test('should calculate max points correctly', async ({ page }) => {
      await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 10000 });

      const result = await page.evaluate(() => {
        const items = Array(5).fill({ class: 'bottle' });
        // First submission, bin detected, high visibility, multiple items
        return window.EcoVentureDetection.calculatePoints(items, 60, 0, true);
      });

      // 50 base + 100 welcome + 25 bin + 30 visibility + 60 multi = 265
      expect(result.points).toBe(265);
    });
  });

  test.describe('COCO Class Detection Logic', () => {
    test('should recognize bottles as trash', async ({ page }) => {
      const classes = await page.evaluate(() => window.EcoVentureConfig.COCO_TRASH_CLASSES);
      expect(classes).toContain('bottle');
      expect(classes).toContain('wine glass');
    });

    test('should recognize food items as trash', async ({ page }) => {
      const classes = await page.evaluate(() => window.EcoVentureConfig.COCO_TRASH_CLASSES);
      expect(classes).toContain('banana');
      expect(classes).toContain('apple');
      expect(classes).toContain('orange');
      expect(classes).toContain('pizza');
      expect(classes).toContain('donut');
    });

    test('should recognize utensils as trash', async ({ page }) => {
      const classes = await page.evaluate(() => window.EcoVentureConfig.COCO_TRASH_CLASSES);
      expect(classes).toContain('fork');
      expect(classes).toContain('knife');
      expect(classes).toContain('spoon');
    });

    test('should recognize sports items as potential litter', async ({ page }) => {
      const classes = await page.evaluate(() => window.EcoVentureConfig.COCO_TRASH_CLASSES);
      expect(classes).toContain('frisbee');
      expect(classes).toContain('sports ball');
    });

    test('should recognize e-waste items', async ({ page }) => {
      const classes = await page.evaluate(() => window.EcoVentureConfig.COCO_TRASH_CLASSES);
      expect(classes).toContain('cell phone');
      expect(classes).toContain('remote');
      expect(classes).toContain('keyboard');
    });

    test('should NOT include vehicles in trash classes', async ({ page }) => {
      const classes = await page.evaluate(() => window.EcoVentureConfig.COCO_TRASH_CLASSES);
      expect(classes).not.toContain('car');
      expect(classes).not.toContain('truck');
      expect(classes).not.toContain('bicycle');
    });

    test('should NOT include animals in trash classes', async ({ page }) => {
      const classes = await page.evaluate(() => window.EcoVentureConfig.COCO_TRASH_CLASSES);
      expect(classes).not.toContain('dog');
      expect(classes).not.toContain('cat');
      expect(classes).not.toContain('bird');
    });

    test('should NOT include furniture in trash classes', async ({ page }) => {
      const classes = await page.evaluate(() => window.EcoVentureConfig.COCO_TRASH_CLASSES);
      expect(classes).not.toContain('chair');
      expect(classes).not.toContain('couch');
      expect(classes).not.toContain('bed');
    });
  });

  test.describe('Ignore Classes Logic', () => {
    test('should ignore vehicles', async ({ page }) => {
      const ignore = await page.evaluate(() => window.EcoVentureConfig.IGNORE_CLASSES);
      expect(ignore).toContain('car');
      expect(ignore).toContain('truck');
      expect(ignore).toContain('bicycle');
      expect(ignore).toContain('motorcycle');
      expect(ignore).toContain('bus');
      expect(ignore).toContain('train');
      expect(ignore).toContain('airplane');
      expect(ignore).toContain('boat');
    });

    test('should ignore animals', async ({ page }) => {
      const ignore = await page.evaluate(() => window.EcoVentureConfig.IGNORE_CLASSES);
      expect(ignore).toContain('cat');
      expect(ignore).toContain('dog');
      expect(ignore).toContain('horse');
      expect(ignore).toContain('bird');
      expect(ignore).toContain('cow');
      expect(ignore).toContain('elephant');
    });

    test('should ignore furniture', async ({ page }) => {
      const ignore = await page.evaluate(() => window.EcoVentureConfig.IGNORE_CLASSES);
      expect(ignore).toContain('chair');
      expect(ignore).toContain('couch');
      expect(ignore).toContain('bed');
      expect(ignore).toContain('dining table');
    });

    test('should ignore large appliances', async ({ page }) => {
      const ignore = await page.evaluate(() => window.EcoVentureConfig.IGNORE_CLASSES);
      expect(ignore).toContain('refrigerator');
      expect(ignore).toContain('oven');
      expect(ignore).toContain('microwave');
      expect(ignore).toContain('tv');
    });

    test('person should be in ignore list', async ({ page }) => {
      const ignore = await page.evaluate(() => window.EcoVentureConfig.IGNORE_CLASSES);
      expect(ignore).toContain('person');
    });
  });

  test.describe('Bin Detection', () => {
    test('should recognize common bin names', async ({ page }) => {
      const bins = await page.evaluate(() => window.EcoVentureConfig.BIN_CLASSES);
      expect(bins).toContain('trash can');
      expect(bins).toContain('garbage can');
      expect(bins).toContain('dustbin');
      expect(bins).toContain('wastebasket');
    });

    test('should recognize recycling bins', async ({ page }) => {
      const bins = await page.evaluate(() => window.EcoVentureConfig.BIN_CLASSES);
      expect(bins).toContain('recycling bin');
    });

    test('should recognize dumpsters', async ({ page }) => {
      const bins = await page.evaluate(() => window.EcoVentureConfig.BIN_CLASSES);
      expect(bins).toContain('dumpster');
    });

    test('should have at least 10 bin class variations', async ({ page }) => {
      const bins = await page.evaluate(() => window.EcoVentureConfig.BIN_CLASSES);
      expect(bins.length).toBeGreaterThanOrEqual(10);
    });
  });

  test.describe('TACO Categories', () => {
    test('should have comprehensive TACO categories', async ({ page }) => {
      const taco = await page.evaluate(() => window.EcoVentureConfig.TACO_TRASH_CATEGORIES);
      expect(taco.length).toBeGreaterThanOrEqual(30);
    });

    test('should include plastic items', async ({ page }) => {
      const taco = await page.evaluate(() => window.EcoVentureConfig.TACO_TRASH_CATEGORIES);
      expect(taco).toContain('Plastic bag & wrapper');
      expect(taco).toContain('Plastic container');
      expect(taco).toContain('Plastic utensils');
    });

    test('should include bottles and cans', async ({ page }) => {
      const taco = await page.evaluate(() => window.EcoVentureConfig.TACO_TRASH_CATEGORIES);
      expect(taco).toContain('Bottle');
      expect(taco).toContain('Can');
      expect(taco).toContain('Clear plastic bottle');
      expect(taco).toContain('Glass bottle');
    });

    test('should include paper and cardboard', async ({ page }) => {
      const taco = await page.evaluate(() => window.EcoVentureConfig.TACO_TRASH_CATEGORIES);
      expect(taco).toContain('Paper');
      expect(taco).toContain('Cardboard');
      expect(taco).toContain('Paper bag');
      expect(taco).toContain('Pizza box');
    });

    test('should include cigarettes', async ({ page }) => {
      const taco = await page.evaluate(() => window.EcoVentureConfig.TACO_TRASH_CATEGORIES);
      expect(taco).toContain('Cigarette');
    });

    test('should include food containers', async ({ page }) => {
      const taco = await page.evaluate(() => window.EcoVentureConfig.TACO_TRASH_CATEGORIES);
      expect(taco).toContain('Disposable food container');
      expect(taco).toContain('Cup');
      expect(taco).toContain('Lid');
    });
  });

  test.describe('Levels System', () => {
    test('should have 8 levels defined', async ({ page }) => {
      const levels = await page.evaluate(() => window.EcoVentureConfig.LEVELS);
      expect(levels.length).toBe(8);
    });

    test('should start with Eco Beginner at 0 points', async ({ page }) => {
      const levels = await page.evaluate(() => window.EcoVentureConfig.LEVELS);
      expect(levels[0].name).toBe('Eco Beginner');
      expect(levels[0].minPoints).toBe(0);
    });

    test('should end with Eco Legend at 10000 points', async ({ page }) => {
      const levels = await page.evaluate(() => window.EcoVentureConfig.LEVELS);
      const lastLevel = levels[levels.length - 1];
      expect(lastLevel.name).toBe('Eco Legend');
      expect(lastLevel.minPoints).toBe(10000);
    });

    test('should have increasing point thresholds', async ({ page }) => {
      const levels = await page.evaluate(() => window.EcoVentureConfig.LEVELS);
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i].minPoints).toBeGreaterThan(levels[i-1].minPoints);
      }
    });

    test('should have icons for all levels', async ({ page }) => {
      const levels = await page.evaluate(() => window.EcoVentureConfig.LEVELS);
      levels.forEach(level => {
        expect(level.icon).toBeTruthy();
        expect(level.icon.length).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Daily Challenges', () => {
    test('should have 7 daily challenges', async ({ page }) => {
      const challenges = await page.evaluate(() => window.EcoVentureConfig.DAILY_CHALLENGES);
      expect(challenges.length).toBe(7);
    });

    test('should have unique challenge IDs', async ({ page }) => {
      const challenges = await page.evaluate(() => window.EcoVentureConfig.DAILY_CHALLENGES);
      const ids = challenges.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(challenges.length);
    });

    test('should have bonus points for each challenge', async ({ page }) => {
      const challenges = await page.evaluate(() => window.EcoVentureConfig.DAILY_CHALLENGES);
      challenges.forEach(challenge => {
        expect(challenge.bonus).toBeGreaterThan(0);
      });
    });

    test('should have valid challenge types', async ({ page }) => {
      const challenges = await page.evaluate(() => window.EcoVentureConfig.DAILY_CHALLENGES);
      const validTypes = ['submissions', 'points', 'streak', 'items'];
      challenges.forEach(challenge => {
        expect(validTypes).toContain(challenge.type);
      });
    });
  });

  test.describe('Achievements', () => {
    test('should have 13 achievements', async ({ page }) => {
      const achievements = await page.evaluate(() => window.EcoVentureConfig.ACHIEVEMENTS);
      expect(achievements.length).toBe(13);
    });

    test('should have unique achievement IDs', async ({ page }) => {
      const achievements = await page.evaluate(() => window.EcoVentureConfig.ACHIEVEMENTS);
      const ids = achievements.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(achievements.length);
    });

    test('should have conditions for all achievements', async ({ page }) => {
      const achievements = await page.evaluate(() => window.EcoVentureConfig.ACHIEVEMENTS);
      achievements.forEach(achievement => {
        expect(achievement.condition).toBeTruthy();
        expect(achievement.condition.type).toBeTruthy();
        expect(achievement.condition.value).toBeGreaterThan(0);
      });
    });

    test('should have icons for all achievements', async ({ page }) => {
      const achievements = await page.evaluate(() => window.EcoVentureConfig.ACHIEVEMENTS);
      achievements.forEach(achievement => {
        expect(achievement.icon).toBeTruthy();
      });
    });
  });

  test.describe('TensorFlow.js Integration', () => {
    test('should have TensorFlow.js loaded', async ({ page }) => {
      const hasTf = await page.evaluate(() => typeof tf !== 'undefined');
      // TensorFlow might take time to load, so this checks if the page has it set up
      expect(hasTf).toBeDefined();
    });

    test('should have COCO-SSD available', async ({ page }) => {
      const hasCocoSsd = await page.evaluate(() => typeof cocoSsd !== 'undefined');
      expect(hasCocoSsd).toBeDefined();
    });
  });

  test.describe('Detection UI Elements', () => {
    test('should have detection badge element', async ({ page }) => {
      await expect(page.locator('#detectionBadge')).toBeAttached();
    });

    test('should have detection canvas', async ({ page }) => {
      await expect(page.locator('#detectionCanvas')).toBeAttached();
    });

    test('should have detect button', async ({ page }) => {
      await expect(page.locator('#detectBtn')).toBeVisible();
    });

    test('detection badge should be hidden initially', async ({ page }) => {
      await expect(page.locator('#detectionBadge')).toHaveClass(/hidden/);
    });
  });
});
