/**
 * EcoVenture - Main Application
 * Initializes all modules and handles core app logic
 */

const EcoVentureApp = {
  // State
  userData: null,
  cocoModel: null,
  isDetecting: false,
  detectedItems: new Set(),
  framesWithTrash: 0,
  framesWithPerson: 0,
  framesWithBin: 0,  // Track bin detection
  binDetected: false, // Has bin been seen during recording
  totalFramesAnalyzed: 0,
  detectionLoop: null,

  // DOM Elements
  elements: {},

  // Initialize app
  async init() {
    console.log('Initializing EcoVenture...');

    // Cache DOM elements
    this.cacheElements();

    // Load user data
    this.loadUserData();

    // Setup all module listeners
    this.setupListeners();

    // Initialize camera
    await this.initCamera();

    // Load AI model
    await this.loadModel();

    // Initialize Supabase
    this.initSupabase();

    // Update UI
    window.EcoVentureUI.updateStats(this.userData);
    window.EcoVentureRewards.loadRewards();

    // Initialize gamification modules
    if (window.EcoVentureInventory) window.EcoVentureInventory.init();
    if (window.EcoVentureAvatar) window.EcoVentureAvatar.init();
    if (window.EcoVentureQuests) window.EcoVentureQuests.init();
    if (window.EcoVentureShop) window.EcoVentureShop.init();
    if (window.EcoVentureGacha) window.EcoVentureGacha.init();
    if (window.EcoVentureGambling) window.EcoVentureGambling.init();

    // Update gems display
    this.updateGemsDisplay();

    console.log('EcoVenture initialized!');
  },

  // Cache DOM elements
  cacheElements() {
    this.elements = {
      videoPreview: document.getElementById('videoPreview'),
      detectionCanvas: document.getElementById('detectionCanvas'),
      videoOverlay: document.getElementById('videoOverlay'),
      recordBtn: document.getElementById('recordBtn'),
      switchCameraBtn: document.getElementById('switchCameraBtn'),
      detectBtn: document.getElementById('detectBtn'),
      recordingIndicator: document.getElementById('recordingIndicator'),
      recTime: document.getElementById('recTime'),
      detectionBadge: document.getElementById('detectionBadge'),
      cameraSection: document.getElementById('cameraSection'),
      processingSection: document.getElementById('processingSection'),
      resultsSection: document.getElementById('resultsSection'),
      resultsCard: document.getElementById('resultsCard'),
      progressFill: document.getElementById('progressFill')
    };
  },

  // Load user data
  loadUserData() {
    const defaultUserData = {
      totalPoints: 0,
      lifetimePoints: 0,
      submissions: 0,
      currentStreak: 0,
      longestStreak: 0,
      redemptionHistory: [],
      ecoGems: 0,
      lifetimeGems: 0
    };

    if (window.electronAPI) {
      window.electronAPI.getUserData().then(data => {
        this.userData = { ...defaultUserData, ...data };
        window.EcoVentureUI.updateStats(this.userData);
      });
    } else {
      const stored = localStorage.getItem('ecoventure_userData');
      this.userData = stored ? { ...defaultUserData, ...JSON.parse(stored) } : defaultUserData;
    }
  },

  // Save user data
  saveUserData() {
    localStorage.setItem('ecoventure_userData', JSON.stringify(this.userData));
  },

  // Setup listeners
  setupListeners() {
    // Tab navigation
    window.EcoVentureUI.setupTabNavigation((tab) => {
      if (tab === 'leaderboard') {
        window.EcoVentureLeaderboard.loadData();
      } else if (tab === 'redeem') {
        window.EcoVentureRewards.updatePointsBalance();
        window.EcoVentureRewards.loadRedemptionHistory();
      } else if (tab === 'cleanups') {
        window.EcoVentureCleanups.loadData();
      } else if (tab === 'quests') {
        if (window.EcoVentureQuests) {
          window.EcoVentureQuests.renderQuests();
          window.EcoVentureGacha?.renderBoxInventory();
        }
      } else if (tab === 'shop') {
        if (window.EcoVentureShop) {
          window.EcoVentureShop.renderShop();
        }
      } else if (tab === 'profile') {
        if (window.EcoVentureAvatar) {
          window.EcoVentureAvatar.renderAvatarPreview();
        }
      }
    });

    // Profile sub-navigation
    document.querySelectorAll('.profile-sub-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.profile-sub-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show corresponding section
        const section = btn.dataset.section;
        document.querySelectorAll('.profile-sub-content').forEach(content => {
          content.classList.remove('active');
        });

        const targetSection = document.getElementById(`profile${section.charAt(0).toUpperCase() + section.slice(1)}Section`);
        if (targetSection) {
          targetSection.classList.add('active');

          // Initialize section content
          if (section === 'avatar' && window.EcoVentureAvatar) {
            window.EcoVentureAvatar.showCustomizer();
          } else if (section === 'leaderboard') {
            loadProfileLeaderboard();
          } else if (section === 'redeem') {
            window.EcoVentureRewards.updatePointsBalance();
          }
        }
      });
    });

    // Camera controls
    if (this.elements.videoOverlay) {
      this.elements.videoOverlay.addEventListener('click', () => this.initCamera());
    }

    if (this.elements.switchCameraBtn) {
      this.elements.switchCameraBtn.addEventListener('click', () => this.switchCamera());
    }

    if (this.elements.recordBtn) {
      this.elements.recordBtn.addEventListener('click', () => this.toggleRecording());
    }

    if (this.elements.detectBtn) {
      this.elements.detectBtn.addEventListener('click', () => this.toggleDetection());
    }

    // New recording button
    const newRecordingBtn = document.getElementById('newRecordingBtn');
    if (newRecordingBtn) {
      newRecordingBtn.addEventListener('click', () => this.resetForNewRecording());
    }

    // Setup module listeners
    window.EcoVentureAuthUI.setupListeners();
    window.EcoVentureLeaderboard.setupListeners();
    window.EcoVentureFriends.setupListeners();
    window.EcoVentureRewards.setupListeners();
    window.EcoVentureCleanups.setupListeners();

    // Profile leaderboard toggle buttons
    document.querySelectorAll('#profileLeaderboardSection .toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#profileLeaderboardSection .toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadProfileLeaderboard();
      });
    });

    // Roboflow AI setup button
    const setupRoboflowBtn = document.getElementById('setupRoboflowBtn');
    if (setupRoboflowBtn) {
      setupRoboflowBtn.addEventListener('click', () => this.setupRoboflow());
    }

    // Update Roboflow status on load
    this.updateRoboflowStatus();
  },

  // Setup Roboflow AI
  setupRoboflow() {
    if (window.EcoVentureRoboflow) {
      window.EcoVentureRoboflow.showSetupDialog();
      this.updateRoboflowStatus();
    }
  },

  // Update Roboflow status display
  updateRoboflowStatus() {
    const statusDot = document.getElementById('roboflowStatusDot');
    const statusText = document.getElementById('roboflowStatusText');

    if (!statusDot || !statusText) return;

    if (window.EcoVentureRoboflow && window.EcoVentureRoboflow.isConfigured()) {
      statusDot.classList.add('active');
      statusText.textContent = 'AI Detection Active ✓';
      statusText.style.color = 'var(--success)';
    } else {
      statusDot.classList.remove('active');
      statusText.textContent = 'Not configured - Click to setup';
      statusText.style.color = 'var(--text-secondary)';
    }
  },

  // Initialize Supabase
  initSupabase() {
    if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
      window.EcoVentureAuth.init();
    }
  },

  // Initialize camera
  async initCamera() {
    const success = await window.EcoVentureCamera.initCamera(this.elements.videoPreview);

    if (success) {
      this.elements.videoOverlay.classList.add('hidden');
      this.elements.recordBtn.disabled = false;
      this.elements.detectBtn.disabled = false;

      // Setup canvas size when video is ready
      this.elements.videoPreview.onloadedmetadata = () => {
        this.setupCanvasSize();
      };

      // Also setup on play in case metadata already loaded
      this.elements.videoPreview.onplay = () => {
        this.setupCanvasSize();
      };

      window.EcoVentureUI.showToast('Camera ready!', 'success');
    } else {
      window.EcoVentureUI.showToast('Camera access denied', 'error');
    }
  },

  // Setup canvas to match video dimensions
  setupCanvasSize() {
    const video = this.elements.videoPreview;
    const canvas = this.elements.detectionCanvas;

    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      console.log(`Canvas set to ${canvas.width}x${canvas.height}`);
    }
  },

  // Switch camera
  async switchCamera() {
    await window.EcoVentureCamera.switchCamera(this.elements.videoPreview);
  },

  // Load AI model
  async loadModel() {
    window.EcoVentureUI.showToast('Loading AI model...', 'info');

    this.cocoModel = await window.EcoVentureDetection.loadDetectionModel();

    if (this.cocoModel) {
      window.EcoVentureUI.showToast('AI model ready!', 'success');
    } else {
      window.EcoVentureUI.showToast('AI model failed to load', 'error');
    }
  },

  // Toggle detection
  toggleDetection() {
    if (this.isDetecting) {
      this.stopDetection();
    } else {
      this.startDetection();
    }
  },

  // Start detection
  startDetection() {
    if (!this.cocoModel) {
      window.EcoVentureUI.showToast('AI model not loaded', 'warning');
      return;
    }

    this.isDetecting = true;
    this.elements.detectBtn.classList.add('active');
    this.elements.detectionBadge.classList.remove('hidden');
    this.updateDetectionBadge('Scanning...', 'blue');

    this.runDetectionLoop();
  },

  // Stop detection
  stopDetection() {
    this.isDetecting = false;
    this.elements.detectBtn.classList.remove('active');
    this.elements.detectionBadge.classList.add('hidden');

    if (this.detectionLoop) {
      cancelAnimationFrame(this.detectionLoop);
      this.detectionLoop = null;
    }

    const ctx = this.elements.detectionCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.elements.detectionCanvas.width, this.elements.detectionCanvas.height);
  },

  // Update detection badge
  updateDetectionBadge(text, color) {
    const badge = this.elements.detectionBadge;
    if (!badge) return;

    badge.querySelector('.detection-text').textContent = text;

    const colors = {
      green: 'linear-gradient(135deg, #10B981, #059669)',
      yellow: 'linear-gradient(135deg, #F59E0B, #D97706)',
      blue: 'linear-gradient(135deg, #3B82F6, #2563EB)',
      red: 'linear-gradient(135deg, #EF4444, #DC2626)'
    };
    badge.style.background = colors[color] || colors.blue;
  },

  // Run detection loop
  async runDetectionLoop() {
    if (!this.isDetecting || !this.cocoModel) return;

    const { COCO_TRASH_CLASSES, IGNORE_CLASSES, CONFIG } = window.EcoVentureConfig;
    const Detection = window.EcoVentureDetection;

    try {
      // Run COCO-SSD detection (local, fast)
      const allPredictions = await this.cocoModel.detect(this.elements.videoPreview);

      // Add source tag to all predictions
      allPredictions.forEach(p => p.source = 'COCO');

      // Filter for trash items only (not person, not ignored)
      const cocoPredictions = allPredictions.filter(p => {
        const classLower = p.class.toLowerCase();
        // Keep if it's a trash class OR not in ignore list
        return COCO_TRASH_CLASSES.includes(classLower) ||
               (!IGNORE_CLASSES.includes(classLower) && classLower !== 'person');
      });

      // Get person detections separately
      const personPredictions = allPredictions.filter(p =>
        p.class.toLowerCase() === 'person' && p.score > 0.3
      );

      // Update confidence tracker with trash detections
      Detection.updateConfidenceTracker(cocoPredictions);

      // Filter trash items from COCO with confidence boost
      const cocoTrashItems = cocoPredictions.filter(p => {
        if (!COCO_TRASH_CLASSES.includes(p.class.toLowerCase())) return false;
        const boostedScore = Detection.getBoostedConfidence(p.class, p.score);
        return boostedScore > CONFIG.MIN_CONFIDENCE;
      }).map(p => ({
        ...p,
        boostedScore: Detection.getBoostedConfidence(p.class, p.score)
      }));

      // Run external APIs every few frames to save API calls
      let externalDetections = [];
      const frameCount = Detection.confidenceTracker.frameCount;

      // Call TrashNet (MobileNet) every 10 frames for waste classification
      if (Detection.isTrashNetAvailable() && frameCount % 10 === 0) {
        const trashNetResult = await Detection.classifyWithTrashNet(this.elements.videoPreview);
        if (trashNetResult && trashNetResult.score > 0.2) {
          console.log(`TrashNet: ${trashNetResult.class} (${Math.round(trashNetResult.score * 100)}%) - ${trashNetResult.originalClass}${trashNetResult.binDetected ? ' [BIN DETECTED]' : ''}`);

          // Track bin detection
          if (trashNetResult.binDetected) {
            this.binDetected = true;
            this.framesWithBin++;
          }

          // Add to detected items for scoring (exclude bin itself)
          if (trashNetResult.category !== 'bin') {
            this.detectedItems.add(trashNetResult.class);
          }
        }
      }

      // Call Roboflow API for accurate trash detection (throttled to 1/sec)
      if (Detection.isRoboflowAvailable()) {
        const roboflowResult = await Detection.detectWithRoboflow(this.elements.videoPreview);
        if (roboflowResult && roboflowResult.length > 0) {
          console.log('🎯 Roboflow found:', roboflowResult.map(d => `${d.class}(${Math.round(d.score * 100)}%)`).join(', '));

          // Add to external detections for drawing
          externalDetections.push(...roboflowResult);

          // Add to detected items for scoring
          roboflowResult.forEach(item => {
            this.detectedItems.add(item.class);

            // Map to TrashNet category for classification
            if (window.EcoVentureRoboflow) {
              const category = window.EcoVentureRoboflow.mapToTrashNetCategory(item.class);
              this.detectedItems.add(category);
            }
          });
        }
      }

      // Combine all detections (including persons for display)
      const allDetections = [...cocoPredictions, ...personPredictions, ...externalDetections];
      const allTrashItems = [...cocoTrashItems, ...externalDetections.filter(d => d.score > CONFIG.MIN_CONFIDENCE)];

      // Person detection flag
      const personDetected = personPredictions.length > 0;

      // Draw all detections (trash + persons)
      const ctx = this.elements.detectionCanvas.getContext('2d');

      // Debug: log what we're detecting
      if (allDetections.length > 0) {
        console.log('Detections:', allDetections.map(d => `${d.class}(${Math.round(d.score * 100)}%)`).join(', '));
      }

      Detection.drawDetections(ctx, this.elements.detectionCanvas, allDetections, cocoTrashItems);

      // Update badge
      if (allTrashItems.length > 0) {
        const itemNames = [...new Set(allTrashItems.map(t => t.class))].slice(0, 3);
        const binStatus = this.binDetected ? ' 🗑️' : ' (put in bin!)';
        this.updateDetectionBadge(`Found: ${itemNames.join(', ')}${binStatus}`, this.binDetected ? 'green' : 'yellow');
        allTrashItems.forEach(item => this.detectedItems.add(item.class));
      } else if (this.binDetected) {
        this.updateDetectionBadge('Bin detected! Now show trash', 'green');
      } else if (personDetected) {
        this.updateDetectionBadge('Show trash & put in bin!', 'yellow');
      } else {
        this.updateDetectionBadge('Scanning for trash...', 'blue');
      }

      // Update recording stats
      if (window.EcoVentureCamera.isRecording) {
        this.totalFramesAnalyzed++;
        if (allTrashItems.length > 0) this.framesWithTrash++;
        if (personDetected) this.framesWithPerson++;
      }

    } catch (error) {
      console.error('Detection error:', error);
    }

    // Schedule next frame
    setTimeout(() => {
      if (this.isDetecting) this.runDetectionLoop();
    }, window.EcoVentureConfig.CONFIG.DETECTION_INTERVAL);
  },

  // Toggle recording
  toggleRecording() {
    if (window.EcoVentureCamera.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  },

  // Start recording
  startRecording() {
    // Reset stats
    this.detectedItems.clear();
    this.framesWithTrash = 0;
    this.framesWithPerson = 0;
    this.framesWithBin = 0;
    this.binDetected = false;
    this.totalFramesAnalyzed = 0;
    window.EcoVentureDetection.resetConfidenceTracker();

    // Start detection if not running
    if (!this.isDetecting) {
      this.startDetection();
    }

    // Start recording
    const success = window.EcoVentureCamera.startRecording(() => {
      this.processRecording();
    });

    if (success) {
      this.elements.recordBtn.classList.add('recording');
      this.elements.recordingIndicator.classList.remove('hidden');
      this.startRecordingTimer();
    }
  },

  // Stop recording
  stopRecording() {
    const duration = window.EcoVentureCamera.getRecordingDuration();

    if (duration < window.EcoVentureConfig.CONFIG.MIN_RECORDING_TIME) {
      window.EcoVentureUI.showToast(`Record for at least ${window.EcoVentureConfig.CONFIG.MIN_RECORDING_TIME} seconds`, 'warning');
      return;
    }

    window.EcoVentureCamera.stopRecording();
    this.elements.recordBtn.classList.remove('recording');
    this.elements.recordingIndicator.classList.add('hidden');
    this.stopRecordingTimer();
  },

  // Recording timer
  startRecordingTimer() {
    this.recordingTimer = setInterval(() => {
      const duration = window.EcoVentureCamera.getRecordingDuration();
      this.elements.recTime.textContent = window.EcoVentureCamera.formatTime(duration);

      if (duration >= window.EcoVentureConfig.CONFIG.MAX_RECORDING_TIME) {
        this.stopRecording();
      }
    }, 1000);
  },

  stopRecordingTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  },

  // Process recording
  async processRecording() {
    this.stopDetection();

    // Show processing
    this.elements.cameraSection.classList.add('hidden');
    this.elements.processingSection.classList.remove('hidden');

    // Animate progress
    await this.animateProgress();

    // Calculate results
    const detectedItems = Array.from(this.detectedItems);
    const trashPercent = this.totalFramesAnalyzed > 0 ?
      Math.round((this.framesWithTrash / this.totalFramesAnalyzed) * 100) : 0;

    // SUCCESS requires: trash detected AND bin detected (put trash in bin!)
    const hasTrash = trashPercent >= 15 && detectedItems.length > 0;
    const hasBin = this.binDetected;
    const success = hasTrash && hasBin;

    if (success) {
      const points = window.EcoVentureDetection.calculatePoints(
        detectedItems,
        trashPercent,
        this.userData.submissions,
        hasBin  // Pass bin detection for bonus
      );

      // Award points locally
      this.userData.totalPoints += points.points;
      this.userData.lifetimePoints += points.points;
      this.userData.submissions++;
      this.saveUserData();

      // Sync to Supabase
      await this.syncPointsToSupabase(points.points, detectedItems);

      // Update quest progress
      if (window.EcoVentureQuests) {
        window.EcoVentureQuests.onTrashCollected(detectedItems.map(name => ({ class: name })));
        window.EcoVentureQuests.onPointsEarned(points.points);
        window.EcoVentureQuests.onStreakUpdated(this.userData.currentStreak);
      }

      this.showResults({ success: true, trashPercent, detectedItems, pointsAwarded: points, binDetected: hasBin });
      window.EcoVentureUI.updateStats(this.userData);
      this.updateGemsDisplay();
    } else {
      let errorMsg = 'Verification failed: ';
      if (detectedItems.length === 0) {
        errorMsg += 'No trash detected! Show bottles, cups, or other items.';
      } else if (!hasBin) {
        errorMsg += 'Bin not detected! You must put the trash INTO a bin to earn points.';
      } else if (trashPercent < 15) {
        errorMsg += 'Items not visible long enough. Keep trash in frame longer!';
      }

      this.showResults({ success: false, error: errorMsg, trashPercent, detectedItems, binDetected: hasBin });
    }
  },

  // Sync points to Supabase
  async syncPointsToSupabase(points, detectedItems) {
    const auth = window.EcoVentureAuthUI;

    if (auth.isLoggedIn && window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
      try {
        await window.EcoVentureAuth.createSubmission(
          auth.authUser.id,
          points,
          detectedItems,
          auth.userProfile?.area || null,
          auth.userProfile?.country || null
        );

        // Refresh profile
        const updatedProfile = await window.EcoVentureAuth.getUserProfile(auth.authUser.id);
        auth.userProfile = updatedProfile;

        console.log('Points synced to Supabase:', points);
      } catch (error) {
        console.error('Failed to sync points:', error);
      }
    }
  },

  // Animate progress bar
  animateProgress() {
    return new Promise(resolve => {
      const steps = [
        { progress: 20, text: 'Analyzing video...' },
        { progress: 50, text: 'Detecting items...' },
        { progress: 75, text: 'Calculating points...' },
        { progress: 100, text: 'Complete!' }
      ];

      let stepIndex = 0;
      const interval = setInterval(() => {
        if (stepIndex < steps.length) {
          this.elements.progressFill.style.width = `${steps[stepIndex].progress}%`;
          document.getElementById('processingStatus').textContent = steps[stepIndex].text;
          stepIndex++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, 400);
    });
  },

  // Show results
  showResults(result) {
    this.elements.processingSection.classList.add('hidden');
    this.elements.resultsSection.classList.remove('hidden');

    if (result.success) {
      this.elements.resultsCard.innerHTML = `
        <div class="result-success">
          <div class="result-icon">🎉</div>
          <h2>Great Job!</h2>
          <div class="points-earned">+${result.pointsAwarded.points} pts</div>
          <div class="result-details">
            <p>🗑️ Trash binned: ${result.detectedItems.join(', ')}</p>
          </div>
          <div class="points-breakdown">
            ${result.pointsAwarded.breakdown.map(b => `
              <div class="breakdown-item">
                <span>+${b.points}</span>
                <span>${b.reason}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      const binTip = !result.binDetected ?
        '<li><strong>🗑️ PUT TRASH IN A BIN!</strong> Show the bin in frame</li>' : '';

      this.elements.resultsCard.innerHTML = `
        <div class="result-fail">
          <div class="result-icon">😕</div>
          <h2>Try Again!</h2>
          <p>${result.error}</p>
          <div class="result-tips">
            <h4>Tips:</h4>
            <ul>
              ${binTip}
              <li>Hold trash items in frame for 3+ seconds</li>
              <li>Show the trash going INTO the bin</li>
              <li>Use good lighting</li>
            </ul>
          </div>
        </div>
      `;
    }
  },

  // Reset for new recording
  resetForNewRecording() {
    this.elements.resultsSection.classList.add('hidden');
    this.elements.cameraSection.classList.remove('hidden');
    this.elements.progressFill.style.width = '0%';
  },

  // Update gems display in header
  updateGemsDisplay() {
    const gemsEl = document.getElementById('headerGems');
    if (gemsEl && this.userData) {
      gemsEl.textContent = `${this.userData.ecoGems || 0}`;
    }
  }
};

// Profile leaderboard - renders into the profile sub-section container
async function loadProfileLeaderboard() {
  const container = document.getElementById('profileLeaderboardList');
  if (!container) return;

  const auth = window.EcoVentureAuthUI;
  if (!auth || !auth.isLoggedIn) {
    container.innerHTML = `
      <div class="leaderboard-empty">
        <span class="empty-icon">🔐</span>
        <p>Sign in to see leaderboards</p>
      </div>
    `;
    return;
  }

  const activeBtn = document.querySelector('#profileLeaderboardSection .toggle-btn.active');
  const type = activeBtn?.dataset?.leaderboard || 'area';

  if (type === 'friends') {
    // Render friends leaderboard into profile container
    if (window.EcoVentureFriends) {
      await window.EcoVentureFriends.loadLeaderboard();
      // Copy friends content into profile container
      const friendsList = document.getElementById('friendsLeaderboardList');
      if (friendsList && container) {
        container.innerHTML = friendsList.innerHTML;
      }
    }
    return;
  }

  let data = [];
  const userData = EcoVentureApp.userData;

  if (type === 'area') {
    if (!auth.userProfile?.area) {
      container.innerHTML = `
        <div class="leaderboard-empty">
          <span class="empty-icon">📍</span>
          <p>Set your area to see local rankings</p>
          <button class="btn btn-primary" onclick="window.EcoVentureLeaderboard.openAreaModal()">Set Area</button>
        </div>
      `;
      return;
    }
    if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
      try { data = await window.EcoVentureAuth.getAreaLeaderboard(auth.userProfile.area); } catch(e) {}
    }
  } else if (type === 'global') {
    if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
      try { data = await window.EcoVentureAuth.getGlobalLeaderboard(); } catch(e) {}
    }
  }

  // Generate demo data if empty
  if (data.length === 0) {
    const names = ['EcoHero', 'GreenWarrior', 'TrashBuster', 'PlanetSaver', 'CleanChamp', 'EcoNinja'];
    data = names.map((name, i) => ({
      id: `demo_${i}`, username: name, display_name: name,
      total_points: Math.floor(Math.random() * 2000) + 500,
      submissions: Math.floor(Math.random() * 50) + 5,
      current_streak: Math.floor(Math.random() * 10)
    }));
    if (auth.userProfile) {
      data.push({
        id: auth.authUser?.id || 'current_user',
        username: auth.userProfile.username,
        display_name: auth.userProfile.display_name,
        total_points: userData?.totalPoints || 0,
        submissions: userData?.submissions || 0,
        current_streak: userData?.currentStreak || 0
      });
    }
    data.sort((a, b) => b.total_points - a.total_points);
  }

  // Render
  const currentUserId = auth.authUser?.id || 'current_user';
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
          <span class="leaderboard-stats">${user.submissions} cleanups</span>
        </div>
        <div class="leaderboard-points">${user.total_points}</div>
      </div>
    `;
  }).join('');
}

// Make globally accessible
window.EcoVentureApp = EcoVentureApp;
window.loadProfileLeaderboard = loadProfileLeaderboard;

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => EcoVentureApp.init());
