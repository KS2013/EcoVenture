/**
 * EcoQuest Rewards Module
 * Rewards display and redemption
 */

const RewardsModule = {
  currentCategory: 'all',
  rewards: [],

  // Setup listeners
  setupListeners() {
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterByCategory(btn.dataset.category);
      });
    });

    // Reward modal close
    const modalClose = document.getElementById('modalClose');
    const rewardModal = document.getElementById('rewardModal');

    if (modalClose) modalClose.addEventListener('click', () => this.closeModal());
    if (rewardModal) {
      rewardModal.addEventListener('click', (e) => {
        if (e.target === rewardModal) this.closeModal();
      });
    }
  },

  // Filter by category
  filterByCategory(category) {
    this.currentCategory = category;

    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    this.renderRewards();
  },

  // Load rewards from main process or use defaults
  async loadRewards() {
    if (window.electronAPI) {
      try {
        this.rewards = await window.electronAPI.getRewards();
      } catch (error) {
        console.error('Failed to load rewards:', error);
        this.rewards = this.getDefaultRewards();
      }
    } else {
      this.rewards = this.getDefaultRewards();
    }

    this.renderRewards();
    this.updatePointsBalance();
  },

  // Get default rewards
  getDefaultRewards() {
    return [
      { id: 'coffee', name: '$5 Coffee Gift Card', points: 500, icon: '☕', category: 'gift_card' },
      { id: 'amazon5', name: '$5 Amazon Gift Card', points: 500, icon: '🛒', category: 'gift_card' },
      { id: 'amazon10', name: '$10 Amazon Gift Card', points: 900, icon: '🛒', category: 'gift_card' },
      { id: 'tree', name: 'Plant a Tree', points: 200, icon: '🌳', category: 'donation' },
      { id: 'ocean', name: 'Ocean Cleanup Donation', points: 300, icon: '🌊', category: 'donation' },
      { id: 'wildlife', name: 'Wildlife Protection Fund', points: 400, icon: '🦁', category: 'donation' }
    ];
  },

  // Render rewards grid
  renderRewards() {
    const grid = document.getElementById('rewardsGrid');
    if (!grid) return;

    let filtered = this.rewards;
    if (this.currentCategory !== 'all') {
      filtered = this.rewards.filter(r => r.category === this.currentCategory);
    }

    grid.innerHTML = filtered.map(reward => `
      <div class="reward-card" onclick="window.EcoQuestRewards.showRewardDetails('${reward.id}')">
        <div class="reward-icon">${reward.icon}</div>
        <div class="reward-info">
          <span class="reward-name">${reward.name}</span>
          <span class="reward-points">${reward.points} pts</span>
        </div>
      </div>
    `).join('');
  },

  // Show reward details modal
  showRewardDetails(rewardId) {
    const reward = this.rewards.find(r => r.id === rewardId);
    if (!reward) return;

    const modal = document.getElementById('rewardModal');
    const modalBody = document.getElementById('modalBody');

    if (!modal || !modalBody) return;

    // Get user data
    let userPoints = 0;
    if (window.EcoQuestApp && window.EcoQuestApp.userData) {
      userPoints = window.EcoQuestApp.userData.totalPoints || 0;
    }

    const canAfford = userPoints >= reward.points;

    modalBody.innerHTML = `
      <div class="reward-details">
        <div class="reward-icon-large">${reward.icon}</div>
        <h2>${reward.name}</h2>
        <p class="reward-cost">${reward.points} points</p>
        <p class="reward-balance">Your balance: ${userPoints} pts</p>
        ${canAfford ?
          `<button class="btn btn-primary btn-large" onclick="window.EcoQuestRewards.redeemReward('${reward.id}')">Redeem Now</button>` :
          `<button class="btn btn-secondary btn-large" disabled>Not enough points</button>
           <p class="reward-needed">Need ${reward.points - userPoints} more points</p>`
        }
      </div>
    `;

    modal.classList.remove('hidden');
  },

  // Close modal
  closeModal() {
    const modal = document.getElementById('rewardModal');
    if (modal) modal.classList.add('hidden');
  },

  // Redeem reward
  async redeemReward(rewardId) {
    const reward = this.rewards.find(r => r.id === rewardId);
    if (!reward) return;

    let result;

    if (window.electronAPI) {
      result = await window.electronAPI.redeemReward(rewardId);
    } else {
      // Demo mode
      let userData = window.EcoQuestApp?.userData;
      if (!userData) {
        userData = JSON.parse(localStorage.getItem('ecoquest_userData') || '{"totalPoints":0}');
      }

      if (userData.totalPoints < reward.points) {
        result = { success: false, error: 'Not enough points' };
      } else {
        userData.totalPoints -= reward.points;
        if (!userData.redemptionHistory) userData.redemptionHistory = [];
        userData.redemptionHistory.push({
          rewardId: reward.id,
          rewardName: reward.name,
          points: reward.points,
          code: this.generateCode(),
          redeemedAt: new Date().toISOString()
        });
        localStorage.setItem('ecoquest_userData', JSON.stringify(userData));
        if (window.EcoQuestApp) window.EcoQuestApp.userData = userData;

        result = { success: true, code: userData.redemptionHistory[userData.redemptionHistory.length - 1].code };
      }
    }

    const modalBody = document.getElementById('modalBody');

    if (result.success) {
      modalBody.innerHTML = `
        <div class="redeem-success">
          <div class="success-icon">🎉</div>
          <h2>Reward Redeemed!</h2>
          <p>Your code:</p>
          <div class="redeem-code">${result.code}</div>
          <p class="redeem-note">Save this code! Check your email for details.</p>
          <button class="btn btn-primary btn-large" onclick="window.EcoQuestRewards.closeModal()">Done</button>
        </div>
      `;

      // Update UI
      this.updatePointsBalance();
      this.loadRedemptionHistory();
      if (window.EcoQuestUI && window.EcoQuestApp) {
        window.EcoQuestUI.updateStats(window.EcoQuestApp.userData);
      }

      window.EcoQuestUI.showToast('Reward redeemed!', 'success');
    } else {
      window.EcoQuestUI.showToast(result.error || 'Redemption failed', 'error');
    }
  },

  // Generate redemption code
  generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ECO-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  // Update points balance display
  updatePointsBalance() {
    const balanceEl = document.getElementById('redeemPointsBalance');
    if (balanceEl) {
      let points = 0;
      if (window.EcoQuestApp && window.EcoQuestApp.userData) {
        points = window.EcoQuestApp.userData.totalPoints || 0;
      }
      balanceEl.textContent = points;
    }
  },

  // Load redemption history
  loadRedemptionHistory() {
    const historyList = document.getElementById('redemptionHistoryList');
    if (!historyList) return;

    let history = [];
    if (window.EcoQuestApp && window.EcoQuestApp.userData) {
      history = window.EcoQuestApp.userData.redemptionHistory || [];
    }

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
            <span class="history-name">${item.rewardName || item.rewardId}</span>
            <span class="history-date">${date}</span>
          </div>
          <span class="history-code">${item.code}</span>
        </div>
      `;
    }).join('');
  }
};

// Export
window.EcoQuestRewards = RewardsModule;
