/**
 * EcoVenture UI Module
 * UI helpers, navigation, and toast notifications
 */

const UIModule = {
  currentTab: 'home',

  // Show toast notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Setup tab navigation
  setupTabNavigation(onTabChange) {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
        if (onTabChange) onTabChange(tabName);
      });
    });
  },

  // Switch tab
  switchTab(tabName) {
    this.currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
  },

  // Update stats display
  updateStats(data) {
    const elements = {
      headerPoints: document.getElementById('headerPoints'),
      headerGems: document.getElementById('headerGems'),
      totalPoints: document.getElementById('totalPoints'),
      submissions: document.getElementById('submissions'),
      streak: document.getElementById('streak'),
      levelIcon: document.getElementById('levelIcon'),
      levelName: document.getElementById('levelName')
    };

    if (elements.headerPoints) elements.headerPoints.textContent = `${data.totalPoints} pts`;
    if (elements.headerGems) elements.headerGems.textContent = `${data.ecoGems || 0}`;
    if (elements.totalPoints) elements.totalPoints.textContent = data.totalPoints;
    if (elements.submissions) elements.submissions.textContent = data.submissions;
    if (elements.streak) elements.streak.textContent = data.currentStreak;

    // Update level
    const level = this.getLevel(data.totalPoints);
    if (elements.levelIcon) elements.levelIcon.textContent = level.icon;
    if (elements.levelName) elements.levelName.textContent = level.name;

    // Update level progress
    this.updateLevelProgress(data.totalPoints);
  },

  // Get user level
  getLevel(points) {
    const { LEVELS } = window.EcoVentureConfig;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (points >= LEVELS[i].minPoints) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  },

  // Update level progress bar
  updateLevelProgress(points) {
    const { LEVELS } = window.EcoVentureConfig;
    const currentLevel = document.getElementById('currentLevel');
    const nextLevel = document.getElementById('nextLevel');
    const progressFill = document.getElementById('levelProgressFill');

    const level = this.getLevel(points);
    const levelIndex = LEVELS.findIndex(l => l.name === level.name);
    const nextLevelData = LEVELS[levelIndex + 1];

    if (currentLevel) currentLevel.textContent = `${level.icon} ${level.name}`;

    if (nextLevelData) {
      if (nextLevel) nextLevel.textContent = `Next: ${nextLevelData.name} (${nextLevelData.minPoints} pts)`;

      const progressInLevel = points - level.minPoints;
      const levelRange = nextLevelData.minPoints - level.minPoints;
      const progress = Math.min((progressInLevel / levelRange) * 100, 100);

      if (progressFill) progressFill.style.width = `${progress}%`;
    } else {
      if (nextLevel) nextLevel.textContent = 'Max level reached!';
      if (progressFill) progressFill.style.width = '100%';
    }
  },

  // Show/hide element
  show(element) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (element) element.classList.remove('hidden');
  },

  hide(element) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (element) element.classList.add('hidden');
  },

  // Toggle class
  toggle(element, className, force) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (element) element.classList.toggle(className, force);
  },

  /**
   * Show confetti celebration effect
   * @param {number} count - Number of confetti pieces (default 50)
   */
  showConfetti(count = 50) {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
      container.appendChild(confetti);
    }

    // Remove container after animation
    setTimeout(() => container.remove(), 4000);
  },

  /**
   * Animate currency update (bump effect)
   * @param {string} elementId - ID of the element to animate
   */
  animateCurrencyUpdate(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.classList.remove('currency-updated');
    // Trigger reflow to restart animation
    void el.offsetWidth;
    el.classList.add('currency-updated');

    setTimeout(() => el.classList.remove('currency-updated'), 500);
  },

  /**
   * Show a success celebration for rewards
   * @param {string} message - Message to show
   */
  showRewardCelebration(message) {
    this.showConfetti(30);
    this.showToast(message, 'success');
  }
};

// Export
window.EcoVentureUI = UIModule;
