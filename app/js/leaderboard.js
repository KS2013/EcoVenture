/**
 * EcoVenture Leaderboard Module
 * Leaderboard display and management
 */

const LeaderboardModule = {
  currentLeaderboard: 'area',

  // Setup listeners
  setupListeners() {
    const toggleBtns = document.querySelectorAll('.leaderboard-toggle .toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.leaderboard;
        this.switchLeaderboard(type);
      });
    });

    // Change area button
    const changeAreaBtn = document.getElementById('changeAreaBtn');
    const setAreaBtn = document.getElementById('setAreaBtn');
    if (changeAreaBtn) changeAreaBtn.addEventListener('click', () => this.openAreaModal());
    if (setAreaBtn) setAreaBtn.addEventListener('click', () => this.openAreaModal());

    // Area modal
    const areaModalClose = document.getElementById('areaModalClose');
    const areaModal = document.getElementById('areaModal');
    const saveAreaBtn = document.getElementById('saveAreaBtn');

    if (areaModalClose) areaModalClose.addEventListener('click', () => this.closeAreaModal());
    if (areaModal) {
      areaModal.addEventListener('click', (e) => {
        if (e.target === areaModal) this.closeAreaModal();
      });
    }
    if (saveAreaBtn) saveAreaBtn.addEventListener('click', () => this.handleSaveArea());
  },

  // Switch leaderboard type
  switchLeaderboard(type) {
    this.currentLeaderboard = type;

    // Update toggle buttons
    document.querySelectorAll('.leaderboard-toggle .toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.leaderboard === type);
    });

    // Update content visibility
    document.querySelectorAll('.leaderboard-content').forEach(content => {
      content.classList.remove('active');
    });

    const targetContent = document.getElementById(`${type}Leaderboard`);
    if (targetContent) targetContent.classList.add('active');

    // Load data
    this.loadData();
  },

  // Load leaderboard data
  async loadData() {
    const auth = window.EcoVentureAuthUI;
    if (!auth.isLoggedIn) return;

    if (this.currentLeaderboard === 'area') {
      await this.loadAreaLeaderboard();
    } else if (this.currentLeaderboard === 'global') {
      await this.loadGlobalLeaderboard();
    } else if (this.currentLeaderboard === 'friends') {
      if (window.EcoVentureFriends) {
        await window.EcoVentureFriends.loadLeaderboard();
      }
    }
  },

  // Load area leaderboard
  async loadAreaLeaderboard() {
    const auth = window.EcoVentureAuthUI;
    const listEl = document.getElementById('areaLeaderboardList');
    const yourRankCard = document.getElementById('yourAreaRank');
    const areaNameEl = document.getElementById('currentAreaName');

    if (!auth.userProfile?.area) {
      if (areaNameEl) areaNameEl.textContent = 'Set your area to compete!';
      if (listEl) {
        listEl.innerHTML = `
          <div class="leaderboard-empty">
            <span class="empty-icon">📍</span>
            <p>Set your area to see local leaderboard</p>
            <button class="btn btn-primary" onclick="window.EcoVentureLeaderboard.openAreaModal()">Set Area</button>
          </div>
        `;
      }
      return;
    }

    if (areaNameEl) areaNameEl.textContent = auth.userProfile.area;

    let data = [];
    if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
      try {
        data = await window.EcoVentureAuth.getAreaLeaderboard(auth.userProfile.area);
      } catch (error) {
        console.error('Failed to load area leaderboard:', error);
      }
    }

    if (data.length === 0) {
      data = this.generateDemoData();
    }

    this.renderLeaderboard(listEl, data, yourRankCard);
  },

  // Load global leaderboard
  async loadGlobalLeaderboard() {
    const listEl = document.getElementById('globalLeaderboardList');
    const yourRankCard = document.getElementById('yourGlobalRank');

    let data = [];
    if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured()) {
      try {
        data = await window.EcoVentureAuth.getGlobalLeaderboard();
      } catch (error) {
        console.error('Failed to load global leaderboard:', error);
      }
    }

    if (data.length === 0) {
      data = this.generateDemoData();
    }

    this.renderLeaderboard(listEl, data, yourRankCard);
  },

  // Generate demo leaderboard data
  generateDemoData() {
    const names = ['EcoWarrior', 'GreenHero', 'TrashHunter', 'PlanetSaver', 'CleanMachine'];
    return names.map((name, i) => ({
      id: `demo_${i}`,
      username: name,
      display_name: name,
      total_points: Math.floor(Math.random() * 500) + 100,
      submissions: Math.floor(Math.random() * 20) + 1,
      current_streak: Math.floor(Math.random() * 7)
    })).sort((a, b) => b.total_points - a.total_points);
  },

  // Render leaderboard
  renderLeaderboard(listEl, data, yourRankCard) {
    if (!listEl) return;

    const auth = window.EcoVentureAuthUI;
    const currentUserId = auth.authUser?.id || 'current_user';
    const userIndex = data.findIndex(u => u.id === currentUserId);
    const userRank = userIndex !== -1 ? userIndex + 1 : '-';
    const userPoints = userIndex !== -1 ? data[userIndex].total_points : 0;

    // Update rank card
    if (yourRankCard) {
      yourRankCard.querySelector('.rank-number').textContent = `#${userRank}`;
      yourRankCard.querySelector('.rank-points').textContent = `${userPoints} pts`;
    }

    // Render list
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
  },

  // Open area modal
  openAreaModal() {
    const areaModal = document.getElementById('areaModal');
    if (areaModal) areaModal.classList.remove('hidden');

    // Pre-fill with current values
    const auth = window.EcoVentureAuthUI;
    if (auth.userProfile) {
      const areaInput = document.getElementById('areaInput');
      const countryInput = document.getElementById('countryInput');
      if (areaInput) areaInput.value = auth.userProfile.area || '';
      if (countryInput) countryInput.value = auth.userProfile.country || '';
    }
  },

  // Close area modal
  closeAreaModal() {
    const areaModal = document.getElementById('areaModal');
    if (areaModal) areaModal.classList.add('hidden');
  },

  // Save area
  async handleSaveArea() {
    const areaInput = document.getElementById('areaInput');
    const countryInput = document.getElementById('countryInput');
    const area = areaInput?.value.trim();
    const country = countryInput?.value.trim();

    if (!area) {
      window.EcoVentureUI.showToast('Please enter your area', 'warning');
      return;
    }

    const auth = window.EcoVentureAuthUI;

    if (window.EcoVentureAuth && window.EcoVentureAuth.isConfigured() && auth.authUser) {
      try {
        const updated = await window.EcoVentureAuth.updateUserArea(auth.authUser.id, area, country);
        auth.userProfile = { ...auth.userProfile, ...updated };
        window.EcoVentureUI.showToast('Area updated!', 'success');
      } catch (error) {
        window.EcoVentureUI.showToast('Failed to update area', 'error');
      }
    } else {
      // Demo mode
      if (auth.userProfile) {
        auth.userProfile.area = area;
        auth.userProfile.country = country;
      }
      window.EcoVentureUI.showToast('Area updated! (Demo)', 'success');
    }

    this.closeAreaModal();
    auth.updateProfileSection();

    // Reload area leaderboard
    if (this.currentLeaderboard === 'area') {
      await this.loadAreaLeaderboard();
    }
  }
};

// Export
window.EcoVentureLeaderboard = LeaderboardModule;
