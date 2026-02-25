/**
 * EcoVenture - Desktop/Mobile Application
 * AI Detection with COCO-SSD + Confidence Boosting
 * TrashAI integration (free, no API key needed)
 */

// Configuration
const MAX_RECORDING_TIME = 30;
const MIN_RECORDING_TIME = 3;
const DETECTION_INTERVAL = 250; // Faster detection (was 300)
const MIN_CONFIDENCE = 0.10; // Lower threshold for detection (was 0.15)

// TrashAI endpoint (free public API)
const TRASHAI_ENDPOINT = 'https://trashai.org/api/detect';

// TACO API - Trash Annotations in Context (specialized trash detection)
const TACO_API_ENDPOINT = 'https://api.taco-dataset.org/detect';

// TRASH ITEMS - expanded list with ALL possible COCO classes that could be trash/litter
const COCO_TRASH_CLASSES = [
  // Bottles & Containers - MOST COMMON
  'bottle', 'cup', 'wine glass', 'bowl', 'vase',
  // Food & Food Waste - expanded
  'banana', 'apple', 'orange', 'sandwich', 'hot dog', 'pizza', 'donut', 'cake', 'carrot', 'broccoli',
  // Utensils - often littered
  'fork', 'knife', 'spoon',
  // Sports & Recreation items (often left behind)
  'frisbee', 'sports ball', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'kite',
  // Bags and containers - expanded
  'handbag', 'tie', 'umbrella', 'suitcase', 'backpack',
  // Additional items that can be litter
  'scissors', 'toothbrush', 'hair drier', // personal items often discarded
  'book', // paper waste
  'clock', // electronics waste
  'remote', // electronics waste
  'cell phone', // broken phones are e-waste
  'mouse', // e-waste
  'keyboard' // e-waste
];

// TACO trash categories for specialized detection
const TACO_TRASH_CATEGORIES = [
  'Plastic bag & wrapper', 'Bottle', 'Bottle cap', 'Can', 'Carton',
  'Cup', 'Lid', 'Straw', 'Cigarette', 'Paper', 'Cardboard',
  'Plastic container', 'Plastic utensils', 'Food waste', 'Glass',
  'Metal', 'Styrofoam', 'Wrapper', 'Other plastic', 'Rope & strings',
  'Shoe', 'Squeezable tube', 'Broken glass', 'Aluminium foil',
  'Battery', 'Blister pack', 'Carded blister pack', 'Clear plastic bottle',
  'Corrugated carton', 'Crisp packet', 'Disposable food container',
  'Disposable plastic cup', 'Drink can', 'Drink carton', 'Egg carton',
  'Foam cup', 'Foam food container', 'Food Can', 'Food waste',
  'Garbage bag', 'Glass bottle', 'Glass cup', 'Glass jar', 'Magazine paper',
  'Meal carton', 'Metal bottle cap', 'Metal lid', 'Normal paper',
  'Other carton', 'Other plastic bottle', 'Other plastic container',
  'Other plastic cup', 'Other plastic wrapper', 'Paper bag', 'Paper cup',
  'Paper straw', 'Pizza box', 'Plastic bottle cap', 'Plastic film',
  'Plastic glooves', 'Plastic lid', 'Plastic straw', 'Plastic utensils',
  'Polypropylene bag', 'Pop tab', 'Rope & strings', 'Scrap metal',
  'Single-use carrier bag', 'Six pack rings', 'Spread tub', 'Squeezable tube',
  'Styrofoam piece', 'Tissues', 'Toilet tube', 'Tupperware', 'Unlabeled litter',
  'Wrapping paper'
];

// Items to ALWAYS IGNORE - definitely not trash (reduced list - more items now detectable as trash)
const IGNORE_CLASSES = [
  'person', // people are not trash
  'car', 'truck', 'bicycle', 'motorcycle', 'bus', 'train', 'airplane', 'boat', // vehicles
  'cat', 'dog', 'horse', 'bird', 'cow', 'sheep', 'elephant', 'bear', 'zebra', 'giraffe', // animals
  'chair', 'couch', 'bed', 'dining table', 'toilet', // furniture
  'teddy bear', 'potted plant', // household items
  'refrigerator', 'oven', 'microwave', 'sink', 'toaster', 'tv', 'monitor', 'laptop' // large appliances
];

// Confidence boosting - tracks detections across frames
const confidenceTracker = {
  detections: new Map(), // itemClass -> { count, lastSeen, confidence }
  frameCount: 0,
  BOOST_THRESHOLD: 2, // Fewer frames needed to boost (was 3)
  DECAY_FRAMES: 8, // More frames before decay (was 5)
  BOOST_MULTIPLIER: 1.8 // Higher boost multiplier (was 1.5)
};

// State
const state = {
  userId: null,
  userData: null,
  stream: null,
  mediaRecorder: null,
  recordedChunks: [],
  isRecording: false,
  recordingStartTime: null,
  recordingTimer: null,
  currentLocation: null,
  locationVerified: true,
  facingMode: 'user',
  modelLoaded: false,
  cocoModel: null,
  trashAIAvailable: false,
  tacoAPIAvailable: false,
  isDetecting: false,
  detectedItems: new Set(),
  personDetected: false,
  framesWithPerson: 0,
  framesWithTrash: 0,
  totalFramesAnalyzed: 0,
  detectionLoop: null,
  // Auth state
  isLoggedIn: false,
  authUser: null,
  userProfile: null,
  currentTab: 'home',
  currentLeaderboard: 'area',
  rewardCategory: 'all'
};

// DOM Elements
const elements = {
  videoPreview: document.getElementById('videoPreview'),
  detectionCanvas: document.getElementById('detectionCanvas'),
  videoOverlay: document.getElementById('videoOverlay'),
  recordBtn: document.getElementById('recordBtn'),
  switchCameraBtn: document.getElementById('switchCameraBtn'),
  detectBtn: document.getElementById('detectBtn'),
  recordingIndicator: document.getElementById('recordingIndicator'),
  recTime: document.getElementById('recTime'),
  detectionBadge: document.getElementById('detectionBadge'),
  locationStatus: document.getElementById('locationStatus'),
  headerPoints: document.getElementById('headerPoints'),
  cameraSection: document.getElementById('cameraSection'),
  processingSection: document.getElementById('processingSection'),
  resultsSection: document.getElementById('resultsSection'),
  progressFill: document.getElementById('progressFill'),
  processingStatus: document.getElementById('processingStatus'),
  resultsCard: document.getElementById('resultsCard'),
  newRecordingBtn: document.getElementById('newRecordingBtn'),
  totalPoints: document.getElementById('totalPoints'),
  submissions: document.getElementById('submissions'),
  streak: document.getElementById('streak'),
  levelIcon: document.getElementById('levelIcon'),
  levelName: document.getElementById('levelName'),
  currentLevel: document.getElementById('currentLevel'),
  nextLevel: document.getElementById('nextLevel'),
  levelProgressFill: document.getElementById('levelProgressFill'),
  rewardsGrid: document.getElementById('rewardsGrid'),
  rewardModal: document.getElementById('rewardModal'),
  modalClose: document.getElementById('modalClose'),
  modalBody: document.getElementById('modalBody'),
  toastContainer: document.getElementById('toastContainer')
};

// Initialize App
async function init() {
  console.log('Initializing EcoVenture with Enhanced AI Detection...');

  // Initialize Supabase if available
  if (window.EcoVentureAuth) {
    window.EcoVentureAuth.init();
  }

  // Get user data
  if (window.electronAPI) {
    state.userId = await window.electronAPI.getUserId();
    state.userData = await window.electronAPI.getUserData();
  } else {
    state.userId = localStorage.getItem('ecoventure_user_id') || `user_${Date.now()}`;
    localStorage.setItem('ecoventure_user_id', state.userId);
    state.userData = JSON.parse(localStorage.getItem('ecoventure_userData') || '{"totalPoints":0,"lifetimePoints":0,"submissions":0,"currentStreak":0,"longestStreak":0,"redemptionHistory":[]}');
  }

  setupEventListeners();
  setupTabNavigation();
  setupAuthListeners();
  updateLocationStatus('valid', '✓ Demo Mode');
  updateStatsUI();
  await loadRewards();

  // Load AI models
  await loadModels();
}

async function loadModels() {
  try {
    showToast('Loading AI models...', 'info');
    elements.detectBtn.disabled = true;

    // Load COCO-SSD (primary detection)
    state.cocoModel = await cocoSsd.load({
      base: 'lite_mobilenet_v2' // Faster model
    });
    console.log('COCO-SSD model loaded successfully');

    // Check external API availability in parallel
    const [trashAIAvailable, tacoAvailable] = await Promise.all([
      checkTrashAI(),
      checkTACOAPI()
    ]);

    state.trashAIAvailable = trashAIAvailable;
    state.tacoAPIAvailable = tacoAvailable;

    state.modelLoaded = true;
    elements.detectBtn.disabled = false;

    // Show status based on available models
    const models = ['COCO-SSD (enhanced)'];
    if (state.trashAIAvailable) models.push('TrashAI');
    if (state.tacoAPIAvailable) models.push('TACO');

    showToast(`AI Ready! (${models.join(' + ')})`, 'success');
    console.log('Available AI models:', models);
  } catch (error) {
    console.error('Failed to load models:', error);
    showToast('AI models failed to load. Refresh to retry.', 'error');
  }
}

// TrashAI Integration (https://trashai.org) - Free, no API key needed
async function checkTrashAI() {
  try {
    // Test if TrashAI endpoint is reachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(TRASHAI_ENDPOINT, {
      method: 'HEAD',
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeoutId);
    return response !== null;
  } catch (e) {
    console.warn('TrashAI not available:', e.message);
    return false;
  }
}

async function detectWithTrashAI(imageData) {
  if (!state.trashAIAvailable) return [];

  try {
    const response = await fetch(TRASHAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageData })
    });

    if (response.ok) {
      const data = await response.json();
      // TrashAI returns detections with label and confidence
      return data.detections || data.predictions || [];
    }
  } catch (e) {
    console.warn('TrashAI detection failed:', e.message);
  }
  return [];
}

// Confidence Boosting System
function updateConfidenceTracker(detections) {
  confidenceTracker.frameCount++;

  // Update existing detections
  for (const [itemClass, data] of confidenceTracker.detections) {
    const framesSinceLastSeen = confidenceTracker.frameCount - data.lastSeen;
    if (framesSinceLastSeen > confidenceTracker.DECAY_FRAMES) {
      // Remove stale detections
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
      existing.rawConfidence = det.score;
      // Boost confidence based on persistence
      if (existing.count >= confidenceTracker.BOOST_THRESHOLD) {
        existing.boostedConfidence = Math.min(det.score * confidenceTracker.BOOST_MULTIPLIER, 0.99);
      }
    } else {
      confidenceTracker.detections.set(itemClass, {
        count: 1,
        lastSeen: confidenceTracker.frameCount,
        rawConfidence: det.score,
        boostedConfidence: det.score
      });
    }
  });
}

function getBoostedConfidence(itemClass, rawScore) {
  const data = confidenceTracker.detections.get(itemClass.toLowerCase());
  if (data && data.count >= confidenceTracker.BOOST_THRESHOLD) {
    return data.boostedConfidence;
  }
  return rawScore;
}

function resetConfidenceTracker() {
  confidenceTracker.detections.clear();
  confidenceTracker.frameCount = 0;
}

function setupEventListeners() {s
  elements.videoOverlay.addEventListener('click', startCamera);
  elements.recordBtn.addEventListener('click', toggleRecording);
  elements.switchCameraBtn.addEventListener('click', switchCamera);
  elements.detectBtn.addEventListener('click', toggleDetection);
  elements.newRecordingBtn.addEventListener('click', resetToCamera);
  elements.modalClose.addEventListener('click', closeModal);
  elements.rewardModal.addEventListener('click', (e) => {
    if (e.target === elements.rewardModal) closeModal();
  });
}

// Camera Functions
async function startCamera() {
  try {
    const constraints = {
      video: {
        facingMode: state.facingMode,
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: true
    };

    state.stream = await navigator.mediaDevices.getUserMedia(constraints);
    elements.videoPreview.srcObject = state.stream;

    elements.videoPreview.onloadedmetadata = () => {
      elements.detectionCanvas.width = elements.videoPreview.videoWidth;
      elements.detectionCanvas.height = elements.videoPreview.videoHeight;
    };

    elements.videoOverlay.classList.add('hidden');
    elements.recordBtn.disabled = false;

    showToast('Camera ready! Click the magnifier for live detection', 'success');
  } catch (error) {
    console.error('Camera error:', error);
    showToast('Camera error: ' + error.message, 'error');
  }
}

async function switchCamera() {
  if (state.isRecording) return;
  state.facingMode = state.facingMode === 'environment' ? 'user' : 'environment';
  if (state.stream) {
    state.stream.getTracks().forEach(track => track.stop());
  }
  await startCamera();
}

// Detection Functions
function toggleDetection() {
  if (state.isDetecting) {
    stopDetection();
  } else {
    startDetection();
  }
}

function startDetection() {
  if (!state.stream) {
    showToast('Start the camera first!', 'warning');
    return;
  }

  if (!state.modelLoaded) {
    showToast('AI model still loading...', 'warning');
    return;
  }

  state.isDetecting = true;
  resetConfidenceTracker();
  elements.detectBtn.classList.add('active');
  elements.detectionBadge.classList.remove('hidden');
  updateDetectionBadge('Scanning...', 'blue');

  runDetectionLoop();
}

function stopDetection() {
  state.isDetecting = false;
  elements.detectBtn.classList.remove('active');
  elements.detectionBadge.classList.add('hidden');

  if (state.detectionLoop) {
    cancelAnimationFrame(state.detectionLoop);
    state.detectionLoop = null;
  }

  const ctx = elements.detectionCanvas.getContext('2d');
  ctx.clearRect(0, 0, elements.detectionCanvas.width, elements.detectionCanvas.height);
}

function updateDetectionBadge(text, color) {
  const badge = elements.detectionBadge;
  badge.querySelector('.detection-text').textContent = text;

  const colors = {
    green: 'rgba(16, 185, 129, 0.9)',
    yellow: 'rgba(245, 158, 11, 0.9)',
    blue: 'rgba(59, 130, 246, 0.9)',
    red: 'rgba(239, 68, 68, 0.9)'
  };
  badge.style.background = colors[color] || colors.blue;
}

async function runDetectionLoop() {
  if (!state.isDetecting || !state.modelLoaded) return;

  try {
    // Run COCO-SSD detection
    const allPredictions = await state.cocoModel.detect(elements.videoPreview);

    // Filter out ignored classes FIRST (phones, laptops, cars, people, etc.)
    const cocoPredictions = allPredictions.filter(p =>
      !IGNORE_CLASSES.includes(p.class.toLowerCase())
    );

    // Update confidence tracker for boosting (only with filtered predictions)
    updateConfidenceTracker(cocoPredictions);

    // Filter for trash items with confidence boosting - LOWER THRESHOLD
    const trashItems = cocoPredictions.filter(p => {
      if (!COCO_TRASH_CLASSES.includes(p.class.toLowerCase())) return false;
      const boostedScore = getBoostedConfidence(p.class, p.score);
      return boostedScore > MIN_CONFIDENCE; // Use configurable threshold (0.15)
    }).map(p => ({
      ...p,
      boostedScore: getBoostedConfidence(p.class, p.score)
    }));

    // Run TrashAI if available (less frequently to reduce API calls)
    let trashAIResults = [];
    const shouldCallTrashAI = state.trashAIAvailable && (confidenceTracker.frameCount % 5 === 0);

    if (shouldCallTrashAI) {
      // Capture frame for TrashAI API
      const canvas = document.createElement('canvas');
      canvas.width = elements.videoPreview.videoWidth;
      canvas.height = elements.videoPreview.videoHeight;
      canvas.getContext('2d').drawImage(elements.videoPreview, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      trashAIResults = await detectWithTrashAI(imageData);
    }

    // Detect person for verification (use allPredictions, not filtered)
    const personDetected = allPredictions.some(p => p.class === 'person' && p.score > 0.5);

    // Draw detections - only shows trash items (filtered)
    drawDetections(cocoPredictions, trashItems);

    // Combine all results for stats
    const allTrashItems = [
      ...trashItems.map(p => ({ class: p.class, score: p.boostedScore })),
      ...trashAIResults.map(p => ({ class: p.label || p.class, score: p.confidence || p.score }))
    ];

    const trashFound = allTrashItems.length > 0;

    if (trashFound) {
      // Get unique items with best confidence
      const itemMap = new Map();
      allTrashItems.forEach(item => {
        const existing = itemMap.get(item.class);
        if (!existing || existing.score < item.score) {
          itemMap.set(item.class, item);
        }
      });

      const displayItems = Array.from(itemMap.keys()).slice(0, 3);
      const confidenceInfo = confidenceTracker.detections.get(displayItems[0]?.toLowerCase());
      const boostIndicator = confidenceInfo?.count >= confidenceTracker.BOOST_THRESHOLD ? ' +' : '';

      updateDetectionBadge(`Found: ${displayItems.join(', ')}${boostIndicator}`, 'green');

      // Add to detected items set
      allTrashItems.forEach(item => state.detectedItems.add(item.class));
    } else if (personDetected) {
      updateDetectionBadge('Person detected, show trash!', 'yellow');
    } else {
      updateDetectionBadge('Scanning...', 'blue');
    }

    // Update stats for recording
    if (state.isRecording) {
      state.totalFramesAnalyzed++;
      if (trashFound) state.framesWithTrash++;
      if (personDetected) state.framesWithPerson++;
    }

    // Debug logging
    if (trashItems.length > 0) {
      console.log('Detected:', trashItems.map(p =>
        `${p.class} ${(p.score*100).toFixed(0)}%->${(p.boostedScore*100).toFixed(0)}%`
      ).join(', '));
    }

  } catch (error) {
    console.error('Detection error:', error);
  }

  // Schedule next detection
  setTimeout(() => {
    if (state.isDetecting) runDetectionLoop();
  }, DETECTION_INTERVAL);
}

function drawDetections(predictions, trashItems) {
  const ctx = elements.detectionCanvas.getContext('2d');
  const canvas = elements.detectionCanvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  predictions.forEach(prediction => {
    // Use lower threshold for initial detection
    if (prediction.score < MIN_CONFIDENCE) return;

    const classLower = prediction.class.toLowerCase();

    // SKIP ignored classes completely (phones, laptops, cars, etc.)
    if (IGNORE_CLASSES.includes(classLower)) return;

    const [x, y, width, height] = prediction.bbox;
    const isTrash = COCO_TRASH_CLASSES.includes(classLower);

    // Only draw trash items
    if (!isTrash) return;

    const trashItem = trashItems.find(t => t.class === prediction.class);
    const isBoosted = trashItem && confidenceTracker.detections.get(classLower)?.count >= confidenceTracker.BOOST_THRESHOLD;

    // Green color for trash
    const color = isBoosted ? '#059669' : '#10B981'; // darker green if boosted

    // Draw bounding box (thicker if boosted)
    ctx.strokeStyle = color;
    ctx.lineWidth = isBoosted ? 4 : 2;
    ctx.strokeRect(x, y, width, height);

    // Draw label background
    const boostedScore = trashItem ? trashItem.boostedScore : prediction.score;
    const boostMarker = isBoosted ? '+' : '';
    const label = `🗑️ ${prediction.class} ${Math.round(boostedScore * 100)}%${boostMarker}`;
    ctx.font = 'bold 14px Arial';
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = color;
    ctx.fillRect(x, y - 24, textWidth + 10, 24);

    // Draw label text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, x + 5, y - 7);
  });
}

// Recording Functions
function toggleRecording() {
  if (state.isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  if (!state.stream) {
    showToast('Start the camera first!', 'warning');
    return;
  }

  // Reset all detection stats
  state.detectedItems.clear();
  state.framesWithTrash = 0;
  state.framesWithPerson = 0;
  state.totalFramesAnalyzed = 0;
  state.recordedChunks = [];
  resetConfidenceTracker();

  // Auto-start detection during recording
  if (!state.isDetecting) {
    startDetection();
  }

  const options = { mimeType: 'video/webm;codecs=vp9' };
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    options.mimeType = 'video/webm';
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/mp4';
    }
  }

  try {
    state.mediaRecorder = new MediaRecorder(state.stream, options);
  } catch (e) {
    state.mediaRecorder = new MediaRecorder(state.stream);
  }

  state.mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) state.recordedChunks.push(e.data);
  };

  state.mediaRecorder.onstop = handleRecordingComplete;
  state.mediaRecorder.start(1000);

  state.isRecording = true;
  state.recordingStartTime = Date.now();

  elements.recordBtn.classList.add('recording');
  elements.recordingIndicator.classList.add('active');
  elements.switchCameraBtn.disabled = true;

  state.recordingTimer = setInterval(updateRecordingTime, 1000);

  setTimeout(() => {
    if (state.isRecording) {
      stopRecording();
      showToast('Max recording time reached', 'warning');
    }
  }, MAX_RECORDING_TIME * 1000);

  showToast('Recording! Show bottles, cups, or trash to camera', 'info');
}

function stopRecording() {
  if (!state.isRecording || !state.mediaRecorder) return;

  const duration = (Date.now() - state.recordingStartTime) / 1000;
  if (duration < MIN_RECORDING_TIME) {
    showToast(`Record for at least ${MIN_RECORDING_TIME} seconds`, 'warning');
    return;
  }

  state.mediaRecorder.stop();
  state.isRecording = false;

  elements.recordBtn.classList.remove('recording');
  elements.recordingIndicator.classList.remove('active');
  elements.switchCameraBtn.disabled = false;

  clearInterval(state.recordingTimer);
  elements.recTime.textContent = '00:00';

  stopDetection();
}

function updateRecordingTime() {
  const elapsed = Math.floor((Date.now() - state.recordingStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  elements.recTime.textContent = `${minutes}:${seconds}`;
}

async function handleRecordingComplete() {
  showSection('processing');
  await analyzeAndSubmit();
}

// Analysis
async function analyzeAndSubmit() {
  const steps = [
    { progress: 30, text: 'Analyzing detections...' },
    { progress: 60, text: 'Calculating results...' },
    { progress: 100, text: 'Done!' }
  ];

  for (const step of steps) {
    elements.progressFill.style.width = `${step.progress}%`;
    elements.processingStatus.textContent = step.text;
    await sleep(400);
  }

  // Calculate results based on actual detections
  const detectedItems = Array.from(state.detectedItems);
  const totalFrames = state.totalFramesAnalyzed;

  // Calculate actual percentages
  const trashPercent = totalFrames > 0 ? (state.framesWithTrash / totalFrames) * 100 : 0;

  console.log('Detection Results:', {
    totalFrames,
    framesWithTrash: state.framesWithTrash,
    trashPercent: trashPercent.toFixed(1) + '%',
    detectedItems
  });

  // SUCCESS requires trash to be detected in at least 15% of frames (lowered with confidence boosting)
  const success = trashPercent >= 15 && detectedItems.length > 0;

  if (success) {
    const points = calculatePoints(detectedItems, trashPercent);

    // Award points locally
    if (window.electronAPI) {
      state.userData = await window.electronAPI.awardPoints({ points: points.points });
    } else {
      state.userData.totalPoints += points.points;
      state.userData.lifetimePoints += points.points;
      state.userData.submissions++;
      localStorage.setItem('ecoventure_userData', JSON.stringify(state.userData));
    }

    // Sync to Supabase if logged in
    if (state.isLoggedIn && window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
      try {
        // Create submission record (this also updates profile via trigger)
        await window.EcoVentureAuth.createSubmission(
          state.authUser.id,
          points.points,
          detectedItems,
          state.userProfile?.area || null,
          state.userProfile?.country || null
        );

        // Refresh profile to get updated totals
        const updatedProfile = await window.EcoVentureAuth.getUserProfile(state.authUser.id);
        state.userProfile = updatedProfile;

        console.log('Points synced to Supabase:', points.points);
      } catch (syncError) {
        console.error('Failed to sync points to Supabase:', syncError);
        // Points still saved locally, will sync later
      }
    }

    showResults({
      success: true,
      trashPercent,
      detectedItems,
      pointsAwarded: points
    });

    updateStatsUI();
    await loadRewards();
  } else {
    // FAIL - give specific feedback
    let errorMsg = 'Detection failed: ';
    if (detectedItems.length === 0) {
      errorMsg += 'No items detected! Try bottles, cups, or food items.';
    } else if (trashPercent < 15) {
      errorMsg += 'Items not visible long enough. Keep in frame longer!';
    }

    showResults({
      success: false,
      error: errorMsg,
      trashPercent,
      detectedItems
    });
  }
}

function calculatePoints(items, trashPercent) {
  let points = 0;
  const breakdown = [];

  // Base points for successful detection
  points += 50;
  breakdown.push({ points: 50, reason: 'Verified trash recording' });

  // First time bonus
  if (state.userData.submissions === 0) {
    points += 100;
    breakdown.push({ points: 100, reason: 'Welcome bonus!' });
  }

  // High visibility bonus
  if (trashPercent >= 50) {
    points += 30;
    breakdown.push({ points: 30, reason: 'Great visibility' });
  }

  // Multiple items bonus
  if (items.length > 1) {
    const bonus = 15 * (items.length - 1);
    points += bonus;
    breakdown.push({ points: bonus, reason: `${items.length} different items` });
  }

  // Bottle bonus (common trash)
  if (items.some(i => i.toLowerCase() === 'bottle')) {
    points += 20;
    breakdown.push({ points: 20, reason: 'Bottle detected!' });
  }

  return { points, breakdown };
}

function showResults(result) {
  showSection('results');

  if (result.success) {
    elements.resultsCard.className = 'results-card success';
    elements.resultsCard.innerHTML = `
      <div class="result-header">
        <span class="result-icon">🎉</span>
        <h2 class="result-title">Success!</h2>
        <p class="result-subtitle">AI verified your trash pickup</p>
      </div>

      <div class="points-earned">
        <span class="points-value">+${result.pointsAwarded.points}</span>
        <span class="points-label">Points Earned</span>

        <div class="points-breakdown">
          ${result.pointsAwarded.breakdown.map(item => `
            <div class="breakdown-item">
              <span>${item.reason}</span>
              <span>+${item.points}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="verification-details">
        <div class="verification-item">
          <span class="icon">🗑️</span>
          <span class="value">${Math.round(result.trashPercent)}%</span>
          <span class="label">Trash Visible</span>
        </div>
        <div class="verification-item">
          <span class="icon">🏷️</span>
          <span class="value">${result.detectedItems.length}</span>
          <span class="label">Types Found</span>
        </div>
        <div class="verification-item">
          <span class="icon">📦</span>
          <span class="value">${result.detectedItems.join(', ') || 'None'}</span>
          <span class="label">Detected Items</span>
        </div>
      </div>
    `;

    showToast(`Earned ${result.pointsAwarded.points} points!`, 'success');
  } else {
    elements.resultsCard.className = 'results-card failure';
    elements.resultsCard.innerHTML = `
      <div class="result-header">
        <span class="result-icon">❌</span>
        <h2 class="result-title">Not Verified</h2>
        <p class="result-subtitle">${result.error}</p>
      </div>

      <div class="verification-details" style="margin-top: 16px;">
        <div class="verification-item">
          <span class="icon">🗑️</span>
          <span class="value">${Math.round(result.trashPercent || 0)}%</span>
          <span class="label">Trash (need 15%+)</span>
        </div>
        <div class="verification-item">
          <span class="icon">🏷️</span>
          <span class="value">${result.detectedItems?.length || 0}</span>
          <span class="label">Items Found</span>
        </div>
      </div>

      <div style="background: var(--bg-card); border-radius: var(--border-radius); padding: 14px; margin-top: 16px;">
        <h4 style="margin-bottom: 10px; font-size: 0.9rem;">Detectable items (show these to camera):</h4>
        <ul style="list-style-position: inside; color: var(--text-secondary); font-size: 0.85rem;">
          <li>Bottles (plastic, glass, wine)</li>
          <li>Cups and glasses</li>
          <li>Bowls and containers</li>
          <li>Food items (banana, apple, etc.)</li>
          <li>Utensils (fork, knife, spoon)</li>
          <li>Bags, backpacks, suitcases</li>
        </ul>
      </div>
    `;

    showToast('No items detected. Try again!', 'error');
  }
}

// Stats & Rewards
function updateStatsUI() {
  const data = state.userData;
  elements.headerPoints.textContent = `${data.totalPoints} pts`;
  elements.totalPoints.textContent = data.totalPoints;
  elements.submissions.textContent = data.submissions;
  elements.streak.textContent = data.currentStreak || 0;

  const level = calculateLevel(data.lifetimePoints);
  elements.levelIcon.textContent = level.current.icon;
  elements.levelName.textContent = level.current.name.split(' ')[0];
  elements.currentLevel.textContent = `${level.current.icon} ${level.current.name}`;

  if (level.next) {
    elements.nextLevel.textContent = `Next: ${level.next.name}`;
    elements.levelProgressFill.style.width = `${level.progress}%`;
  } else {
    elements.nextLevel.textContent = 'Max Level!';
    elements.levelProgressFill.style.width = '100%';
  }
}

function calculateLevel(points) {
  const levels = [
    { name: 'Eco Beginner', minPoints: 0, icon: '🌱' },
    { name: 'Litter Picker', minPoints: 200, icon: '🧤' },
    { name: 'Clean Champion', minPoints: 500, icon: '🏆' },
    { name: 'Earth Guardian', minPoints: 1000, icon: '🌍' },
    { name: 'Eco Warrior', minPoints: 2500, icon: '⚔️' },
    { name: 'Planet Protector', minPoints: 5000, icon: '🛡️' }
  ];

  let current = levels[0];
  for (const level of levels) {
    if (points >= level.minPoints) current = level;
  }

  const idx = levels.indexOf(current);
  const next = levels[idx + 1] || null;
  let progress = 100;
  if (next) {
    progress = ((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100;
  }

  return { current, next, progress };
}

async function loadRewards() {
  let rewards;
  if (window.electronAPI) {
    rewards = await window.electronAPI.getRewards();
  } else {
    rewards = [
      { id: 'amazon_5', name: 'Amazon', value: '$5', pointsCost: 500, category: 'gift_card', image: '🛒' },
      { id: 'amazon_10', name: 'Amazon', value: '$10', pointsCost: 950, category: 'gift_card', image: '🛒' },
      { id: 'starbucks_5', name: 'Starbucks', value: '$5', pointsCost: 500, category: 'gift_card', image: '☕' },
      { id: 'target_10', name: 'Target', value: '$10', pointsCost: 950, category: 'gift_card', image: '🎯' },
      { id: 'donation_trees', name: 'Plant Trees', value: '5 Trees', pointsCost: 300, category: 'donation', image: '🌳' },
      { id: 'donation_ocean', name: 'Ocean Cleanup', value: '1 lb', pointsCost: 250, category: 'donation', image: '🌊' }
    ];
  }

  // Filter by category if set
  if (state.rewardCategory && state.rewardCategory !== 'all') {
    rewards = rewards.filter(r => r.category === state.rewardCategory);
  }

  renderRewards(rewards);
}

function renderRewards(rewards) {
  const userPoints = state.userData?.totalPoints || 0;
  elements.rewardsGrid.innerHTML = rewards.map(reward => {
    const canAfford = userPoints >= reward.pointsCost;
    return `
      <div class="reward-card ${canAfford ? '' : 'locked'}"
           onclick="${canAfford ? `showRewardModal('${reward.id}', ${reward.pointsCost})` : ''}">
        <span class="reward-icon">${reward.image}</span>
        <div class="reward-name">${reward.name}</div>
        <div class="reward-value">${reward.value}</div>
        <div class="reward-cost">${reward.pointsCost} pts</div>
      </div>
    `;
  }).join('');
}

window.showRewardModal = async function(rewardId, pointsCost) {
  let rewards;
  if (window.electronAPI) {
    rewards = await window.electronAPI.getRewards();
  } else {
    rewards = [
      { id: 'amazon_5', name: 'Amazon', value: '$5', pointsCost: 500, description: '$5 Amazon Gift Card', image: '🛒' },
      { id: 'starbucks_5', name: 'Starbucks', value: '$5', pointsCost: 500, description: '$5 Starbucks Gift Card', image: '☕' },
      { id: 'donation_trees', name: 'Plant Trees', value: '5 Trees', pointsCost: 300, description: 'Plant 5 trees', image: '🌳' },
      { id: 'donation_ocean', name: 'Ocean Cleanup', value: '1 lb', pointsCost: 250, description: 'Remove ocean trash', image: '🌊' }
    ];
  }

  const reward = rewards.find(r => r.id === rewardId);
  if (!reward) return;

  elements.modalBody.innerHTML = `
    <div class="modal-reward">
      <span class="modal-reward-icon">${reward.image}</span>
      <h3 class="modal-reward-name">${reward.name}</h3>
      <div class="modal-reward-value">${reward.value}</div>
      <p class="modal-reward-cost">${reward.pointsCost} points</p>
      <button class="btn btn-primary btn-large" style="margin-top: 16px;"
              onclick="redeemReward('${reward.id}', ${reward.pointsCost})">
        Redeem Now
      </button>
      <p style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">
        Balance: ${state.userData.totalPoints} pts
      </p>
    </div>
  `;

  elements.rewardModal.classList.remove('hidden');
};

window.redeemReward = async function(rewardId, pointsCost) {
  let result;
  if (window.electronAPI) {
    result = await window.electronAPI.redeemReward({ rewardId, pointsCost });
  } else {
    if (state.userData.totalPoints < pointsCost) {
      result = { success: false, error: 'Not enough points' };
    } else {
      state.userData.totalPoints -= pointsCost;
      localStorage.setItem('ecoventure_userData', JSON.stringify(state.userData));
      result = { success: true, code: generateCode(), remainingPoints: state.userData.totalPoints };
    }
  }

  if (result.success) {
    elements.modalBody.innerHTML = `
      <div class="modal-reward">
        <span class="modal-reward-icon">🎁</span>
        <h3 class="modal-reward-name">Redeemed!</h3>
        <p>Your code:</p>
        <div class="redemption-code">${result.code}</div>
        <button class="btn btn-secondary btn-large" style="margin-top: 16px;" onclick="closeModal()">Done</button>
      </div>
    `;
    showToast('Reward redeemed!', 'success');
    if (window.electronAPI) state.userData = await window.electronAPI.getUserData();
    updateStatsUI();
    await loadRewards();
  } else {
    showToast(result.error, 'error');
    closeModal();
  }
};

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function closeModal() {
  elements.rewardModal.classList.add('hidden');
}

// UI Helpers
function showSection(section) {
  elements.cameraSection.classList.add('hidden');
  elements.processingSection.classList.add('hidden');
  elements.resultsSection.classList.add('hidden');

  switch (section) {
    case 'camera': elements.cameraSection.classList.remove('hidden'); break;
    case 'processing':
      elements.processingSection.classList.remove('hidden');
      elements.progressFill.style.width = '0%';
      break;
    case 'results': elements.resultsSection.classList.remove('hidden'); break;
  }
}

function resetToCamera() {
  showSection('camera');
  state.recordedChunks = [];
  state.detectedItems.clear();
  resetConfidenceTracker();
  if (!state.stream) startCamera();
}

function updateLocationStatus(status, text) {
  elements.locationStatus.className = `location-status ${status}`;
  elements.locationStatus.innerHTML = `
    <span class="status-icon">📍</span>
    <span class="status-text">${text}</span>
  `;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// Navigation & Tabs
// ========================================

function setupTabNavigation() {
  // Tab navigation
  const navTabBtns = document.querySelectorAll('.nav-tab');
  navTabBtns.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Leaderboard toggle
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => switchLeaderboard(btn.dataset.leaderboard));
  });

  // Category buttons
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => filterRewards(btn.dataset.category));
  });
}

function switchTab(tabName) {
  state.currentTab = tabName;

  // Update nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}Tab`).classList.add('active');

  // Load data for specific tabs
  if (tabName === 'leaderboard') {
    loadLeaderboardData();
  } else if (tabName === 'redeem') {
    updateRedeemSection();
  } else if (tabName === 'profile') {
    updateProfileSection();
  }
}

function switchLeaderboard(type) {
  state.currentLeaderboard = type;

  // Update toggle buttons
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.leaderboard === type);
  });

  // Update leaderboard content
  document.querySelectorAll('.leaderboard-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${type}Leaderboard`).classList.add('active');

  loadLeaderboardData();
}

function filterRewards(category) {
  state.rewardCategory = category;

  // Update category buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });

  loadRewards();
}

// ========================================
// Authentication
// ========================================

function setupAuthListeners() {
  // Auth banner button
  const authBannerBtn = document.getElementById('authBannerBtn');
  if (authBannerBtn) {
    authBannerBtn.addEventListener('click', () => openAuthModal('signin'));
  }

  // Header auth button
  const authBtn = document.getElementById('authBtn');
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      if (state.isLoggedIn) {
        switchTab('profile');
      } else {
        openAuthModal('signin');
      }
    });
  }

  // Profile buttons
  const showSignUpBtn = document.getElementById('showSignUpBtn');
  const showSignInBtn = document.getElementById('showSignInBtn');
  if (showSignUpBtn) showSignUpBtn.addEventListener('click', () => openAuthModal('signup'));
  if (showSignInBtn) showSignInBtn.addEventListener('click', () => openAuthModal('signin'));

  // Leaderboard sign in buttons
  const leaderboardSignInBtn = document.getElementById('leaderboardSignInBtn');
  const globalSignInBtn = document.getElementById('globalSignInBtn');
  if (leaderboardSignInBtn) leaderboardSignInBtn.addEventListener('click', () => openAuthModal('signin'));
  if (globalSignInBtn) globalSignInBtn.addEventListener('click', () => openAuthModal('signin'));

  // Shop sign in button
  const shopSignInBtn = document.getElementById('shopSignInBtn');
  if (shopSignInBtn) shopSignInBtn.addEventListener('click', () => openAuthModal('signin'));

  // Modal controls
  const authModalClose = document.getElementById('authModalClose');
  if (authModalClose) {
    authModalClose.addEventListener('click', closeAuthModal);
  }

  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Form switches
  const switchToSignUp = document.getElementById('switchToSignUp');
  const switchToSignIn = document.getElementById('switchToSignIn');
  const backToSignInBtn = document.getElementById('backToSignInBtn');

  if (switchToSignUp) switchToSignUp.addEventListener('click', () => showAuthForm('signup'));
  if (switchToSignIn) switchToSignIn.addEventListener('click', () => showAuthForm('signin'));
  if (backToSignInBtn) backToSignInBtn.addEventListener('click', () => showAuthForm('signin'));

  // Form submissions
  const signInSubmitBtn = document.getElementById('signInSubmitBtn');
  const signUpSubmitBtn = document.getElementById('signUpSubmitBtn');

  if (signInSubmitBtn) signInSubmitBtn.addEventListener('click', handleSignIn);
  if (signUpSubmitBtn) signUpSubmitBtn.addEventListener('click', handleSignUp);

  // Sign out
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);

  // Area modal
  const areaModalClose = document.getElementById('areaModalClose');
  const setAreaBtn = document.getElementById('setAreaBtn');
  const changeAreaBtn = document.getElementById('changeAreaBtn');
  const saveAreaBtn = document.getElementById('saveAreaBtn');

  if (areaModalClose) areaModalClose.addEventListener('click', closeAreaModal);
  if (setAreaBtn) setAreaBtn.addEventListener('click', openAreaModal);
  if (changeAreaBtn) changeAreaBtn.addEventListener('click', openAreaModal);
  if (saveAreaBtn) saveAreaBtn.addEventListener('click', handleSaveArea);

  const areaModal = document.getElementById('areaModal');
  if (areaModal) {
    areaModal.addEventListener('click', (e) => {
      if (e.target === areaModal) closeAreaModal();
    });
  }
}

function openAuthModal(type = 'signin') {
  const authModal = document.getElementById('authModal');
  authModal.classList.remove('hidden');
  showAuthForm(type);
}

function closeAuthModal() {
  const authModal = document.getElementById('authModal');
  authModal.classList.add('hidden');
}

function showAuthForm(type) {
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const verificationForm = document.getElementById('verificationForm');

  signInForm.classList.add('hidden');
  signUpForm.classList.add('hidden');
  verificationForm.classList.add('hidden');

  if (type === 'signin') {
    signInForm.classList.remove('hidden');
  } else if (type === 'signup') {
    signUpForm.classList.remove('hidden');
  } else if (type === 'verification') {
    verificationForm.classList.remove('hidden');
  }
}

async function handleSignIn() {
  const email = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;

  if (!email || !password) {
    showToast('Please fill in all fields', 'warning');
    return;
  }

  // Check if Supabase is configured
  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      const data = await window.EcoVentureAuth.signIn(email, password);
      state.authUser = data.user;
      state.isLoggedIn = true;

      // Try to get profile, create one if it doesn't exist
      let profile = null;
      try {
        profile = await window.EcoVentureAuth.getUserProfile(data.user.id);
      } catch (profileError) {
        console.log('Profile not found, creating one...');
        // Profile doesn't exist, it will be created on first use
        profile = {
          id: data.user.id,
          username: data.user.email.split('@')[0],
          display_name: data.user.user_metadata?.display_name || data.user.email.split('@')[0],
          total_points: 0,
          submissions: 0,
          current_streak: 0,
          area: null,
          country: null,
          friend_code: null
        };
      }
      state.userProfile = profile;

      syncAuthToModules();
      closeAuthModal();
      updateAuthUI();
      showToast('Welcome back!', 'success');
    } catch (error) {
      showToast(error.message || 'Sign in failed', 'error');
    }
  } else {
    // Demo mode - simulate login
    state.isLoggedIn = true;
    state.authUser = { id: 'demo_user', email };
    state.userProfile = {
      username: email.split('@')[0],
      display_name: email.split('@')[0],
      total_points: state.userData?.totalPoints || 0,
      submissions: state.userData?.submissions || 0,
      current_streak: state.userData?.currentStreak || 0,
      area: null,
      country: null
    };

    syncAuthToModules();
    closeAuthModal();
    updateAuthUI();
    showToast('Demo mode: Signed in!', 'success');
  }
}

async function handleSignUp() {
  const username = document.getElementById('signUpUsername').value;
  const email = document.getElementById('signUpEmail').value;
  const password = document.getElementById('signUpPassword').value;

  if (!username || !email || !password) {
    showToast('Please fill in all fields', 'warning');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'warning');
    return;
  }

  // Check if Supabase is configured
  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      await window.EcoVentureAuth.signUp(email, password, username, username);
      showAuthForm('verification');
      showToast('Check your email for verification!', 'success');
    } catch (error) {
      showToast(error.message || 'Sign up failed', 'error');
    }
  } else {
    // Demo mode
    state.isLoggedIn = true;
    state.authUser = { id: 'demo_user', email };
    state.userProfile = {
      username,
      display_name: username,
      total_points: state.userData?.totalPoints || 0,
      submissions: state.userData?.submissions || 0,
      current_streak: state.userData?.currentStreak || 0,
      area: null,
      country: null
    };

    syncAuthToModules();
    closeAuthModal();
    updateAuthUI();
    showToast('Demo mode: Account created!', 'success');
  }
}

async function handleSignOut() {
  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      await window.EcoVentureAuth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  state.isLoggedIn = false;
  state.authUser = null;
  state.userProfile = null;

  syncAuthToModules();
  updateAuthUI();
  showToast('Signed out', 'success');
  switchTab('home');
}

// Sync auth state from app.js to other modules (AuthUI, etc.)
function syncAuthToModules() {
  const authUI = window.EcoVentureAuthUI;
  if (authUI) {
    authUI.isLoggedIn = state.isLoggedIn;
    authUI.authUser = state.authUser;
    authUI.userProfile = state.userProfile;
  }
}

function updateAuthUI() {
  const authBanner = document.getElementById('authBanner');
  const authBtn = document.getElementById('authBtn');
  const profileLoggedOut = document.getElementById('profileLoggedOut');
  const profileLoggedIn = document.getElementById('profileLoggedIn');

  if (state.isLoggedIn) {
    if (authBanner) authBanner.classList.add('hidden');
    if (authBtn) authBtn.classList.add('logged-in');
    if (profileLoggedOut) profileLoggedOut.classList.add('hidden');
    if (profileLoggedIn) profileLoggedIn.classList.remove('hidden');

    updateProfileSection();
  } else {
    if (authBanner) authBanner.classList.remove('hidden');
    if (authBtn) authBtn.classList.remove('logged-in');
    if (profileLoggedOut) profileLoggedOut.classList.remove('hidden');
    if (profileLoggedIn) profileLoggedIn.classList.add('hidden');
  }

  // Refresh shop auth state
  if (window.EcoVentureShop) {
    window.EcoVentureShop.renderShop();
  }
}

// ========================================
// Profile Section
// ========================================

function updateProfileSection() {
  if (!state.isLoggedIn || !state.userProfile) return;

  const profile = state.userProfile;

  // Update profile info
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileArea = document.getElementById('profileArea');

  if (profileName) profileName.textContent = profile.display_name || profile.username;
  if (profileEmail && state.authUser) profileEmail.textContent = state.authUser.email;
  if (profileArea) {
    profileArea.textContent = profile.area
      ? `${profile.area}${profile.country ? ', ' + profile.country : ''}`
      : 'Not set';
  }

  // Update profile stats
  const profileTotalPoints = document.getElementById('profileTotalPoints');
  const profileSubmissions = document.getElementById('profileSubmissions');
  const profileStreak = document.getElementById('profileStreak');

  if (profileTotalPoints) profileTotalPoints.textContent = profile.total_points || state.userData?.totalPoints || 0;
  if (profileSubmissions) profileSubmissions.textContent = profile.submissions || state.userData?.submissions || 0;
  if (profileStreak) profileStreak.textContent = profile.current_streak || state.userData?.currentStreak || 0;
}

// ========================================
// Area Modal
// ========================================

function openAreaModal() {
  const areaModal = document.getElementById('areaModal');
  areaModal.classList.remove('hidden');

  // Pre-fill if area exists
  if (state.userProfile?.area) {
    document.getElementById('areaInput').value = state.userProfile.area;
    document.getElementById('countryInput').value = state.userProfile.country || '';
  }
}

function closeAreaModal() {
  const areaModal = document.getElementById('areaModal');
  areaModal.classList.add('hidden');
}

async function handleSaveArea() {
  const area = document.getElementById('areaInput').value.trim();
  const country = document.getElementById('countryInput').value.trim();

  if (!area) {
    showToast('Please enter your city/region', 'warning');
    return;
  }

  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured() && state.authUser) {
    try {
      await window.EcoVentureAuth.updateUserArea(state.authUser.id, area, country);
      state.userProfile.area = area;
      state.userProfile.country = country;
    } catch (error) {
      showToast('Failed to save area', 'error');
      return;
    }
  } else {
    // Demo mode
    state.userProfile.area = area;
    state.userProfile.country = country;
  }

  closeAreaModal();
  updateProfileSection();
  updateAreaDisplay();
  showToast('Area updated!', 'success');

  // Refresh leaderboard if on that tab
  if (state.currentTab === 'leaderboard') {
    loadLeaderboardData();
  }
}

function updateAreaDisplay() {
  const currentAreaName = document.getElementById('currentAreaName');
  if (currentAreaName && state.userProfile?.area) {
    currentAreaName.textContent = state.userProfile.area;
  } else if (currentAreaName) {
    currentAreaName.textContent = 'Set your area';
  }
}

// ========================================
// Leaderboard
// ========================================

async function loadLeaderboardData() {
  if (!state.isLoggedIn) return;

  if (state.currentLeaderboard === 'area') {
    await loadAreaLeaderboard();
  } else if (state.currentLeaderboard === 'global') {
    await loadGlobalLeaderboard();
  }
}

async function loadAreaLeaderboard() {
  const listEl = document.getElementById('areaLeaderboardList');
  const yourRankCard = document.getElementById('yourAreaRank');

  if (!state.userProfile?.area) {
    listEl.innerHTML = `
      <div class="leaderboard-empty">
        <span class="empty-icon">📍</span>
        <p>Set your area to see local rankings</p>
        <button class="btn btn-primary" onclick="openAreaModal()">Set Area</button>
      </div>
    `;
    yourRankCard.querySelector('.rank-number').textContent = '#-';
    yourRankCard.querySelector('.rank-points').textContent = '0 pts';
    return;
  }

  // Update area name display
  updateAreaDisplay();

  let leaderboardData = [];

  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      leaderboardData = await window.EcoVentureAuth.getAreaLeaderboard(state.userProfile.area);
    } catch (error) {
      console.error('Failed to load area leaderboard:', error);
    }
  } else {
    // Demo data
    leaderboardData = generateDemoLeaderboard(state.userProfile.area);
  }

  renderLeaderboard(listEl, leaderboardData, yourRankCard, 'area');
}

async function loadGlobalLeaderboard() {
  const listEl = document.getElementById('globalLeaderboardList');
  const yourRankCard = document.getElementById('yourGlobalRank');

  let leaderboardData = [];

  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      leaderboardData = await window.EcoVentureAuth.getGlobalLeaderboard();
    } catch (error) {
      console.error('Failed to load global leaderboard:', error);
    }
  } else {
    // Demo data
    leaderboardData = generateDemoLeaderboard('Global');
  }

  renderLeaderboard(listEl, leaderboardData, yourRankCard, 'global');
}

function generateDemoLeaderboard(area) {
  const names = ['EcoHero', 'GreenWarrior', 'TrashBuster', 'PlanetSaver', 'CleanChamp', 'EcoNinja', 'RecycleKing', 'GreenQueen'];
  const data = names.map((name, i) => ({
    id: `demo_${i}`,
    username: name,
    display_name: name,
    total_points: Math.floor(Math.random() * 2000) + 500,
    submissions: Math.floor(Math.random() * 50) + 5,
    current_streak: Math.floor(Math.random() * 10),
    area: area
  }));

  // Add current user
  if (state.userProfile) {
    data.push({
      id: state.authUser?.id || 'current_user',
      username: state.userProfile.username,
      display_name: state.userProfile.display_name,
      total_points: state.userData?.totalPoints || 0,
      submissions: state.userData?.submissions || 0,
      current_streak: state.userData?.currentStreak || 0,
      area: state.userProfile.area
    });
  }

  // Sort by points
  data.sort((a, b) => b.total_points - a.total_points);

  return data;
}

function renderLeaderboard(listEl, data, yourRankCard, type) {
  if (data.length === 0) {
    listEl.innerHTML = `
      <div class="leaderboard-empty">
        <span class="empty-icon">📊</span>
        <p>No data yet. Be the first!</p>
      </div>
    `;
    return;
  }

  // Find current user's rank
  const currentUserId = state.authUser?.id || 'current_user';
  const userIndex = data.findIndex(u => u.id === currentUserId);
  const userRank = userIndex !== -1 ? userIndex + 1 : '-';
  const userPoints = userIndex !== -1 ? data[userIndex].total_points : 0;

  // Update your rank card
  yourRankCard.querySelector('.rank-number').textContent = `#${userRank}`;
  yourRankCard.querySelector('.rank-points').textContent = `${userPoints} pts`;

  // Render list (top 10)
  const topUsers = data.slice(0, 10);
  listEl.innerHTML = topUsers.map((user, index) => {
    const rank = index + 1;
    const isCurrentUser = user.id === currentUserId;
    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';

    return `
      <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
        <div class="leaderboard-rank ${rankClass}">${rank}</div>
        <div class="leaderboard-user">
          <span class="leaderboard-username">${user.display_name || user.username}${isCurrentUser ? ' (You)' : ''}</span>
          <span class="leaderboard-stats">${user.submissions} cleanups • ${user.current_streak} day streak</span>
        </div>
        <div class="leaderboard-points">${user.total_points}</div>
      </div>
    `;
  }).join('');
}

// ========================================
// Profile Leaderboard (inside profile tab)
// ========================================

async function loadProfileLeaderboard() {
  const container = document.getElementById('profileLeaderboardList');
  if (!container) return;

  if (!state.isLoggedIn) {
    container.innerHTML = `
      <div class="leaderboard-empty">
        <span class="empty-icon">🔐</span>
        <p>Sign in to see leaderboards</p>
      </div>
    `;
    return;
  }

  // Determine which leaderboard type is active in profile section
  const activeBtn = document.querySelector('#profileLeaderboardSection .toggle-btn.active');
  const type = activeBtn?.dataset?.leaderboard || 'area';

  let leaderboardData = [];

  if (type === 'area') {
    if (!state.userProfile?.area) {
      container.innerHTML = `
        <div class="leaderboard-empty">
          <span class="empty-icon">📍</span>
          <p>Set your area to see local rankings</p>
          <button class="btn btn-primary" onclick="openAreaModal()">Set Area</button>
        </div>
      `;
      return;
    }

    if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
      try {
        leaderboardData = await window.EcoVentureAuth.getAreaLeaderboard(state.userProfile.area);
      } catch (e) { console.error(e); }
    }
    if (leaderboardData.length === 0) leaderboardData = generateDemoLeaderboard(state.userProfile.area);

  } else if (type === 'global') {
    if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
      try {
        leaderboardData = await window.EcoVentureAuth.getGlobalLeaderboard();
      } catch (e) { console.error(e); }
    }
    if (leaderboardData.length === 0) leaderboardData = generateDemoLeaderboard('Global');

  } else if (type === 'friends') {
    if (window.EcoVentureFriends) {
      await window.EcoVentureFriends.loadLeaderboard();
      return; // Friends module renders its own content
    }
    container.innerHTML = `
      <div class="leaderboard-empty">
        <span class="empty-icon">👥</span>
        <p>Add friends to see their rankings</p>
      </div>
    `;
    return;
  }

  // Render into profile container
  renderProfileLeaderboard(container, leaderboardData);
}

function renderProfileLeaderboard(container, data) {
  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="leaderboard-empty">
        <span class="empty-icon">📊</span>
        <p>No data yet. Be the first!</p>
      </div>
    `;
    return;
  }

  const currentUserId = state.authUser?.id || 'current_user';
  const topUsers = data.slice(0, 10);

  container.innerHTML = topUsers.map((user, index) => {
    const rank = index + 1;
    const isCurrentUser = user.id === currentUserId;
    const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';

    return `
      <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
        <div class="leaderboard-rank ${rankClass}">${rank}</div>
        <div class="leaderboard-user">
          <span class="leaderboard-username">${user.display_name || user.username}${isCurrentUser ? ' (You)' : ''}</span>
          <span class="leaderboard-stats">${user.submissions} cleanups • ${user.current_streak} day streak</span>
        </div>
        <div class="leaderboard-points">${user.total_points}</div>
      </div>
    `;
  }).join('');
}

// ========================================
// Redeem Section
// ========================================

function updateRedeemSection() {
  const balanceEl = document.getElementById('redeemPointsBalance');
  if (balanceEl) {
    balanceEl.textContent = state.userData?.totalPoints || 0;
  }

  loadRedemptionHistory();
}

function loadRedemptionHistory() {
  const historyList = document.getElementById('redemptionHistoryList');
  if (!historyList) return;

  const history = state.userData?.redemptionHistory || [];

  if (history.length === 0) {
    historyList.innerHTML = `
      <div class="history-empty">
        <span>No redemptions yet</span>
      </div>
    `;
    return;
  }

  historyList.innerHTML = history.slice(0, 5).map(item => {
    const date = new Date(item.redeemedAt).toLocaleDateString();
    return `
      <div class="history-item">
        <span class="history-icon">🎁</span>
        <div class="history-info">
          <span class="history-name">${item.rewardId}</span>
          <span class="history-date">${date}</span>
        </div>
        <span class="history-code">${item.code}</span>
      </div>
    `;
  }).join('');
}

// Make area modal function global
window.openAreaModal = openAreaModal;

// ========================================
// Friends System
// ========================================

let foundFriend = null;

function setupFriendsListeners() {
  // Add Friend button
  const addFriendBtn = document.getElementById('addFriendBtn');
  const addFirstFriendBtn = document.getElementById('addFirstFriendBtn');
  if (addFriendBtn) addFriendBtn.addEventListener('click', openAddFriendModal);
  if (addFirstFriendBtn) addFirstFriendBtn.addEventListener('click', openAddFriendModal);

  // Copy friend code buttons
  const copyFriendCodeBtn = document.getElementById('copyFriendCodeBtn');
  const copyProfileFriendCodeBtn = document.getElementById('copyProfileFriendCodeBtn');
  if (copyFriendCodeBtn) copyFriendCodeBtn.addEventListener('click', copyFriendCode);
  if (copyProfileFriendCodeBtn) copyProfileFriendCodeBtn.addEventListener('click', copyFriendCode);

  // View requests
  const viewRequestsBtn = document.getElementById('viewRequestsBtn');
  if (viewRequestsBtn) viewRequestsBtn.addEventListener('click', openFriendRequestsModal);

  // Add Friend Modal
  const addFriendModalClose = document.getElementById('addFriendModalClose');
  const addFriendModal = document.getElementById('addFriendModal');
  if (addFriendModalClose) addFriendModalClose.addEventListener('click', closeAddFriendModal);
  if (addFriendModal) {
    addFriendModal.addEventListener('click', (e) => {
      if (e.target === addFriendModal) closeAddFriendModal();
    });
  }

  // Friend code input
  const friendCodeInput = document.getElementById('friendCodeInput');
  if (friendCodeInput) {
    friendCodeInput.addEventListener('input', handleFriendCodeInput);
  }

  // Send friend request
  const sendFriendRequestBtn = document.getElementById('sendFriendRequestBtn');
  if (sendFriendRequestBtn) sendFriendRequestBtn.addEventListener('click', handleSendFriendRequest);

  // Friend Requests Modal
  const friendRequestsModalClose = document.getElementById('friendRequestsModalClose');
  const friendRequestsModal = document.getElementById('friendRequestsModal');
  if (friendRequestsModalClose) friendRequestsModalClose.addEventListener('click', closeFriendRequestsModal);
  if (friendRequestsModal) {
    friendRequestsModal.addEventListener('click', (e) => {
      if (e.target === friendRequestsModal) closeFriendRequestsModal();
    });
  }

  // Request tabs
  const requestsTabs = document.querySelectorAll('.requests-tab');
  requestsTabs.forEach(tab => {
    tab.addEventListener('click', () => switchRequestsTab(tab.dataset.requests));
  });
}

function openAddFriendModal() {
  if (!state.isLoggedIn) {
    openAuthModal('signin');
    return;
  }

  const addFriendModal = document.getElementById('addFriendModal');
  addFriendModal.classList.remove('hidden');

  // Reset state
  document.getElementById('friendCodeInput').value = '';
  document.getElementById('friendSearchResult').classList.add('hidden');
  foundFriend = null;

  // Update share code
  const shareMyCode = document.getElementById('shareMyCode');
  if (shareMyCode && state.userProfile?.friend_code) {
    shareMyCode.textContent = state.userProfile.friend_code;
  }
}

function closeAddFriendModal() {
  const addFriendModal = document.getElementById('addFriendModal');
  addFriendModal.classList.add('hidden');
}

async function handleFriendCodeInput(e) {
  const code = e.target.value.toUpperCase().trim();
  const searchResult = document.getElementById('friendSearchResult');

  if (code.length < 8) {
    searchResult.classList.add('hidden');
    foundFriend = null;
    return;
  }

  // Search for user
  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      const user = await window.EcoVentureAuth.getUserByFriendCode(code);
      if (user && user.id !== state.authUser?.id) {
        foundFriend = user;
        document.getElementById('friendPreviewName').textContent = user.display_name || user.username;
        document.getElementById('friendPreviewPoints').textContent = `${user.total_points} pts`;
        searchResult.classList.remove('hidden');
      } else if (user && user.id === state.authUser?.id) {
        showToast('That\'s your own code!', 'warning');
        searchResult.classList.add('hidden');
        foundFriend = null;
      } else {
        searchResult.classList.add('hidden');
        foundFriend = null;
      }
    } catch (error) {
      searchResult.classList.add('hidden');
      foundFriend = null;
    }
  } else {
    // Demo mode
    foundFriend = {
      id: 'demo_friend',
      username: 'DemoFriend',
      display_name: 'Demo Friend',
      total_points: Math.floor(Math.random() * 1000)
    };
    document.getElementById('friendPreviewName').textContent = foundFriend.display_name;
    document.getElementById('friendPreviewPoints').textContent = `${foundFriend.total_points} pts`;
    searchResult.classList.remove('hidden');
  }
}

async function handleSendFriendRequest() {
  if (!foundFriend) {
    showToast('Enter a valid friend code first', 'warning');
    return;
  }

  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      await window.EcoVentureAuth.sendFriendRequest(state.authUser.id, foundFriend.id);
      showToast('Friend request sent!', 'success');
      closeAddFriendModal();
    } catch (error) {
      showToast(error.message || 'Failed to send request', 'error');
    }
  } else {
    // Demo mode
    showToast('Friend request sent! (Demo)', 'success');
    closeAddFriendModal();
  }
}

function copyFriendCode() {
  const code = state.userProfile?.friend_code || 'DEMO1234';
  navigator.clipboard.writeText(code).then(() => {
    showToast('Friend code copied!', 'success');
  }).catch(() => {
    showToast('Failed to copy', 'error');
  });
}

function openFriendRequestsModal() {
  const friendRequestsModal = document.getElementById('friendRequestsModal');
  friendRequestsModal.classList.remove('hidden');
  loadFriendRequests();
}

function closeFriendRequestsModal() {
  const friendRequestsModal = document.getElementById('friendRequestsModal');
  friendRequestsModal.classList.add('hidden');
}

function switchRequestsTab(tab) {
  // Update tabs
  document.querySelectorAll('.requests-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.requests === tab);
  });

  // Update lists
  document.getElementById('receivedRequestsList').classList.toggle('hidden', tab !== 'received');
  document.getElementById('sentRequestsList').classList.toggle('hidden', tab !== 'sent');
}

async function loadFriendRequests() {
  if (!state.isLoggedIn) return;

  const receivedList = document.getElementById('receivedRequestsList');
  const sentList = document.getElementById('sentRequestsList');

  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      // Load received requests
      const received = await window.EcoVentureAuth.getPendingFriendRequests(state.authUser.id);
      renderReceivedRequests(received, receivedList);

      // Load sent requests
      const sent = await window.EcoVentureAuth.getSentFriendRequests(state.authUser.id);
      renderSentRequests(sent, sentList);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  } else {
    // Demo mode
    receivedList.innerHTML = '<div class="requests-empty"><span>No pending requests</span></div>';
    sentList.innerHTML = '<div class="requests-empty"><span>No sent requests</span></div>';
  }
}

function renderReceivedRequests(requests, container) {
  if (!requests || requests.length === 0) {
    container.innerHTML = '<div class="requests-empty"><span>No pending requests</span></div>';
    return;
  }

  container.innerHTML = requests.map(req => {
    const profile = req.profiles;
    return `
      <div class="request-item" data-id="${req.id}">
        <div class="request-avatar">👤</div>
        <div class="request-info">
          <span class="request-name">${profile.display_name || profile.username}</span>
          <span class="request-points">${profile.total_points} pts</span>
        </div>
        <div class="request-actions">
          <button class="btn btn-accept" onclick="acceptRequest('${req.id}')">Accept</button>
          <button class="btn btn-reject" onclick="rejectRequest('${req.id}')">Reject</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderSentRequests(requests, container) {
  if (!requests || requests.length === 0) {
    container.innerHTML = '<div class="requests-empty"><span>No sent requests</span></div>';
    return;
  }

  container.innerHTML = requests.map(req => {
    const profile = req.profiles;
    return `
      <div class="request-item" data-id="${req.id}">
        <div class="request-avatar">👤</div>
        <div class="request-info">
          <span class="request-name">${profile.display_name || profile.username}</span>
          <span class="request-points">${profile.total_points} pts</span>
        </div>
        <div class="request-actions">
          <span style="color: var(--text-muted); font-size: 0.85rem;">Pending</span>
        </div>
      </div>
    `;
  }).join('');
}

async function acceptRequest(requestId) {
  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      await window.EcoVentureAuth.acceptFriendRequest(requestId);
      showToast('Friend added!', 'success');
      loadFriendRequests();
      updatePendingRequestsBadge();
      if (state.currentLeaderboard === 'friends') {
        loadFriendsLeaderboard();
      }
    } catch (error) {
      showToast('Failed to accept request', 'error');
    }
  }
}

async function rejectRequest(requestId) {
  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      await window.EcoVentureAuth.rejectFriendRequest(requestId);
      showToast('Request declined', 'success');
      loadFriendRequests();
      updatePendingRequestsBadge();
    } catch (error) {
      showToast('Failed to decline request', 'error');
    }
  }
}

async function loadFriendsLeaderboard() {
  if (!state.isLoggedIn) {
    const listEl = document.getElementById('friendsLeaderboardList');
    listEl.innerHTML = `
      <div class="leaderboard-empty">
        <span class="empty-icon">🔐</span>
        <p>Sign in to see friends</p>
        <button class="btn btn-primary" onclick="openAuthModal('signin')">Sign In</button>
      </div>
    `;
    return;
  }

  // Update friend code displays
  updateFriendCodeDisplays();

  const listEl = document.getElementById('friendsLeaderboardList');
  const yourRankCard = document.getElementById('yourFriendsRank');
  const statsCard = document.getElementById('friendsStatsCard');
  const emptyState = document.getElementById('friendsEmptyState');

  let leaderboardData = [];

  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      leaderboardData = await window.EcoVentureAuth.getFriendsLeaderboard(state.authUser.id);

      // Update pending requests badge
      updatePendingRequestsBadge();
    } catch (error) {
      console.error('Failed to load friends leaderboard:', error);
    }
  } else {
    // Demo data - just the user
    leaderboardData = [{
      id: state.authUser?.id || 'current_user',
      username: state.userProfile?.username || 'You',
      display_name: state.userProfile?.display_name || 'You',
      total_points: state.userData?.totalPoints || 0,
      submissions: state.userData?.submissions || 0,
      current_streak: state.userData?.currentStreak || 0
    }];
  }

  // Check if user has friends (more than just themselves)
  if (leaderboardData.length <= 1) {
    // Show empty state
    listEl.innerHTML = `
      <div class="leaderboard-empty" id="friendsEmptyState">
        <span class="empty-icon">👥</span>
        <p>No friends yet</p>
        <span class="empty-desc">Add friends using their friend code to compete!</span>
        <button class="btn btn-primary" onclick="openAddFriendModal()">Add Your First Friend</button>
      </div>
    `;
    statsCard.classList.add('hidden');
    yourRankCard.querySelector('.rank-number').textContent = '#1';
    yourRankCard.querySelector('.rank-points').textContent = `${state.userData?.totalPoints || 0} pts`;
    return;
  }

  // Render leaderboard
  statsCard.classList.remove('hidden');
  renderLeaderboard(listEl, leaderboardData, yourRankCard, 'friends');

  // Update stats
  const currentUserId = state.authUser?.id || 'current_user';
  const userIndex = leaderboardData.findIndex(u => u.id === currentUserId);

  document.getElementById('totalFriendsCount').textContent = leaderboardData.length - 1; // Exclude self
  document.getElementById('friendsAhead').textContent = userIndex;
  document.getElementById('friendsBehind').textContent = leaderboardData.length - userIndex - 1;
}

function updateFriendCodeDisplays() {
  const code = state.userProfile?.friend_code || 'DEMO1234';

  const myFriendCode = document.getElementById('myFriendCode');
  const profileFriendCode = document.getElementById('profileFriendCode');
  const shareMyCode = document.getElementById('shareMyCode');

  if (myFriendCode) myFriendCode.textContent = code;
  if (profileFriendCode) profileFriendCode.textContent = code;
  if (shareMyCode) shareMyCode.textContent = code;
}

async function updatePendingRequestsBadge() {
  const banner = document.getElementById('pendingRequestsBanner');
  const countEl = document.getElementById('pendingCount');

  if (!state.isLoggedIn || !banner) return;

  if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
    try {
      const count = await window.EcoVentureAuth.getPendingRequestCount(state.authUser.id);
      if (count > 0) {
        countEl.textContent = count;
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    } catch (error) {
      banner.classList.add('hidden');
    }
  } else {
    banner.classList.add('hidden');
  }
}

// Make functions global
window.openAddFriendModal = openAddFriendModal;
window.acceptRequest = acceptRequest;
window.rejectRequest = rejectRequest;

// Update loadLeaderboardData to include friends
const originalLoadLeaderboardData = loadLeaderboardData;
async function loadLeaderboardDataUpdated() {
  if (!state.isLoggedIn) return;

  if (state.currentLeaderboard === 'area') {
    await loadAreaLeaderboard();
  } else if (state.currentLeaderboard === 'global') {
    await loadGlobalLeaderboard();
  } else if (state.currentLeaderboard === 'friends') {
    await loadFriendsLeaderboard();
  }
}

// Override the original function
loadLeaderboardData = loadLeaderboardDataUpdated;

// Update init to include friends listeners
const originalSetupAuthListeners = setupAuthListeners;
function setupAuthListenersUpdated() {
  originalSetupAuthListeners();
  setupFriendsListeners();
}
setupAuthListeners = setupAuthListenersUpdated;

// Update profile section to show friend code
const originalUpdateProfileSection = updateProfileSection;
function updateProfileSectionUpdated() {
  originalUpdateProfileSection();
  updateFriendCodeDisplays();
}
updateProfileSection = updateProfileSectionUpdated;

// Initialize
document.addEventListener('DOMContentLoaded', init);
