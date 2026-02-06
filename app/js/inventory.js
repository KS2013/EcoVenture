/**
 * EcoVenture Inventory Module
 * Manages user's item collection, boxes, and tickets
 */

const InventoryModule = {
  // Storage key
  STORAGE_KEY: 'ecoventure_inventory',

  // Default inventory state
  defaultInventory: {
    items: [],           // Array of owned item IDs
    duplicates: {},      // { itemId: count } for extra copies
    boxes: {
      basic: 0,
      premium: 0,
      legendary: 0
    },
    freeTickets: 0,      // Free box tickets from quests
    sortBy: 'rarity',
    filterType: 'all'
  },

  /**
   * Initialize the inventory module
   */
  init() {
    console.log('Inventory module initialized');
  },

  /**
   * Load inventory from localStorage
   * @returns {Object} Inventory data
   */
  loadInventory() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const inventory = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist
        return { ...this.defaultInventory, ...inventory };
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
    return { ...this.defaultInventory };
  },

  /**
   * Save inventory to localStorage
   * @param {Object} inventory - Inventory data to save
   */
  saveInventory(inventory) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(inventory));
    } catch (error) {
      console.error('Failed to save inventory:', error);
    }
  },

  /**
   * Get the current inventory
   * @returns {Object} Current inventory state
   */
  getInventory() {
    return this.loadInventory();
  },

  /**
   * Add an item to inventory
   * @param {string} itemId - ID of the item to add
   * @returns {boolean} True if new item, false if duplicate
   */
  addItem(itemId) {
    const inventory = this.loadInventory();

    if (inventory.items.includes(itemId)) {
      // Item is a duplicate
      inventory.duplicates[itemId] = (inventory.duplicates[itemId] || 0) + 1;
      this.saveInventory(inventory);
      return false; // Not a new item
    } else {
      // New item
      inventory.items.push(itemId);
      this.saveInventory(inventory);
      return true; // Is a new item
    }
  },

  /**
   * Check if user owns an item
   * @param {string} itemId - ID of the item
   * @returns {boolean}
   */
  hasItem(itemId) {
    const inventory = this.loadInventory();
    return inventory.items.includes(itemId);
  },

  /**
   * Get count of duplicates for an item
   * @param {string} itemId - ID of the item
   * @returns {number}
   */
  getDuplicateCount(itemId) {
    const inventory = this.loadInventory();
    return inventory.duplicates[itemId] || 0;
  },

  /**
   * Add boxes to inventory
   * @param {string} boxType - Type of box (basic, premium, legendary)
   * @param {number} count - Number of boxes to add
   */
  addBoxes(boxType, count = 1) {
    const inventory = this.loadInventory();
    inventory.boxes[boxType] = (inventory.boxes[boxType] || 0) + count;
    this.saveInventory(inventory);
  },

  /**
   * Remove a box from inventory
   * @param {string} boxType - Type of box to remove
   * @returns {boolean} True if box was removed, false if none available
   */
  removeBox(boxType) {
    const inventory = this.loadInventory();
    if (inventory.boxes[boxType] > 0) {
      inventory.boxes[boxType]--;
      this.saveInventory(inventory);
      return true;
    }
    return false;
  },

  /**
   * Get box count
   * @param {string} boxType - Type of box
   * @returns {number}
   */
  getBoxCount(boxType) {
    const inventory = this.loadInventory();
    return inventory.boxes[boxType] || 0;
  },

  /**
   * Add free tickets
   * @param {number} count - Number of tickets to add
   */
  addTickets(count = 1) {
    const inventory = this.loadInventory();
    inventory.freeTickets = (inventory.freeTickets || 0) + count;
    this.saveInventory(inventory);
  },

  /**
   * Add a single free ticket (alias for addTickets(1))
   */
  addFreeTicket() {
    this.addTickets(1);
  },

  /**
   * Use a free ticket
   * @returns {boolean} True if ticket was used, false if none available
   */
  useTicket() {
    const inventory = this.loadInventory();
    if (inventory.freeTickets > 0) {
      inventory.freeTickets--;
      this.saveInventory(inventory);
      return true;
    }
    return false;
  },

  /**
   * Get ticket count
   * @returns {number}
   */
  getTicketCount() {
    const inventory = this.loadInventory();
    return inventory.freeTickets || 0;
  },

  /**
   * Get all owned items with full details
   * @returns {Array} Array of item objects
   */
  getOwnedItems() {
    const inventory = this.loadInventory();
    const { AVATAR_ITEMS } = window.EcoVentureConfig;

    return inventory.items.map(itemId => {
      const item = AVATAR_ITEMS.find(i => i.id === itemId);
      if (item) {
        return {
          ...item,
          duplicates: inventory.duplicates[itemId] || 0
        };
      }
      return null;
    }).filter(Boolean);
  },

  /**
   * Get items filtered by type
   * @param {string} type - Item type to filter by
   * @returns {Array}
   */
  getItemsByType(type) {
    const items = this.getOwnedItems();
    if (type === 'all') return items;
    return items.filter(item => item.type === type);
  },

  /**
   * Get items sorted by criteria
   * @param {Array} items - Items to sort
   * @param {string} sortBy - Sort criteria (rarity, name, type)
   * @returns {Array}
   */
  sortItems(items, sortBy = 'rarity') {
    const rarityOrder = ['MYTHICAL', 'LEGENDARY', 'EPIC', 'RARE', 'UNCOMMON', 'COMMON'];

    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  },

  /**
   * Get inventory statistics
   * @returns {Object}
   */
  getStats() {
    const inventory = this.loadInventory();
    const items = this.getOwnedItems();
    const { AVATAR_ITEMS, RARITY_TIERS } = window.EcoVentureConfig;

    const byRarity = {};
    const byType = {};

    Object.keys(RARITY_TIERS).forEach(r => byRarity[r] = 0);

    items.forEach(item => {
      byRarity[item.rarity] = (byRarity[item.rarity] || 0) + 1;
      byType[item.type] = (byType[item.type] || 0) + 1;
    });

    return {
      totalItems: items.length,
      totalPossible: AVATAR_ITEMS.length,
      completionPercent: Math.round((items.length / AVATAR_ITEMS.length) * 100),
      byRarity,
      byType,
      totalDuplicates: Object.values(inventory.duplicates).reduce((a, b) => a + b, 0),
      totalBoxes: inventory.boxes.basic + inventory.boxes.premium + inventory.boxes.legendary,
      freeTickets: inventory.freeTickets
    };
  },

  /**
   * Convert duplicate to gems (scrapping)
   * @param {string} itemId - Item to scrap
   * @returns {number} Gems received, 0 if failed
   */
  scrapDuplicate(itemId) {
    const inventory = this.loadInventory();
    const { AVATAR_ITEMS, RARITY_TIERS } = window.EcoVentureConfig;

    if (!inventory.duplicates[itemId] || inventory.duplicates[itemId] <= 0) {
      return 0;
    }

    const item = AVATAR_ITEMS.find(i => i.id === itemId);
    if (!item) return 0;

    const gemValue = RARITY_TIERS[item.rarity]?.gemValue || 5;

    inventory.duplicates[itemId]--;
    if (inventory.duplicates[itemId] <= 0) {
      delete inventory.duplicates[itemId];
    }

    this.saveInventory(inventory);
    return gemValue;
  }
};

// Export module
window.EcoVentureInventory = InventoryModule;
