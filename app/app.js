/**
 * Litteryl - Desktop/Mobile Application
 * Video recording with Roboflow Trash Detection API
 * Detects: cans, plastic bags, bottles, paper, cigarettes, and more!
 */

// Roboflow API Configuration
const ROBOFLOW_API_KEY = 'rf_KkMEplwiCgYtwUBmuibX8PFL4PR2';
// Using garbage_detection model - better for general trash detection
const ROBOFLOW_MODEL = 'garbage_detection-wvzwv/9';
const ROBOFLOW_API_URL = `https://detect.roboflow.com/${ROBOFLOW_MODEL}`;

// Configuration
const MAX_RECORDING_TIME = 30;
const MIN_RECORDING_TIME = 3;
const DETECTION_INTERVAL = 1000; // 1 second between API calls to save credits

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
  modelLoaded: true, // Roboflow API is always "ready"
  isDetecting: false,
  detectedItems: new Set(),
  personDetected: false,
  framesWithPerson: 0,
  framesWithTrash: 0,
  totalFramesAnalyzed: 0,
  detectionLoop: null
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
  console.log('Initializing Litteryl with Roboflow Trash Detection...');

  // Get user data
  if (window.electronAPI) {
    state.userId = await window.electronAPI.getUserId();
    state.userData = await window.electronAPI.getUserData();
  } else {
    state.userId = localStorage.getItem('litteryl_user_id') || `user_${Date.now()}`;
    localStorage.setItem('litteryl_user_id', state.userId);
    state.userData = JSON.parse(localStorage.getItem('litteryl_userData') || '{"totalPoints":0,"lifetimePoints":0,"submissions":0,"currentStreak":0,"longestStreak":0}');
  }

  setupEventListeners();
  updateLocationStatus('valid', '✓ Demo Mode');
  updateStatsUI();
  await loadRewards();

  // Enable buttons immediately - no model download needed!
  elements.detectBtn.disabled = false;
  showToast('Ready! Roboflow Trash AI loaded', 'success');
}

function setupEventListeners() {
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

// Roboflow API Detection
async function detectTrashWithRoboflow(imageBase64) {
  try {
    // Add confidence threshold parameter for better detection
    const url = `${ROBOFLOW_API_URL}?api_key=${ROBOFLOW_API_KEY}&confidence=20&overlap=30`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: imageBase64
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Roboflow response:', data);
    return data.predictions || [];
  } catch (error) {
    console.error('Roboflow API error:', error);
    return [];
  }
}

// Capture frame from video as base64
function captureFrame() {
  const canvas = document.createElement('canvas');
  canvas.width = elements.videoPreview.videoWidth || 640;
  canvas.height = elements.videoPreview.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(elements.videoPreview, 0, 0, canvas.width, canvas.height);
  // Return base64 without the data:image/jpeg;base64, prefix
  return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
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

    showToast('Camera ready! Click 🔍 for live trash detection', 'success');
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

  state.isDetecting = true;
  elements.detectBtn.classList.add('active');
  elements.detectionBadge.classList.remove('hidden');
  updateDetectionBadge('Scanning for trash...', 'blue');

  runDetectionLoop();
}

function stopDetection() {
  state.isDetecting = false;
  elements.detectBtn.classList.remove('active');
  elements.detectionBadge.classList.add('hidden');

  if (state.detectionLoop) {
    clearTimeout(state.detectionLoop);
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
  if (!state.isDetecting) return;

  try {
    // Capture current frame
    const frameBase64 = captureFrame();

    // Call Roboflow API
    const predictions = await detectTrashWithRoboflow(frameBase64);

    // Draw detections
    drawDetections(predictions);

    // Process results - lower threshold to 20% confidence
    const trashItems = predictions.filter(p => p.confidence > 0.2);
    const trashFound = trashItems.length > 0;

    if (trashFound) {
      const items = [...new Set(trashItems.map(p => p.class))];
      updateDetectionBadge(`🗑️ Found: ${items.join(', ')}`, 'green');
      trashItems.forEach(p => state.detectedItems.add(p.class));
    } else {
      updateDetectionBadge('Scanning for trash...', 'blue');
    }

    // Update stats for recording
    if (state.isRecording) {
      state.totalFramesAnalyzed++;
      if (trashFound) state.framesWithTrash++;
    }

  } catch (error) {
    console.error('Detection error:', error);
    updateDetectionBadge('Detection error', 'red');
  }

  // Schedule next detection (1 second interval to save API credits)
  state.detectionLoop = setTimeout(() => runDetectionLoop(), DETECTION_INTERVAL);
}

function drawDetections(predictions) {
  const ctx = elements.detectionCanvas.getContext('2d');
  const canvas = elements.detectionCanvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (predictions.length === 0) return;

  // Scale factors for drawing
  const scaleX = canvas.width / (elements.videoPreview.videoWidth || 640);
  const scaleY = canvas.height / (elements.videoPreview.videoHeight || 480);

  predictions.forEach(prediction => {
    if (prediction.confidence < 0.2) return;

    // Roboflow returns x, y as center coordinates
    const x = (prediction.x - prediction.width / 2) * scaleX;
    const y = (prediction.y - prediction.height / 2) * scaleY;
    const width = prediction.width * scaleX;
    const height = prediction.height * scaleY;

    // Green for trash items
    const color = '#10B981';

    // Draw bounding box
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // Draw label background
    const label = `${prediction.class} ${Math.round(prediction.confidence * 100)}%`;
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
  state.totalFramesAnalyzed = 0;
  state.recordedChunks = [];

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

  showToast('Recording! Show trash items to the camera', 'info');
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

  // SUCCESS requires trash to be detected in at least 20% of frames
  const success = trashPercent >= 20 && detectedItems.length > 0;

  if (success) {
    const points = calculatePoints(detectedItems, trashPercent);

    // Award points
    if (window.electronAPI) {
      state.userData = await window.electronAPI.awardPoints({ points: points.points });
    } else {
      state.userData.totalPoints += points.points;
      state.userData.lifetimePoints += points.points;
      state.userData.submissions++;
      localStorage.setItem('litteryl_userData', JSON.stringify(state.userData));
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
      errorMsg += 'No trash detected! Try pointing at bottles, cans, or plastic bags.';
    } else if (trashPercent < 20) {
      errorMsg += 'Trash not visible long enough. Keep items in frame longer!';
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
    breakdown.push({ points: 30, reason: 'Great trash visibility' });
  }

  // Multiple items bonus
  if (items.length > 1) {
    const bonus = 15 * (items.length - 1);
    points += bonus;
    breakdown.push({ points: bonus, reason: `${items.length} different trash types` });
  }

  // Specific item bonuses
  const hardToFind = ['Cigarette', 'Plastic bag', 'Straw'];
  const foundHard = items.filter(i => hardToFind.some(h => i.toLowerCase().includes(h.toLowerCase())));
  if (foundHard.length > 0) {
    points += 25;
    breakdown.push({ points: 25, reason: 'Hard-to-find trash bonus' });
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
        <p class="result-subtitle">Roboflow AI verified your trash pickup</p>
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
          <span class="label">Trash (need 20%+)</span>
        </div>
        <div class="verification-item">
          <span class="icon">🏷️</span>
          <span class="value">${result.detectedItems?.length || 0}</span>
          <span class="label">Items Found</span>
        </div>
      </div>

      <div style="background: var(--bg-card); border-radius: var(--border-radius); padding: 14px; margin-top: 16px;">
        <h4 style="margin-bottom: 10px; font-size: 0.9rem;">Detectable trash types:</h4>
        <ul style="list-style-position: inside; color: var(--text-secondary); font-size: 0.85rem;">
          <li>Plastic bottles & containers</li>
          <li>Aluminum cans</li>
          <li>Plastic bags</li>
          <li>Paper & cardboard</li>
          <li>Cigarette butts</li>
          <li>Food wrappers</li>
          <li>Cups & straws</li>
        </ul>
      </div>
    `;

    showToast('No trash detected. Try again!', 'error');
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
      { id: 'amazon_5', name: 'Amazon', value: '$5', pointsCost: 500, image: '🛒' },
      { id: 'starbucks_5', name: 'Starbucks', value: '$5', pointsCost: 500, image: '☕' },
      { id: 'donation_trees', name: 'Plant Trees', value: '5 Trees', pointsCost: 300, image: '🌳' },
      { id: 'donation_ocean', name: 'Ocean Cleanup', value: '1 lb', pointsCost: 250, image: '🌊' }
    ];
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
      localStorage.setItem('litteryl_userData', JSON.stringify(state.userData));
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

// Initialize
document.addEventListener('DOMContentLoaded', init);
