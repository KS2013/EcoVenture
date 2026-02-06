/**
 * EcoVenture Quest Module
 * Manages daily/weekly quests and progress tracking
 */

const QuestsModule = {
  // Storage key
  STORAGE_KEY: 'ecoventure_quests',

  // Quest data
  questData: null,

  // Default quest state
  defaultQuestData: {
    dailyQuests: [],
    weeklyQuests: [],
    lastDailyRefresh: null,
    lastWeeklyRefresh: null,
    completedToday: [],
    completedThisWeek: [],
    todayProgress: {
      submissions: 0,
      points: 0,
      itemsByType: {},
      boxesOpened: 0
    }
  },

  /**
   * Initialize quest module
   */
  init() {
    this.loadQuests();
    this.checkRefresh();
    this.setupListeners();
    console.log('Quests module initialized');
  },

  /**
   * Load quests from localStorage
   */
  loadQuests() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.questData = { ...this.defaultQuestData, ...JSON.parse(stored) };
      } else {
        this.questData = { ...this.defaultQuestData };
        this.generateDailyQuests();
        this.generateWeeklyQuests();
      }
    } catch (error) {
      console.error('Failed to load quests:', error);
      this.questData = { ...this.defaultQuestData };
    }
  },

  /**
   * Save quests to localStorage
   */
  saveQuests() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.questData));
    } catch (error) {
      console.error('Failed to save quests:', error);
    }
  },

  /**
   * Check if quests need to refresh
   */
  checkRefresh() {
    const now = new Date();
    const today = now.toDateString();

    // Check daily refresh
    if (this.questData.lastDailyRefresh !== today) {
      this.refreshDailyQuests();
    }

    // Check weekly refresh (Monday)
    const weekStart = this.getWeekStart(now);
    if (this.questData.lastWeeklyRefresh !== weekStart) {
      this.refreshWeeklyQuests();
    }
  },

  /**
   * Get the start of the week (Monday) as string
   * @param {Date} date
   * @returns {string}
   */
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toDateString();
  },

  /**
   * Refresh daily quests
   */
  refreshDailyQuests() {
    this.questData.dailyQuests = [];
    this.questData.completedToday = [];
    this.questData.todayProgress = {
      submissions: 0,
      points: 0,
      itemsByType: {},
      boxesOpened: 0
    };
    this.questData.lastDailyRefresh = new Date().toDateString();
    this.generateDailyQuests();
    this.saveQuests();
  },

  /**
   * Refresh weekly quests
   */
  refreshWeeklyQuests() {
    this.questData.weeklyQuests = [];
    this.questData.completedThisWeek = [];
    this.questData.lastWeeklyRefresh = this.getWeekStart(new Date());
    this.generateWeeklyQuests();
    this.saveQuests();
  },

  /**
   * Generate daily quests (3 random quests)
   */
  generateDailyQuests() {
    const { DAILY_QUEST_TEMPLATES } = window.EcoVentureConfig;
    const shuffled = [...DAILY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    this.questData.dailyQuests = selected.map((template, index) => ({
      ...template,
      id: `daily_${Date.now()}_${index}`,
      progress: 0,
      claimed: false,
      type: 'daily'
    }));

    this.saveQuests();
  },

  /**
   * Generate weekly quests (2 random quests)
   */
  generateWeeklyQuests() {
    const { WEEKLY_QUEST_TEMPLATES } = window.EcoVentureConfig;
    const shuffled = [...WEEKLY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 2);

    this.questData.weeklyQuests = selected.map((template, index) => ({
      ...template,
      id: `weekly_${Date.now()}_${index}`,
      progress: 0,
      claimed: false,
      type: 'weekly'
    }));

    this.saveQuests();
  },

  /**
   * Get all active quests
   * @returns {Object} { daily: [], weekly: [] }
   */
  getActiveQuests() {
    this.checkRefresh();
    return {
      daily: this.questData.dailyQuests || [],
      weekly: this.questData.weeklyQuests || []
    };
  },

  /**
   * Update quest progress based on an action
   * @param {string} conditionType - Type of action (submissions, points, etc)
   * @param {number} value - Value to add
   * @param {string} itemType - Optional item type for collect_type quests
   */
  updateProgress(conditionType, value, itemType = null) {
    // Update today's progress
    if (conditionType === 'submissions') {
      this.questData.todayProgress.submissions += value;
    } else if (conditionType === 'points') {
      this.questData.todayProgress.points += value;
    } else if (conditionType === 'open_boxes') {
      this.questData.todayProgress.boxesOpened += value;
    } else if (conditionType === 'collect_type' && itemType) {
      this.questData.todayProgress.itemsByType[itemType] =
        (this.questData.todayProgress.itemsByType[itemType] || 0) + value;
    }

    // Check daily quests
    this.questData.dailyQuests.forEach(quest => {
      if (quest.claimed) return;

      if (quest.condition.type === conditionType) {
        if (conditionType === 'collect_type') {
          if (quest.condition.itemType === itemType) {
            quest.progress += value;
          }
        } else {
          quest.progress += value;
        }

        // Cap at target
        quest.progress = Math.min(quest.progress, quest.condition.target);
      }
    });

    // Check weekly quests
    this.questData.weeklyQuests.forEach(quest => {
      if (quest.claimed) return;

      if (quest.condition.type === conditionType) {
        if (conditionType === 'collect_type') {
          if (quest.condition.itemType === itemType) {
            quest.progress += value;
          }
        } else {
          quest.progress += value;
        }

        quest.progress = Math.min(quest.progress, quest.condition.target);
      }
    });

    this.saveQuests();
    this.renderQuests();
  },

  /**
   * Check if a quest is completed
   * @param {Object} quest - Quest object
   * @returns {boolean}
   */
  isQuestComplete(quest) {
    return quest.progress >= quest.condition.target;
  },

  /**
   * Claim a quest reward
   * @param {string} questId - ID of quest to claim
   * @returns {Object|null} Rewards received or null if failed
   */
  claimReward(questId) {
    // Find quest in daily or weekly
    let quest = this.questData.dailyQuests.find(q => q.id === questId);
    if (!quest) {
      quest = this.questData.weeklyQuests.find(q => q.id === questId);
    }

    if (!quest || quest.claimed || !this.isQuestComplete(quest)) {
      return null;
    }

    // Mark as claimed
    quest.claimed = true;

    // Award rewards
    const rewards = quest.rewards;

    // Add points
    if (rewards.points && window.EcoVentureApp) {
      window.EcoVentureApp.userData.totalPoints += rewards.points;
      window.EcoVentureApp.userData.lifetimePoints += rewards.points;
    }

    // Add gems
    if (rewards.gems && window.EcoVentureApp) {
      window.EcoVentureApp.userData.ecoGems =
        (window.EcoVentureApp.userData.ecoGems || 0) + rewards.gems;
      window.EcoVentureApp.userData.lifetimeGems =
        (window.EcoVentureApp.userData.lifetimeGems || 0) + rewards.gems;
    }

    // Add box tickets
    if (rewards.boxTickets && window.EcoVentureInventory) {
      window.EcoVentureInventory.addTickets(rewards.boxTickets);
    }

    // Save everything
    this.saveQuests();

    if (window.EcoVentureApp) {
      window.EcoVentureApp.saveUserData();
      window.EcoVentureUI.updateStats(window.EcoVentureApp.userData);
    }

    // Show celebration
    let rewardText = [];
    if (rewards.points) rewardText.push(`+${rewards.points} pts`);
    if (rewards.gems) rewardText.push(`+${rewards.gems} gems`);
    if (rewards.boxTickets) rewardText.push(`+${rewards.boxTickets} ticket${rewards.boxTickets > 1 ? 's' : ''}`);

    if (window.EcoVentureUI) {
      // Show confetti celebration for quest completion
      window.EcoVentureUI.showRewardCelebration(`Quest Complete! ${rewardText.join(', ')}`);

      // Animate currency displays
      if (rewards.points) {
        window.EcoVentureUI.animateCurrencyUpdate('headerPoints');
        window.EcoVentureUI.animateCurrencyUpdate('shopPoints');
      }
      if (rewards.gems) {
        window.EcoVentureUI.animateCurrencyUpdate('headerGems');
        window.EcoVentureUI.animateCurrencyUpdate('shopGems');
      }
    }

    return rewards;
  },

  /**
   * Get time until daily reset (midnight)
   * @returns {Object} { hours, minutes, seconds }
   */
  getTimeUntilDailyReset() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  },

  /**
   * Format countdown string
   * @param {Object} time - { hours, minutes, seconds }
   * @returns {string}
   */
  formatCountdown(time) {
    const pad = n => n.toString().padStart(2, '0');
    return `${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`;
  },

  /**
   * Render quests UI
   */
  renderQuests() {
    const dailyList = document.getElementById('dailyQuestList');
    const weeklyList = document.getElementById('weeklyQuestList');
    const timerEl = document.getElementById('dailyQuestTimer');

    if (dailyList) {
      dailyList.innerHTML = '';
      this.questData.dailyQuests.forEach(quest => {
        dailyList.appendChild(this.renderQuestCard(quest));
      });
    }

    if (weeklyList) {
      weeklyList.innerHTML = '';
      this.questData.weeklyQuests.forEach(quest => {
        weeklyList.appendChild(this.renderQuestCard(quest));
      });
    }

    // Update timer
    if (timerEl) {
      const time = this.getTimeUntilDailyReset();
      const timerText = timerEl.querySelector('.timer-text');
      if (timerText) {
        timerText.textContent = `Resets in ${this.formatCountdown(time)}`;
      }
    }
  },

  /**
   * Render a single quest card
   * @param {Object} quest - Quest data
   * @returns {HTMLElement}
   */
  renderQuestCard(quest) {
    const card = document.createElement('div');
    const isComplete = this.isQuestComplete(quest);
    const isReadyToClaim = isComplete && !quest.claimed;
    card.className = `quest-card ${quest.claimed ? 'completed' : ''} ${isReadyToClaim ? 'ready-to-claim' : ''}`;

    const progressPercent = Math.min((quest.progress / quest.condition.target) * 100, 100);

    // Build rewards HTML
    let rewardsHtml = '';
    if (quest.rewards.points) {
      rewardsHtml += `<span class="quest-reward points">✨ ${quest.rewards.points}</span>`;
    }
    if (quest.rewards.gems) {
      rewardsHtml += `<span class="quest-reward gems">💎 ${quest.rewards.gems}</span>`;
    }
    if (quest.rewards.boxTickets) {
      rewardsHtml += `<span class="quest-reward tickets">🎟️ ${quest.rewards.boxTickets}</span>`;
    }

    card.innerHTML = `
      <div class="quest-header">
        <div class="quest-icon">${quest.icon}</div>
        <div class="quest-info">
          <div class="quest-title">${quest.title}</div>
          <div class="quest-description">${quest.description}</div>
        </div>
        <div class="quest-rewards">${rewardsHtml}</div>
      </div>
      <div class="quest-progress">
        <div class="quest-progress-bar">
          <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <div class="quest-progress-text">${quest.progress} / ${quest.condition.target}</div>
      </div>
      ${isComplete && !quest.claimed ? `
        <button class="quest-claim-btn" data-quest-id="${quest.id}">Claim Reward</button>
      ` : ''}
      ${quest.claimed ? `
        <button class="quest-claim-btn" disabled>Claimed ✓</button>
      ` : ''}
    `;

    // Add claim button listener
    const claimBtn = card.querySelector('.quest-claim-btn:not([disabled])');
    if (claimBtn) {
      claimBtn.addEventListener('click', () => {
        this.claimReward(quest.id);
        this.renderQuests();
      });
    }

    return card;
  },

  /**
   * Setup event listeners
   */
  setupListeners() {
    // Timer update interval
    setInterval(() => {
      const timerEl = document.getElementById('dailyQuestTimer');
      if (timerEl) {
        const time = this.getTimeUntilDailyReset();
        const timerText = timerEl.querySelector('.timer-text');
        if (timerText) {
          timerText.textContent = `Resets in ${this.formatCountdown(time)}`;
        }
      }
    }, 1000);
  },

  // === EVENT HANDLERS (called from app.js/detection.js) ===

  /**
   * Called when trash is collected
   * @param {Array} items - Array of detected items
   */
  onTrashCollected(items) {
    if (!items || items.length === 0) return;

    this.updateProgress('submissions', 1);

    // Track by type
    items.forEach(item => {
      const itemType = item.class?.toLowerCase();
      if (itemType) {
        // Map to general types
        let category = 'trash';
        if (itemType.includes('plastic') || itemType.includes('bottle')) {
          category = 'plastic';
        } else if (itemType.includes('paper') || itemType.includes('cardboard')) {
          category = 'paper';
        } else if (itemType.includes('metal') || itemType.includes('can')) {
          category = 'metal';
        } else if (itemType.includes('glass')) {
          category = 'glass';
        }
        this.updateProgress('collect_type', 1, category);
      }
    });
  },

  /**
   * Called when points are earned
   * @param {number} points - Points earned
   */
  onPointsEarned(points) {
    this.updateProgress('points', points);
  },

  /**
   * Called when a box is opened
   */
  onBoxOpened() {
    this.updateProgress('open_boxes', 1);
  },

  /**
   * Called when streak is updated
   * @param {number} streak - Current streak value
   */
  onStreakUpdated(streak) {
    // Check streak-based quests
    [...this.questData.dailyQuests, ...this.questData.weeklyQuests].forEach(quest => {
      if (quest.condition.type === 'streak' && !quest.claimed) {
        quest.progress = streak;
        if (quest.progress >= quest.condition.target) {
          quest.progress = quest.condition.target;
        }
      }
    });
    this.saveQuests();
    this.renderQuests();
  }
};

// Export module
window.EcoVentureQuests = QuestsModule;
