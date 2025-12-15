/**
 * EcoQuest Cleanups Module
 * Organized cleanup events management
 */

const CleanupsModule = {
  currentView: 'upcoming',
  events: [],
  userEvents: [],
  selectedEvent: null,

  // Bonus points for attending organized cleanups
  ATTENDANCE_BONUS: 50,

  // Setup listeners
  setupListeners() {
    // Create event button
    const createEventBtn = document.getElementById('createCleanupBtn');
    if (createEventBtn) {
      createEventBtn.addEventListener('click', () => this.openCreateModal());
    }

    // View toggle buttons
    document.querySelectorAll('.cleanup-toggle .toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.switchView(view);
      });
    });

    // Create modal controls
    const createModalClose = document.getElementById('createCleanupModalClose');
    const createModal = document.getElementById('createCleanupModal');
    const submitEventBtn = document.getElementById('submitCleanupEventBtn');

    if (createModalClose) {
      createModalClose.addEventListener('click', () => this.closeCreateModal());
    }
    if (createModal) {
      createModal.addEventListener('click', (e) => {
        if (e.target === createModal) this.closeCreateModal();
      });
    }
    if (submitEventBtn) {
      submitEventBtn.addEventListener('click', () => this.handleCreateEvent());
    }

    // Event details modal controls
    const detailsModalClose = document.getElementById('eventDetailsModalClose');
    const detailsModal = document.getElementById('eventDetailsModal');

    if (detailsModalClose) {
      detailsModalClose.addEventListener('click', () => this.closeDetailsModal());
    }
    if (detailsModal) {
      detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) this.closeDetailsModal();
      });
    }

    // Set minimum date for event creation (tomorrow)
    const eventDateInput = document.getElementById('cleanupEventDate');
    if (eventDateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      eventDateInput.min = tomorrow.toISOString().slice(0, 16);
    }
  },

  // Switch between views
  switchView(view) {
    this.currentView = view;

    // Update toggle buttons
    document.querySelectorAll('.cleanup-toggle .toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update content visibility
    document.querySelectorAll('.cleanup-content').forEach(content => {
      content.classList.remove('active');
    });

    const targetContent = document.getElementById(`${view}Cleanups`);
    if (targetContent) targetContent.classList.add('active');

    // Load data for the view
    this.loadData();
  },

  // Load cleanup data
  async loadData() {
    const auth = window.EcoQuestAuthUI;
    if (!auth.isLoggedIn) {
      this.showSignInPrompt();
      return;
    }

    if (this.currentView === 'upcoming') {
      await this.loadUpcomingEvents();
    } else if (this.currentView === 'my-events') {
      await this.loadMyEvents();
    }
  },

  // Show sign in prompt
  showSignInPrompt() {
    const upcomingList = document.getElementById('upcomingCleanupsList');
    const myEventsList = document.getElementById('myEventsList');

    const signInPrompt = `
      <div class="cleanup-empty">
        <span class="empty-icon">🔐</span>
        <p>Sign in to view and join cleanup events</p>
        <button class="btn btn-primary" onclick="window.EcoQuestAuthUI.openModal('signin')">Sign In</button>
      </div>
    `;

    if (upcomingList) upcomingList.innerHTML = signInPrompt;
    if (myEventsList) myEventsList.innerHTML = signInPrompt;
  },

  // Load upcoming events
  async loadUpcomingEvents() {
    const listEl = document.getElementById('upcomingCleanupsList');
    if (!listEl) return;

    const auth = window.EcoQuestAuthUI;

    try {
      let events = [];

      if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
        // Get events in user's area first, then all upcoming
        if (auth.userProfile?.area) {
          events = await window.EcoQuestAuth.getAreaCleanupEvents(auth.userProfile.area);
        }

        // If no area events, get all upcoming
        if (events.length === 0) {
          events = await window.EcoQuestAuth.getUpcomingCleanupEvents(20);
        }
      }

      // Demo mode
      if (events.length === 0) {
        events = this.generateDemoEvents();
      }

      this.events = events;
      this.renderEventsList(listEl, events, 'upcoming');

    } catch (error) {
      console.error('Failed to load cleanup events:', error);
      listEl.innerHTML = `
        <div class="cleanup-empty">
          <span class="empty-icon">😕</span>
          <p>Failed to load events</p>
        </div>
      `;
    }
  },

  // Load user's events (attending + organized)
  async loadMyEvents() {
    const listEl = document.getElementById('myEventsList');
    if (!listEl) return;

    const auth = window.EcoQuestAuthUI;

    try {
      let attendingEvents = [];
      let organizedEvents = [];

      if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured() && auth.authUser) {
        attendingEvents = await window.EcoQuestAuth.getUserCleanupEvents(auth.authUser.id);
        organizedEvents = await window.EcoQuestAuth.getUserOrganizedEvents(auth.authUser.id);
      }

      this.userEvents = { attending: attendingEvents, organized: organizedEvents };
      this.renderMyEvents(listEl, attendingEvents, organizedEvents);

    } catch (error) {
      console.error('Failed to load user events:', error);
      listEl.innerHTML = `
        <div class="cleanup-empty">
          <span class="empty-icon">😕</span>
          <p>Failed to load your events</p>
        </div>
      `;
    }
  },

  // Generate demo events
  generateDemoEvents() {
    const now = new Date();
    return [
      {
        id: 'demo_1',
        title: 'Central Park Cleanup',
        description: 'Join us for a community cleanup at Central Park! Bring gloves and bags.',
        location: 'Central Park, Main Entrance',
        area: 'New York',
        event_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        bonus_points: 50,
        organizer: { display_name: 'EcoWarrior', username: 'ecowarrior' },
        attendee_count: 12
      },
      {
        id: 'demo_2',
        title: 'Beach Cleanup Day',
        description: 'Help us clean the beach! Refreshments provided.',
        location: 'Sunset Beach, Parking Lot A',
        area: 'California',
        event_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        bonus_points: 50,
        organizer: { display_name: 'OceanSaver', username: 'oceansaver' },
        attendee_count: 8
      }
    ];
  },

  // Render events list
  renderEventsList(listEl, events, type) {
    if (events.length === 0) {
      listEl.innerHTML = `
        <div class="cleanup-empty">
          <span class="empty-icon">📅</span>
          <p>No upcoming cleanup events</p>
          <span class="empty-desc">Be the first to organize one in your area!</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = events.map(event => this.renderEventCard(event)).join('');
  },

  // Render a single event card
  renderEventCard(event) {
    const eventDate = new Date(event.event_date);
    const dateStr = eventDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });

    const organizerName = event.organizer?.display_name || event.organizer?.username || 'Unknown';
    const attendeeCount = event.attendee_count || 0;

    return `
      <div class="cleanup-card" onclick="window.EcoQuestCleanups.openEventDetails('${event.id}')">
        <div class="cleanup-card-header">
          <div class="cleanup-date">
            <span class="cleanup-day">${eventDate.getDate()}</span>
            <span class="cleanup-month">${eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
          </div>
          <div class="cleanup-info">
            <h3 class="cleanup-title">${event.title}</h3>
            <div class="cleanup-meta">
              <span class="cleanup-location">📍 ${event.location}</span>
              <span class="cleanup-time">🕐 ${timeStr}</span>
            </div>
          </div>
        </div>
        <div class="cleanup-card-footer">
          <div class="cleanup-organizer">
            <span class="organizer-label">by</span>
            <span class="organizer-name">${organizerName}</span>
          </div>
          <div class="cleanup-stats">
            <span class="cleanup-attendees">👥 ${attendeeCount} going</span>
            <span class="cleanup-bonus">+${event.bonus_points || 50} pts</span>
          </div>
        </div>
      </div>
    `;
  },

  // Render my events
  renderMyEvents(listEl, attending, organized) {
    if (attending.length === 0 && organized.length === 0) {
      listEl.innerHTML = `
        <div class="cleanup-empty">
          <span class="empty-icon">📅</span>
          <p>No events yet</p>
          <span class="empty-desc">Join an upcoming cleanup or organize your own!</span>
        </div>
      `;
      return;
    }

    let html = '';

    if (organized.length > 0) {
      html += `<div class="my-events-section">
        <h4 class="section-label">Events You're Organizing</h4>
        ${organized.map(event => this.renderEventCard(event)).join('')}
      </div>`;
    }

    if (attending.length > 0) {
      html += `<div class="my-events-section">
        <h4 class="section-label">Events You're Attending</h4>
        ${attending.map(a => this.renderEventCard(a.event)).join('')}
      </div>`;
    }

    listEl.innerHTML = html;
  },

  // Open create event modal
  openCreateModal() {
    const auth = window.EcoQuestAuthUI;
    if (!auth.isLoggedIn) {
      window.EcoQuestUI.showToast('Sign in to create events', 'warning');
      auth.openModal('signin');
      return;
    }

    const modal = document.getElementById('createCleanupModal');
    if (modal) modal.classList.remove('hidden');

    // Pre-fill area if available
    const areaInput = document.getElementById('cleanupEventArea');
    if (areaInput && auth.userProfile?.area) {
      areaInput.value = auth.userProfile.area;
    }
  },

  // Close create modal
  closeCreateModal() {
    const modal = document.getElementById('createCleanupModal');
    if (modal) modal.classList.add('hidden');

    // Clear form
    document.getElementById('cleanupEventTitle')?.value && (document.getElementById('cleanupEventTitle').value = '');
    document.getElementById('cleanupEventDescription')?.value && (document.getElementById('cleanupEventDescription').value = '');
    document.getElementById('cleanupEventLocation')?.value && (document.getElementById('cleanupEventLocation').value = '');
    document.getElementById('cleanupEventDate')?.value && (document.getElementById('cleanupEventDate').value = '');
  },

  // Handle create event
  async handleCreateEvent() {
    const auth = window.EcoQuestAuthUI;

    const title = document.getElementById('cleanupEventTitle')?.value.trim();
    const description = document.getElementById('cleanupEventDescription')?.value.trim();
    const location = document.getElementById('cleanupEventLocation')?.value.trim();
    const area = document.getElementById('cleanupEventArea')?.value.trim();
    const eventDate = document.getElementById('cleanupEventDate')?.value;

    // Validation
    if (!title) {
      window.EcoQuestUI.showToast('Please enter an event title', 'warning');
      return;
    }
    if (!location) {
      window.EcoQuestUI.showToast('Please enter a location', 'warning');
      return;
    }
    if (!area) {
      window.EcoQuestUI.showToast('Please enter your area', 'warning');
      return;
    }
    if (!eventDate) {
      window.EcoQuestUI.showToast('Please select a date and time', 'warning');
      return;
    }

    // Check if date is in the future
    if (new Date(eventDate) <= new Date()) {
      window.EcoQuestUI.showToast('Event must be scheduled for the future', 'warning');
      return;
    }

    try {
      if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured() && auth.authUser) {
        await window.EcoQuestAuth.createCleanupEvent(
          auth.authUser.id,
          title,
          description,
          location,
          area,
          new Date(eventDate).toISOString()
        );

        window.EcoQuestUI.showToast('Cleanup event created!', 'success');
        this.closeCreateModal();
        this.loadData();
      } else {
        // Demo mode
        window.EcoQuestUI.showToast('Event created! (Demo mode)', 'success');
        this.closeCreateModal();
      }
    } catch (error) {
      window.EcoQuestUI.showToast(error.message || 'Failed to create event', 'error');
    }
  },

  // Open event details
  async openEventDetails(eventId) {
    const modal = document.getElementById('eventDetailsModal');
    const body = document.getElementById('eventDetailsBody');
    if (!modal || !body) return;

    const auth = window.EcoQuestAuthUI;

    // Find event from cached data
    let event = this.events.find(e => e.id === eventId);

    // For demo events
    if (!event && eventId.startsWith('demo_')) {
      event = this.generateDemoEvents().find(e => e.id === eventId);
    }

    if (!event) {
      // Try to fetch from API
      if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
        try {
          event = await window.EcoQuestAuth.getCleanupEvent(eventId);
        } catch (error) {
          console.error('Failed to load event:', error);
          return;
        }
      }
    }

    if (!event) return;

    this.selectedEvent = event;

    // Get attendee count
    let attendeeCount = event.attendee_count || 0;
    let userStatus = null;

    if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured() && auth.authUser) {
      try {
        attendeeCount = await window.EcoQuestAuth.getEventAttendeeCount(eventId);
        userStatus = await window.EcoQuestAuth.getUserEventStatus(auth.authUser.id, eventId);
      } catch (e) {
        // Ignore errors for demo
      }
    }

    const eventDate = new Date(event.event_date);
    const dateStr = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });

    const organizerName = event.organizer?.display_name || event.organizer?.username || 'Unknown';
    const isOrganizer = auth.authUser?.id === event.organizer_id || auth.authUser?.id === event.organizer?.id;
    const isGoing = userStatus?.status === 'going';
    const hasAttended = userStatus?.attended === true;

    // Check if event is happening now (within 2 hours of start time)
    const now = new Date();
    const eventStart = new Date(event.event_date);
    const isHappeningNow = now >= new Date(eventStart.getTime() - 30 * 60 * 1000) &&
                          now <= new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);

    body.innerHTML = `
      <div class="event-details">
        <div class="event-details-header">
          <h2>${event.title}</h2>
          <span class="event-status-badge ${event.status}">${event.status}</span>
        </div>

        <div class="event-details-info">
          <div class="event-detail-item">
            <span class="detail-icon">📅</span>
            <span class="detail-text">${dateStr}</span>
          </div>
          <div class="event-detail-item">
            <span class="detail-icon">🕐</span>
            <span class="detail-text">${timeStr}</span>
          </div>
          <div class="event-detail-item">
            <span class="detail-icon">📍</span>
            <span class="detail-text">${event.location}</span>
          </div>
          <div class="event-detail-item">
            <span class="detail-icon">🌍</span>
            <span class="detail-text">${event.area}</span>
          </div>
          <div class="event-detail-item">
            <span class="detail-icon">👤</span>
            <span class="detail-text">Organized by ${organizerName}</span>
          </div>
        </div>

        ${event.description ? `
          <div class="event-description">
            <h4>Description</h4>
            <p>${event.description}</p>
          </div>
        ` : ''}

        <div class="event-stats-card">
          <div class="event-stat">
            <span class="stat-value">${attendeeCount}</span>
            <span class="stat-label">Going</span>
          </div>
          <div class="event-stat bonus">
            <span class="stat-value">+${event.bonus_points || 50}</span>
            <span class="stat-label">Bonus pts</span>
          </div>
        </div>

        ${hasAttended ? `
          <div class="event-attended-badge">
            <span class="badge-icon">✅</span>
            <span class="badge-text">You attended this event!</span>
          </div>
        ` : ''}

        <div class="event-actions">
          ${isOrganizer ? `
            ${event.status === 'upcoming' ? `
              <button class="btn btn-secondary btn-large" onclick="window.EcoQuestCleanups.cancelEvent('${event.id}')">
                Cancel Event
              </button>
            ` : ''}
            ${event.status === 'upcoming' && isHappeningNow ? `
              <button class="btn btn-primary btn-large" onclick="window.EcoQuestCleanups.completeEvent('${event.id}')">
                Mark as Completed
              </button>
            ` : ''}
          ` : `
            ${!isGoing && event.status === 'upcoming' ? `
              <button class="btn btn-primary btn-large" onclick="window.EcoQuestCleanups.joinEvent('${event.id}')">
                I'm Going!
              </button>
            ` : ''}
            ${isGoing && !hasAttended && event.status === 'upcoming' ? `
              <button class="btn btn-secondary btn-large" onclick="window.EcoQuestCleanups.leaveEvent('${event.id}')">
                Cancel RSVP
              </button>
              ${isHappeningNow ? `
                <button class="btn btn-primary btn-large" onclick="window.EcoQuestCleanups.checkIn('${event.id}')">
                  Check In (+${event.bonus_points || 50} pts)
                </button>
              ` : ''}
            ` : ''}
            ${isGoing && !isHappeningNow && !hasAttended ? `
              <div class="event-rsvp-status">
                <span class="rsvp-icon">✅</span>
                <span class="rsvp-text">You're going!</span>
              </div>
            ` : ''}
          `}
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  },

  // Close details modal
  closeDetailsModal() {
    const modal = document.getElementById('eventDetailsModal');
    if (modal) modal.classList.add('hidden');
    this.selectedEvent = null;
  },

  // Join an event
  async joinEvent(eventId) {
    const auth = window.EcoQuestAuthUI;
    if (!auth.isLoggedIn) {
      window.EcoQuestUI.showToast('Sign in to join events', 'warning');
      return;
    }

    try {
      if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
        await window.EcoQuestAuth.joinCleanupEvent(auth.authUser.id, eventId);
        window.EcoQuestUI.showToast('You\'re going! See you there!', 'success');
        this.closeDetailsModal();
        this.loadData();
      } else {
        window.EcoQuestUI.showToast('Joined! (Demo mode)', 'success');
        this.closeDetailsModal();
      }
    } catch (error) {
      window.EcoQuestUI.showToast(error.message || 'Failed to join event', 'error');
    }
  },

  // Leave an event
  async leaveEvent(eventId) {
    const auth = window.EcoQuestAuthUI;

    try {
      if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
        await window.EcoQuestAuth.leaveCleanupEvent(auth.authUser.id, eventId);
        window.EcoQuestUI.showToast('RSVP cancelled', 'success');
        this.closeDetailsModal();
        this.loadData();
      } else {
        window.EcoQuestUI.showToast('Left event (Demo mode)', 'success');
        this.closeDetailsModal();
      }
    } catch (error) {
      window.EcoQuestUI.showToast(error.message || 'Failed to leave event', 'error');
    }
  },

  // Check in to an event
  async checkIn(eventId) {
    const auth = window.EcoQuestAuthUI;

    try {
      if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
        await window.EcoQuestAuth.checkInToCleanupEvent(auth.authUser.id, eventId);

        // Award bonus points locally
        const bonusPoints = this.selectedEvent?.bonus_points || this.ATTENDANCE_BONUS;
        if (window.EcoQuestApp && window.EcoQuestApp.userData) {
          window.EcoQuestApp.userData.totalPoints += bonusPoints;
          window.EcoQuestApp.userData.lifetimePoints += bonusPoints;
          localStorage.setItem('ecoquest_userData', JSON.stringify(window.EcoQuestApp.userData));
          window.EcoQuestUI.updateStats(window.EcoQuestApp.userData);
        }

        window.EcoQuestUI.showToast(`Checked in! +${bonusPoints} bonus points!`, 'success');
        this.closeDetailsModal();
        this.loadData();
      } else {
        window.EcoQuestUI.showToast('Checked in! +50 pts (Demo mode)', 'success');
        this.closeDetailsModal();
      }
    } catch (error) {
      window.EcoQuestUI.showToast(error.message || 'Failed to check in', 'error');
    }
  },

  // Cancel an event (organizer only)
  async cancelEvent(eventId) {
    const auth = window.EcoQuestAuthUI;

    if (!confirm('Are you sure you want to cancel this event?')) return;

    try {
      if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
        await window.EcoQuestAuth.cancelCleanupEvent(eventId, auth.authUser.id);
        window.EcoQuestUI.showToast('Event cancelled', 'success');
        this.closeDetailsModal();
        this.loadData();
      } else {
        window.EcoQuestUI.showToast('Event cancelled (Demo mode)', 'success');
        this.closeDetailsModal();
      }
    } catch (error) {
      window.EcoQuestUI.showToast(error.message || 'Failed to cancel event', 'error');
    }
  },

  // Complete an event (organizer only)
  async completeEvent(eventId) {
    const auth = window.EcoQuestAuthUI;

    try {
      if (window.EcoQuestAuth && window.EcoQuestAuth.isConfigured()) {
        await window.EcoQuestAuth.completeCleanupEvent(eventId, auth.authUser.id);
        window.EcoQuestUI.showToast('Event marked as completed!', 'success');
        this.closeDetailsModal();
        this.loadData();
      } else {
        window.EcoQuestUI.showToast('Event completed! (Demo mode)', 'success');
        this.closeDetailsModal();
      }
    } catch (error) {
      window.EcoQuestUI.showToast(error.message || 'Failed to complete event', 'error');
    }
  }
};

// Export
window.EcoQuestCleanups = CleanupsModule;
