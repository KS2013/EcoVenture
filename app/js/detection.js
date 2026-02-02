/**
 * EcoVenture Detection Module
 * AI detection with COCO-SSD + MobileNet TrashNet + Confidence Boosting
 */

// Confidence tracker for boosting persistent detections
const confidenceTracker = {
  detections: new Map(),
  frameCount: 0,
  BOOST_THRESHOLD: 2,
  DECAY_FRAMES: 8,
  BOOST_MULTIPLIER: 1.8
};

// Model availability state
let trashNetModel = null;
let trashNetAvailable = false;

// Update confidence tracker with new detections
function updateConfidenceTracker(detections) {
  confidenceTracker.frameCount++;

  // Decay existing detections
  for (const [itemClass, data] of confidenceTracker.detections) {
    const framesSinceSeen = confidenceTracker.frameCount - data.lastSeen;
    if (framesSinceSeen > confidenceTracker.DECAY_FRAMES) {
      confidenceTracker.detections.delete(itemClass);
    }
  }

  // Add/update current detections
  detections.forEach(det => {
    const itemClass = det.class.toLowerCase();
    const existing = confidenceTracker.detections.get(itemClass);

    if (existing) {
      existing.count++;
      existing.lastSeen = confidenceTracker.frameCount;
      existing.confidence = Math.max(existing.confidence, det.score);
    } else {
      confidenceTracker.detections.set(itemClass, {
        count: 1,
        lastSeen: confidenceTracker.frameCount,
        confidence: det.score
      });
    }
  });
}

// Get boosted confidence for an item
function getBoostedConfidence(itemClass, baseScore) {
  const data = confidenceTracker.detections.get(itemClass.toLowerCase());
  if (data && data.count >= confidenceTracker.BOOST_THRESHOLD) {
    return Math.min(baseScore * confidenceTracker.BOOST_MULTIPLIER, 0.99);
  }
  return baseScore;
}

// Reset tracker
function resetConfidenceTracker() {
  confidenceTracker.detections.clear();
  confidenceTracker.frameCount = 0;
}

// ImageNet class labels (top 1000 classes - we'll use a subset for trash detection)
// This is loaded from a local file to avoid TFHub dependency
let imagenetClasses = null;

// Load ImageNet classes from local JSON
async function loadImageNetClasses() {
  try {
    const response = await fetch('models/imagenet_classes.json');
    const classArray = await response.json();
    // The file is an array, convert to object for easy lookup
    imagenetClasses = {};
    classArray.forEach((name, idx) => {
      imagenetClasses[idx] = name;
    });
    console.log('Loaded', Object.keys(imagenetClasses).length, 'ImageNet classes');
    return true;
  } catch (e) {
    console.warn('Could not load ImageNet classes, using built-in subset');
    // Fallback to built-in subset of relevant classes
    imagenetClasses = getBuiltInClasses();
    return true;
  }
}

// Built-in subset of ImageNet classes relevant to trash/litter detection
function getBuiltInClasses() {
  return {
    // Bottles & containers
    898: 'water bottle', 907: 'wine bottle', 737: 'pop bottle', 440: 'beer bottle',
    653: 'measuring cup', 968: 'cup', 504: 'coffee mug', 647: 'mixing bowl',
    // Bags
    728: 'plastic bag', 414: 'bag', 728: 'grocery bag',
    // Food items (often littered)
    954: 'banana', 948: 'orange', 950: 'apple', 951: 'lemon',
    923: 'hot dog', 927: 'pizza', 928: 'burrito', 934: 'ice cream',
    // Paper/cardboard
    478: 'envelope', 921: 'book', 917: 'comic book',
    // Cans
    520: 'can', 746: 'soda can', 441: 'beer can',
    // Bins/receptacles (for bin detection)
    412: 'ashcan', 413: 'trash can', 414: 'bucket',
    // Electronics (e-waste)
    508: 'computer keyboard', 509: 'mouse', 527: 'desktop computer',
    487: 'cell phone', 620: 'laptop',
    // Misc items
    518: 'balloon', 601: 'mask', 702: 'pencil sharpener'
  };
}

// Load TrashNet model using local MobileNet
async function loadTrashNetModel() {
  try {
    const config = window.EcoVentureConfig.TRASHNET_CONFIG;

    if (!config || !config.ENABLED) {
      console.log('TrashNet is disabled in config');
      trashNetAvailable = false;
      return false;
    }

    console.log('Loading local MobileNet V1 for TrashNet classification...');

    // Load ImageNet classes first
    await loadImageNetClasses();

    // Load model from local files using tf.loadLayersModel
    trashNetModel = await tf.loadLayersModel('models/mobilenet_v1/model.json');

    trashNetAvailable = true;
    console.log('TrashNet (Local MobileNet V1) loaded successfully');
    return true;
  } catch (e) {
    console.warn('TrashNet model failed to load:', e.message);
    trashNetAvailable = false;
    return false;
  }
}

// Custom classify function for local MobileNet model
async function classifyImage(imageElement, topK = 5) {
  if (!trashNetModel || !imagenetClasses) return [];

  try {
    // Preprocess image for MobileNet (224x224, normalized to [-1, 1])
    const tensor = tf.tidy(() => {
      let img = tf.browser.fromPixels(imageElement);
      // Resize to 224x224
      img = tf.image.resizeBilinear(img, [224, 224]);
      // Normalize to [-1, 1] (MobileNet V1 expects this)
      img = img.toFloat().div(127.5).sub(1);
      // Add batch dimension
      return img.expandDims(0);
    });

    // Run inference
    const predictions = await trashNetModel.predict(tensor);
    const data = await predictions.data();

    // Clean up tensors
    tensor.dispose();
    predictions.dispose();

    // Get top K predictions
    const indices = Array.from(data)
      .map((prob, idx) => ({ prob, idx }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, topK);

    // Map to class names
    return indices.map(({ prob, idx }) => ({
      className: imagenetClasses[idx] || `class_${idx}`,
      probability: prob
    }));
  } catch (e) {
    console.warn('Classification failed:', e.message);
    return [];
  }
}

// Load COCO-SSD model
async function loadDetectionModel() {
  try {
    const model = await cocoSsd.load({
      base: 'lite_mobilenet_v2' // Faster model
    });
    console.log('COCO-SSD model loaded successfully');

    // Load TrashNet model in parallel
    await loadTrashNetModel();

    const models = ['COCO-SSD (enhanced)'];
    if (trashNetAvailable) models.push('TrashNet (MobileNet)');
    console.log('Available AI models:', models);

    return model;
  } catch (error) {
    console.error('Failed to load COCO-SSD:', error);
    return null;
  }
}

// Check if MobileNet prediction indicates a bin/trash can
function isBinDetection(className) {
  const binClasses = window.EcoVentureConfig.BIN_CLASSES || [];
  const lowerClass = className.toLowerCase();

  for (const binClass of binClasses) {
    if (lowerClass.includes(binClass.toLowerCase())) {
      return true;
    }
  }

  // Also check common bin-related keywords
  const binKeywords = ['ashcan', 'trash', 'garbage', 'waste', 'bin', 'dustbin', 'dumpster', 'recycl'];
  for (const keyword of binKeywords) {
    if (lowerClass.includes(keyword)) {
      return true;
    }
  }

  return false;
}

// Classify image with TrashNet (MobileNet) - returns waste category AND bin detection
async function classifyWithTrashNet(videoElement) {
  if (!trashNetAvailable || !trashNetModel) return null;

  try {
    const config = window.EcoVentureConfig.TRASHNET_CONFIG;

    // Get predictions using our custom classify function
    const predictions = await classifyImage(videoElement, 5);

    if (!predictions || predictions.length === 0) return null;

    // First check if any prediction is a bin/trash can
    let binDetected = false;
    for (const pred of predictions) {
      if (isBinDetection(pred.className) && pred.probability > 0.15) {
        binDetected = true;
        break;
      }
    }

    // Map MobileNet classes to trash categories
    // MobileNet recognizes common objects - we map them to trash types
    const trashMappings = {
      // Plastic items
      'water bottle': 'plastic',
      'plastic bag': 'plastic',
      'pop bottle': 'plastic',
      'bottle cap': 'plastic',
      'pill bottle': 'plastic',
      'soap dispenser': 'plastic',
      // Glass items
      'wine bottle': 'glass',
      'beer bottle': 'glass',
      'beer glass': 'glass',
      'goblet': 'glass',
      'perfume': 'glass',
      // Metal items
      'can opener': 'metal',
      'pop can': 'metal',
      'beer can': 'metal',
      'tin can': 'metal',
      'frying pan': 'metal',
      // Paper/cardboard
      'envelope': 'paper',
      'book jacket': 'paper',
      'paper towel': 'paper',
      'toilet tissue': 'paper',
      'carton': 'cardboard',
      'packet': 'cardboard',
      // Food/organic waste
      'banana': 'trash',
      'orange': 'trash',
      'apple': 'trash',
      'lemon': 'trash',
      'food': 'trash',
      // General items often found as litter
      'cup': 'plastic',
      'coffee mug': 'plastic',
      'plate': 'plastic',
      'bowl': 'plastic',
      'bucket': 'plastic',
      'plastic bag': 'plastic',
      'grocery store': 'plastic',  // plastic bags
      'shopping basket': 'plastic',
      'mask': 'trash',
      'rubber eraser': 'trash',
      'balloon': 'plastic',
      'pencil sharpener': 'plastic'
    };

    // Find best matching trash category
    for (const pred of predictions) {
      const className = pred.className.toLowerCase();

      // Direct match in mappings
      for (const [key, category] of Object.entries(trashMappings)) {
        if (className.includes(key)) {
          const displayName = config.DISPLAY_NAMES[category] || category;
          return {
            class: displayName,
            category: category,
            score: pred.probability,
            originalClass: pred.className,
            source: 'TrashNet',
            binDetected: binDetected
          };
        }
      }

      // Check if it matches any COCO trash class
      const cocoTrash = window.EcoVentureConfig.COCO_TRASH_CLASSES;
      for (const trashClass of cocoTrash) {
        if (className.includes(trashClass.toLowerCase())) {
          return {
            class: pred.className,
            category: 'trash',
            score: pred.probability,
            originalClass: pred.className,
            source: 'TrashNet',
            binDetected: binDetected
          };
        }
      }
    }

    // If confidence is high enough, return top prediction as potential trash
    if (predictions[0].probability > 0.3) {
      return {
        class: predictions[0].className,
        category: 'unknown',
        score: predictions[0].probability,
        originalClass: predictions[0].className,
        source: 'TrashNet',
        binDetected: binDetected
      };
    }

    // Return bin detection even if no trash found
    if (binDetected) {
      return {
        class: 'Bin',
        category: 'bin',
        score: 0.5,
        originalClass: 'bin detected',
        source: 'TrashNet',
        binDetected: true
      };
    }

    return null;
  } catch (e) {
    console.warn('TrashNet classification failed:', e.message);
    return null;
  }
}

// Draw detection boxes on canvas with improved visuals
function drawDetections(ctx, canvas, allDetections, cocoTrashItems) {
  const { COCO_TRASH_CLASSES, IGNORE_CLASSES, CONFIG } = window.EcoVentureConfig;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Colors for different detection sources
  const sourceColors = {
    'COCO': { normal: '#10B981', boosted: '#059669' },      // Green
    'TrashNet': { normal: '#8B5CF6', boosted: '#7C3AED' },  // Purple (local AI!)
    'MobileNet': { normal: '#3B82F6', boosted: '#1D4ED8' }, // Blue
    'TACO': { normal: '#F59E0B', boosted: '#D97706' }       // Orange
  };

  // Special color for person detection
  const personColor = { normal: '#EC4899', boosted: '#DB2777' }; // Pink

  allDetections.forEach(detection => {
    // Skip if no bounding box
    if (!detection.bbox) return;

    if (detection.score < CONFIG.MIN_CONFIDENCE) return;

    const classLower = detection.class.toLowerCase();

    // Allow person detection, skip other ignored classes
    const isPerson = classLower === 'person';
    if (!isPerson && IGNORE_CLASSES.includes(classLower)) return;

    // Get bounding box coordinates
    let x, y, width, height;
    if (Array.isArray(detection.bbox)) {
      [x, y, width, height] = detection.bbox;
    } else if (typeof detection.bbox === 'object') {
      if (detection.bbox.width !== undefined) {
        x = detection.bbox.x;
        y = detection.bbox.y;
        width = detection.bbox.width;
        height = detection.bbox.height;
      } else if (detection.bbox.x2 !== undefined) {
        x = detection.bbox.x1;
        y = detection.bbox.y1;
        width = detection.bbox.x2 - detection.bbox.x1;
        height = detection.bbox.y2 - detection.bbox.y1;
      } else {
        return;
      }
    } else {
      return;
    }

    // Check if boosted
    const cocoItem = cocoTrashItems ? cocoTrashItems.find(t => t.class === detection.class) : null;
    const isBoosted = cocoItem && confidenceTracker.detections.get(classLower)?.count >= confidenceTracker.BOOST_THRESHOLD;

    // Get color based on source (special color for person)
    const source = detection.source || 'COCO';
    let colors;
    if (isPerson) {
      colors = personColor;
    } else {
      colors = sourceColors[source] || sourceColors['COCO'];
    }
    const color = isBoosted ? colors.boosted : colors.normal;

    // Draw rounded bounding box
    ctx.strokeStyle = color;
    ctx.lineWidth = isBoosted ? 4 : 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const radius = 8;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();

    // Draw corner accents
    const cornerLength = 15;
    ctx.lineWidth = isBoosted ? 5 : 4;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x, y + cornerLength);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerLength, y);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + width - cornerLength, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + cornerLength);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x, y + height - cornerLength);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + cornerLength, y + height);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + width - cornerLength, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + height - cornerLength);
    ctx.stroke();

    // Draw label
    const boostMarker = isBoosted ? ' ⚡' : '';
    const sourceTag = source !== 'COCO' ? ` [${source}]` : '';
    const icon = isPerson ? '👤' : '🗑️';
    const label = `${icon} ${detection.class} ${Math.round(detection.score * 100)}%${boostMarker}${sourceTag}`;
    ctx.font = 'bold 14px Arial';
    const textWidth = ctx.measureText(label).width;

    // Rounded label background
    const labelHeight = 26;
    const labelY = y - labelHeight - 4;
    const labelRadius = 6;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(x + labelRadius, labelY);
    ctx.lineTo(x + textWidth + 10 - labelRadius, labelY);
    ctx.quadraticCurveTo(x + textWidth + 10, labelY, x + textWidth + 10, labelY + labelRadius);
    ctx.lineTo(x + textWidth + 10, labelY + labelHeight - labelRadius);
    ctx.quadraticCurveTo(x + textWidth + 10, labelY + labelHeight, x + textWidth + 10 - labelRadius, labelY + labelHeight);
    ctx.lineTo(x + labelRadius, labelY + labelHeight);
    ctx.quadraticCurveTo(x, labelY + labelHeight, x, labelY + labelHeight - labelRadius);
    ctx.lineTo(x, labelY + labelRadius);
    ctx.quadraticCurveTo(x, labelY, x + labelRadius, labelY);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, x + 5, labelY + 18);
  });
}

// Calculate points from detection
function calculatePoints(items, trashPercent, submissions, binDetected = false) {
  let points = 0;
  const breakdown = [];

  // Base points for collecting trash
  points += 50;
  breakdown.push({ points: 50, reason: 'Trash collected' });

  // Bin bonus - main reward for actually disposing trash
  if (binDetected) {
    points += 25;
    breakdown.push({ points: 25, reason: 'Put in bin! 🗑️' });
  }

  // First time bonus
  if (submissions === 0) {
    points += 100;
    breakdown.push({ points: 100, reason: 'Welcome bonus!' });
  }

  // High visibility bonus
  if (trashPercent >= 50) {
    points += 30;
    breakdown.push({ points: 30, reason: 'Great visibility' });
  }

  // Multiple items bonus
  if (items.length >= 2) {
    const multiBonus = Math.min(items.length * 15, 60);
    points += multiBonus;
    breakdown.push({ points: multiBonus, reason: `${items.length} items collected` });
  }

  return { points, breakdown };
}

// Combined detection using Roboflow (if available) + COCO-SSD fallback
async function detectWithRoboflow(imageElement) {
  // Check if Roboflow is configured
  if (window.EcoVentureRoboflow && window.EcoVentureRoboflow.isConfigured()) {
    try {
      const detections = await window.EcoVentureRoboflow.detectTrashThrottled(imageElement);
      if (detections && detections.length > 0) {
        console.log('🎯 Roboflow detected trash:', detections.map(d => d.class).join(', '));
        return detections;
      }
    } catch (error) {
      console.warn('Roboflow detection failed, using fallback:', error.message);
    }
  }
  return null; // Return null to signal fallback to COCO-SSD
}

// Check if Roboflow is available and configured
function isRoboflowAvailable() {
  return window.EcoVentureRoboflow && window.EcoVentureRoboflow.isConfigured();
}

// Export
window.EcoVentureDetection = {
  confidenceTracker,
  updateConfidenceTracker,
  getBoostedConfidence,
  resetConfidenceTracker,
  loadDetectionModel,
  loadTrashNetModel,
  classifyWithTrashNet,
  drawDetections,
  calculatePoints,
  detectWithRoboflow,
  isTrashNetAvailable: () => trashNetAvailable,
  isRoboflowAvailable
};

