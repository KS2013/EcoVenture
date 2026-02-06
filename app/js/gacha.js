/**
 * EcoVenture Gacha Module
 * Manages loot box opening, RNG, and animations
 */

const GachaModule = {
  // State
  isOpening: false,
  currentBox: null,
  lastResult: null,

  // Pity counters
  STORAGE_KEY: 'ecoventure_gacha_pity',

  /**
   * Initialize gacha module
   */
  init() {
    this.setupListeners();
    console.log('Gacha module initialized');
  },

  /**
   * Load pity counters from localStorage
   * @returns {Object}
   */
  loadPityCounters() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load pity counters:', e);
    }
    return {
      pullsSinceEpic: 0,
      pullsSinceLegendary: 0,
      totalPulls: 0
    };
  },

  /**
   * Save pity counters
   * @param {Object} counters
   */
  savePityCounters(counters) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(counters));
  },

  /**
   * Weighted random selection
   * @param {Object} weights - { COMMON: 0.5, UNCOMMON: 0.3, ... }
   * @returns {string} Selected key
   */
  weightedRandom(weights) {
    const entries = Object.entries(weights).filter(([_, w]) => w > 0);
    const total = entries.reduce((sum, [_, w]) => sum + w, 0);

    let random = Math.random() * total;

    for (const [rarity, weight] of entries) {
      random -= weight;
      if (random <= 0) return rarity;
    }

    // Fallback
    return entries[entries.length - 1][0];
  },

  /**
   * Check pity guarantee
   * @returns {string|null} Guaranteed rarity or null
   */
  checkPityGuarantee() {
    const counters = this.loadPityCounters();

    // Legendary pity at 90 pulls
    if (counters.pullsSinceLegendary >= 89) {
      return 'LEGENDARY';
    }

    // Epic pity at 30 pulls
    if (counters.pullsSinceEpic >= 29) {
      return 'EPIC';
    }

    return null;
  },

  /**
   * Update pity counters after a pull
   * @param {string} rarity - Rarity of pulled item
   */
  updatePityCounters(rarity) {
    const counters = this.loadPityCounters();
    counters.totalPulls++;

    if (rarity === 'LEGENDARY' || rarity === 'MYTHICAL') {
      counters.pullsSinceLegendary = 0;
      counters.pullsSinceEpic = 0;
    } else if (rarity === 'EPIC') {
      counters.pullsSinceEpic = 0;
      counters.pullsSinceLegendary++;
    } else {
      counters.pullsSinceEpic++;
      counters.pullsSinceLegendary++;
    }

    this.savePityCounters(counters);
  },

  /**
   * Get a random item of a specific rarity
   * @param {string} rarity - Target rarity
   * @returns {Object} Item data
   */
  getItemOfRarity(rarity) {
    const { AVATAR_ITEMS } = window.EcoVentureConfig;
    const itemsOfRarity = AVATAR_ITEMS.filter(item => item.rarity === rarity);

    if (itemsOfRarity.length === 0) {
      // Fallback to any item if no items of this rarity
      return AVATAR_ITEMS[Math.floor(Math.random() * AVATAR_ITEMS.length)];
    }

    // Prefer items user doesn't own
    const ownedItems = window.EcoVentureInventory.getInventory().items;
    const newItems = itemsOfRarity.filter(item => !ownedItems.includes(item.id));

    const pool = newItems.length > 0 ? newItems : itemsOfRarity;
    return pool[Math.floor(Math.random() * pool.length)];
  },

  /**
   * Calculate drop result for a box
   * @param {string} boxType - Type of box (BASIC, PREMIUM, LEGENDARY)
   * @returns {Object} Item data
   */
  calculateDrop(boxType) {
    const { BOX_TYPES } = window.EcoVentureConfig;
    const box = BOX_TYPES[boxType];

    if (!box) {
      console.error('Unknown box type:', boxType);
      return null;
    }

    // Check pity first
    const pitiedRarity = this.checkPityGuarantee();
    if (pitiedRarity && box.dropRates[pitiedRarity] > 0) {
      this.updatePityCounters(pitiedRarity);
      return this.getItemOfRarity(pitiedRarity);
    }

    // Normal weighted roll
    let rarity = this.weightedRandom(box.dropRates);

    // Check guaranteed minimum rarity
    if (box.guaranteedRarity) {
      const rarityOrder = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHICAL'];
      const minIndex = rarityOrder.indexOf(box.guaranteedRarity);
      const rolledIndex = rarityOrder.indexOf(rarity);

      if (rolledIndex < minIndex) {
        rarity = box.guaranteedRarity;
      }
    }

    this.updatePityCounters(rarity);
    return this.getItemOfRarity(rarity);
  },

  /**
   * Open a box
   * @param {string} boxType - Type of box to open (basic, premium, legendary)
   * @returns {Promise<Object|null>} Result item or null if failed
   */
  async openBox(boxType) {
    if (this.isOpening) {
      console.warn('Already opening a box');
      return null;
    }

    // Normalize box type
    const boxTypeUpper = boxType.toUpperCase();

    // Check if user has a box or ticket
    const inventory = window.EcoVentureInventory.getInventory();
    const hasBox = inventory.boxes[boxType.toLowerCase()] > 0;
    const hasTicket = inventory.freeTickets > 0 && boxType.toLowerCase() === 'basic';

    if (!hasBox && !hasTicket) {
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('No boxes available!', 'error');
      }
      return null;
    }

    // Consume box or ticket
    if (hasBox) {
      window.EcoVentureInventory.removeBox(boxType.toLowerCase());
    } else {
      window.EcoVentureInventory.useTicket();
    }

    this.isOpening = true;
    this.currentBox = boxType;

    // Calculate result
    const item = this.calculateDrop(boxTypeUpper);
    this.lastResult = item;

    // Add item to inventory
    const isNew = window.EcoVentureInventory.addItem(item.id);

    // If duplicate, award gems AND tokens based on rarity
    let gemsAwarded = 0;
    let tokensAwarded = 0;
    if (!isNew) {
      const { RARITY_TIERS } = window.EcoVentureConfig;
      gemsAwarded = RARITY_TIERS[item.rarity]?.gemValue || 5;

      // Add gems to user
      if (window.EcoVentureApp) {
        window.EcoVentureApp.userData.ecoGems =
          (window.EcoVentureApp.userData.ecoGems || 0) + gemsAwarded;
        window.EcoVentureApp.userData.lifetimeGems =
          (window.EcoVentureApp.userData.lifetimeGems || 0) + gemsAwarded;
        window.EcoVentureApp.saveUserData();
        window.EcoVentureApp.updateGemsDisplay();

        // Animate gem display
        if (window.EcoVentureUI) {
          window.EcoVentureUI.animateCurrencyUpdate('headerGems');
          window.EcoVentureUI.animateCurrencyUpdate('shopGems');
        }
      }

      // Award tokens for duplicates (gambling module)
      if (window.EcoVentureGambling) {
        tokensAwarded = window.EcoVentureGambling.convertToTokens(item.id, item.rarity);
      }
    }

    // Store gems awarded for display
    this.lastGemsAwarded = gemsAwarded;
    this.lastTokensAwarded = tokensAwarded;

    // Track for quests
    if (window.EcoVentureQuests) {
      window.EcoVentureQuests.onBoxOpened();
    }

    // Track box milestone (gambling module)
    if (window.EcoVentureGambling) {
      window.EcoVentureGambling.recordBoxOpened();
    }

    // Play animation
    await this.playOpenAnimation(boxTypeUpper, item, isNew, gemsAwarded);

    this.isOpening = false;
    return item;
  },

  /**
   * Play box opening animation
   * @param {string} boxType - Type of box
   * @param {Object} item - Result item
   * @param {boolean} isNew - Whether item is new
   * @param {number} gemsAwarded - Gems awarded for duplicate
   */
  async playOpenAnimation(boxType, item, isNew, gemsAwarded = 0) {
    const modal = document.getElementById('boxOpenModal');
    const boxEl = document.getElementById('box3d');
    const revealEl = document.getElementById('itemReveal');
    const actionsEl = document.getElementById('boxActions');

    if (!modal) {
      // Simple fallback if no modal
      const rarityName = window.EcoVentureConfig.RARITY_TIERS[item.rarity]?.name || item.rarity;
      const icon = item.preview || item.emoji || '🎁';
      let message = `${isNew ? 'NEW! ' : ''}${icon} ${item.name} (${rarityName})`;
      if (!isNew && gemsAwarded > 0) {
        message += ` +${gemsAwarded} gems`;
      }
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast(message, 'success');
      }
      return;
    }

    // Store for reveal
    this.currentGemsAwarded = gemsAwarded;

    // Show modal
    modal.classList.remove('hidden');

    // Set box icon
    const { BOX_TYPES } = window.EcoVentureConfig;
    const boxIcon = BOX_TYPES[boxType]?.icon || '📦';
    if (boxEl) {
      boxEl.querySelector('.box-lid').textContent = boxIcon;
    }

    // Reset state
    if (revealEl) revealEl.classList.add('hidden');
    if (boxEl) boxEl.classList.remove('opening');
    if (actionsEl) actionsEl.classList.add('hidden');

    // Start opening animation
    await this.delay(500);

    if (boxEl) {
      boxEl.classList.add('opening');
    }

    // Wait for box animation
    await this.delay(1000);

    // Hide box, show item
    if (boxEl) boxEl.style.display = 'none';
    if (revealEl) {
      revealEl.classList.remove('hidden');
      this.showItemReveal(item, isNew);

      // Show confetti for rare+ pulls
      const epicRarities = ['EPIC', 'LEGENDARY', 'MYTHICAL'];
      if (epicRarities.includes(item.rarity) && window.EcoVentureUI) {
        const confettiCount = item.rarity === 'MYTHICAL' ? 80 : item.rarity === 'LEGENDARY' ? 60 : 40;
        window.EcoVentureUI.showConfetti(confettiCount);
      }
    }

    // Show actions
    await this.delay(500);
    if (actionsEl) actionsEl.classList.remove('hidden');
  },

  /**
   * Show item reveal
   * @param {Object} item - Item data
   * @param {boolean} isNew - Whether item is new
   */
  showItemReveal(item, isNew) {
    const glowEl = document.getElementById('revealGlow');
    const itemEl = document.getElementById('revealItem');
    const rarityEl = document.getElementById('revealRarity');
    const nameEl = document.getElementById('revealName');
    const descEl = document.getElementById('revealDesc');

    const rarityLower = item.rarity.toLowerCase();
    const { RARITY_TIERS } = window.EcoVentureConfig;
    const rarityInfo = RARITY_TIERS[item.rarity];
    const gemsAwarded = this.currentGemsAwarded || 0;

    // Set glow
    if (glowEl) {
      glowEl.className = `reveal-glow ${rarityLower}`;
    }

    // Set item (use preview or fallback to emoji)
    if (itemEl) {
      itemEl.textContent = item.preview || item.emoji || '🎁';
    }

    // Set rarity badge
    if (rarityEl) {
      rarityEl.className = `reveal-rarity ${rarityLower}`;
      if (isNew) {
        rarityEl.textContent = `NEW! ${rarityInfo.name}`;
      } else if (gemsAwarded > 0) {
        rarityEl.textContent = `DUPLICATE +${gemsAwarded} 💎`;
      } else {
        rarityEl.textContent = rarityInfo.name;
      }
    }

    // Set name
    if (nameEl) {
      nameEl.textContent = item.name;
    }

    // Set description
    if (descEl) {
      if (!isNew && gemsAwarded > 0) {
        descEl.textContent = `You already have this! Converted to ${gemsAwarded} EcoGems.`;
      } else {
        descEl.textContent = item.description || '';
      }
    }
  },

  /**
   * Close the box modal
   */
  closeModal() {
    const modal = document.getElementById('boxOpenModal');
    const boxEl = document.getElementById('box3d');

    if (modal) {
      modal.classList.add('hidden');
    }

    // Reset box for next open
    if (boxEl) {
      boxEl.classList.remove('opening');
      boxEl.style.display = '';
    }
  },

  /**
   * Open another box of the same type
   */
  async openAnother() {
    if (!this.currentBox) return;

    const boxType = this.currentBox.toLowerCase();
    const inventory = window.EcoVentureInventory.getInventory();

    if (inventory.boxes[boxType] > 0 || inventory.freeTickets > 0) {
      // Reset modal state
      const boxEl = document.getElementById('box3d');
      const revealEl = document.getElementById('itemReveal');

      if (boxEl) {
        boxEl.classList.remove('opening');
        boxEl.style.display = '';
      }
      if (revealEl) revealEl.classList.add('hidden');

      await this.delay(300);
      await this.openBox(boxType);
    } else {
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('No more boxes!', 'warning');
      }
      this.closeModal();
    }
  },

  /**
   * Helper delay function
   * @param {number} ms - Milliseconds to wait
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Get box inventory counts
   * @returns {Object}
   */
  getBoxCounts() {
    const inventory = window.EcoVentureInventory.getInventory();
    return {
      basic: inventory.boxes.basic || 0,
      premium: inventory.boxes.premium || 0,
      legendary: inventory.boxes.legendary || 0,
      tickets: inventory.freeTickets || 0
    };
  },

  /**
   * Render box inventory UI
   */
  renderBoxInventory() {
    const containerEl = document.getElementById('boxInventory');
    if (!containerEl) return;

    const counts = this.getBoxCounts();
    const { BOX_TYPES } = window.EcoVentureConfig;

    containerEl.innerHTML = '';

    Object.entries(BOX_TYPES).forEach(([key, box]) => {
      const count = counts[key.toLowerCase()] || 0;
      const card = document.createElement('div');
      card.className = `box-card ${count > 0 ? 'has-boxes' : 'empty'}`;

      card.innerHTML = `
        <div class="box-icon">${box.icon}</div>
        <div class="box-name">${box.name}</div>
        <div class="box-count">${count} owned</div>
        <button class="btn btn-small btn-primary open-box-btn"
                data-box-type="${key.toLowerCase()}"
                ${count === 0 ? 'disabled' : ''}>
          Open
        </button>
      `;

      containerEl.appendChild(card);
    });

    // Add ticket display
    if (counts.tickets > 0) {
      const ticketInfo = document.createElement('div');
      ticketInfo.className = 'ticket-info';
      ticketInfo.innerHTML = `
        <span>🎟️ ${counts.tickets} Free Ticket${counts.tickets > 1 ? 's' : ''}</span>
        <small>Use on Basic Boxes</small>
      `;
      containerEl.appendChild(ticketInfo);
    }
  },

  /**
   * Setup event listeners
   */
  setupListeners() {
    // Open box buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('open-box-btn')) {
        const boxType = e.target.dataset.boxType;
        if (boxType) {
          this.openBox(boxType);
        }
      }
    });

    // Modal buttons
    const openAnotherBtn = document.getElementById('openAnotherBtn');
    const closeBoxBtn = document.getElementById('closeBoxBtn');

    if (openAnotherBtn) {
      openAnotherBtn.addEventListener('click', () => this.openAnother());
    }

    if (closeBoxBtn) {
      closeBoxBtn.addEventListener('click', () => this.closeModal());
    }
  }
};

// Export module
window.EcoVentureGacha = GachaModule;
