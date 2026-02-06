/**
 * EcoVenture Avatar Module
 * Manages avatar customization with CSS-based character system
 */

const AvatarModule = {
  // Storage key
  STORAGE_KEY: 'ecoventure_avatar',

  // Current UI state
  currentCategory: 'skin',

  /**
   * Initialize avatar module
   */
  init() {
    this.setupListeners();
    this.ensureDefaultItems();
    // Render mini avatars on init (profile pictures)
    setTimeout(() => this.renderMiniAvatars(), 100);
    console.log('Avatar module initialized');
  },

  /**
   * Ensure default items are in inventory
   */
  ensureDefaultItems() {
    const { DEFAULT_AVATAR, AVATAR_ITEMS } = window.EcoVentureConfig;

    // Add default equipped items to inventory if not already there
    Object.values(DEFAULT_AVATAR.equipped).forEach(itemId => {
      if (itemId && !window.EcoVentureInventory.hasItem(itemId)) {
        // Find item in catalog to verify it exists
        const item = AVATAR_ITEMS.find(i => i.id === itemId);
        if (item) {
          window.EcoVentureInventory.addItem(itemId);
          console.log('Added default item to inventory:', itemId);
        }
      }
    });
  },

  /**
   * Load avatar data from localStorage
   * @returns {Object} Avatar data
   */
  loadAvatar() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const avatar = JSON.parse(stored);
        const { DEFAULT_AVATAR } = window.EcoVentureConfig;
        // Merge with defaults to ensure all slots exist
        return {
          equipped: { ...DEFAULT_AVATAR.equipped, ...avatar.equipped }
        };
      }
    } catch (error) {
      console.error('Failed to load avatar:', error);
    }
    return { ...window.EcoVentureConfig.DEFAULT_AVATAR };
  },

  /**
   * Save avatar data to localStorage
   * @param {Object} avatar - Avatar data to save
   */
  saveAvatar(avatar) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(avatar));
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
  },

  /**
   * Get the current avatar
   * @returns {Object} Avatar state
   */
  getAvatar() {
    return this.loadAvatar();
  },

  /**
   * Equip an item to a slot
   * @param {string} itemId - ID of item to equip
   * @param {string} slot - Slot to equip to
   * @returns {boolean} Success
   */
  equipItem(itemId, slot) {
    // Verify user owns the item
    if (!window.EcoVentureInventory.hasItem(itemId)) {
      console.warn('Cannot equip item user does not own:', itemId);
      return false;
    }

    const avatar = this.loadAvatar();
    avatar.equipped[slot] = itemId;
    this.saveAvatar(avatar);

    // Update UI if visible
    this.renderAvatarPreview();

    return true;
  },

  /**
   * Unequip an item from a slot
   * @param {string} slot - Slot to unequip
   */
  unequipItem(slot) {
    // Some slots can't be unequipped (skin, eyes, mouth)
    const requiredSlots = ['skin', 'eyes', 'mouth'];
    if (requiredSlots.includes(slot)) {
      console.warn('Cannot unequip required slot:', slot);
      return;
    }

    const avatar = this.loadAvatar();
    avatar.equipped[slot] = null;
    this.saveAvatar(avatar);
    this.renderAvatarPreview();
  },

  /**
   * Get equipped item for a slot
   * @param {string} slot - Slot to check
   * @returns {Object|null} Item data or null
   */
  getEquippedItem(slot) {
    const avatar = this.loadAvatar();
    const itemId = avatar.equipped[slot];
    if (!itemId) return null;

    const { AVATAR_ITEMS } = window.EcoVentureConfig;
    return AVATAR_ITEMS.find(i => i.id === itemId) || null;
  },

  /**
   * Get all equipped items
   * @returns {Object} Map of slot to item data
   */
  getAllEquipped() {
    const avatar = this.loadAvatar();
    const { AVATAR_ITEMS } = window.EcoVentureConfig;
    const equipped = {};

    Object.entries(avatar.equipped).forEach(([slot, itemId]) => {
      if (itemId) {
        equipped[slot] = AVATAR_ITEMS.find(i => i.id === itemId) || null;
      } else {
        equipped[slot] = null;
      }
    });

    return equipped;
  },

  /**
   * Render avatar preview using CSS-based character system
   * @param {HTMLElement} container - Container element (optional)
   */
  renderAvatarPreview(container = null) {
    const previewEl = container || document.getElementById('avatarPreview');
    if (!previewEl) return;

    const equipped = this.getAllEquipped();

    // Update background
    const bgEl = previewEl.querySelector('.avatar-bg') || previewEl.querySelector('#avatarBg');
    if (bgEl) {
      bgEl.className = 'avatar-bg';
      if (equipped.background?.cssClass) {
        bgEl.classList.add(equipped.background.cssClass);
      }
    }

    // Update skin tone (head shape)
    const headShapeEl = previewEl.querySelector('.head-shape') || previewEl.querySelector('#headShape');
    if (headShapeEl) {
      headShapeEl.className = 'head-shape';
      if (equipped.skin?.cssClass) {
        headShapeEl.classList.add(equipped.skin.cssClass);
      }
    }

    // Also apply skin tone to face element (for visibility above hair)
    const faceEl = previewEl.querySelector('.char-face');
    if (faceEl) {
      // Reset classes but keep char-face
      faceEl.className = 'char-face';
      if (equipped.skin?.cssClass) {
        faceEl.classList.add(equipped.skin.cssClass);
      }
    }

    // Update hair
    const hairEl = previewEl.querySelector('.char-hair') || previewEl.querySelector('#charHair');
    if (hairEl) {
      hairEl.className = 'char-hair';
      if (equipped.hair?.cssClass) {
        equipped.hair.cssClass.split(' ').forEach(cls => {
          if (cls) hairEl.classList.add(cls);
        });
      }
    }

    // Update eyes
    const eyesEl = previewEl.querySelector('.char-eyes') || previewEl.querySelector('#charEyes');
    if (eyesEl) {
      eyesEl.className = 'char-eyes';
      if (equipped.eyes?.cssClass) {
        eyesEl.classList.add(equipped.eyes.cssClass);
      }
    }

    // Update mouth
    const mouthEl = previewEl.querySelector('.char-mouth') || previewEl.querySelector('#charMouth');
    if (mouthEl) {
      mouthEl.className = 'char-mouth';
      if (equipped.mouth?.cssClass) {
        mouthEl.classList.add(equipped.mouth.cssClass);
      }
    }

    // Update accessory
    const accEl = previewEl.querySelector('.char-accessory') || previewEl.querySelector('#charAccessory');
    if (accEl) {
      accEl.className = 'char-accessory';
      if (equipped.accessory?.cssClass) {
        accEl.classList.add(equipped.accessory.cssClass);
      }
    }

    // Update hat
    const hatEl = previewEl.querySelector('.char-hat') || previewEl.querySelector('#charHat');
    if (hatEl) {
      hatEl.className = 'char-hat';
      if (equipped.hat?.cssClass) {
        hatEl.classList.add(equipped.hat.cssClass);
      }
    }

    // Update outfit
    const outfitEl = previewEl.querySelector('.body-outfit') || previewEl.querySelector('#bodyOutfit');
    if (outfitEl) {
      outfitEl.className = 'body-outfit';
      if (equipped.outfit?.cssClass) {
        outfitEl.classList.add(equipped.outfit.cssClass);
      }
    }

    // Update frame
    const frameEl = previewEl.querySelector('.avatar-frame') || previewEl.querySelector('#avatarFrame');
    if (frameEl) {
      frameEl.className = 'avatar-frame';
      if (equipped.frame?.cssClass) {
        frameEl.classList.add(equipped.frame.cssClass);
      }
    }

    // Update effect
    const effectEl = previewEl.querySelector('.avatar-effect') || previewEl.querySelector('#avatarEffect');
    if (effectEl) {
      effectEl.className = 'avatar-effect';
      if (equipped.effect?.cssClass) {
        effectEl.classList.add(equipped.effect.cssClass);
      }
    }

    // Also update mini avatars (profile pictures)
    this.renderMiniAvatars();
  },

  /**
   * Render mini avatars (profile pictures) throughout the app
   */
  renderMiniAvatars() {
    const equipped = this.getAllEquipped();
    const miniAvatars = document.querySelectorAll('.mini-avatar');

    miniAvatars.forEach(miniEl => {
      // Background
      const bgEl = miniEl.querySelector('.mini-bg');
      if (bgEl) {
        bgEl.className = 'mini-bg';
        if (equipped.background?.cssClass) {
          bgEl.classList.add(equipped.background.cssClass);
        }
      }

      // Body/Outfit
      const bodyEl = miniEl.querySelector('.mini-body');
      if (bodyEl) {
        bodyEl.className = 'mini-body';
        if (equipped.outfit?.cssClass) {
          bodyEl.classList.add(equipped.outfit.cssClass);
        }
      }

      // Head (skin tone)
      const headEl = miniEl.querySelector('.mini-head');
      if (headEl) {
        headEl.className = 'mini-head';
        if (equipped.skin?.cssClass) {
          headEl.classList.add(equipped.skin.cssClass);
        }
      }

      // Face (also apply skin tone for visibility above hair)
      const faceEl = miniEl.querySelector('.mini-face');
      if (faceEl) {
        faceEl.className = 'mini-face';
        if (equipped.skin?.cssClass) {
          faceEl.classList.add(equipped.skin.cssClass);
        }
      }

      // Hair
      const hairEl = miniEl.querySelector('.mini-hair');
      if (hairEl) {
        hairEl.className = 'mini-hair';
        if (equipped.hair?.cssClass) {
          equipped.hair.cssClass.split(' ').forEach(cls => {
            if (cls) hairEl.classList.add(cls);
          });
        }
      }

      // Hat
      const hatEl = miniEl.querySelector('.mini-hat');
      if (hatEl) {
        hatEl.className = 'mini-hat';
        if (equipped.hat?.cssClass) {
          hatEl.classList.add(equipped.hat.cssClass);
        }
      }

      // Accessory
      const accEl = miniEl.querySelector('.mini-accessory');
      if (accEl) {
        accEl.className = 'mini-accessory';
        if (equipped.accessory?.cssClass) {
          accEl.classList.add(equipped.accessory.cssClass);
        }
      }
    });
  },

  /**
   * Render inventory grid for avatar customization
   * @param {string} category - Item category to show
   */
  renderInventoryGrid(category = 'skin') {
    const gridEl = document.getElementById('avatarInventory');
    if (!gridEl) return;

    this.currentCategory = category;

    // Get owned items of this category
    const items = window.EcoVentureInventory.getItemsByType(category);
    const sortedItems = window.EcoVentureInventory.sortItems(items, 'rarity');
    const avatar = this.loadAvatar();
    const equippedId = avatar.equipped[category];

    // Clear grid
    gridEl.innerHTML = '';

    // Some categories can have "None" option
    const optionalSlots = ['accessory', 'hat', 'hair'];
    if (optionalSlots.includes(category)) {
      const noneCard = document.createElement('div');
      noneCard.className = `item-card ${!equippedId ? 'equipped' : ''}`;
      noneCard.innerHTML = `
        <div class="item-preview">❌</div>
        <div class="item-name">None</div>
      `;
      noneCard.addEventListener('click', () => {
        this.unequipItem(category);
        this.renderInventoryGrid(category);
      });
      gridEl.appendChild(noneCard);
    }

    // Add owned items
    sortedItems.forEach(item => {
      const isEquipped = item.id === equippedId;
      const card = this.renderItemCard(item, isEquipped);
      card.addEventListener('click', () => {
        this.equipItem(item.id, category);
        this.renderInventoryGrid(category);
      });
      gridEl.appendChild(card);
    });

    // If no items (after none option), show message
    if (sortedItems.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'empty-inventory-msg';
      emptyMsg.innerHTML = `
        <p style="color: var(--text-muted); font-size: 0.85rem; grid-column: span 3; text-align: center; padding: 20px;">
          No items yet! Open Avatar Boxes to get items.
        </p>
      `;
      gridEl.appendChild(emptyMsg);
    }
  },

  /**
   * Render a single item card
   * @param {Object} item - Item data
   * @param {boolean} isEquipped - Whether item is equipped
   * @returns {HTMLElement}
   */
  renderItemCard(item, isEquipped = false) {
    const card = document.createElement('div');
    const rarityClass = item.rarity.toLowerCase();
    card.className = `item-card rarity-${rarityClass} ${isEquipped ? 'equipped' : ''}`;

    // Use preview emoji for display
    const preview = item.preview || item.emoji || '❓';

    card.innerHTML = `
      <div class="item-preview">${preview}</div>
      <div class="item-name">${item.name}</div>
      <div class="item-rarity ${rarityClass}">${item.rarity}</div>
    `;

    return card;
  },

  /**
   * Get rarity CSS class
   * @param {string} rarity - Rarity tier
   * @returns {string}
   */
  getRarityClass(rarity) {
    return `rarity-${rarity.toLowerCase()}`;
  },

  /**
   * Setup event listeners
   */
  setupListeners() {
    // Category buttons - use event delegation for dynamic elements
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('avatar-cat-btn')) {
        // Update active state
        document.querySelectorAll('.avatar-cat-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Render items for this category
        const type = e.target.dataset.type;
        this.renderInventoryGrid(type);
      }
    });
  },

  /**
   * Show avatar customizer modal/section
   */
  showCustomizer() {
    // Ensure default items are in inventory
    this.ensureDefaultItems();

    // Give starter items if inventory is empty
    this.ensureStarterItems();

    // Initialize with first category (skin)
    this.renderAvatarPreview();
    this.renderInventoryGrid('skin');

    // Activate first category button
    const firstBtn = document.querySelector('.avatar-cat-btn');
    if (firstBtn) {
      document.querySelectorAll('.avatar-cat-btn').forEach(b => b.classList.remove('active'));
      firstBtn.classList.add('active');
    }
  },

  /**
   * Give starter items to new users
   */
  ensureStarterItems() {
    const inventory = window.EcoVentureInventory.getInventory();

    // If user has very few items, give them starter items for the new system
    if (inventory.items.length < 10) {
      const starterItems = [
        // Skin tones (all free)
        'skin_light', 'skin_fair', 'skin_medium', 'skin_tan', 'skin_brown', 'skin_dark',
        // Basic hair
        'hair_short_black', 'hair_short_brown', 'hair_long_brown',
        // Basic eyes
        'eyes_normal', 'eyes_happy',
        // Basic mouth
        'mouth_smile', 'mouth_grin',
        // Basic outfits
        'outfit_tshirt', 'outfit_hoodie',
        // Basic backgrounds
        'bg_default', 'bg_forest', 'bg_ocean',
        // Basic frames
        'frame_simple',
        // Basic accessories
        'acc_glasses',
        // Basic hats
        'hat_cap', 'hat_beanie'
      ];

      starterItems.forEach(itemId => {
        if (!window.EcoVentureInventory.hasItem(itemId)) {
          window.EcoVentureInventory.addItem(itemId);
        }
      });
      console.log('Added starter items for character customization');
    }
  },

  /**
   * Get avatar display data for profile/leaderboard
   * @returns {Object} Display-ready avatar data
   */
  getDisplayData() {
    const equipped = this.getAllEquipped();
    return { equipped };
  }
};

// Export module
window.EcoVentureAvatar = AvatarModule;
