/**
 * EcoVenture Gambling Module
 * Handles all gacha/gambling mechanics: Lucky Wheel, Scratch Cards, Slots, etc.
 */

const GamblingModule = {
  STORAGE_KEY: 'ecoventure_gambling',

  // State
  lastWheelSpin: null,
  pityCounters: { legendary: 0, mythical: 0 },
  boxesOpened: 0,
  claimedMilestones: [],
  tokens: 0,
  activeFlashSale: null,

  /**
   * Initialize gambling module
   */
  init() {
    this.loadState();
    this.startFlashSaleChecker();
    console.log('Gambling module initialized');
  },

  /**
   * Load state from localStorage
   */
  loadState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        this.lastWheelSpin = state.lastWheelSpin ? new Date(state.lastWheelSpin) : null;
        this.pityCounters = state.pityCounters || { legendary: 0, mythical: 0 };
        this.boxesOpened = state.boxesOpened || 0;
        this.claimedMilestones = state.claimedMilestones || [];
        this.tokens = state.tokens || 0;
        this.activeFlashSale = state.activeFlashSale || null;
      }
    } catch (e) {
      console.error('Failed to load gambling state:', e);
    }
  },

  /**
   * Save state to localStorage
   */
  saveState() {
    const state = {
      lastWheelSpin: this.lastWheelSpin?.toISOString(),
      pityCounters: this.pityCounters,
      boxesOpened: this.boxesOpened,
      claimedMilestones: this.claimedMilestones,
      tokens: this.tokens,
      activeFlashSale: this.activeFlashSale
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  },

  // ==========================================
  // LUCKY WHEEL
  // ==========================================

  /**
   * Check if free wheel spin is available
   */
  canSpinWheel() {
    if (!this.lastWheelSpin) return true;
    const { LUCKY_WHEEL } = window.EcoVentureConfig;
    return Date.now() - new Date(this.lastWheelSpin).getTime() >= LUCKY_WHEEL.cooldown;
  },

  /**
   * Get time until next free spin
   */
  getWheelCooldown() {
    if (!this.lastWheelSpin) return 0;
    const { LUCKY_WHEEL } = window.EcoVentureConfig;
    const elapsed = Date.now() - new Date(this.lastWheelSpin).getTime();
    return Math.max(0, LUCKY_WHEEL.cooldown - elapsed);
  },

  /**
   * Spin the lucky wheel
   * @param {boolean} usePremium - Use gems for extra spin
   */
  async spinWheel(usePremium = false) {
    const { LUCKY_WHEEL } = window.EcoVentureConfig;

    // Check if can spin
    if (!usePremium && !this.canSpinWheel()) {
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('Wait for free spin!', 'warning');
      }
      return null;
    }

    // Deduct gems for premium spin
    if (usePremium) {
      if (!window.EcoVentureShop.spendGems(LUCKY_WHEEL.premiumSpinCost)) {
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast('Not enough gems!', 'error');
        }
        return null;
      }
    } else {
      this.lastWheelSpin = new Date();
    }

    // Calculate weighted random segment
    const totalWeight = LUCKY_WHEEL.segments.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedSegment = LUCKY_WHEEL.segments[0];

    for (const segment of LUCKY_WHEEL.segments) {
      random -= segment.weight;
      if (random <= 0) {
        selectedSegment = segment;
        break;
      }
    }

    // Grant reward
    await this.grantReward(selectedSegment.reward);

    this.saveState();

    return {
      segment: selectedSegment,
      segmentIndex: LUCKY_WHEEL.segments.indexOf(selectedSegment)
    };
  },

  // ==========================================
  // PITY SYSTEM
  // ==========================================

  /**
   * Apply pity system to drop rates
   * @param {Object} dropRates - Original drop rates
   * @returns {Object} Modified drop rates
   */
  applyPity(dropRates) {
    const { PITY_SYSTEM } = window.EcoVentureConfig;
    if (!PITY_SYSTEM.enabled) return dropRates;

    const modifiedRates = { ...dropRates };

    // Soft pity for legendary
    if (this.pityCounters.legendary >= PITY_SYSTEM.softPity) {
      const pullsSinceSoftPity = this.pityCounters.legendary - PITY_SYSTEM.softPity;
      const multiplier = Math.pow(PITY_SYSTEM.softPityMultiplier, pullsSinceSoftPity);
      modifiedRates.LEGENDARY = Math.min(1, (modifiedRates.LEGENDARY || 0) * multiplier);
    }

    // Hard pity - guaranteed legendary
    if (this.pityCounters.legendary >= PITY_SYSTEM.hardPity) {
      modifiedRates.LEGENDARY = 1;
      modifiedRates.COMMON = 0;
      modifiedRates.UNCOMMON = 0;
      modifiedRates.RARE = 0;
      modifiedRates.EPIC = 0;
    }

    // Mythical pity
    if (this.pityCounters.mythical >= PITY_SYSTEM.mythicalPity) {
      modifiedRates.MYTHICAL = 1;
      modifiedRates.COMMON = 0;
      modifiedRates.UNCOMMON = 0;
      modifiedRates.RARE = 0;
      modifiedRates.EPIC = 0;
      modifiedRates.LEGENDARY = 0;
    }

    return modifiedRates;
  },

  /**
   * Update pity counters after a pull
   * @param {string} rarity - Rarity of item received
   */
  updatePity(rarity) {
    this.pityCounters.legendary++;
    this.pityCounters.mythical++;

    if (rarity === 'LEGENDARY' || rarity === 'MYTHICAL') {
      this.pityCounters.legendary = 0;
    }
    if (rarity === 'MYTHICAL') {
      this.pityCounters.mythical = 0;
    }

    this.saveState();
  },

  /**
   * Get current pity info
   */
  getPityInfo() {
    const { PITY_SYSTEM } = window.EcoVentureConfig;
    return {
      legendary: {
        current: this.pityCounters.legendary,
        softPity: PITY_SYSTEM.softPity,
        hardPity: PITY_SYSTEM.hardPity,
        inSoftPity: this.pityCounters.legendary >= PITY_SYSTEM.softPity
      },
      mythical: {
        current: this.pityCounters.mythical,
        pity: PITY_SYSTEM.mythicalPity
      }
    };
  },

  // ==========================================
  // SCRATCH CARDS
  // ==========================================

  /**
   * Purchase and generate a scratch card
   * @param {string} cardType - 'scratch_basic' or 'scratch_premium'
   */
  buyScratchCard(cardType) {
    const { SCRATCH_CARDS } = window.EcoVentureConfig;
    const cardConfig = SCRATCH_CARDS.types.find(c => c.id === cardType);

    if (!cardConfig) return null;

    // Deduct cost
    if (cardConfig.costType === 'points') {
      if (!window.EcoVentureShop.spendPoints(cardConfig.cost)) {
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast('Not enough points!', 'error');
        }
        return null;
      }
    } else {
      if (!window.EcoVentureShop.spendGems(cardConfig.cost)) {
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast('Not enough gems!', 'error');
        }
        return null;
      }
    }

    // Determine prize
    let selectedPrize = null;
    const roll = Math.random();
    let cumulative = 0;

    for (const prize of cardConfig.prizes) {
      cumulative += prize.chance;
      if (roll <= cumulative) {
        selectedPrize = prize;
        break;
      }
    }

    // Generate card grid
    const grid = this.generateScratchGrid(cardConfig, selectedPrize);

    return {
      config: cardConfig,
      grid: grid,
      prize: selectedPrize,
      revealed: new Array(cardConfig.gridSize).fill(false)
    };
  },

  /**
   * Generate scratch card grid
   */
  generateScratchGrid(cardConfig, prize) {
    const grid = [];
    const gridSize = cardConfig.gridSize;

    if (prize && prize.symbols !== '❌❌❌') {
      // Winning card - place 3 matching symbols
      const winSymbol = prize.symbols[0];
      const positions = [];

      // Randomly select 3 positions for winning symbols
      while (positions.length < 3) {
        const pos = Math.floor(Math.random() * gridSize);
        if (!positions.includes(pos)) {
          positions.push(pos);
        }
      }

      // Fill grid
      const allSymbols = cardConfig.prizes.map(p => p.symbols[0]).filter(s => s !== '❌');
      for (let i = 0; i < gridSize; i++) {
        if (positions.includes(i)) {
          grid.push(winSymbol);
        } else {
          // Random non-winning symbol
          const randomSymbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
          grid.push(randomSymbol);
        }
      }
    } else {
      // Losing card - no 3 matching
      const allSymbols = cardConfig.prizes.map(p => p.symbols[0]).filter(s => s !== '❌');
      for (let i = 0; i < gridSize; i++) {
        grid.push(allSymbols[Math.floor(Math.random() * allSymbols.length)]);
      }
      // Ensure no 3 matching (shuffle if needed)
      // This is simplified - in production would need more sophisticated logic
    }

    return grid;
  },

  /**
   * Claim scratch card prize
   */
  async claimScratchPrize(prize) {
    if (!prize || !prize.reward) {
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('No prize this time!', 'info');
      }
      return;
    }

    await this.grantReward(prize.reward);
  },

  // ==========================================
  // MYSTERY BOX
  // ==========================================

  /**
   * Purchase and open mystery box
   */
  async openMysteryBox() {
    const { MYSTERY_BOX } = window.EcoVentureConfig;

    // Deduct cost
    if (!window.EcoVentureShop.spendGems(MYSTERY_BOX.cost)) {
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('Not enough gems!', 'error');
      }
      return null;
    }

    // Weighted random selection
    const totalWeight = MYSTERY_BOX.possibleRewards.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedReward = MYSTERY_BOX.possibleRewards[0];

    for (const reward of MYSTERY_BOX.possibleRewards) {
      random -= reward.weight;
      if (random <= 0) {
        selectedReward = reward;
        break;
      }
    }

    // Process reward
    let rewardResult = { ...selectedReward };

    if (selectedReward.type === 'gems' || selectedReward.type === 'points') {
      // Random amount within range
      rewardResult.amount = Math.floor(
        Math.random() * (selectedReward.max - selectedReward.min + 1) + selectedReward.min
      );
    }

    if (selectedReward.type === 'bust') {
      // Bad luck - partial refund
      window.EcoVentureShop.addGems(selectedReward.refund);
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast(`Bad luck! ${selectedReward.refund} gems refunded`, 'warning');
      }
      return { type: 'bust', refund: selectedReward.refund };
    }

    if (selectedReward.type === 'jackpot') {
      window.EcoVentureShop.addGems(selectedReward.gems);
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast(`JACKPOT! +${selectedReward.gems} gems!`, 'success');
      }
      return { type: 'jackpot', gems: selectedReward.gems };
    }

    // Grant normal reward
    await this.grantReward(rewardResult);

    return rewardResult;
  },

  // ==========================================
  // SLOT MACHINE
  // ==========================================

  /**
   * Spin the slot machine
   */
  async spinSlots() {
    const { SLOT_MACHINE } = window.EcoVentureConfig;

    // Deduct cost
    if (!window.EcoVentureShop.spendGems(SLOT_MACHINE.spinCost)) {
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('Not enough gems!', 'error');
      }
      return null;
    }

    // Generate 3 random symbols with weights
    const symbols = [];
    const totalWeight = Object.values(SLOT_MACHINE.symbolWeights).reduce((a, b) => a + b, 0);

    for (let i = 0; i < 3; i++) {
      let random = Math.random() * totalWeight;
      for (const [symbol, weight] of Object.entries(SLOT_MACHINE.symbolWeights)) {
        random -= weight;
        if (random <= 0) {
          symbols.push(symbol);
          break;
        }
      }
    }

    // Check for wins
    let winResult = null;
    for (const payout of SLOT_MACHINE.payouts) {
      if (symbols[0] === payout.match[0] &&
          symbols[1] === payout.match[1] &&
          symbols[2] === payout.match[2]) {
        winResult = payout;
        break;
      }
    }

    // Grant winnings
    if (winResult) {
      const winAmount = SLOT_MACHINE.spinCost * winResult.multiplier;
      window.EcoVentureShop.addGems(winAmount);

      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast(`${winResult.name}! +${winAmount} gems!`, 'success');
      }
    }

    return {
      symbols,
      win: winResult,
      winAmount: winResult ? SLOT_MACHINE.spinCost * winResult.multiplier : 0
    };
  },

  // ==========================================
  // TOKEN SYSTEM
  // ==========================================

  /**
   * Convert duplicate item to tokens
   * @param {string} itemId - Item ID
   * @param {string} rarity - Item rarity
   */
  convertToTokens(itemId, rarity) {
    const { TOKEN_SYSTEM } = window.EcoVentureConfig;
    if (!TOKEN_SYSTEM.enabled) return 0;

    const tokenValue = TOKEN_SYSTEM.conversionRates[rarity] || 1;
    this.tokens += tokenValue;
    this.saveState();

    if (window.EcoVentureUI) {
      window.EcoVentureUI.showToast(`+${tokenValue} tokens!`, 'info');
    }

    return tokenValue;
  },

  /**
   * Purchase from token shop
   * @param {string} itemId - Shop item ID
   */
  async purchaseWithTokens(itemId) {
    const { TOKEN_SYSTEM } = window.EcoVentureConfig;
    const shopItem = TOKEN_SYSTEM.tokenShop.find(i => i.id === itemId);

    if (!shopItem) return false;

    if (this.tokens < shopItem.cost) {
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('Not enough tokens!', 'error');
      }
      return false;
    }

    this.tokens -= shopItem.cost;
    this.saveState();

    await this.grantReward(shopItem.reward);

    return true;
  },

  /**
   * Get current token balance
   */
  getTokens() {
    return this.tokens;
  },

  // ==========================================
  // BOX MILESTONES
  // ==========================================

  /**
   * Record a box opening and check milestones
   */
  async recordBoxOpened() {
    this.boxesOpened++;

    const { BOX_MILESTONES } = window.EcoVentureConfig;

    // Check for unclaimed milestones
    for (const milestone of BOX_MILESTONES) {
      if (this.boxesOpened >= milestone.boxes && !this.claimedMilestones.includes(milestone.boxes)) {
        // Claim milestone
        this.claimedMilestones.push(milestone.boxes);
        await this.grantReward(milestone.reward);

        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast(`Milestone: ${milestone.name}!`, 'success');
        }
      }
    }

    this.saveState();
  },

  /**
   * Get milestone progress
   */
  getMilestoneProgress() {
    const { BOX_MILESTONES } = window.EcoVentureConfig;
    return {
      boxesOpened: this.boxesOpened,
      milestones: BOX_MILESTONES.map(m => ({
        ...m,
        claimed: this.claimedMilestones.includes(m.boxes),
        progress: Math.min(1, this.boxesOpened / m.boxes)
      }))
    };
  },

  // ==========================================
  // FLASH SALES
  // ==========================================

  /**
   * Start flash sale checker
   */
  startFlashSaleChecker() {
    const { FLASH_SALES } = window.EcoVentureConfig;
    if (!FLASH_SALES.enabled) return;

    // Check if existing flash sale has expired
    if (this.activeFlashSale) {
      if (Date.now() > this.activeFlashSale.expiresAt) {
        this.activeFlashSale = null;
        this.saveState();
      }
    }

    // Periodic check for new flash sale
    setInterval(() => {
      if (!this.activeFlashSale && Math.random() < FLASH_SALES.triggerChance) {
        this.triggerFlashSale();
      }

      // Clean up expired sale
      if (this.activeFlashSale && Date.now() > this.activeFlashSale.expiresAt) {
        this.activeFlashSale = null;
        this.saveState();
        this.notifyFlashSaleExpired();
      }
    }, FLASH_SALES.checkInterval);
  },

  /**
   * Trigger a random flash sale
   */
  triggerFlashSale() {
    const { FLASH_SALES } = window.EcoVentureConfig;
    const randomDeal = FLASH_SALES.deals[Math.floor(Math.random() * FLASH_SALES.deals.length)];

    this.activeFlashSale = {
      ...randomDeal,
      triggeredAt: Date.now(),
      expiresAt: Date.now() + FLASH_SALES.duration
    };

    this.saveState();

    // Notify user
    if (window.EcoVentureUI) {
      window.EcoVentureUI.showToast(`FLASH SALE: ${randomDeal.name}`, 'success');
    }

    // Show flash sale modal
    this.showFlashSaleModal();
  },

  /**
   * Show flash sale modal
   */
  showFlashSaleModal() {
    if (!this.activeFlashSale) return;

    const sale = this.activeFlashSale;
    const timeLeft = Math.max(0, sale.expiresAt - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    const modalHtml = `
      <div class="flash-sale-modal" id="flashSaleModal">
        <div class="flash-sale-content">
          <div class="flash-sale-header">
            <span class="flash-icon">🔥</span>
            <h2>FLASH SALE!</h2>
            <div class="flash-timer">${minutes}:${String(seconds).padStart(2, '0')}</div>
          </div>
          <div class="flash-sale-body">
            <div class="flash-icon-large">${sale.icon}</div>
            <h3>${sale.name}</h3>
            <div class="flash-contents">
              ${sale.offer.gems ? `<span>💎 ${sale.offer.gems} Gems</span>` : ''}
              ${sale.offer.boxes ? Object.entries(sale.offer.boxes).map(([t, c]) => `<span>${c}x ${t} Box</span>`).join('') : ''}
            </div>
            <div class="flash-discount">${sale.discount}% OFF!</div>
            <button class="flash-buy-btn" onclick="window.EcoVentureGambling.purchaseFlashSale()">
              $${sale.cost.toFixed(2)}
            </button>
            <button class="flash-close-btn" onclick="document.getElementById('flashSaleModal').remove()">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    document.getElementById('flashSaleModal')?.remove();

    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Update timer
    const timerEl = document.querySelector('.flash-timer');
    if (timerEl) {
      const timerInterval = setInterval(() => {
        const remaining = Math.max(0, this.activeFlashSale?.expiresAt - Date.now() || 0);
        if (remaining <= 0) {
          clearInterval(timerInterval);
          document.getElementById('flashSaleModal')?.remove();
          return;
        }
        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        timerEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
      }, 1000);
    }
  },

  /**
   * Purchase flash sale
   */
  purchaseFlashSale() {
    if (!this.activeFlashSale) return;

    const sale = this.activeFlashSale;

    const confirmed = confirm(
      `Purchase ${sale.name}?\n\n` +
      `Price: $${sale.cost.toFixed(2)} (${sale.discount}% OFF!)\n\n` +
      `(Demo - no real payment)`
    );

    if (confirmed) {
      // Grant rewards
      if (sale.offer.gems) {
        window.EcoVentureShop.addGems(sale.offer.gems);
      }
      if (sale.offer.boxes) {
        Object.entries(sale.offer.boxes).forEach(([type, count]) => {
          window.EcoVentureInventory.addBoxes(type, count);
        });
      }

      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast(`${sale.name} purchased!`, 'success');
      }

      // Clear flash sale
      this.activeFlashSale = null;
      this.saveState();
      document.getElementById('flashSaleModal')?.remove();
    }
  },

  /**
   * Notify flash sale expired
   */
  notifyFlashSaleExpired() {
    document.getElementById('flashSaleModal')?.remove();
  },

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  /**
   * Grant a reward to the player
   * @param {Object} reward - Reward object
   */
  async grantReward(reward) {
    if (!reward || reward.type === 'nothing') return;

    switch (reward.type) {
      case 'gems':
        window.EcoVentureShop.addGems(reward.amount);
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast(`+${reward.amount} gems!`, 'success');
        }
        break;

      case 'points':
        if (window.EcoVentureApp) {
          window.EcoVentureApp.userData.totalPoints += reward.amount;
          window.EcoVentureApp.saveUserData();
          window.EcoVentureShop.updateCurrencyDisplay();
        }
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast(`+${reward.amount} points!`, 'success');
        }
        break;

      case 'box':
        window.EcoVentureInventory?.addBoxes(reward.boxType, reward.count || 1);
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast(`+${reward.count || 1} ${reward.boxType} box!`, 'success');
        }
        break;

      case 'ticket':
        for (let i = 0; i < (reward.amount || 1); i++) {
          window.EcoVentureInventory?.addFreeTicket();
        }
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast(`+${reward.amount || 1} ticket!`, 'success');
        }
        break;

      case 'random_item':
        const item = window.EcoVentureGacha?.getItemOfRarity(reward.rarity);
        if (item) {
          window.EcoVentureInventory?.addItem(item.id);
          if (window.EcoVentureUI) {
            window.EcoVentureUI.showToast(`Got ${item.name}!`, 'success');
          }
        }
        break;

      case 'exclusive_title':
        // Store exclusive title
        if (window.EcoVentureApp) {
          window.EcoVentureApp.userData.titles = window.EcoVentureApp.userData.titles || [];
          window.EcoVentureApp.userData.titles.push(reward.title);
          window.EcoVentureApp.saveUserData();
        }
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast(`New title: ${reward.title}!`, 'success');
        }
        break;
    }
  }
};

// Export module
window.EcoVentureGambling = GamblingModule;
