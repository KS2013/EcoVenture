/**
 * EcoVenture Shop Module - Supercell Style
 * Manages in-app purchases, daily deals, bundles, and boxes
 */

const ShopModule = {
  // Storage keys
  STORAGE_KEY: 'ecoventure_shop',

  // Current UI state
  currentCategory: 'featured',

  // Cached daily deals
  dailyDeals: [],
  lastDealRefresh: null,

  /**
   * Initialize shop module
   */
  init() {
    this.loadShopState();
    this.generateDailyDeals();
    this.setupListeners();
    this.startTimers();
    console.log('Shop module initialized (Supercell style)');
  },

  /**
   * Load shop state from localStorage
   */
  loadShopState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        this.purchasedBundles = state.purchasedBundles || [];
        this.purchasedStarterPack = state.purchasedStarterPack || false;
        this.lastDealRefresh = state.lastDealRefresh ? new Date(state.lastDealRefresh) : null;
        this.claimedFreebies = state.claimedFreebies || {};
        this.dailyDeals = state.dailyDeals || [];
        return;
      }
    } catch (e) {
      console.error('Failed to load shop state:', e);
    }
    this.purchasedBundles = [];
    this.purchasedStarterPack = false;
    this.claimedFreebies = {};
  },

  /**
   * Save shop state
   */
  saveShopState() {
    const state = {
      purchasedBundles: this.purchasedBundles,
      purchasedStarterPack: this.purchasedStarterPack,
      lastDealRefresh: this.lastDealRefresh?.toISOString(),
      claimedFreebies: this.claimedFreebies,
      dailyDeals: this.dailyDeals
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  },

  /**
   * Check if daily deals need refresh
   */
  needsDealRefresh() {
    if (!this.lastDealRefresh || this.dailyDeals.length === 0) return true;

    const now = new Date();
    const lastRefresh = new Date(this.lastDealRefresh);

    // Check if we've passed midnight UTC
    const nowDay = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
    const lastDay = Math.floor(lastRefresh.getTime() / (24 * 60 * 60 * 1000));

    return nowDay > lastDay;
  },

  /**
   * Generate daily deals
   */
  generateDailyDeals() {
    if (!this.needsDealRefresh()) return;

    const { DAILY_DEALS_POOL, SHOP_CONFIG } = window.EcoVentureConfig;

    // Shuffle and pick random deals
    const shuffled = [...DAILY_DEALS_POOL].sort(() => Math.random() - 0.5);
    this.dailyDeals = shuffled.slice(0, SHOP_CONFIG.DAILY_DEALS_COUNT);

    this.lastDealRefresh = new Date();
    this.saveShopState();
  },

  /**
   * Get time until next daily reset
   * @returns {Object} { hours, minutes, seconds }
   */
  getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0);

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, total: diff };
  },

  /**
   * Start countdown timers
   */
  startTimers() {
    // Update every second
    setInterval(() => {
      this.updateTimerDisplays();

      // Check for deal refresh
      if (this.needsDealRefresh()) {
        this.generateDailyDeals();
        this.renderShop();
      }
    }, 1000);
  },

  /**
   * Update timer displays in UI
   */
  updateTimerDisplays() {
    const time = this.getTimeUntilReset();
    const timerEl = document.getElementById('dailyTimer');
    if (timerEl) {
      timerEl.textContent = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
    }

    // Update any bundle timers
    document.querySelectorAll('.bundle-timer').forEach(el => {
      const endTime = parseInt(el.dataset.endTime);
      if (endTime) {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
          el.textContent = 'EXPIRED';
          el.closest('.shop-bundle')?.classList.add('expired');
        } else {
          const h = Math.floor(remaining / (1000 * 60 * 60));
          const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((remaining % (1000 * 60)) / 1000);
          el.textContent = `${h}h ${m}m ${s}s`;
        }
      }
    });
  },

  /**
   * Get user's current currency
   * @returns {Object} { points, gems }
   */
  getCurrency() {
    const userData = window.EcoVentureApp?.userData || {};
    return {
      points: userData.totalPoints || 0,
      gems: userData.ecoGems || 0
    };
  },

  /**
   * Spend points
   * @param {number} amount - Amount to spend
   * @returns {boolean} Success
   */
  spendPoints(amount) {
    if (!window.EcoVentureApp) return false;

    const current = window.EcoVentureApp.userData.totalPoints || 0;
    if (current < amount) return false;

    window.EcoVentureApp.userData.totalPoints = current - amount;
    window.EcoVentureApp.saveUserData();
    this.updateCurrencyDisplay();
    return true;
  },

  /**
   * Spend gems
   * @param {number} amount - Amount to spend
   * @returns {boolean} Success
   */
  spendGems(amount) {
    if (!window.EcoVentureApp) return false;

    const current = window.EcoVentureApp.userData.ecoGems || 0;
    if (current < amount) return false;

    window.EcoVentureApp.userData.ecoGems = current - amount;
    window.EcoVentureApp.saveUserData();
    this.updateCurrencyDisplay();
    return true;
  },

  /**
   * Add gems to user
   * @param {number} amount - Amount to add
   */
  addGems(amount) {
    if (!window.EcoVentureApp) return;

    window.EcoVentureApp.userData.ecoGems =
      (window.EcoVentureApp.userData.ecoGems || 0) + amount;
    window.EcoVentureApp.userData.lifetimeGems =
      (window.EcoVentureApp.userData.lifetimeGems || 0) + amount;
    window.EcoVentureApp.saveUserData();
    this.updateCurrencyDisplay();
  },

  /**
   * Add tickets to user
   * @param {number} amount - Amount to add
   */
  addTickets(amount) {
    if (!window.EcoVentureInventory) return;
    for (let i = 0; i < amount; i++) {
      window.EcoVentureInventory.addFreeTicket();
    }
  },

  /**
   * Check if user can afford an item
   * @param {Object} item - Shop item
   * @param {string} currency - 'points' or 'gems'
   * @returns {boolean}
   */
  canAfford(price, currency) {
    const { points, gems } = this.getCurrency();
    if (currency === 'points') return points >= price;
    if (currency === 'gems') return gems >= price;
    return false;
  },

  /**
   * Purchase a daily deal
   * @param {Object} deal - Deal object
   */
  async purchaseDeal(deal) {
    if (deal.type === 'free') {
      // Check cooldown for free items
      const lastClaim = this.claimedFreebies[deal.id];
      if (lastClaim && Date.now() - lastClaim < deal.cooldown) {
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast('Already claimed today!', 'warning');
        }
        return false;
      }

      // Give reward
      if (deal.reward.tickets) {
        this.addTickets(deal.reward.tickets);
      }
      if (deal.reward.gems) {
        this.addGems(deal.reward.gems);
      }

      this.claimedFreebies[deal.id] = Date.now();
      this.saveShopState();

      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('Free reward claimed!', 'success');
      }
      this.renderShop();
      return true;
    }

    if (deal.type === 'box') {
      const discountedPrice = Math.floor(deal.originalPoints * (1 - deal.discount / 100));
      if (!this.spendPoints(discountedPrice)) {
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast('Not enough points!', 'error');
        }
        return false;
      }

      window.EcoVentureInventory.addBoxes(deal.boxType.toLowerCase(), 1);
      await window.EcoVentureGacha?.openBox(deal.boxType.toLowerCase());
      this.renderShop();
      return true;
    }

    if (deal.type === 'gems') {
      if (!this.spendPoints(deal.pricePoints)) {
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast('Not enough points!', 'error');
        }
        return false;
      }

      this.addGems(deal.amount);
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast(`+${deal.amount} EcoGems!`, 'success');
      }
      this.renderShop();
      return true;
    }

    if (deal.type === 'random_item') {
      if (!this.spendGems(deal.priceGems)) {
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast('Not enough gems!', 'error');
        }
        return false;
      }

      // Get random item of rarity
      const item = window.EcoVentureGacha?.getItemOfRarity(deal.rarity);
      if (item) {
        window.EcoVentureInventory.addItem(item.id);
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast(`Got ${item.name}!`, 'success');
        }
      }
      this.renderShop();
      return true;
    }

    if (deal.type === 'box_bundle') {
      const currency = deal.pricePoints ? 'points' : 'gems';
      const price = deal.pricePoints || deal.priceGems;

      if (currency === 'points' && !this.spendPoints(price)) {
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast('Not enough points!', 'error');
        }
        return false;
      }
      if (currency === 'gems' && !this.spendGems(price)) {
        if (window.EcoVentureUI) {
          window.EcoVentureUI.showToast('Not enough gems!', 'error');
        }
        return false;
      }

      // Add boxes
      Object.entries(deal.boxes).forEach(([type, count]) => {
        window.EcoVentureInventory.addBoxes(type, count);
      });

      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('Bundle purchased!', 'success');
      }
      this.renderShop();
      return true;
    }

    return false;
  },

  /**
   * Purchase a special bundle (real money)
   * @param {Object} bundle - Bundle object
   */
  purchaseBundle(bundle) {
    // Check if one-time purchase already made
    if (bundle.oneTimePurchase && this.purchasedBundles.includes(bundle.id)) {
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('Already purchased!', 'warning');
      }
      return;
    }

    // Show purchase confirmation
    const confirmed = confirm(
      `Purchase ${bundle.name}?\n\n` +
      `Contents:\n${this.getBundleContentsText(bundle)}\n\n` +
      `Price: $${bundle.price.toFixed(2)} (Value: $${bundle.originalValue.toFixed(2)})\n\n` +
      `(Demo - no real payment)`
    );

    if (confirmed) {
      this.completeBundlePurchase(bundle);
    }
  },

  /**
   * Get bundle contents as text
   */
  getBundleContentsText(bundle) {
    return bundle.contents.map(item => {
      if (item.type === 'gems') return `  - ${item.amount} EcoGems`;
      if (item.type === 'boxes') return `  - ${item.count}x ${item.boxType} Box`;
      if (item.type === 'tickets') return `  - ${item.count} Free Tickets`;
      if (item.type === 'item') return `  - Exclusive Item!`;
      return '';
    }).join('\n');
  },

  /**
   * Complete bundle purchase
   */
  completeBundlePurchase(bundle) {
    bundle.contents.forEach(item => {
      if (item.type === 'gems') {
        this.addGems(item.amount);
      } else if (item.type === 'boxes') {
        window.EcoVentureInventory.addBoxes(item.boxType.toLowerCase(), item.count);
      } else if (item.type === 'tickets') {
        this.addTickets(item.count);
      } else if (item.type === 'item' && item.itemId) {
        window.EcoVentureInventory.addItem(item.itemId);
      }
    });

    if (bundle.oneTimePurchase) {
      this.purchasedBundles.push(bundle.id);
      this.saveShopState();
    }

    if (window.EcoVentureUI) {
      window.EcoVentureUI.showToast(`${bundle.name} purchased!`, 'success');
    }

    this.renderShop();
  },

  /**
   * Purchase starter pack
   */
  purchaseStarterPack() {
    if (this.purchasedStarterPack) {
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('Already purchased!', 'warning');
      }
      return;
    }

    const { STARTER_PACK } = window.EcoVentureConfig;

    const confirmed = confirm(
      `Purchase ${STARTER_PACK.name}?\n\n` +
      `Contents:\n${this.getBundleContentsText(STARTER_PACK)}\n\n` +
      `Price: $${STARTER_PACK.price.toFixed(2)} (Value: $${STARTER_PACK.originalValue.toFixed(2)})\n\n` +
      `This is a ONE-TIME offer!\n\n` +
      `(Demo - no real payment)`
    );

    if (confirmed) {
      STARTER_PACK.contents.forEach(item => {
        if (item.type === 'gems') {
          this.addGems(item.amount);
        } else if (item.type === 'boxes') {
          window.EcoVentureInventory.addBoxes(item.boxType.toLowerCase(), item.count);
        } else if (item.type === 'tickets') {
          this.addTickets(item.count);
        } else if (item.type === 'item' && item.itemId) {
          window.EcoVentureInventory.addItem(item.itemId);
        }
      });

      this.purchasedStarterPack = true;
      this.saveShopState();

      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast('Starter Pack purchased!', 'success');
      }

      this.renderShop();
    }
  },

  /**
   * Purchase a box and open it immediately
   * @param {string} boxType - Type of box (BASIC, PREMIUM, LEGENDARY)
   * @param {string} currency - 'points' or 'gems'
   * @returns {boolean} Success
   */
  async purchaseBox(boxType, currency = 'points') {
    const { BOX_TYPES } = window.EcoVentureConfig;
    const box = BOX_TYPES[boxType];

    if (!box) return false;

    const cost = currency === 'points' ? box.costPoints : box.costGems;
    if (!cost || cost <= 0) return false;

    const spent = currency === 'points' ? this.spendPoints(cost) : this.spendGems(cost);
    if (!spent) {
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast(`Not enough ${currency}!`, 'error');
      }
      return false;
    }

    if (window.EcoVentureGacha) {
      window.EcoVentureInventory.addBoxes(boxType.toLowerCase(), 1);
      await window.EcoVentureGacha.openBox(boxType.toLowerCase());
    } else {
      window.EcoVentureInventory.addBoxes(boxType.toLowerCase(), 1);
      if (window.EcoVentureUI) {
        window.EcoVentureUI.showToast(`Purchased ${box.name}!`, 'success');
      }
    }

    this.renderShop();
    return true;
  },

  /**
   * Purchase gem pack (real money)
   * @param {string} packId - Gem pack ID
   */
  purchaseGemPack(packId) {
    const { GEM_PACKS_EXPANDED, GEM_PACKS } = window.EcoVentureConfig;
    const allPacks = GEM_PACKS_EXPANDED || GEM_PACKS;
    const pack = allPacks.find(p => p.id === packId);

    if (!pack) return;

    const bonusText = [];
    if (pack.bonusGems) bonusText.push(`+${pack.bonusGems} bonus gems`);
    if (pack.bonusBoxes) {
      Object.entries(pack.bonusBoxes).forEach(([type, count]) => {
        bonusText.push(`+${count} ${type} box${count > 1 ? 'es' : ''}`);
      });
    }

    const confirmed = confirm(
      `Purchase ${pack.name}?\n\n` +
      `${pack.gems} EcoGems\n` +
      (bonusText.length > 0 ? bonusText.join('\n') + '\n' : '') +
      `\nPrice: $${pack.price.toFixed(2)}\n\n` +
      `(Demo - no real payment)`
    );

    if (confirmed) {
      this.completePurchase(pack);
    }
  },

  /**
   * Complete a gem pack purchase (demo)
   * @param {Object} pack - Gem pack data
   */
  completePurchase(pack) {
    const totalGems = pack.gems + (pack.bonusGems || 0);
    this.addGems(totalGems);

    if (pack.bonusBoxes) {
      Object.entries(pack.bonusBoxes).forEach(([boxType, count]) => {
        window.EcoVentureInventory.addBoxes(boxType, count);
      });
    }

    if (window.EcoVentureUI) {
      window.EcoVentureUI.showToast(`+${totalGems} EcoGems!`, 'success');
    }

    this.renderShop();
  },

  /**
   * Update currency display in UI
   */
  updateCurrencyDisplay() {
    const { points, gems } = this.getCurrency();

    const headerPoints = document.getElementById('headerPoints');
    const headerGems = document.getElementById('headerGems');

    if (headerPoints) headerPoints.textContent = `${points} pts`;
    if (headerGems) headerGems.textContent = `${gems}`;

    const shopPoints = document.getElementById('shopPoints');
    const shopGems = document.getElementById('shopGems');

    if (shopPoints) shopPoints.textContent = points.toLocaleString();
    if (shopGems) shopGems.textContent = gems.toLocaleString();

    if (window.EcoVentureUI && window.EcoVentureApp) {
      window.EcoVentureUI.updateStats(window.EcoVentureApp.userData);
    }
  },

  /**
   * Render shop UI
   */
  renderShop() {
    const overlay = document.getElementById('shopLockedOverlay');
    const container = document.getElementById('shopContent');
    const currencyBar = document.querySelector('.sticky-currency');
    const isLoggedIn = window.EcoVentureAuthUI?.isLoggedIn || false;

    if (!isLoggedIn) {
      // Show locked overlay, hide shop content
      if (overlay) overlay.classList.remove('hidden');
      if (container) container.classList.add('hidden');
      if (currencyBar) currencyBar.classList.add('hidden');
      return;
    }

    // Logged in - hide overlay, show shop
    if (overlay) overlay.classList.add('hidden');
    if (container) container.classList.remove('hidden');
    if (currencyBar) currencyBar.classList.remove('hidden');

    this.updateCurrencyDisplay();

    if (!container) {
      // Fallback to old grid
      this.renderOldShop();
      return;
    }

    container.innerHTML = '';

    // Render each section
    this.renderStarterPackSection(container);
    this.renderLimitedItemsSection(container);
    this.renderFeaturedCosmeticsSection(container);
    this.renderCosmeticCategoriesSection(container);
    this.renderLuckyWheelSection(container);
    this.renderDailyDealsSection(container);
    this.renderGamblingSection(container);
    this.renderSpecialBundlesSection(container);
    this.renderBoxShopSection(container);
    this.renderTokenShopSection(container);
    this.renderGemShopSection(container);
  },

  /**
   * Render limited time exclusive items
   */
  renderLimitedItemsSection(container) {
    const { LIMITED_ITEMS, AVATAR_ITEMS, RARITY_TIERS } = window.EcoVentureConfig;
    const inventory = window.EcoVentureInventory;
    const userData = window.EcoVentureApp?.userData;

    // Filter out items the user already owns
    const availableItems = LIMITED_ITEMS.filter(item => {
      const owned = inventory?.hasItem?.(item.itemId);
      return !owned;
    });

    if (availableItems.length === 0) return;

    const section = document.createElement('div');
    section.className = 'shop-section limited-items-section';
    section.innerHTML = `
      <div class="shop-section-header">
        <h3>⚡ LIMITED TIME EXCLUSIVES</h3>
        <span class="section-badge exclusive">SHOP ONLY</span>
      </div>
      <p class="section-desc">These items are NOT available in boxes - buy them before time runs out!</p>
      <div class="limited-items-grid">
        ${availableItems.map(item => {
          const avatarItem = AVATAR_ITEMS.find(a => a.id === item.itemId);
          const rarity = RARITY_TIERS[item.rarity] || RARITY_TIERS.LEGENDARY;
          const canAfford = (userData?.ecoGems || 0) >= item.price;
          const endTime = Date.now() + item.endsIn;

          return `
            <div class="limited-item-card" data-item-id="${item.id}" style="--rarity-color: ${rarity.color}">
              <div class="limited-badge">${item.rarity}</div>
              <div class="limited-timer" data-end="${endTime}">
                <span class="timer-icon">⏰</span>
                <span class="timer-text">${this.formatTimeRemaining(item.endsIn)}</span>
              </div>
              <div class="limited-preview">
                <span class="preview-emoji">${avatarItem?.preview || '❓'}</span>
              </div>
              <div class="limited-info">
                <h4>${item.name}</h4>
                <p class="limited-desc">${item.description}</p>
              </div>
              <button class="limited-buy-btn ${canAfford ? '' : 'disabled'}" data-item-id="${item.id}" ${!canAfford ? 'disabled' : ''}>
                💎 ${item.price}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Add buy listeners
    section.querySelectorAll('.limited-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => this.buyLimitedItem(btn.dataset.itemId));
    });

    container.appendChild(section);
  },

  /**
   * Format time remaining
   */
  formatTimeRemaining(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${mins}m`;
  },

  /**
   * Buy limited item
   */
  async buyLimitedItem(itemId) {
    const { LIMITED_ITEMS, AVATAR_ITEMS } = window.EcoVentureConfig;
    const item = LIMITED_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const userData = window.EcoVentureApp?.userData;
    if (!userData || (userData.ecoGems || 0) < item.price) {
      window.EcoVentureUI.showToast('Not enough gems!', 'error');
      return;
    }

    // Deduct gems
    userData.ecoGems = (userData.ecoGems || 0) - item.price;
    window.EcoVentureApp.saveUserData();

    // Add item to inventory
    const avatarItem = AVATAR_ITEMS.find(a => a.id === item.itemId);
    if (avatarItem && window.EcoVentureInventory) {
      window.EcoVentureInventory.addItem(avatarItem);
    }

    window.EcoVentureUI.showToast(`Purchased ${item.name}!`, 'success');
    this.updateCurrencyDisplay();
    this.renderShop();
  },

  /**
   * Render featured cosmetics section (rotating daily)
   */
  renderFeaturedCosmeticsSection(container) {
    const { FEATURED_COSMETICS, AVATAR_ITEMS, RARITY_TIERS } = window.EcoVentureConfig;
    const inventory = window.EcoVentureInventory;
    const userData = window.EcoVentureApp?.userData;

    // Pick random items for daily featured
    const seed = Math.floor(Date.now() / FEATURED_COSMETICS.refreshInterval);
    const randomItems = this.seededShuffle([...FEATURED_COSMETICS.dailyItems], seed)
      .slice(0, FEATURED_COSMETICS.dailySlots);

    const section = document.createElement('div');
    section.className = 'shop-section featured-cosmetics-section';
    section.innerHTML = `
      <div class="shop-section-header">
        <h3>✨ FEATURED COSMETICS</h3>
        <span class="refresh-timer">Refreshes in ${this.getTimeUntilMidnight()}</span>
      </div>
      <p class="section-desc">Buy cosmetics directly - no gambling required!</p>
      <div class="featured-grid">
        ${randomItems.map(shopItem => {
          const avatarItem = AVATAR_ITEMS.find(a => a.id === shopItem.itemId);
          if (!avatarItem) return '';

          const rarity = RARITY_TIERS[avatarItem.rarity] || RARITY_TIERS.COMMON;
          const owned = inventory?.hasItem?.(shopItem.itemId);
          const canAfford = (userData?.ecoGems || 0) >= shopItem.price;

          return `
            <div class="featured-item ${owned ? 'owned' : ''}" style="--rarity-color: ${rarity.color}">
              ${shopItem.badge ? `<div class="featured-badge">${shopItem.badge}</div>` : ''}
              <div class="featured-preview">
                <span class="preview-emoji">${avatarItem.preview}</span>
              </div>
              <div class="featured-info">
                <h4>${avatarItem.name}</h4>
                <span class="rarity-tag" style="color: ${rarity.color}">${rarity.name}</span>
              </div>
              ${owned ?
                '<button class="featured-btn owned" disabled>OWNED ✓</button>' :
                `<button class="featured-btn ${canAfford ? '' : 'disabled'}" data-item-id="${shopItem.itemId}" data-price="${shopItem.price}" ${!canAfford ? 'disabled' : ''}>
                  💎 ${shopItem.price}
                </button>`
              }
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Add buy listeners
    section.querySelectorAll('.featured-btn:not(.owned)').forEach(btn => {
      btn.addEventListener('click', () => this.buyFeaturedItem(btn.dataset.itemId, parseInt(btn.dataset.price)));
    });

    container.appendChild(section);
  },

  /**
   * Buy featured item
   */
  async buyFeaturedItem(itemId, price) {
    const { AVATAR_ITEMS } = window.EcoVentureConfig;
    const avatarItem = AVATAR_ITEMS.find(a => a.id === itemId);
    if (!avatarItem) return;

    const userData = window.EcoVentureApp?.userData;
    if (!userData || (userData.ecoGems || 0) < price) {
      window.EcoVentureUI.showToast('Not enough gems!', 'error');
      return;
    }

    // Deduct gems
    userData.ecoGems = (userData.ecoGems || 0) - price;
    window.EcoVentureApp.saveUserData();

    // Add item to inventory
    if (window.EcoVentureInventory) {
      window.EcoVentureInventory.addItem(avatarItem);
    }

    window.EcoVentureUI.showToast(`Purchased ${avatarItem.name}!`, 'success');
    this.updateCurrencyDisplay();
    this.renderShop();
  },

  /**
   * Render cosmetic categories section
   */
  renderCosmeticCategoriesSection(container) {
    const { SHOP_CATEGORIES, AVATAR_ITEMS, RARITY_TIERS } = window.EcoVentureConfig;
    if (!SHOP_CATEGORIES) return;

    const inventory = window.EcoVentureInventory;
    const userData = window.EcoVentureApp?.userData;

    const section = document.createElement('div');
    section.className = 'shop-section categories-section';
    section.innerHTML = `
      <div class="shop-section-header">
        <h3>🛍️ COSMETICS SHOP</h3>
      </div>
      <div class="category-tabs">
        ${Object.entries(SHOP_CATEGORIES).map(([key, cat], i) => `
          <button class="category-tab ${i === 0 ? 'active' : ''}" data-category="${key}">
            ${cat.icon} ${cat.name}
          </button>
        `).join('')}
      </div>
      <div class="category-content" id="categoryContent">
        <!-- Content loaded dynamically -->
      </div>
    `;

    // Add tab listeners
    section.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        section.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderCategoryItems(section.querySelector('#categoryContent'), tab.dataset.category);
      });
    });

    container.appendChild(section);

    // Render first category
    const firstCategory = Object.keys(SHOP_CATEGORIES)[0];
    this.renderCategoryItems(section.querySelector('#categoryContent'), firstCategory);
  },

  /**
   * Render items for a specific category
   */
  renderCategoryItems(container, categoryKey) {
    const { SHOP_CATEGORIES, AVATAR_ITEMS, RARITY_TIERS } = window.EcoVentureConfig;
    const category = SHOP_CATEGORIES[categoryKey];
    if (!category || !container) return;

    const inventory = window.EcoVentureInventory;
    const userData = window.EcoVentureApp?.userData;

    container.innerHTML = `
      <div class="category-items-grid">
        ${category.items.map(shopItem => {
          const avatarItem = AVATAR_ITEMS.find(a => a.id === shopItem.itemId);
          if (!avatarItem) return '';

          const rarity = RARITY_TIERS[avatarItem.rarity] || RARITY_TIERS.COMMON;
          const owned = inventory?.hasItem?.(shopItem.itemId);
          const canAfford = (userData?.ecoGems || 0) >= shopItem.price;

          return `
            <div class="category-item ${owned ? 'owned' : ''}" style="--rarity-color: ${rarity.color}">
              ${shopItem.badge ? `<div class="item-badge">${shopItem.badge}</div>` : ''}
              <div class="item-preview">
                <span class="preview-emoji">${avatarItem.preview}</span>
              </div>
              <div class="item-info">
                <h5>${avatarItem.name}</h5>
                <span class="rarity-tag" style="color: ${rarity.color}">${rarity.name}</span>
              </div>
              ${owned ?
                '<button class="item-btn owned" disabled>OWNED</button>' :
                `<button class="item-btn ${canAfford ? '' : 'disabled'}" data-item-id="${shopItem.itemId}" data-price="${shopItem.price}" ${!canAfford ? 'disabled' : ''}>
                  💎 ${shopItem.price}
                </button>`
              }
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Add buy listeners
    container.querySelectorAll('.item-btn:not(.owned)').forEach(btn => {
      btn.addEventListener('click', () => this.buyFeaturedItem(btn.dataset.itemId, parseInt(btn.dataset.price)));
    });
  },

  /**
   * Seeded random shuffle
   */
  seededShuffle(array, seed) {
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  /**
   * Get time until midnight (next refresh)
   */
  getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  },

  /**
   * Render lucky wheel section
   */
  renderLuckyWheelSection(container) {
    const gambling = window.EcoVentureGambling;
    if (!gambling) return;

    const canSpin = gambling.canSpinWheel();
    const cooldown = gambling.getWheelCooldown();
    const { LUCKY_WHEEL } = window.EcoVentureConfig;

    const section = document.createElement('div');
    section.className = 'shop-section wheel-section';

    const cooldownText = canSpin ? 'FREE SPIN!' : this.formatCooldown(cooldown);

    section.innerHTML = `
      <div class="shop-section-header">
        <h3>🎡 Lucky Wheel</h3>
        <span class="wheel-status ${canSpin ? 'ready' : 'cooldown'}">${cooldownText}</span>
      </div>
      <div class="wheel-container">
        <div class="wheel-wrapper">
          <div class="wheel" id="luckyWheel">
            ${LUCKY_WHEEL.segments.map((seg, i) => `
              <div class="wheel-segment" style="--seg-index: ${i}; --seg-color: ${seg.color}; --total-segments: ${LUCKY_WHEEL.segments.length}">
                <span class="segment-label">${seg.label}</span>
              </div>
            `).join('')}
          </div>
          <div class="wheel-pointer">▼</div>
        </div>
        <div class="wheel-buttons">
          <button class="wheel-spin-btn ${canSpin ? 'free' : 'disabled'}" id="freeSpinBtn" ${!canSpin ? 'disabled' : ''}>
            ${canSpin ? '🎰 FREE SPIN' : '⏰ ' + cooldownText}
          </button>
          <button class="wheel-spin-btn premium" id="premiumSpinBtn">
            💎 ${LUCKY_WHEEL.premiumSpinCost} SPIN
          </button>
        </div>
      </div>
    `;

    section.querySelector('#freeSpinBtn')?.addEventListener('click', () => this.spinWheel(false));
    section.querySelector('#premiumSpinBtn')?.addEventListener('click', () => this.spinWheel(true));

    container.appendChild(section);
  },

  /**
   * Format cooldown time
   */
  formatCooldown(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  },

  /**
   * Spin the wheel with animation
   */
  async spinWheel(premium) {
    const gambling = window.EcoVentureGambling;
    if (!gambling) return;

    const wheel = document.getElementById('luckyWheel');
    if (!wheel || wheel.classList.contains('spinning')) return;

    const result = await gambling.spinWheel(premium);
    if (!result) return;

    const { LUCKY_WHEEL } = window.EcoVentureConfig;
    const segmentAngle = 360 / LUCKY_WHEEL.segments.length;
    const targetAngle = 360 - (result.segmentIndex * segmentAngle) - (segmentAngle / 2);
    const totalRotation = 360 * 5 + targetAngle; // 5 full rotations + target

    wheel.classList.add('spinning');
    wheel.style.transform = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
      wheel.classList.remove('spinning');
      if (result.segment.isJackpot) {
        this.showJackpotAnimation();
      }
      this.renderShop();
    }, 4000);
  },

  /**
   * Show jackpot animation
   */
  showJackpotAnimation() {
    const overlay = document.createElement('div');
    overlay.className = 'jackpot-overlay';
    overlay.innerHTML = `
      <div class="jackpot-content">
        <div class="jackpot-icon">🎰</div>
        <h1>JACKPOT!</h1>
        <p>You won 500 gems!</p>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 3000);
  },

  /**
   * Render gambling mini-games section
   */
  renderGamblingSection(container) {
    const gambling = window.EcoVentureGambling;
    if (!gambling) return;

    const { SCRATCH_CARDS, MYSTERY_BOX, SLOT_MACHINE } = window.EcoVentureConfig;

    const section = document.createElement('div');
    section.className = 'shop-section gambling-section';
    section.innerHTML = `
      <div class="shop-section-header">
        <h3>🎰 Mini Games</h3>
        <span class="section-badge hot">HOT</span>
      </div>
      <div class="gambling-grid">
        <!-- Scratch Cards -->
        ${SCRATCH_CARDS.types.map(card => `
          <div class="gambling-card scratch-card" data-card-type="${card.id}">
            <div class="gambling-icon">${card.icon}</div>
            <div class="gambling-name">${card.name}</div>
            <div class="gambling-price">${card.cost} ${card.costType === 'gems' ? '💎' : 'pts'}</div>
          </div>
        `).join('')}

        <!-- Mystery Box -->
        <div class="gambling-card mystery-box" id="mysteryBoxBtn">
          <div class="gambling-glow mystery"></div>
          <div class="gambling-icon">${MYSTERY_BOX.icon}</div>
          <div class="gambling-name">${MYSTERY_BOX.name}</div>
          <div class="gambling-desc">${MYSTERY_BOX.description}</div>
          <div class="gambling-price">${MYSTERY_BOX.cost} 💎</div>
        </div>

        <!-- Slot Machine -->
        <div class="gambling-card slot-machine" id="slotMachineBtn">
          <div class="gambling-glow slots"></div>
          <div class="gambling-icon">🎰</div>
          <div class="gambling-name">Slot Machine</div>
          <div class="gambling-desc">Match 3 to win!</div>
          <div class="gambling-price">${SLOT_MACHINE.spinCost} 💎/spin</div>
        </div>
      </div>
    `;

    // Add event listeners
    section.querySelectorAll('.scratch-card').forEach(card => {
      card.addEventListener('click', () => this.openScratchCard(card.dataset.cardType));
    });

    section.querySelector('#mysteryBoxBtn')?.addEventListener('click', () => this.openMysteryBox());
    section.querySelector('#slotMachineBtn')?.addEventListener('click', () => this.openSlotMachine());

    container.appendChild(section);
  },

  /**
   * Open scratch card modal
   */
  openScratchCard(cardType) {
    const gambling = window.EcoVentureGambling;
    if (!gambling) return;

    const card = gambling.buyScratchCard(cardType);
    if (!card) return;

    const modal = document.createElement('div');
    modal.className = 'scratch-modal';
    modal.innerHTML = `
      <div class="scratch-modal-content">
        <h2>${card.config.icon} ${card.config.name}</h2>
        <p>Scratch 3 matching symbols to win!</p>
        <div class="scratch-grid">
          ${card.grid.map((symbol, i) => `
            <div class="scratch-cell" data-index="${i}" data-symbol="${symbol}">
              <div class="scratch-cover">?</div>
              <div class="scratch-symbol">${symbol}</div>
            </div>
          `).join('')}
        </div>
        <button class="scratch-reveal-all">Reveal All</button>
        <button class="scratch-close">Close</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Scratch to reveal
    modal.querySelectorAll('.scratch-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        cell.classList.add('revealed');
        this.checkScratchWin(modal, card);
      });
    });

    modal.querySelector('.scratch-reveal-all')?.addEventListener('click', () => {
      modal.querySelectorAll('.scratch-cell').forEach(cell => cell.classList.add('revealed'));
      this.checkScratchWin(modal, card);
    });

    modal.querySelector('.scratch-close')?.addEventListener('click', () => {
      modal.remove();
      this.renderShop();
    });
  },

  /**
   * Check for scratch card win
   */
  checkScratchWin(modal, card) {
    const revealed = modal.querySelectorAll('.scratch-cell.revealed');
    if (revealed.length < card.config.gridSize) return;

    // Count symbols
    const counts = {};
    card.grid.forEach(symbol => {
      counts[symbol] = (counts[symbol] || 0) + 1;
    });

    // Check for 3+ match
    const hasWin = Object.values(counts).some(count => count >= 3);

    setTimeout(() => {
      if (hasWin && card.prize && card.prize.reward) {
        modal.querySelector('.scratch-modal-content').innerHTML += `
          <div class="scratch-win">
            <h3>YOU WIN!</h3>
            <p>${card.prize.symbols}</p>
          </div>
        `;
        window.EcoVentureGambling.claimScratchPrize(card.prize);
      } else {
        modal.querySelector('.scratch-modal-content').innerHTML += `
          <div class="scratch-lose">
            <h3>No Match</h3>
            <p>Try again!</p>
          </div>
        `;
      }
    }, 500);
  },

  /**
   * Open mystery box
   */
  async openMysteryBox() {
    const gambling = window.EcoVentureGambling;
    if (!gambling) return;

    const result = await gambling.openMysteryBox();
    if (!result) return;

    const modal = document.createElement('div');
    modal.className = 'mystery-modal';

    let resultHtml = '';
    if (result.type === 'bust') {
      resultHtml = `<h3>💨 Bad Luck!</h3><p>${result.refund} gems refunded</p>`;
    } else if (result.type === 'jackpot') {
      resultHtml = `<h3>🎰 JACKPOT!</h3><p>+${result.gems} gems!</p>`;
    } else {
      resultHtml = `<h3>You got:</h3><p>${JSON.stringify(result)}</p>`;
    }

    modal.innerHTML = `
      <div class="mystery-modal-content">
        <div class="mystery-box-animation">❓</div>
        <div class="mystery-result">${resultHtml}</div>
        <button onclick="this.closest('.mystery-modal').remove()">Close</button>
      </div>
    `;

    document.body.appendChild(modal);
    this.renderShop();
  },

  /**
   * Open slot machine
   */
  openSlotMachine() {
    const modal = document.createElement('div');
    modal.className = 'slots-modal';
    modal.innerHTML = `
      <div class="slots-modal-content">
        <h2>🎰 Slot Machine</h2>
        <div class="slots-display">
          <div class="slot-reel" id="reel1">🍒</div>
          <div class="slot-reel" id="reel2">🍒</div>
          <div class="slot-reel" id="reel3">🍒</div>
        </div>
        <div class="slots-result" id="slotsResult"></div>
        <div class="slots-buttons">
          <button class="slots-spin-btn" id="spinSlotsBtn">SPIN (10 💎)</button>
          <button class="slots-close-btn" onclick="this.closest('.slots-modal').remove()">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#spinSlotsBtn')?.addEventListener('click', () => this.spinSlots(modal));
  },

  /**
   * Spin the slot machine
   */
  async spinSlots(modal) {
    const gambling = window.EcoVentureGambling;
    if (!gambling) return;

    const btn = modal.querySelector('#spinSlotsBtn');
    if (btn.disabled) return;
    btn.disabled = true;

    const { SLOT_MACHINE } = window.EcoVentureConfig;
    const reels = [
      modal.querySelector('#reel1'),
      modal.querySelector('#reel2'),
      modal.querySelector('#reel3')
    ];

    // Spin animation
    reels.forEach(reel => reel.classList.add('spinning'));

    // Get result
    const result = await gambling.spinSlots();

    if (!result) {
      reels.forEach(reel => reel.classList.remove('spinning'));
      btn.disabled = false;
      return;
    }

    // Stop reels one by one
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 500 + i * 300));
      reels[i].classList.remove('spinning');
      reels[i].textContent = result.symbols[i];
    }

    // Show result
    const resultEl = modal.querySelector('#slotsResult');
    if (result.win) {
      resultEl.innerHTML = `<span class="win">🎉 ${result.win.name}! +${result.winAmount} 💎</span>`;
      resultEl.classList.add('winner');
    } else {
      resultEl.innerHTML = `<span class="lose">No match - Try again!</span>`;
      resultEl.classList.remove('winner');
    }

    btn.disabled = false;
    this.renderShop();
  },

  /**
   * Render token shop section
   */
  renderTokenShopSection(container) {
    const gambling = window.EcoVentureGambling;
    if (!gambling) return;

    const { TOKEN_SYSTEM } = window.EcoVentureConfig;
    const tokens = gambling.getTokens();

    const section = document.createElement('div');
    section.className = 'shop-section token-section';
    section.innerHTML = `
      <div class="shop-section-header">
        <h3>🪙 Token Shop</h3>
        <span class="token-balance">${tokens} tokens</span>
      </div>
      <div class="token-grid">
        ${TOKEN_SYSTEM.tokenShop.map(item => `
          <div class="token-item ${tokens >= item.cost ? 'can-afford' : ''}" data-item-id="${item.id}">
            <div class="token-item-icon">${item.icon}</div>
            <div class="token-item-name">${item.name}</div>
            <div class="token-item-cost">${item.cost} 🪙</div>
          </div>
        `).join('')}
      </div>
      <p class="token-hint">Earn tokens from duplicate items!</p>
    `;

    section.querySelectorAll('.token-item.can-afford').forEach(item => {
      item.addEventListener('click', async () => {
        const success = await gambling.purchaseWithTokens(item.dataset.itemId);
        if (success) this.renderShop();
      });
    });

    container.appendChild(section);
  },

  /**
   * Render starter pack section
   */
  renderStarterPackSection(container) {
    if (this.purchasedStarterPack) return;

    const { STARTER_PACK } = window.EcoVentureConfig;

    const section = document.createElement('div');
    section.className = 'shop-section starter-pack-section';
    section.innerHTML = `
      <div class="shop-section-header">
        <h3>🎁 New Player Offer</h3>
        <span class="section-badge exclusive">ONE TIME</span>
      </div>
      <div class="starter-pack-card" id="starterPackCard">
        <div class="starter-pack-glow"></div>
        <div class="starter-pack-badge">${STARTER_PACK.badge}</div>
        <div class="starter-pack-icon">${STARTER_PACK.icon}</div>
        <div class="starter-pack-name">${STARTER_PACK.name}</div>
        <div class="starter-pack-contents">
          ${STARTER_PACK.contents.map(c => this.getContentIcon(c)).join('')}
        </div>
        <div class="starter-pack-price">
          <span class="original-price">$${STARTER_PACK.originalValue.toFixed(2)}</span>
          <span class="current-price">$${STARTER_PACK.price.toFixed(2)}</span>
        </div>
        <div class="starter-pack-savings">Save ${Math.round((1 - STARTER_PACK.price / STARTER_PACK.originalValue) * 100)}%!</div>
      </div>
    `;

    section.querySelector('#starterPackCard').addEventListener('click', () => {
      this.purchaseStarterPack();
    });

    container.appendChild(section);
  },

  /**
   * Render daily deals section
   */
  renderDailyDealsSection(container) {
    const section = document.createElement('div');
    section.className = 'shop-section daily-deals-section';
    section.innerHTML = `
      <div class="shop-section-header">
        <h3>⚡ Daily Deals</h3>
        <div class="daily-timer">
          <span class="timer-label">Resets in</span>
          <span class="timer-value" id="dailyTimer">--:--:--</span>
        </div>
      </div>
      <div class="daily-deals-grid" id="dailyDealsGrid"></div>
    `;

    const grid = section.querySelector('#dailyDealsGrid');

    this.dailyDeals.forEach((deal, index) => {
      const card = this.renderDealCard(deal, index);
      grid.appendChild(card);
    });

    container.appendChild(section);
    this.updateTimerDisplays();
  },

  /**
   * Render a daily deal card
   */
  renderDealCard(deal, index) {
    const card = document.createElement('div');
    card.className = `deal-card deal-${deal.type}`;

    let priceHtml = '';
    let canBuy = true;

    if (deal.type === 'free') {
      const lastClaim = this.claimedFreebies[deal.id];
      const canClaim = !lastClaim || Date.now() - lastClaim >= deal.cooldown;
      priceHtml = canClaim ? '<span class="deal-price free">FREE</span>' : '<span class="deal-price claimed">CLAIMED</span>';
      canBuy = canClaim;
    } else if (deal.type === 'box') {
      const discounted = Math.floor(deal.originalPoints * (1 - deal.discount / 100));
      const canAfford = this.canAfford(discounted, 'points');
      priceHtml = `
        <span class="deal-original">${deal.originalPoints} pts</span>
        <span class="deal-price ${canAfford ? '' : 'expensive'}">${discounted} pts</span>
      `;
      canBuy = canAfford;
    } else if (deal.pricePoints) {
      const canAfford = this.canAfford(deal.pricePoints, 'points');
      priceHtml = `<span class="deal-price ${canAfford ? '' : 'expensive'}">${deal.pricePoints} pts</span>`;
      canBuy = canAfford;
    } else if (deal.priceGems) {
      const canAfford = this.canAfford(deal.priceGems, 'gems');
      if (deal.originalGems) {
        priceHtml = `
          <span class="deal-original">${deal.originalGems} 💎</span>
          <span class="deal-price ${canAfford ? '' : 'expensive'}">${deal.priceGems} 💎</span>
        `;
      } else {
        priceHtml = `<span class="deal-price ${canAfford ? '' : 'expensive'}">${deal.priceGems} 💎</span>`;
      }
      canBuy = canAfford;
    }

    card.innerHTML = `
      ${deal.badge ? `<div class="deal-badge">${deal.badge}</div>` : ''}
      <div class="deal-icon">${deal.icon}</div>
      <div class="deal-info">
        ${this.getDealDescription(deal)}
      </div>
      <div class="deal-price-area">
        ${priceHtml}
      </div>
    `;

    if (canBuy) {
      card.classList.add('can-buy');
      card.addEventListener('click', () => this.purchaseDeal(deal));
    }

    return card;
  },

  /**
   * Get deal description text
   */
  getDealDescription(deal) {
    if (deal.type === 'box') {
      const { BOX_TYPES } = window.EcoVentureConfig;
      return `<span class="deal-name">${BOX_TYPES[deal.boxType]?.name || deal.boxType}</span><span class="deal-discount">${deal.discount}% OFF</span>`;
    }
    if (deal.type === 'gems') {
      return `<span class="deal-name">${deal.amount} EcoGems</span>`;
    }
    if (deal.type === 'random_item') {
      return `<span class="deal-name">Random ${deal.rarity} Item</span>`;
    }
    if (deal.type === 'box_bundle') {
      const contents = Object.entries(deal.boxes).map(([t, c]) => `${c}x ${t}`).join(' + ');
      return `<span class="deal-name">${contents}</span>`;
    }
    if (deal.type === 'free') {
      return `<span class="deal-name">Daily Free Gift!</span>`;
    }
    return '';
  },

  /**
   * Render special bundles section
   */
  renderSpecialBundlesSection(container) {
    const { SPECIAL_BUNDLES } = window.EcoVentureConfig;

    const section = document.createElement('div');
    section.className = 'shop-section bundles-section';
    section.innerHTML = `
      <div class="shop-section-header">
        <h3>🌟 Special Offers</h3>
      </div>
      <div class="bundles-grid" id="bundlesGrid"></div>
    `;

    const grid = section.querySelector('#bundlesGrid');

    SPECIAL_BUNDLES.forEach(bundle => {
      // Skip already purchased one-time bundles
      if (bundle.oneTimePurchase && this.purchasedBundles.includes(bundle.id)) {
        return;
      }

      const card = this.renderBundleCard(bundle);
      grid.appendChild(card);
    });

    container.appendChild(section);
  },

  /**
   * Render a bundle card
   */
  renderBundleCard(bundle) {
    const card = document.createElement('div');
    card.className = 'shop-bundle';

    const discount = Math.round((1 - bundle.price / bundle.originalValue) * 100);

    card.innerHTML = `
      <div class="bundle-glow ${bundle.badge?.toLowerCase() || ''}"></div>
      <div class="bundle-badge">${bundle.badge}</div>
      ${bundle.limitedTime ? `<div class="bundle-timer" data-end-time="${Date.now() + bundle.duration}">Loading...</div>` : ''}
      <div class="bundle-icon">${bundle.icon}</div>
      <div class="bundle-name">${bundle.name}</div>
      <div class="bundle-contents">
        ${bundle.contents.map(c => `<span class="bundle-item">${this.getContentIcon(c)}</span>`).join('')}
      </div>
      <div class="bundle-price">
        <span class="bundle-original">$${bundle.originalValue.toFixed(2)}</span>
        <span class="bundle-current">$${bundle.price.toFixed(2)}</span>
      </div>
      <div class="bundle-savings">${discount}% OFF!</div>
    `;

    card.addEventListener('click', () => this.purchaseBundle(bundle));

    return card;
  },

  /**
   * Get content icon for display
   */
  getContentIcon(content) {
    if (content.type === 'gems') return `<span class="content-item">💎${content.amount}</span>`;
    if (content.type === 'boxes') return `<span class="content-item">${content.boxType === 'legendary' ? '✨' : content.boxType === 'premium' ? '🎁' : '📦'}x${content.count}</span>`;
    if (content.type === 'tickets') return `<span class="content-item">🎟️x${content.count}</span>`;
    if (content.type === 'item') return `<span class="content-item">⭐</span>`;
    return '';
  },

  /**
   * Render box shop section
   */
  renderBoxShopSection(container) {
    const { BOX_TYPES } = window.EcoVentureConfig;

    const section = document.createElement('div');
    section.className = 'shop-section boxes-section';
    section.innerHTML = `
      <div class="shop-section-header">
        <h3>📦 Avatar Boxes</h3>
      </div>
      <div class="boxes-grid" id="boxesGrid"></div>
    `;

    const grid = section.querySelector('#boxesGrid');

    Object.entries(BOX_TYPES).forEach(([key, box]) => {
      const card = document.createElement('div');
      card.className = `box-shop-card ${key.toLowerCase()}`;

      const useGems = box.costGems > 0;
      const cost = useGems ? box.costGems : box.costPoints;
      const currency = useGems ? 'gems' : 'points';
      const canAfford = this.canAfford(cost, currency);

      card.innerHTML = `
        <div class="box-glow"></div>
        <div class="box-icon">${box.icon}</div>
        <div class="box-name">${box.name}</div>
        <div class="box-desc">${box.description}</div>
        <button class="box-buy-btn ${canAfford ? '' : 'disabled'}">
          ${cost} ${useGems ? '💎' : 'pts'}
        </button>
      `;

      card.querySelector('.box-buy-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.purchaseBox(key, currency);
      });

      grid.appendChild(card);
    });

    container.appendChild(section);
  },

  /**
   * Render gem shop section
   */
  renderGemShopSection(container) {
    const { GEM_PACKS_EXPANDED, GEM_PACKS } = window.EcoVentureConfig;
    const packs = GEM_PACKS_EXPANDED || GEM_PACKS;

    const section = document.createElement('div');
    section.className = 'shop-section gems-section';
    section.innerHTML = `
      <div class="shop-section-header">
        <h3>💎 Get EcoGems</h3>
      </div>
      <div class="gems-grid" id="gemsGrid"></div>
    `;

    const grid = section.querySelector('#gemsGrid');

    packs.forEach(pack => {
      const card = document.createElement('div');
      card.className = `gem-pack-card ${pack.badge ? pack.badge.toLowerCase().replace(' ', '-') : ''}`;

      const totalGems = pack.gems + (pack.bonusGems || 0);

      card.innerHTML = `
        ${pack.badge ? `<div class="gem-badge">${pack.badge}</div>` : ''}
        <div class="gem-icon">${pack.icon}</div>
        <div class="gem-amount">${pack.gems}</div>
        ${pack.bonusGems ? `<div class="gem-bonus">+${pack.bonusGems} BONUS</div>` : ''}
        ${pack.bonusBoxes ? `<div class="gem-bonus-boxes">${Object.entries(pack.bonusBoxes).map(([t, c]) => `+${c} ${t}`).join(' ')}</div>` : ''}
        <button class="gem-buy-btn">$${pack.price.toFixed(2)}</button>
      `;

      card.querySelector('.gem-buy-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.purchaseGemPack(pack.id);
      });

      grid.appendChild(card);
    });

    container.appendChild(section);
  },

  /**
   * Fallback render for old shop structure
   */
  renderOldShop() {
    const gridEl = document.getElementById('shopGrid');
    if (!gridEl) return;

    const { BOX_TYPES, GEM_PACKS } = window.EcoVentureConfig;

    gridEl.innerHTML = '';

    // Add boxes
    Object.entries(BOX_TYPES).forEach(([key, box]) => {
      const card = document.createElement('div');
      card.className = 'shop-item';

      const useGems = box.costGems > 0;
      const cost = useGems ? box.costGems : box.costPoints;

      card.innerHTML = `
        <div class="shop-item-icon">${box.icon}</div>
        <div class="shop-item-name">${box.name}</div>
        <div class="shop-item-desc">${box.description}</div>
        <div class="shop-item-price">
          <div class="price-tag ${useGems ? 'gems' : 'points'}">
            ${cost} ${useGems ? 'gems' : 'pts'}
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.purchaseBox(key, useGems ? 'gems' : 'points');
      });

      gridEl.appendChild(card);
    });
  },

  /**
   * Setup event listeners
   */
  setupListeners() {
    // Category buttons (if using old UI)
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.renderShop();
      });
    });
  }
};

// Export module
window.EcoVentureShop = ShopModule;
