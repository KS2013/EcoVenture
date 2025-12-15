/**
 * EcoQuest Friends Module
 * Friends system - add, accept, reject, leaderboard
 */

const FriendsModule = {
  foundFriend: null,

  // Setup listeners
  setupListeners() {
    // Add friend buttons
    const addFriendBtn = document.getElementById('addFriendBtn');
    const addFirstFriendBtn = document.getElementById('addFirstFriendBtn');
    if (addFriendBtn) addFriendBtn.addEventListener('click', () => this.openAddModal());
    if (addFirstFriendBtn) addFirstFriendBtn.addEventListener('click', () => this.openAddModal());

    // Copy friend code buttons
    const copyFriendCodeBtn = document.getElementById('copyFriendCodeBtn');
    const copyProfileFriendCodeBtn = document.getElementById('copyProfileFriendCodeBtn');
    if (copyFriendCodeBtn) copyFriendCodeBtn.addEventListener('click', () => this.copyFriendCode());
    if (copyProfileFriendCodeBtn) copyProfileFriendCodeBtn.addEventListener('click', () => this.copyFriendCode());

    // View requests
    const viewRequestsBtn = document.getElementById('viewRequestsBtn');
    if (viewRequestsBtn) viewRequestsBtn.addEventListener('click', () => this.openRequestsModal());

    // Add Friend Modal
    const addFriendModalClose = document.getElementById('addFriendModalClose');
    const addFriendModal = document.getElementById('addFriendModal');
    if (addFriendModalClose) addFriendModalClose.addEventListener('click', () => this.closeAddModal());
    if (addFriendModal) {
      addFriendModal.addEventListener('click', (e) => {
        if (e.target === addFriendModal) this.closeAddModal();
      });
    }

    // Friend code input
    const friendCodeInput = document.getElementById('friendCodeInput');
    if (friendCodeInput) {
      friendCodeInput.addEventListener('input', (e) => this.handleCodeInput(e));
    }

    // Send friend request
    const sendFriendRequestBtn = document.getElementById('sendFriendRequestBtn');
    if (sendFriendRequestBtn) sendFriendRequestBtn.addEventListener('click', () => this.sendRequest());

    // Friend Requests Modal
    const friendRequestsModalClose = document.getElementById('friendRequestsModalClose');
    const friendRequestsModal = document.getElementById('friendRequestsModal');
    if (friendRequestsModalClose) friendRequestsModalClose.addEventListener('click', () => this.closeRequestsModal());
    if (friendRequestsModal) {
      friendRequestsModal.addEventListener('click', (e) => {
        if (e.target === friendRequestsModal) this.closeRequestsModal();
      });
    }

    // Request tabs
    document.querySelectorAll('.requests-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchRequestsTab(tab.dataset.requests));
    });
  },

  // Open add friend modal
  openAddModal() {
    const auth = window.EcoQuestAuthUI;
    if (!auth.isLoggedIn) {
      auth.openModal('signin');
      return;
    }

    const modal = document.getElementById('addFriendModal');
    if (modal) modal.classList.remove('hidden');

    // Reset
    document.getElementById('friendCodeInput').value = '';
    document.getElementById('friendSearchResult').classList.add('hidden');
    this.foundFriend = null;

    // Update share code
    const shareMyCode = document.getElementById('shareMyCode');
    if (shareMyCode && auth.userProfile?.friend_code) {
      shareMyCode.textContent = auth.userProfile.friend_code;
    }
  },

  // Close add friend modal
  closeAddModal() {
    const modal = document.getElementById('addFriendModal');
    if (modal) modal.classList.add('hidden');
  },

  // Handle friend code input
  async handleCodeInput(e) {
    const code = e.target.value.toUpperCase().trim();
    const searchResult = document.getElementById('friendSearchResult');

    if (code.length < 8) {
      searchResult.classList.add('hidden');
      this.foundFriend = null;
      return;
    }

    const auth = window.EcoQuestAuthUI;

    if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
      try {
        const user = await window.EcoQuestAuth.getUserByFriendCode(code);
        if (user && user.id !== auth.authUser?.id) {
          this.foundFriend = user;
          document.getElementById('friendPreviewName').textContent = user.display_name || user.username;
          document.getElementById('friendPreviewPoints').textContent = `${user.total_points} pts`;
          searchResult.classList.remove('hidden');
        } else if (user && user.id === auth.authUser?.id) {
          window.EcoQuestUI.showToast("That's your own code!", 'warning');
          searchResult.classList.add('hidden');
          this.foundFriend = null;
        } else {
          searchResult.classList.add('hidden');
          this.foundFriend = null;
        }
      } catch (error) {
        searchResult.classList.add('hidden');
        this.foundFriend = null;
      }
    } else {
      // Demo mode
      this.foundFriend = {
        id: 'demo_friend',
        username: 'DemoFriend',
        display_name: 'Demo Friend',
        total_points: Math.floor(Math.random() * 1000)
      };
      document.getElementById('friendPreviewName').textContent = this.foundFriend.display_name;
      document.getElementById('friendPreviewPoints').textContent = `${this.foundFriend.total_points} pts`;
      searchResult.classList.remove('hidden');
    }
  },

  // Send friend request
  async sendRequest() {
    if (!this.foundFriend) {
      window.EcoQuestUI.showToast('Enter a valid friend code first', 'warning');
      return;
    }

    const auth = window.EcoQuestAuthUI;

    if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
      try {
        await window.EcoQuestAuth.sendFriendRequest(auth.authUser.id, this.foundFriend.id);
        window.EcoQuestUI.showToast('Friend request sent!', 'success');
        this.closeAddModal();
      } catch (error) {
        window.EcoQuestUI.showToast(error.message || 'Failed to send request', 'error');
      }
    } else {
      window.EcoQuestUI.showToast('Friend request sent! (Demo)', 'success');
      this.closeAddModal();
    }
  },

  // Copy friend code
  copyFriendCode() {
    const auth = window.EcoQuestAuthUI;
    const code = auth.userProfile?.friend_code || 'DEMO1234';

    navigator.clipboard.writeText(code).then(() => {
      window.EcoQuestUI.showToast('Friend code copied!', 'success');
    }).catch(() => {
      window.EcoQuestUI.showToast('Failed to copy', 'error');
    });
  },

  // Open requests modal
  openRequestsModal() {
    const modal = document.getElementById('friendRequestsModal');
    if (modal) modal.classList.remove('hidden');
    this.loadRequests();
  },

  // Close requests modal
  closeRequestsModal() {
    const modal = document.getElementById('friendRequestsModal');
    if (modal) modal.classList.add('hidden');
  },

  // Switch requests tab
  switchRequestsTab(tab) {
    document.querySelectorAll('.requests-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.requests === tab);
    });

    document.getElementById('receivedRequestsList').classList.toggle('hidden', tab !== 'received');
    document.getElementById('sentRequestsList').classList.toggle('hidden', tab !== 'sent');
  },

  // Load friend requests
  async loadRequests() {
    const auth = window.EcoQuestAuthUI;
    if (!auth.isLoggedIn) return;

    const receivedList = document.getElementById('receivedRequestsList');
    const sentList = document.getElementById('sentRequestsList');

    if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
      try {
        const received = await window.EcoQuestAuth.getPendingFriendRequests(auth.authUser.id);
        this.renderReceivedRequests(received, receivedList);

        const sent = await window.EcoQuestAuth.getSentFriendRequests(auth.authUser.id);
        this.renderSentRequests(sent, sentList);
      } catch (error) {
        console.error('Error loading friend requests:', error);
      }
    } else {
      receivedList.innerHTML = '<div class="requests-empty"><span>No pending requests</span></div>';
      sentList.innerHTML = '<div class="requests-empty"><span>No sent requests</span></div>';
    }
  },

  // Render received requests
  renderReceivedRequests(requests, container) {
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
            <button class="btn btn-accept" onclick="window.EcoQuestFriends.acceptRequest('${req.id}')">Accept</button>
            <button class="btn btn-reject" onclick="window.EcoQuestFriends.rejectRequest('${req.id}')">Reject</button>
          </div>
        </div>
      `;
    }).join('');
  },

  // Render sent requests
  renderSentRequests(requests, container) {
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
  },

  // Accept request
  async acceptRequest(requestId) {
    if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
      try {
        await window.EcoQuestAuth.acceptFriendRequest(requestId);
        window.EcoQuestUI.showToast('Friend added!', 'success');
        this.loadRequests();
        this.updatePendingBadge();
        this.loadLeaderboard();
      } catch (error) {
        window.EcoQuestUI.showToast('Failed to accept request', 'error');
      }
    }
  },

  // Reject request
  async rejectRequest(requestId) {
    if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
      try {
        await window.EcoQuestAuth.rejectFriendRequest(requestId);
        window.EcoQuestUI.showToast('Request declined', 'success');
        this.loadRequests();
        this.updatePendingBadge();
      } catch (error) {
        window.EcoQuestUI.showToast('Failed to decline request', 'error');
      }
    }
  },

  // Load friends leaderboard
  async loadLeaderboard() {
    const auth = window.EcoQuestAuthUI;

    if (!auth.isLoggedIn) {
      const listEl = document.getElementById('friendsLeaderboardList');
      if (listEl) {
        listEl.innerHTML = `
          <div class="leaderboard-empty">
            <span class="empty-icon">🔐</span>
            <p>Sign in to see friends</p>
            <button class="btn btn-primary" onclick="window.EcoQuestAuthUI.openModal('signin')">Sign In</button>
          </div>
        `;
      }
      return;
    }

    this.updateFriendCodeDisplays();

    const listEl = document.getElementById('friendsLeaderboardList');
    const yourRankCard = document.getElementById('yourFriendsRank');
    const statsCard = document.getElementById('friendsStatsCard');

    let leaderboardData = [];

    if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
      try {
        leaderboardData = await window.EcoQuestAuth.getFriendsLeaderboard(auth.authUser.id);
        this.updatePendingBadge();
      } catch (error) {
        console.error('Failed to load friends leaderboard:', error);
      }
    } else {
      leaderboardData = [{
        id: auth.authUser?.id || 'current_user',
        username: auth.userProfile?.username || 'You',
        display_name: auth.userProfile?.display_name || 'You',
        total_points: 0,
        submissions: 0,
        current_streak: 0
      }];
    }

    // Check if user has friends
    if (leaderboardData.length <= 1) {
      listEl.innerHTML = `
        <div class="leaderboard-empty">
          <span class="empty-icon">👥</span>
          <p>No friends yet</p>
          <span class="empty-desc">Add friends using their friend code to compete!</span>
          <button class="btn btn-primary" onclick="window.EcoQuestFriends.openAddModal()">Add Your First Friend</button>
        </div>
      `;
      if (statsCard) statsCard.classList.add('hidden');
      if (yourRankCard) {
        yourRankCard.querySelector('.rank-number').textContent = '#1';
        yourRankCard.querySelector('.rank-points').textContent = '0 pts';
      }
      return;
    }

    // Render leaderboard
    if (statsCard) statsCard.classList.remove('hidden');
    window.EcoQuestLeaderboard.renderLeaderboard(listEl, leaderboardData, yourRankCard);

    // Update stats
    const currentUserId = auth.authUser?.id || 'current_user';
    const userIndex = leaderboardData.findIndex(u => u.id === currentUserId);

    document.getElementById('totalFriendsCount').textContent = leaderboardData.length - 1;
    document.getElementById('friendsAhead').textContent = userIndex;
    document.getElementById('friendsBehind').textContent = leaderboardData.length - userIndex - 1;
  },

  // Update friend code displays
  updateFriendCodeDisplays() {
    const auth = window.EcoQuestAuthUI;
    const code = auth.userProfile?.friend_code || 'DEMO1234';

    const elements = ['myFriendCode', 'profileFriendCode', 'shareMyCode'];
    elements.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = code;
    });
  },

  // Update pending requests badge
  async updatePendingBadge() {
    const auth = window.EcoQuestAuthUI;
    const banner = document.getElementById('pendingRequestsBanner');
    const countEl = document.getElementById('pendingCount');

    if (!auth.isLoggedIn || !banner) return;

    if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
      try {
        const count = await window.EcoQuestAuth.getPendingRequestCount(auth.authUser.id);
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
};

// Export
window.EcoQuestFriends = FriendsModule;
