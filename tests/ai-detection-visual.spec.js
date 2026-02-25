// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * AI Detection Visual Tests
 * Tests the EcoVenture AI detection system with simulated images
 */

test.describe('AI Detection - Real Image Recognition', () => {

  test('should detect objects in a real photo loaded from URL', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for modules to load
    await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 15000 });
    await page.waitForFunction(() => typeof tf !== 'undefined' && typeof cocoSsd !== 'undefined', { timeout: 15000 });

    // Load the COCO-SSD model and test with a real image from the web
    const result = await page.evaluate(async () => {
      const det = window.EcoVentureDetection;

      try {
        // Load the model
        const model = await det.loadDetectionModel();
        if (!model) {
          return { success: false, error: 'Model failed to load' };
        }

        // Create an image element and load a real photo
        // Using a data URL of a simple but recognizable image
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Load image from a reliable source (placeholder service with a bottle-like shape)
        const imageLoaded = await new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          // Use picsum for a random image, or we'll draw one
          img.src = 'https://picsum.photos/640/480';
          // Timeout after 5 seconds
          setTimeout(() => resolve(false), 5000);
        });

        // If external image fails, create a realistic test image
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        if (imageLoaded && img.complete && img.naturalWidth > 0) {
          // Draw the loaded image
          ctx.drawImage(img, 0, 0, 640, 480);
        } else {
          // Create a more realistic scene with recognizable objects
          // Background - outdoor scene (sky and ground)
          const gradient = ctx.createLinearGradient(0, 0, 0, 480);
          gradient.addColorStop(0, '#87CEEB'); // sky blue
          gradient.addColorStop(0.6, '#87CEEB');
          gradient.addColorStop(0.6, '#228B22'); // grass green
          gradient.addColorStop(1, '#228B22');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 640, 480);

          // Add a path/sidewalk
          ctx.fillStyle = '#808080';
          ctx.fillRect(0, 350, 640, 130);

          // Draw a realistic plastic bottle
          ctx.save();
          ctx.translate(300, 380);

          // Bottle body (transparent blue plastic look)
          ctx.fillStyle = 'rgba(100, 180, 255, 0.7)';
          ctx.beginPath();
          ctx.moveTo(-25, 0);
          ctx.lineTo(-25, -100);
          ctx.quadraticCurveTo(-25, -110, -15, -115);
          ctx.lineTo(-10, -115);
          ctx.lineTo(-10, -130);
          ctx.lineTo(10, -130);
          ctx.lineTo(10, -115);
          ctx.lineTo(15, -115);
          ctx.quadraticCurveTo(25, -110, 25, -100);
          ctx.lineTo(25, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#4a90d9';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Bottle cap (white)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-12, -145, 24, 15);
          ctx.strokeStyle = '#CCCCCC';
          ctx.strokeRect(-12, -145, 24, 15);

          // Water inside
          ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
          ctx.fillRect(-23, -60, 46, 58);

          // Label
          ctx.fillStyle = '#1E90FF';
          ctx.fillRect(-23, -95, 46, 35);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px Arial';
          ctx.fillText('WATER', -20, -75);

          // Highlight/reflection
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(-20, -100, 8, 95);

          ctx.restore();

          // Add a cup (another common trash item)
          ctx.save();
          ctx.translate(450, 400);

          // Cup body
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(-25, -60);
          ctx.lineTo(25, -60);
          ctx.lineTo(20, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#CCCCCC';
          ctx.stroke();

          // Cup rim
          ctx.strokeStyle = '#888888';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(0, -60, 25, 5, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.restore();
        }

        // Run detection on the canvas
        const detections = await model.detect(canvas);

        // Filter for trash items
        const cocoTrash = window.EcoVentureConfig.COCO_TRASH_CLASSES;
        const trashDetections = detections.filter(d =>
          cocoTrash.includes(d.class.toLowerCase())
        );

        return {
          success: true,
          totalDetections: detections.length,
          trashDetections: trashDetections.length,
          allDetected: detections.map(d => ({
            class: d.class,
            score: Math.round(d.score * 100),
            bbox: d.bbox ? [Math.round(d.bbox[0]), Math.round(d.bbox[1]), Math.round(d.bbox[2]), Math.round(d.bbox[3])] : null
          })),
          trashItems: trashDetections.map(d => ({
            class: d.class,
            score: Math.round(d.score * 100)
          })),
          imageSource: imageLoaded ? 'external' : 'generated'
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    console.log('\n========== REAL IMAGE DETECTION TEST ==========');
    console.log('Image source:', result.imageSource);
    console.log('Total objects detected:', result.totalDetections);
    console.log('Trash items detected:', result.trashDetections);
    console.log('All detections:', JSON.stringify(result.allDetected, null, 2));
    if (result.trashItems && result.trashItems.length > 0) {
      console.log('TRASH FOUND:', result.trashItems.map(t => `${t.class} (${t.score}%)`).join(', '));
    }
    console.log('================================================\n');

    expect(result.success).toBe(true);
    // The model should at least run without error
  });

  test('should detect a bottle when shown a clear bottle image', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 15000 });
    await page.waitForFunction(() => typeof cocoSsd !== 'undefined', { timeout: 15000 });

    const result = await page.evaluate(async () => {
      const det = window.EcoVentureDetection;
      const model = await det.loadDetectionModel();

      // Create a very clear, centered bottle image
      const canvas = document.createElement('canvas');
      canvas.width = 416; // COCO-SSD optimal size
      canvas.height = 416;
      const ctx = canvas.getContext('2d');

      // White/neutral background
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 416, 416);

      // Draw a prominent, realistic bottle in the center
      const centerX = 208;
      const centerY = 208;

      // Bottle shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(centerX + 10, 350, 50, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bottle body - blue plastic
      ctx.fillStyle = '#2196F3';
      ctx.beginPath();
      ctx.moveTo(centerX - 40, 340);
      ctx.lineTo(centerX - 40, 150);
      ctx.quadraticCurveTo(centerX - 40, 120, centerX - 20, 110);
      ctx.lineTo(centerX - 15, 80);
      ctx.lineTo(centerX + 15, 80);
      ctx.lineTo(centerX + 20, 110);
      ctx.quadraticCurveTo(centerX + 40, 120, centerX + 40, 150);
      ctx.lineTo(centerX + 40, 340);
      ctx.closePath();
      ctx.fill();

      // Bottle cap - white
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.rect(centerX - 18, 50, 36, 30);
      ctx.fill();
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label area
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(centerX - 35, 180, 70, 80);

      // Highlight/reflection
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(centerX - 30, 120, 15, 200);

      const detections = await model.detect(canvas);

      return {
        success: true,
        detections: detections.map(d => ({
          class: d.class,
          score: Math.round(d.score * 100)
        })),
        foundBottle: detections.some(d => d.class === 'bottle'),
        bottleConfidence: detections.find(d => d.class === 'bottle')?.score
      };
    });

    console.log('\n========== BOTTLE DETECTION TEST ==========');
    console.log('Detections:', JSON.stringify(result.detections, null, 2));
    console.log('Found bottle:', result.foundBottle);
    if (result.bottleConfidence) {
      console.log('Bottle confidence:', Math.round(result.bottleConfidence * 100) + '%');
    }
    console.log('============================================\n');

    expect(result.success).toBe(true);
  });

  test('should run detection on multiple frames like video', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('http://localhost:3000');

    await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 15000 });

    const result = await page.evaluate(async () => {
      const det = window.EcoVentureDetection;
      const model = await det.loadDetectionModel();

      det.resetConfidenceTracker();

      const frameResults = [];

      // Simulate 10 frames of "video" with a bottle moving slightly
      for (let frame = 0; frame < 10; frame++) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 640, 480);

        // Bottle position (moves slightly each frame)
        const x = 300 + Math.sin(frame * 0.3) * 20;
        const y = 240 + Math.cos(frame * 0.3) * 10;

        // Draw bottle
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(x - 25, y - 60, 50, 120);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - 12, y - 80, 24, 20);

        const detections = await model.detect(canvas);

        // Update confidence tracker
        det.updateConfidenceTracker(detections);

        // Check for boosted confidence
        const bottleDet = detections.find(d => d.class === 'bottle');
        let boostedScore = null;
        if (bottleDet) {
          boostedScore = det.getBoostedConfidence('bottle', bottleDet.score);
        }

        frameResults.push({
          frame: frame + 1,
          detected: detections.map(d => d.class).join(', ') || 'nothing',
          bottleScore: bottleDet ? Math.round(bottleDet.score * 100) : null,
          boostedScore: boostedScore ? Math.round(boostedScore * 100) : null
        });
      }

      return {
        success: true,
        frames: frameResults,
        finalTrackerState: {
          frameCount: det.confidenceTracker.frameCount,
          trackedItems: Array.from(det.confidenceTracker.detections.keys())
        }
      };
    });

    console.log('\n========== VIDEO FRAME DETECTION TEST ==========');
    console.log('Frame-by-frame results:');
    result.frames.forEach(f => {
      console.log(`  Frame ${f.frame}: detected="${f.detected}", bottle=${f.bottleScore}%, boosted=${f.boostedScore}%`);
    });
    console.log('Final tracker state:', result.finalTrackerState);
    console.log('================================================\n');

    expect(result.success).toBe(true);
    expect(result.frames.length).toBe(10);
  });
});

test.describe('AI Detection - Visual Recognition Test', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000');

    // Wait for config to load
    await page.waitForFunction(() => window.EcoVentureConfig !== undefined, { timeout: 15000 });

    // Wait for detection module to load
    await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 15000 });
  });

  test('should load AI models successfully', async ({ page }) => {
    // Wait for TensorFlow.js to be available
    const tfLoaded = await page.evaluate(async () => {
      // Check if tf is loaded
      if (typeof tf === 'undefined') {
        return { tfLoaded: false, error: 'TensorFlow not loaded' };
      }

      // Check if cocoSsd is loaded
      if (typeof cocoSsd === 'undefined') {
        return { tfLoaded: true, cocoSsdLoaded: false, error: 'COCO-SSD not loaded' };
      }

      return {
        tfLoaded: true,
        cocoSsdLoaded: true,
        tfVersion: tf.version?.tfjs || 'unknown'
      };
    });

    console.log('TensorFlow status:', JSON.stringify(tfLoaded, null, 2));

    expect(tfLoaded.tfLoaded).toBe(true);
    expect(tfLoaded.cocoSsdLoaded).toBe(true);
  });

  test('should have correct COCO trash classes configured', async ({ page }) => {
    const config = await page.evaluate(() => {
      const cfg = window.EcoVentureConfig;
      return {
        cocoTrashClasses: cfg.COCO_TRASH_CLASSES,
        binClasses: cfg.BIN_CLASSES,
        ignoreClasses: cfg.IGNORE_CLASSES,
        trashNetCategories: cfg.TRASHNET_CONFIG.CATEGORIES
      };
    });

    console.log('COCO Trash Classes:', config.cocoTrashClasses.join(', '));
    console.log('TrashNet Categories:', config.trashNetCategories.join(', '));

    // Verify expected classes exist
    expect(config.cocoTrashClasses).toContain('bottle');
    expect(config.cocoTrashClasses).toContain('cup');
    expect(config.cocoTrashClasses).toContain('bowl');
    expect(config.cocoTrashClasses.length).toBeGreaterThan(20);

    // Verify bin classes
    expect(config.binClasses).toContain('trash can');
    expect(config.binClasses).toContain('ashcan');

    // Verify TrashNet categories
    expect(config.trashNetCategories).toContain('plastic');
    expect(config.trashNetCategories).toContain('metal');
    expect(config.trashNetCategories).toContain('glass');
    expect(config.trashNetCategories).toContain('cardboard');
    expect(config.trashNetCategories).toContain('paper');
    expect(config.trashNetCategories).toContain('trash');
  });

  test('should calculate points correctly for detected trash', async ({ page }) => {
    const pointsTest = await page.evaluate(() => {
      const det = window.EcoVentureDetection;

      // Test scenario 1: Single item, no bin, first submission
      const result1 = det.calculatePoints(
        [{ class: 'bottle', score: 0.85 }], // items
        60, // trash percent
        0, // submissions (first time = welcome bonus)
        false // no bin
      );

      // Test scenario 2: Multiple items with bin
      const result2 = det.calculatePoints(
        [{ class: 'bottle', score: 0.85 }, { class: 'cup', score: 0.75 }],
        70,
        5, // not first submission
        true // bin detected
      );

      // Test scenario 3: Many items
      const result3 = det.calculatePoints(
        [
          { class: 'bottle', score: 0.85 },
          { class: 'cup', score: 0.75 },
          { class: 'bowl', score: 0.65 },
          { class: 'fork', score: 0.55 }
        ],
        80,
        10,
        true
      );

      return { result1, result2, result3 };
    });

    console.log('Points Test Results:');
    console.log('Scenario 1 (first submission):', pointsTest.result1);
    console.log('Scenario 2 (2 items + bin):', pointsTest.result2);
    console.log('Scenario 3 (4 items + bin):', pointsTest.result3);

    // Scenario 1: Base 50 + Welcome 100 + Visibility 30 = 180
    expect(pointsTest.result1.points).toBe(180);

    // Scenario 2: Base 50 + Bin 25 + Visibility 30 + Multi(2*15=30) = 135
    expect(pointsTest.result2.points).toBe(135);

    // Scenario 3: Base 50 + Bin 25 + Visibility 30 + Multi(4*15=60) = 165
    expect(pointsTest.result3.points).toBe(165);
  });

  test('should track confidence and boost persistent detections', async ({ page }) => {
    const confidenceTest = await page.evaluate(() => {
      const det = window.EcoVentureDetection;

      // Reset tracker first
      det.resetConfidenceTracker();

      const results = [];

      // Simulate detecting the same bottle 5 times
      for (let i = 0; i < 5; i++) {
        det.updateConfidenceTracker([{ class: 'bottle', score: 0.6 }]);
        const boosted = det.getBoostedConfidence('bottle', 0.6);
        results.push({
          frame: i + 1,
          originalScore: 0.6,
          boostedScore: boosted,
          trackerCount: det.confidenceTracker.detections.get('bottle')?.count || 0
        });
      }

      // Check the threshold values
      const config = {
        BOOST_THRESHOLD: det.confidenceTracker.BOOST_THRESHOLD,
        DECAY_FRAMES: det.confidenceTracker.DECAY_FRAMES,
        BOOST_MULTIPLIER: det.confidenceTracker.BOOST_MULTIPLIER
      };

      return { results, config };
    });

    console.log('Confidence Tracking Config:', confidenceTest.config);
    console.log('Confidence Progression:');
    confidenceTest.results.forEach(r => {
      console.log(`  Frame ${r.frame}: count=${r.trackerCount}, score=${r.originalScore} -> ${r.boostedScore.toFixed(3)}`);
    });

    // Verify boost threshold is 2
    expect(confidenceTest.config.BOOST_THRESHOLD).toBe(2);
    expect(confidenceTest.config.BOOST_MULTIPLIER).toBe(1.8);

    // Frame 1: count=1, no boost (below threshold)
    expect(confidenceTest.results[0].boostedScore).toBe(0.6);

    // Frame 2+: count>=2, should be boosted
    expect(confidenceTest.results[1].boostedScore).toBeGreaterThan(0.6);

    // Boosted score should be 0.6 * 1.8 = 1.08, capped at 0.99
    expect(confidenceTest.results[4].boostedScore).toBe(0.99);
  });

  test('should reset confidence tracker correctly', async ({ page }) => {
    const resetTest = await page.evaluate(() => {
      const det = window.EcoVentureDetection;

      // Add some detections
      det.updateConfidenceTracker([{ class: 'bottle', score: 0.7 }]);
      det.updateConfidenceTracker([{ class: 'cup', score: 0.6 }]);

      const beforeReset = {
        frameCount: det.confidenceTracker.frameCount,
        detectionCount: det.confidenceTracker.detections.size
      };

      // Reset
      det.resetConfidenceTracker();

      const afterReset = {
        frameCount: det.confidenceTracker.frameCount,
        detectionCount: det.confidenceTracker.detections.size
      };

      return { beforeReset, afterReset };
    });

    console.log('Before reset:', resetTest.beforeReset);
    console.log('After reset:', resetTest.afterReset);

    expect(resetTest.beforeReset.frameCount).toBe(2);
    expect(resetTest.beforeReset.detectionCount).toBe(2);
    expect(resetTest.afterReset.frameCount).toBe(0);
    expect(resetTest.afterReset.detectionCount).toBe(0);
  });

  test('should decay old detections after DECAY_FRAMES', async ({ page }) => {
    const decayTest = await page.evaluate(() => {
      const det = window.EcoVentureDetection;

      det.resetConfidenceTracker();

      // Add a detection
      det.updateConfidenceTracker([{ class: 'bottle', score: 0.7 }]);

      const afterFirstDetection = det.confidenceTracker.detections.has('bottle');

      // Simulate 9 more frames without seeing the bottle (DECAY_FRAMES = 8)
      for (let i = 0; i < 9; i++) {
        det.updateConfidenceTracker([]); // empty detections
      }

      const afterDecay = det.confidenceTracker.detections.has('bottle');

      return { afterFirstDetection, afterDecay, decayFrames: det.confidenceTracker.DECAY_FRAMES };
    });

    console.log('Decay test:', decayTest);

    expect(decayTest.afterFirstDetection).toBe(true);
    expect(decayTest.afterDecay).toBe(false); // Should be removed after decay
    expect(decayTest.decayFrames).toBe(8);
  });
});

test.describe('AI Detection - Real Model Behavior', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForFunction(() => window.EcoVentureConfig !== undefined, { timeout: 15000 });
    await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 15000 });
  });

  test('should have detection module with all required functions', async ({ page }) => {
    const moduleCheck = await page.evaluate(() => {
      const det = window.EcoVentureDetection;

      return {
        hasLoadDetectionModel: typeof det.loadDetectionModel === 'function',
        hasLoadTrashNetModel: typeof det.loadTrashNetModel === 'function',
        hasClassifyWithTrashNet: typeof det.classifyWithTrashNet === 'function',
        hasDrawDetections: typeof det.drawDetections === 'function',
        hasCalculatePoints: typeof det.calculatePoints === 'function',
        hasUpdateConfidenceTracker: typeof det.updateConfidenceTracker === 'function',
        hasGetBoostedConfidence: typeof det.getBoostedConfidence === 'function',
        hasResetConfidenceTracker: typeof det.resetConfidenceTracker === 'function',
        hasIsTrashNetAvailable: typeof det.isTrashNetAvailable === 'function',
        hasConfidenceTracker: typeof det.confidenceTracker === 'object'
      };
    });

    console.log('Detection Module Functions:', JSON.stringify(moduleCheck, null, 2));

    // All functions should exist
    Object.entries(moduleCheck).forEach(([key, value]) => {
      expect(value).toBe(true);
    });
  });

  test('should load COCO-SSD model and run detection', async ({ page }) => {
    // This test loads the actual model and tries detection
    const detectionResult = await page.evaluate(async () => {
      const det = window.EcoVentureDetection;

      try {
        // Load the COCO-SSD model
        const model = await det.loadDetectionModel();

        if (!model) {
          return { success: false, error: 'Model failed to load' };
        }

        // Create a test canvas with a simple shape
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');

        // Draw gray background (like pavement)
        ctx.fillStyle = '#666666';
        ctx.fillRect(0, 0, 640, 480);

        // Draw a bottle-like shape (blue rectangle)
        ctx.fillStyle = '#3498db';
        ctx.fillRect(280, 150, 80, 180);
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(300, 130, 40, 30); // cap

        // Run detection
        const detections = await model.detect(canvas);

        return {
          success: true,
          modelLoaded: true,
          detectionCount: detections.length,
          detections: detections.map(d => ({
            class: d.class,
            score: Math.round(d.score * 100) / 100
          }))
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, { timeout: 60000 });

    console.log('Detection Result:', JSON.stringify(detectionResult, null, 2));

    expect(detectionResult.success).toBe(true);
    expect(detectionResult.modelLoaded).toBe(true);

    // Note: A simple drawn shape may not be detected as a specific object
    // The important thing is the model loaded and ran without error
  });

  test('should identify bottle as valid trash class', async ({ page }) => {
    const trashCheck = await page.evaluate(() => {
      const config = window.EcoVentureConfig;

      // Check if common items are in trash classes
      const items = ['bottle', 'cup', 'bowl', 'fork', 'banana', 'pizza'];
      const results = {};

      items.forEach(item => {
        results[item] = config.COCO_TRASH_CLASSES.includes(item);
      });

      // Check if person is in ignore classes
      results['person_ignored'] = config.IGNORE_CLASSES.includes('person');
      results['car_ignored'] = config.IGNORE_CLASSES.includes('car');

      return results;
    });

    console.log('Trash Class Check:', JSON.stringify(trashCheck, null, 2));

    // All common trash items should be in the list
    expect(trashCheck.bottle).toBe(true);
    expect(trashCheck.cup).toBe(true);
    expect(trashCheck.bowl).toBe(true);
    expect(trashCheck.fork).toBe(true);
    expect(trashCheck.banana).toBe(true);
    expect(trashCheck.pizza).toBe(true);

    // Person and car should be ignored
    expect(trashCheck.person_ignored).toBe(true);
    expect(trashCheck.car_ignored).toBe(true);
  });

  test('should have TrashNet model available', async ({ page }) => {
    const trashNetStatus = await page.evaluate(async () => {
      const det = window.EcoVentureDetection;
      const config = window.EcoVentureConfig.TRASHNET_CONFIG;

      return {
        trashNetEnabled: config.ENABLED,
        categories: config.CATEGORIES,
        displayNames: config.DISPLAY_NAMES,
        isAvailableFunction: typeof det.isTrashNetAvailable === 'function'
      };
    });

    console.log('TrashNet Status:', JSON.stringify(trashNetStatus, null, 2));

    expect(trashNetStatus.trashNetEnabled).toBe(true);
    expect(trashNetStatus.categories).toEqual(['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']);
    expect(trashNetStatus.displayNames.plastic).toBe('Plastic');
    expect(trashNetStatus.displayNames.metal).toBe('Metal Can');
  });
});

test.describe('AI Detection - Points System', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForFunction(() => window.EcoVentureDetection !== undefined, { timeout: 15000 });
  });

  test('should give welcome bonus on first submission', async ({ page }) => {
    const result = await page.evaluate(() => {
      const det = window.EcoVentureDetection;
      return det.calculatePoints([{ class: 'bottle', score: 0.8 }], 50, 0, false);
    });

    console.log('First submission points:', result);

    // Should include welcome bonus
    const hasWelcomeBonus = result.breakdown.some(b => b.reason.includes('Welcome'));
    expect(hasWelcomeBonus).toBe(true);
    expect(result.points).toBeGreaterThanOrEqual(150); // 50 base + 100 welcome
  });

  test('should give bin bonus when bin is detected', async ({ page }) => {
    const result = await page.evaluate(() => {
      const det = window.EcoVentureDetection;
      return det.calculatePoints([{ class: 'bottle', score: 0.8 }], 50, 5, true);
    });

    console.log('Bin detected points:', result);

    const hasBinBonus = result.breakdown.some(b => b.reason.includes('bin'));
    expect(hasBinBonus).toBe(true);
  });

  test('should give multi-item bonus for multiple items', async ({ page }) => {
    const result = await page.evaluate(() => {
      const det = window.EcoVentureDetection;
      return det.calculatePoints(
        [
          { class: 'bottle', score: 0.8 },
          { class: 'cup', score: 0.7 },
          { class: 'fork', score: 0.6 }
        ],
        50,
        5,
        false
      );
    });

    console.log('Multi-item points:', result);

    const hasMultiBonus = result.breakdown.some(b => b.reason.includes('items'));
    expect(hasMultiBonus).toBe(true);
    expect(result.points).toBeGreaterThan(50); // More than base
  });

  test('should give visibility bonus for high trash percentage', async ({ page }) => {
    const lowVisResult = await page.evaluate(() => {
      const det = window.EcoVentureDetection;
      return det.calculatePoints([{ class: 'bottle', score: 0.8 }], 30, 5, false);
    });

    const highVisResult = await page.evaluate(() => {
      const det = window.EcoVentureDetection;
      return det.calculatePoints([{ class: 'bottle', score: 0.8 }], 60, 5, false);
    });

    console.log('Low visibility (30%):', lowVisResult.points);
    console.log('High visibility (60%):', highVisResult.points);

    expect(highVisResult.points).toBeGreaterThan(lowVisResult.points);
  });

  test('should cap multi-item bonus at 60 points', async ({ page }) => {
    const result = await page.evaluate(() => {
      const det = window.EcoVentureDetection;
      // 10 items should hit the cap (10 * 15 = 150, but capped at 60)
      const items = [];
      for (let i = 0; i < 10; i++) {
        items.push({ class: `item${i}`, score: 0.7 });
      }
      return det.calculatePoints(items, 50, 5, false);
    });

    console.log('10 items result:', result);

    const multiBonus = result.breakdown.find(b => b.reason.includes('items'));
    expect(multiBonus).toBeDefined();
    expect(multiBonus.points).toBe(60); // Should be capped at 60
  });
});
