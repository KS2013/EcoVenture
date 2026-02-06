/**
 * EcoVenture Configuration
 * Global constants and settings
 */

// Recording settings
const CONFIG = {
  MAX_RECORDING_TIME: 30,
  MIN_RECORDING_TIME: 3,
  DETECTION_INTERVAL: 250, // Faster detection
  MIN_CONFIDENCE: 0.10 // Lower threshold for better detection
};

// TrashNet Local Model - TensorFlow.js based waste classification
// Uses MobileNet transfer learning for trash categories
const TRASHNET_CONFIG = {
  ENABLED: true,
  // TrashNet categories (6 classes)
  CATEGORIES: ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash'],
  // Map TrashNet categories to display names
  DISPLAY_NAMES: {
    'cardboard': 'Cardboard',
    'glass': 'Glass',
    'metal': 'Metal Can',
    'paper': 'Paper',
    'plastic': 'Plastic',
    'trash': 'General Trash'
  }
};

// TRASH ITEMS - expanded list with ALL possible COCO classes that could be trash/litter
const COCO_TRASH_CLASSES = [
  // Bottles & Containers - MOST COMMON
  'bottle', 'cup', 'wine glass', 'bowl', 'vase',
  // Food & Food Waste - expanded
  'banana', 'apple', 'orange', 'sandwich', 'hot dog', 'pizza', 'donut', 'cake', 'carrot', 'broccoli',
  // Utensils - often littered
  'fork', 'knife', 'spoon',
  // Sports & Recreation items (often left behind)
  'frisbee', 'sports ball', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'kite',
  // Bags and containers - expanded
  'handbag', 'tie', 'umbrella', 'suitcase', 'backpack',
  // Additional items that can be litter
  'scissors', 'toothbrush', 'hair drier', // personal items often discarded
  'book', // paper waste
  'clock', // electronics waste
  'remote', // electronics waste
  'cell phone', // broken phones are e-waste
  'mouse', // e-waste
  'keyboard' // e-waste
];

// TACO trash categories for specialized detection
const TACO_TRASH_CATEGORIES = [
  'Plastic bag & wrapper', 'Bottle', 'Bottle cap', 'Can', 'Carton',
  'Cup', 'Lid', 'Straw', 'Cigarette', 'Paper', 'Cardboard',
  'Plastic container', 'Plastic utensils', 'Food waste', 'Glass',
  'Metal', 'Styrofoam', 'Wrapper', 'Other plastic', 'Rope & strings',
  'Shoe', 'Squeezable tube', 'Broken glass', 'Aluminium foil',
  'Battery', 'Blister pack', 'Clear plastic bottle', 'Drink can',
  'Drink carton', 'Disposable food container', 'Disposable plastic cup',
  'Garbage bag', 'Glass bottle', 'Paper bag', 'Paper cup', 'Pizza box',
  'Plastic bottle cap', 'Plastic film', 'Plastic lid', 'Plastic straw',
  'Single-use carrier bag', 'Six pack rings', 'Styrofoam piece', 'Tissues'
];

// BIN/TRASH CAN detection - MobileNet classes that indicate bins
const BIN_CLASSES = [
  'ashcan', 'trash can', 'garbage can', 'wastebasket', 'ash bin',
  'dustbin', 'trash barrel', 'bin', 'recycling bin', 'waste container',
  'dumpster', 'litter bin', 'rubbish bin'
];

// Items to ALWAYS IGNORE - reduced list (more items now detectable as trash)
const IGNORE_CLASSES = [
  'person', // people are not trash
  'car', 'truck', 'bicycle', 'motorcycle', 'bus', 'train', 'airplane', 'boat', // vehicles
  'cat', 'dog', 'horse', 'bird', 'cow', 'sheep', 'elephant', 'bear', 'zebra', 'giraffe', // animals
  'chair', 'couch', 'bed', 'dining table', 'toilet', // furniture
  'teddy bear', 'potted plant', // household items
  'refrigerator', 'oven', 'microwave', 'sink', 'toaster', 'tv', 'monitor', 'laptop' // large appliances
];

// Level definitions
const LEVELS = [
  { name: 'Eco Beginner', icon: '🌱', minPoints: 0 },
  { name: 'Litter Picker', icon: '🧹', minPoints: 100 },
  { name: 'Trash Hunter', icon: '🎯', minPoints: 300 },
  { name: 'Green Guardian', icon: '🛡️', minPoints: 600 },
  { name: 'Eco Warrior', icon: '⚔️', minPoints: 1000 },
  { name: 'Planet Protector', icon: '🌍', minPoints: 2000 },
  { name: 'Earth Champion', icon: '🏆', minPoints: 5000 },
  { name: 'Eco Legend', icon: '👑', minPoints: 10000 }
];

// Daily challenges - rotating challenges for variety
const DAILY_CHALLENGES = [
  { id: 'collect_3', name: 'Triple Cleanup', description: 'Complete 3 trash pickups today', goal: 3, type: 'submissions', bonus: 50, icon: '🎯' },
  { id: 'earn_100', name: 'Century Club', description: 'Earn 100 points today', goal: 100, type: 'points', bonus: 30, icon: '💯' },
  { id: 'collect_5', name: 'High Five', description: 'Complete 5 trash pickups today', goal: 5, type: 'submissions', bonus: 100, icon: '✋' },
  { id: 'earn_200', name: 'Double Century', description: 'Earn 200 points today', goal: 200, type: 'points', bonus: 75, icon: '🌟' },
  { id: 'streak_3', name: 'Streak Starter', description: 'Maintain a 3-day streak', goal: 3, type: 'streak', bonus: 50, icon: '🔥' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', goal: 7, type: 'streak', bonus: 150, icon: '⚡' },
  { id: 'items_10', name: 'Item Hunter', description: 'Collect 10 different items today', goal: 10, type: 'items', bonus: 60, icon: '🔍' }
];

// ========================================
// GAMIFICATION SYSTEM CONFIGURATION
// ========================================

// Rarity tiers for avatar items
const RARITY_TIERS = {
  COMMON: {
    name: 'Common',
    color: '#9CA3AF',
    dropChance: 0.55,
    gemValue: 5
  },
  UNCOMMON: {
    name: 'Uncommon',
    color: '#22C55E',
    dropChance: 0.30,
    gemValue: 15
  },
  RARE: {
    name: 'Rare',
    color: '#3B82F6',
    dropChance: 0.13,
    gemValue: 50
  },
  EPIC: {
    name: 'Epic',
    color: '#8B5CF6',
    dropChance: 0.07,
    gemValue: 150
  },
  LEGENDARY: {
    name: 'Legendary',
    color: '#F59E0B',
    dropChance: 0.025,
    gemValue: 500
  },
  MYTHICAL: {
    name: 'Mythical',
    color: '#EC4899',
    dropChance: 0.005,
    gemValue: 2000
  }
};

// Avatar item categories
const AVATAR_ITEM_TYPES = {
  HEAD: 'head',
  FACE: 'face',
  BODY: 'body',
  BACKGROUND: 'background',
  FRAME: 'frame',
  NAMEPLATE: 'nameplate',
  EFFECT: 'effect'
};

// Loot box types
const BOX_TYPES = {
  BASIC: {
    id: 'box_basic',
    name: 'Basic Avatar Box',
    icon: '📦',
    description: 'Contains common to rare items',
    costPoints: 300,
    costGems: 0,
    dropRates: {
      COMMON: 0.55,
      UNCOMMON: 0.30,
      RARE: 0.13,
      EPIC: 0.02,
      LEGENDARY: 0,
      MYTHICAL: 0
    }
  },
  PREMIUM: {
    id: 'box_premium',
    name: 'Premium Avatar Box',
    icon: '🎁',
    description: 'Better odds for rare items!',
    costPoints: 0,
    costGems: 100,
    dropRates: {
      COMMON: 0.25,
      UNCOMMON: 0.35,
      RARE: 0.25,
      EPIC: 0.10,
      LEGENDARY: 0.04,
      MYTHICAL: 0.01
    }
  },
  LEGENDARY: {
    id: 'box_legendary',
    name: 'Legendary Avatar Box',
    icon: '✨',
    description: 'Guaranteed Epic or better!',
    costPoints: 0,
    costGems: 500,
    dropRates: {
      COMMON: 0,
      UNCOMMON: 0,
      RARE: 0.40,
      EPIC: 0.40,
      LEGENDARY: 0.15,
      MYTHICAL: 0.05
    },
    guaranteedRarity: 'EPIC'
  }
};

// ========================================
// GAMBLING / GACHA SYSTEMS
// ========================================

// Lucky Wheel Configuration
const LUCKY_WHEEL = {
  spinCost: 0, // Free daily spin
  premiumSpinCost: 50, // Gems for extra spins
  cooldown: 24 * 60 * 60 * 1000, // 24 hours
  segments: [
    { id: 'gems_5', reward: { type: 'gems', amount: 5 }, label: '5 💎', weight: 25, color: '#3B82F6' },
    { id: 'gems_10', reward: { type: 'gems', amount: 10 }, label: '10 💎', weight: 20, color: '#8B5CF6' },
    { id: 'gems_25', reward: { type: 'gems', amount: 25 }, label: '25 💎', weight: 12, color: '#EC4899' },
    { id: 'gems_50', reward: { type: 'gems', amount: 50 }, label: '50 💎', weight: 5, color: '#F59E0B' },
    { id: 'gems_100', reward: { type: 'gems', amount: 100 }, label: '100 💎', weight: 2, color: '#EF4444' },
    { id: 'points_50', reward: { type: 'points', amount: 50 }, label: '50 pts', weight: 20, color: '#22C55E' },
    { id: 'points_100', reward: { type: 'points', amount: 100 }, label: '100 pts', weight: 10, color: '#10B981' },
    { id: 'box_basic', reward: { type: 'box', boxType: 'basic' }, label: '📦', weight: 15, color: '#6B7280' },
    { id: 'box_premium', reward: { type: 'box', boxType: 'premium' }, label: '🎁', weight: 5, color: '#A855F7' },
    { id: 'jackpot', reward: { type: 'gems', amount: 500 }, label: '🎰 JACKPOT', weight: 1, color: '#FBBF24', isJackpot: true },
    { id: 'ticket', reward: { type: 'ticket', amount: 1 }, label: '🎟️', weight: 10, color: '#06B6D4' },
    { id: 'nothing', reward: { type: 'nothing' }, label: '💨', weight: 5, color: '#374151' }
  ]
};

// Pity System - Guaranteed drops after X pulls without legendary
const PITY_SYSTEM = {
  enabled: true,
  softPity: 50, // Increased legendary chance starts
  hardPity: 100, // Guaranteed legendary
  softPityMultiplier: 1.5, // Multiplier per pull after soft pity
  mythicalPity: 200, // Guaranteed mythical
  counters: ['legendary', 'mythical'] // Track separate pity counters
};

// Scratch Card Configuration
const SCRATCH_CARDS = {
  types: [
    {
      id: 'scratch_basic',
      name: 'Lucky Scratch',
      cost: 100, // points
      costType: 'points',
      icon: '🎫',
      gridSize: 9, // 3x3
      matchNeeded: 3,
      prizes: [
        { symbols: '💎💎💎', reward: { type: 'gems', amount: 20 }, chance: 0.15 },
        { symbols: '⭐⭐⭐', reward: { type: 'points', amount: 100 }, chance: 0.25 },
        { symbols: '📦📦📦', reward: { type: 'box', boxType: 'basic' }, chance: 0.10 },
        { symbols: '🎟️🎟️🎟️', reward: { type: 'ticket', amount: 2 }, chance: 0.15 },
        { symbols: '💰💰💰', reward: { type: 'gems', amount: 50 }, chance: 0.05 },
        { symbols: '❌❌❌', reward: null, chance: 0.30 }
      ]
    },
    {
      id: 'scratch_premium',
      name: 'Golden Scratch',
      cost: 25,
      costType: 'gems',
      icon: '🏆',
      gridSize: 9,
      matchNeeded: 3,
      prizes: [
        { symbols: '💎💎💎', reward: { type: 'gems', amount: 100 }, chance: 0.12 },
        { symbols: '👑👑👑', reward: { type: 'gems', amount: 250 }, chance: 0.05 },
        { symbols: '🎁🎁🎁', reward: { type: 'box', boxType: 'premium' }, chance: 0.15 },
        { symbols: '✨✨✨', reward: { type: 'box', boxType: 'legendary' }, chance: 0.03 },
        { symbols: '🌟🌟🌟', reward: { type: 'random_item', rarity: 'EPIC' }, chance: 0.10 },
        { symbols: '💫💫💫', reward: { type: 'random_item', rarity: 'LEGENDARY' }, chance: 0.02 },
        { symbols: '❌❌❌', reward: null, chance: 0.53 }
      ]
    }
  ]
};

// Mystery Box - Unknown contents until opened
const MYSTERY_BOX = {
  cost: 150,
  costType: 'gems',
  icon: '❓',
  name: 'Mystery Box',
  description: 'Could be ANYTHING!',
  possibleRewards: [
    { type: 'gems', min: 50, max: 500, weight: 30 },
    { type: 'points', min: 200, max: 1000, weight: 20 },
    { type: 'box', boxType: 'legendary', count: 1, weight: 10 },
    { type: 'box', boxType: 'premium', count: 3, weight: 15 },
    { type: 'random_item', rarity: 'LEGENDARY', weight: 5 },
    { type: 'random_item', rarity: 'MYTHICAL', weight: 1 },
    { type: 'jackpot', gems: 1000, weight: 1 },
    { type: 'bust', refund: 50, weight: 18 } // Bad luck, partial refund
  ]
};

// Duplicate Token System
const TOKEN_SYSTEM = {
  enabled: true,
  conversionRates: {
    COMMON: 1,
    UNCOMMON: 3,
    RARE: 10,
    EPIC: 30,
    LEGENDARY: 100,
    MYTHICAL: 500
  },
  tokenShop: [
    { id: 'token_basic_box', name: 'Basic Box', cost: 50, reward: { type: 'box', boxType: 'basic' }, icon: '📦' },
    { id: 'token_premium_box', name: 'Premium Box', cost: 150, reward: { type: 'box', boxType: 'premium' }, icon: '🎁' },
    { id: 'token_legendary_box', name: 'Legendary Box', cost: 500, reward: { type: 'box', boxType: 'legendary' }, icon: '✨' },
    { id: 'token_rare_item', name: 'Random Rare', cost: 100, reward: { type: 'random_item', rarity: 'RARE' }, icon: '🎲' },
    { id: 'token_epic_item', name: 'Random Epic', cost: 300, reward: { type: 'random_item', rarity: 'EPIC' }, icon: '🎰' },
    { id: 'token_legendary_item', name: 'Random Legendary', cost: 1000, reward: { type: 'random_item', rarity: 'LEGENDARY' }, icon: '👑' },
    { id: 'token_gems_50', name: '50 Gems', cost: 200, reward: { type: 'gems', amount: 50 }, icon: '💎' },
    { id: 'token_gems_200', name: '200 Gems', cost: 750, reward: { type: 'gems', amount: 200 }, icon: '💎💎' }
  ]
};

// Slot Machine Mini-Game
const SLOT_MACHINE = {
  spinCost: 10, // gems per spin
  symbols: ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣', '🎰'],
  payouts: [
    { match: ['🍒', '🍒', '🍒'], multiplier: 2, name: 'Cherries' },
    { match: ['🍋', '🍋', '🍋'], multiplier: 3, name: 'Lemons' },
    { match: ['🍊', '🍊', '🍊'], multiplier: 4, name: 'Oranges' },
    { match: ['🍇', '🍇', '🍇'], multiplier: 5, name: 'Grapes' },
    { match: ['⭐', '⭐', '⭐'], multiplier: 10, name: 'Stars' },
    { match: ['💎', '💎', '💎'], multiplier: 25, name: 'Diamonds' },
    { match: ['7️⃣', '7️⃣', '7️⃣'], multiplier: 50, name: 'Lucky 7s' },
    { match: ['🎰', '🎰', '🎰'], multiplier: 100, name: 'JACKPOT!' }
  ],
  symbolWeights: {
    '🍒': 20, '🍋': 18, '🍊': 16, '🍇': 14,
    '⭐': 10, '💎': 5, '7️⃣': 3, '🎰': 1
  }
};

// Milestone Rewards for opening boxes
const BOX_MILESTONES = [
  { boxes: 5, reward: { type: 'gems', amount: 25 }, name: 'Getting Started' },
  { boxes: 10, reward: { type: 'box', boxType: 'premium' }, name: 'Box Opener' },
  { boxes: 25, reward: { type: 'gems', amount: 100 }, name: 'Collector' },
  { boxes: 50, reward: { type: 'box', boxType: 'legendary' }, name: 'Treasure Hunter' },
  { boxes: 100, reward: { type: 'random_item', rarity: 'LEGENDARY' }, name: 'Box Master' },
  { boxes: 200, reward: { type: 'gems', amount: 500 }, name: 'Gacha Addict' },
  { boxes: 500, reward: { type: 'random_item', rarity: 'MYTHICAL' }, name: 'Legendary Collector' },
  { boxes: 1000, reward: { type: 'exclusive_title', title: 'Box God' }, name: 'Ultimate Opener' }
];

// Flash Sale System - Random pop-up deals
const FLASH_SALES = {
  enabled: true,
  checkInterval: 5 * 60 * 1000, // Check every 5 minutes
  triggerChance: 0.15, // 15% chance when checking
  duration: 10 * 60 * 1000, // 10 minute duration
  deals: [
    { id: 'flash_gems', name: 'Gem Rush!', offer: { gems: 100 }, cost: 1.99, discount: 50, icon: '💎' },
    { id: 'flash_box', name: 'Box Bonanza!', offer: { boxes: { premium: 3 } }, cost: 2.99, discount: 60, icon: '🎁' },
    { id: 'flash_legendary', name: 'Legendary Deal!', offer: { boxes: { legendary: 1 }, gems: 50 }, cost: 4.99, discount: 55, icon: '✨' },
    { id: 'flash_mega', name: 'MEGA DEAL!', offer: { gems: 500, boxes: { legendary: 2 } }, cost: 9.99, discount: 70, icon: '🔥' }
  ]
};

// ========================================
// FEATURED COSMETICS SHOP
// Direct purchase items (no gambling!)
// ========================================

// Featured items that rotate daily/weekly
const FEATURED_COSMETICS = {
  refreshInterval: 24 * 60 * 60 * 1000, // Daily refresh

  // Items available for direct gem purchase
  dailyItems: [
    // Epic Hair - 150 gems each
    { itemId: 'hair_pink', price: 150, currency: 'gems', badge: 'POPULAR' },
    { itemId: 'hair_green', price: 150, currency: 'gems' },
    { itemId: 'hair_teal', price: 150, currency: 'gems' },
    { itemId: 'hair_cyan', price: 150, currency: 'gems' },
    { itemId: 'hair_orange', price: 150, currency: 'gems' },
    { itemId: 'hair_magenta', price: 150, currency: 'gems' },

    // Epic Eyes - 120 gems each
    { itemId: 'eyes_heart', price: 120, currency: 'gems', badge: 'HOT' },
    { itemId: 'eyes_fire', price: 120, currency: 'gems' },
    { itemId: 'eyes_ice', price: 120, currency: 'gems' },
    { itemId: 'eyes_galaxy', price: 120, currency: 'gems' },
    { itemId: 'eyes_diamond', price: 120, currency: 'gems' },

    // Rare items - cheaper
    { itemId: 'eyes_star', price: 60, currency: 'gems' },
    { itemId: 'eyes_sparkle', price: 60, currency: 'gems' },
    { itemId: 'eyes_cat', price: 60, currency: 'gems' },
    { itemId: 'hair_blonde', price: 80, currency: 'gems' },
    { itemId: 'hair_silver', price: 80, currency: 'gems' },
  ],

  // How many to show at once
  dailySlots: 6
};

// Limited Time Exclusive Items (not in boxes!)
const LIMITED_ITEMS = [
  {
    id: 'limited_neon_eyes',
    itemId: 'eyes_neon',
    name: 'Neon Glow Eyes',
    description: 'LIMITED: Glowing neon eyes!',
    price: 300,
    currency: 'gems',
    icon: '👁️',
    rarity: 'LEGENDARY',
    endsIn: 3 * 24 * 60 * 60 * 1000, // 3 days
    cssClass: 'eyes-neon'
  },
  {
    id: 'limited_crystal_hair',
    itemId: 'hair_crystal',
    name: 'Crystal Hair',
    description: 'LIMITED: Shimmering crystal strands!',
    price: 350,
    currency: 'gems',
    icon: '💎',
    rarity: 'LEGENDARY',
    endsIn: 2 * 24 * 60 * 60 * 1000,
    cssClass: 'hair-long color-crystal'
  },
  {
    id: 'limited_demon_eyes',
    itemId: 'eyes_demon',
    name: 'Demon Eyes',
    description: 'LIMITED: Fiery demon gaze!',
    price: 400,
    currency: 'gems',
    icon: '😈',
    rarity: 'MYTHICAL',
    endsIn: 1 * 24 * 60 * 60 * 1000,
    cssClass: 'eyes-demon'
  },
  {
    id: 'limited_angel_halo',
    itemId: 'hat_angel_halo',
    name: 'Divine Halo',
    description: 'LIMITED: Divine glowing halo!',
    price: 500,
    currency: 'gems',
    icon: '😇',
    rarity: 'MYTHICAL',
    endsIn: 4 * 24 * 60 * 60 * 1000,
    cssClass: 'hat-angel-halo'
  },
  {
    id: 'limited_void_skin',
    itemId: 'skin_void',
    name: 'Void Skin',
    description: 'LIMITED: Skin of pure darkness!',
    price: 600,
    currency: 'gems',
    icon: '🕳️',
    rarity: 'MYTHICAL',
    endsIn: 5 * 24 * 60 * 60 * 1000,
    cssClass: 'skin-void'
  }
];

// Season Pass Items (exclusive cosmetics)
const SEASON_ITEMS = {
  currentSeason: 'Eco Warriors',
  endsIn: 30 * 24 * 60 * 60 * 1000, // 30 days
  freeTrack: [
    { level: 1, reward: { type: 'gems', amount: 10 } },
    { level: 3, reward: { type: 'item', itemId: 'eyes_determined' } },
    { level: 5, reward: { type: 'box', boxType: 'basic' } },
    { level: 7, reward: { type: 'gems', amount: 25 } },
    { level: 10, reward: { type: 'item', itemId: 'hair_short_brown' } },
    { level: 15, reward: { type: 'box', boxType: 'premium' } },
    { level: 20, reward: { type: 'gems', amount: 50 } },
  ],
  premiumTrack: [
    { level: 1, reward: { type: 'item', itemId: 'outfit_eco' } },
    { level: 3, reward: { type: 'gems', amount: 50 } },
    { level: 5, reward: { type: 'item', itemId: 'eyes_sparkle' } },
    { level: 7, reward: { type: 'box', boxType: 'premium' } },
    { level: 10, reward: { type: 'item', itemId: 'hair_green' }, exclusive: true },
    { level: 15, reward: { type: 'item', itemId: 'bg_forest' } },
    { level: 20, reward: { type: 'item', itemId: 'outfit_nature' }, exclusive: true },
    { level: 25, reward: { type: 'box', boxType: 'legendary' } },
    { level: 30, reward: { type: 'item', itemId: 'effect_leaves' }, exclusive: true },
  ],
  premiumPrice: 4.99
};

// Quest condition types
const QUEST_CONDITIONS = {
  COLLECT_TRASH: 'collect_trash',
  COLLECT_TYPE: 'collect_type',
  EARN_POINTS: 'earn_points',
  SUBMISSIONS: 'submissions',
  BIN_TRASH: 'bin_trash',
  STREAK: 'streak',
  ATTEND_CLEANUP: 'attend_cleanup',
  OPEN_BOXES: 'open_boxes'
};

// Daily quest templates
const DAILY_QUEST_TEMPLATES = [
  {
    id: 'daily_collect_1',
    title: 'Quick Pickup',
    description: 'Find and bin 1 piece of trash',
    icon: '🗑️',
    condition: { type: 'submissions', target: 1 },
    rewards: { points: 50, gems: 2 }
  },
  {
    id: 'daily_collect_3',
    title: 'Triple Threat',
    description: 'Complete 3 trash pickups',
    icon: '🎯',
    condition: { type: 'submissions', target: 3 },
    rewards: { points: 150, gems: 5 }
  },
  {
    id: 'daily_points_100',
    title: 'Century Club',
    description: 'Earn 100 points today',
    icon: '💯',
    condition: { type: 'points', target: 100 },
    rewards: { points: 50, gems: 3 }
  },
  {
    id: 'daily_plastic',
    title: 'Plastic Hunter',
    description: 'Find and dispose of 2 plastic items',
    icon: '🍾',
    condition: { type: 'collect_type', target: 2, itemType: 'plastic' },
    rewards: { points: 100, gems: 5 }
  },
  {
    id: 'daily_box',
    title: 'Lucky Day',
    description: 'Open 1 Avatar Box',
    icon: '📦',
    condition: { type: 'open_boxes', target: 1 },
    rewards: { points: 30, gems: 0 }
  }
];

// Weekly quest templates
const WEEKLY_QUEST_TEMPLATES = [
  {
    id: 'weekly_collect_10',
    title: 'Week Warrior',
    description: 'Complete 10 trash pickups this week',
    icon: '⚔️',
    condition: { type: 'submissions', target: 10 },
    rewards: { points: 500, gems: 25, boxTickets: 1 }
  },
  {
    id: 'weekly_streak_5',
    title: 'Dedication',
    description: 'Maintain a 5-day streak',
    icon: '🔥',
    condition: { type: 'streak', target: 5 },
    rewards: { points: 300, gems: 20 }
  },
  {
    id: 'weekly_points_500',
    title: 'High Scorer',
    description: 'Earn 500 points this week',
    icon: '🏆',
    condition: { type: 'points', target: 500 },
    rewards: { points: 200, gems: 15, boxTickets: 1 }
  },
  {
    id: 'weekly_cleanup',
    title: 'Community Hero',
    description: 'Attend a community cleanup event',
    icon: '🌍',
    condition: { type: 'attend_cleanup', target: 1 },
    rewards: { points: 500, gems: 50, boxTickets: 2 }
  }
];

// Gem pack prices (for IAP)
const GEM_PACKS = [
  { id: 'gems_starter', name: 'Starter Pack', gems: 100, price: 0.99, icon: '💎' },
  { id: 'gems_value', name: 'Value Pack', gems: 500, bonusBoxes: { premium: 1 }, price: 4.99, icon: '💎💎', badge: 'POPULAR' },
  { id: 'gems_mega', name: 'Mega Pack', gems: 1200, bonusBoxes: { premium: 3 }, price: 9.99, icon: '💎💎💎', badge: 'BEST VALUE' },
  { id: 'gems_ultimate', name: 'Ultimate Pack', gems: 3000, bonusBoxes: { legendary: 1 }, price: 19.99, icon: '👑', badge: 'ULTIMATE' }
];

// Avatar items catalog - CSS-based character system
const AVATAR_ITEMS = [
  // ============================================
  // === SKIN TONES (always free/common) ===
  // ============================================
  { id: 'skin_light', name: 'Light', type: 'skin', rarity: 'COMMON', cssClass: 'skin-light', preview: '🧑🏻', description: 'Light skin tone' },
  { id: 'skin_fair', name: 'Fair', type: 'skin', rarity: 'COMMON', cssClass: 'skin-fair', preview: '🧑🏼', description: 'Fair skin tone' },
  { id: 'skin_medium', name: 'Medium', type: 'skin', rarity: 'COMMON', cssClass: 'skin-medium', preview: '🧑🏽', description: 'Medium skin tone' },
  { id: 'skin_tan', name: 'Tan', type: 'skin', rarity: 'COMMON', cssClass: 'skin-tan', preview: '🧑🏾', description: 'Tan skin tone' },
  { id: 'skin_brown', name: 'Brown', type: 'skin', rarity: 'COMMON', cssClass: 'skin-brown', preview: '🧑🏾', description: 'Brown skin tone' },
  { id: 'skin_dark', name: 'Dark', type: 'skin', rarity: 'COMMON', cssClass: 'skin-dark', preview: '🧑🏿', description: 'Dark skin tone' },
  // Fantasy skins
  { id: 'skin_pale', name: 'Porcelain', type: 'skin', rarity: 'UNCOMMON', cssClass: 'skin-pale', preview: '🤍', description: 'Pale porcelain skin' },
  { id: 'skin_olive', name: 'Olive', type: 'skin', rarity: 'UNCOMMON', cssClass: 'skin-olive', preview: '🫒', description: 'Mediterranean olive tone' },
  { id: 'skin_rosy', name: 'Rosy', type: 'skin', rarity: 'UNCOMMON', cssClass: 'skin-rosy', preview: '🌸', description: 'Warm rosy complexion' },
  { id: 'skin_golden', name: 'Golden', type: 'skin', rarity: 'RARE', cssClass: 'skin-golden', preview: '✨', description: 'Sun-kissed golden glow' },
  { id: 'skin_blue', name: 'Ocean Blue', type: 'skin', rarity: 'EPIC', cssClass: 'skin-blue', preview: '💙', description: 'Mystical blue skin' },
  { id: 'skin_green', name: 'Forest Green', type: 'skin', rarity: 'EPIC', cssClass: 'skin-green', preview: '💚', description: 'Nature spirit green' },
  { id: 'skin_purple', name: 'Mystic Purple', type: 'skin', rarity: 'LEGENDARY', cssClass: 'skin-purple', preview: '💜', description: 'Enchanted purple skin' },
  { id: 'skin_rainbow', name: 'Prismatic', type: 'skin', rarity: 'MYTHICAL', cssClass: 'skin-rainbow', preview: '🌈', description: 'Shimmering rainbow skin' },

  // EXCLUSIVE - Shop Only (not in boxes!)
  { id: 'skin_void', name: 'Void Skin', type: 'skin', rarity: 'MYTHICAL', cssClass: 'skin-void', preview: '🕳️', description: 'EXCLUSIVE: Skin of pure darkness!', exclusive: true },

  // ============================================
  // === HAIR STYLES ===
  // ============================================
  // Common - Basic styles & natural colors
  { id: 'hair_short_black', name: 'Short Black', type: 'hair', rarity: 'COMMON', cssClass: 'hair-short color-black', preview: '💇', description: 'Classic short hairstyle' },
  { id: 'hair_short_brown', name: 'Short Brown', type: 'hair', rarity: 'COMMON', cssClass: 'hair-short color-brown', preview: '💇', description: 'Classic short brown hair' },
  { id: 'hair_long_brown', name: 'Long Brown', type: 'hair', rarity: 'COMMON', cssClass: 'hair-long color-brown', preview: '👩', description: 'Flowing long hair' },
  { id: 'hair_long_black', name: 'Long Black', type: 'hair', rarity: 'COMMON', cssClass: 'hair-long color-black', preview: '👩', description: 'Elegant long black hair' },
  { id: 'hair_buzz_black', name: 'Buzz Cut', type: 'hair', rarity: 'COMMON', cssClass: 'hair-buzz color-black', preview: '👨', description: 'Clean buzz cut' },
  { id: 'hair_buzz_brown', name: 'Buzz Brown', type: 'hair', rarity: 'COMMON', cssClass: 'hair-buzz color-brown', preview: '👨', description: 'Brown buzz cut' },
  { id: 'hair_medium_black', name: 'Medium Black', type: 'hair', rarity: 'COMMON', cssClass: 'hair-medium color-black', preview: '🧑', description: 'Medium length black hair' },
  { id: 'hair_medium_brown', name: 'Medium Brown', type: 'hair', rarity: 'COMMON', cssClass: 'hair-medium color-brown', preview: '🧑', description: 'Medium length brown hair' },

  // Uncommon - Different styles
  { id: 'hair_spiky', name: 'Spiky Black', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-spiky color-black', preview: '🦔', description: 'Edgy spiky style' },
  { id: 'hair_spiky_brown', name: 'Spiky Brown', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-spiky color-brown', preview: '🦔', description: 'Brown spiky style' },
  { id: 'hair_curly', name: 'Curly Black', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-curly color-black', preview: '🌀', description: 'Beautiful black curls' },
  { id: 'hair_curly_brown', name: 'Curly Brown', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-curly color-brown', preview: '🌀', description: 'Lovely brown curls' },
  { id: 'hair_ponytail', name: 'Ponytail Black', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-ponytail color-black', preview: '🎀', description: 'Sporty black ponytail' },
  { id: 'hair_ponytail_brown', name: 'Ponytail Brown', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-ponytail color-brown', preview: '🎀', description: 'Cute brown ponytail' },
  { id: 'hair_bun', name: 'Bun Black', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-bun color-black', preview: '🍡', description: 'Neat black bun' },
  { id: 'hair_bun_brown', name: 'Bun Brown', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-bun color-brown', preview: '🍡', description: 'Elegant brown bun' },
  { id: 'hair_wavy', name: 'Wavy Black', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-wavy color-black', preview: '〰️', description: 'Wavy black locks' },
  { id: 'hair_wavy_brown', name: 'Wavy Brown', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-wavy color-brown', preview: '〰️', description: 'Wavy brown locks' },
  { id: 'hair_braids', name: 'Braids Black', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-braids color-black', preview: '🎗️', description: 'Stylish black braids' },
  { id: 'hair_mohawk', name: 'Mohawk Black', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-mohawk color-black', preview: '🤘', description: 'Punk mohawk style' },
  { id: 'hair_afro', name: 'Afro Black', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-afro color-black', preview: '⚫', description: 'Classic afro style' },
  { id: 'hair_afro_brown', name: 'Afro Brown', type: 'hair', rarity: 'UNCOMMON', cssClass: 'hair-afro color-brown', preview: '🟤', description: 'Brown afro style' },

  // Rare - Blonde & unique styles
  { id: 'hair_blonde', name: 'Long Blonde', type: 'hair', rarity: 'RARE', cssClass: 'hair-long color-blonde', preview: '👱', description: 'Golden blonde locks' },
  { id: 'hair_blonde_short', name: 'Short Blonde', type: 'hair', rarity: 'RARE', cssClass: 'hair-short color-blonde', preview: '👱', description: 'Short golden hair' },
  { id: 'hair_blonde_curly', name: 'Curly Blonde', type: 'hair', rarity: 'RARE', cssClass: 'hair-curly color-blonde', preview: '👱‍♀️', description: 'Curly golden locks' },
  { id: 'hair_blue', name: 'Blue Spiky', type: 'hair', rarity: 'RARE', cssClass: 'hair-spiky color-blue', preview: '💙', description: 'Cool blue spikes' },
  { id: 'hair_blue_long', name: 'Long Blue', type: 'hair', rarity: 'RARE', cssClass: 'hair-long color-blue', preview: '💙', description: 'Flowing blue hair' },
  { id: 'hair_red', name: 'Red Long', type: 'hair', rarity: 'RARE', cssClass: 'hair-long color-red', preview: '❤️', description: 'Fiery red locks' },
  { id: 'hair_red_short', name: 'Red Short', type: 'hair', rarity: 'RARE', cssClass: 'hair-short color-red', preview: '❤️', description: 'Bold red short hair' },
  { id: 'hair_red_curly', name: 'Red Curly', type: 'hair', rarity: 'RARE', cssClass: 'hair-curly color-red', preview: '❤️', description: 'Fiery red curls' },
  { id: 'hair_ginger', name: 'Ginger Long', type: 'hair', rarity: 'RARE', cssClass: 'hair-long color-ginger', preview: '🧡', description: 'Natural ginger hair' },
  { id: 'hair_silver', name: 'Silver Long', type: 'hair', rarity: 'RARE', cssClass: 'hair-long color-silver', preview: '🩶', description: 'Sleek silver hair' },
  { id: 'hair_silver_short', name: 'Silver Short', type: 'hair', rarity: 'RARE', cssClass: 'hair-short color-silver', preview: '🩶', description: 'Distinguished silver' },
  { id: 'hair_ombre', name: 'Ombre Brown', type: 'hair', rarity: 'RARE', cssClass: 'hair-long color-ombre', preview: '🎨', description: 'Gradient ombre style' },
  { id: 'hair_twintails', name: 'Twin Tails', type: 'hair', rarity: 'RARE', cssClass: 'hair-twintails color-black', preview: '🎀', description: 'Cute twin tails' },
  { id: 'hair_twintails_blonde', name: 'Blonde Twintails', type: 'hair', rarity: 'RARE', cssClass: 'hair-twintails color-blonde', preview: '🎀', description: 'Adorable blonde twin tails' },

  // Epic - Vibrant colors
  { id: 'hair_pink', name: 'Pink Long', type: 'hair', rarity: 'EPIC', cssClass: 'hair-long color-pink', preview: '💗', description: 'Vibrant pink hair' },
  { id: 'hair_pink_short', name: 'Pink Short', type: 'hair', rarity: 'EPIC', cssClass: 'hair-short color-pink', preview: '💗', description: 'Cute pink pixie' },
  { id: 'hair_pink_curly', name: 'Pink Curly', type: 'hair', rarity: 'EPIC', cssClass: 'hair-curly color-pink', preview: '💗', description: 'Bouncy pink curls' },
  { id: 'hair_green', name: 'Green Long', type: 'hair', rarity: 'EPIC', cssClass: 'hair-long color-green', preview: '💚', description: 'Eco-friendly green hair' },
  { id: 'hair_green_curly', name: 'Green Curly', type: 'hair', rarity: 'EPIC', cssClass: 'hair-curly color-green', preview: '💚', description: 'Nature green curls' },
  { id: 'hair_green_spiky', name: 'Green Spiky', type: 'hair', rarity: 'EPIC', cssClass: 'hair-spiky color-green', preview: '💚', description: 'Punk green spikes' },
  { id: 'hair_teal', name: 'Teal Long', type: 'hair', rarity: 'EPIC', cssClass: 'hair-long color-teal', preview: '🩵', description: 'Ocean teal waves' },
  { id: 'hair_orange', name: 'Orange Spiky', type: 'hair', rarity: 'EPIC', cssClass: 'hair-spiky color-orange', preview: '🧡', description: 'Bright orange spikes' },
  { id: 'hair_orange_long', name: 'Orange Long', type: 'hair', rarity: 'EPIC', cssClass: 'hair-long color-orange', preview: '🧡', description: 'Vibrant orange locks' },
  { id: 'hair_cyan', name: 'Cyan Long', type: 'hair', rarity: 'EPIC', cssClass: 'hair-long color-cyan', preview: '💠', description: 'Electric cyan hair' },
  { id: 'hair_neon_green', name: 'Neon Green', type: 'hair', rarity: 'EPIC', cssClass: 'hair-spiky color-neon-green', preview: '🟢', description: 'Glowing neon green' },
  { id: 'hair_magenta', name: 'Magenta Long', type: 'hair', rarity: 'EPIC', cssClass: 'hair-long color-magenta', preview: '🩷', description: 'Bold magenta hair' },

  // Legendary - Special styles
  { id: 'hair_purple', name: 'Purple Long', type: 'hair', rarity: 'LEGENDARY', cssClass: 'hair-long color-purple', preview: '💜', description: 'Majestic purple locks' },
  { id: 'hair_purple_short', name: 'Purple Short', type: 'hair', rarity: 'LEGENDARY', cssClass: 'hair-short color-purple', preview: '💜', description: 'Royal purple pixie' },
  { id: 'hair_galaxy', name: 'Galaxy Hair', type: 'hair', rarity: 'LEGENDARY', cssClass: 'hair-long color-galaxy', preview: '🌌', description: 'Starry galaxy hair' },
  { id: 'hair_flame', name: 'Flame Hair', type: 'hair', rarity: 'LEGENDARY', cssClass: 'hair-spiky color-flame', preview: '🔥', description: 'Hair made of fire' },
  { id: 'hair_ice', name: 'Ice Crystal', type: 'hair', rarity: 'LEGENDARY', cssClass: 'hair-long color-ice', preview: '❄️', description: 'Frozen crystal hair' },
  { id: 'hair_sunset', name: 'Sunset Gradient', type: 'hair', rarity: 'LEGENDARY', cssClass: 'hair-long color-sunset', preview: '🌅', description: 'Orange to pink gradient' },
  { id: 'hair_ocean', name: 'Ocean Waves', type: 'hair', rarity: 'LEGENDARY', cssClass: 'hair-wavy color-ocean', preview: '🌊', description: 'Deep sea blue waves' },
  { id: 'hair_aurora', name: 'Aurora Hair', type: 'hair', rarity: 'LEGENDARY', cssClass: 'hair-long color-aurora', preview: '🎇', description: 'Northern lights hair' },

  // Mythical - Ultimate styles
  { id: 'hair_white', name: 'Ethereal White', type: 'hair', rarity: 'MYTHICAL', cssClass: 'hair-long color-white', preview: '🤍', description: 'Otherworldly silver-white hair' },
  { id: 'hair_rainbow', name: 'Rainbow Flow', type: 'hair', rarity: 'MYTHICAL', cssClass: 'hair-long color-rainbow', preview: '🌈', description: 'All colors of the rainbow' },
  { id: 'hair_void', name: 'Void Black', type: 'hair', rarity: 'MYTHICAL', cssClass: 'hair-long color-void', preview: '🕳️', description: 'Absorbs all light' },
  { id: 'hair_golden', name: 'Pure Gold', type: 'hair', rarity: 'MYTHICAL', cssClass: 'hair-long color-gold', preview: '👑', description: 'Hair of pure gold' },
  { id: 'hair_holographic', name: 'Holographic', type: 'hair', rarity: 'MYTHICAL', cssClass: 'hair-long color-holo', preview: '✨', description: 'Shifts through all colors' },
  { id: 'hair_starlight', name: 'Starlight', type: 'hair', rarity: 'MYTHICAL', cssClass: 'hair-long color-starlight', preview: '⭐', description: 'Woven from starlight' },

  // EXCLUSIVE - Shop Only (not in boxes!)
  { id: 'hair_crystal', name: 'Crystal Hair', type: 'hair', rarity: 'LEGENDARY', cssClass: 'hair-long color-crystal', preview: '💎', description: 'EXCLUSIVE: Hair made of pure crystal!', exclusive: true },

  // ============================================
  // === EYES ===
  // ============================================
  // Common
  { id: 'eyes_normal', name: 'Normal', type: 'eyes', rarity: 'COMMON', cssClass: '', preview: '👁️', description: 'Standard eyes' },
  { id: 'eyes_happy', name: 'Happy', type: 'eyes', rarity: 'COMMON', cssClass: 'eyes-happy', preview: '😊', description: 'Cheerful expression' },
  { id: 'eyes_closed', name: 'Closed', type: 'eyes', rarity: 'COMMON', cssClass: 'eyes-closed', preview: '😌', description: 'Peaceful closed eyes' },
  { id: 'eyes_determined', name: 'Determined', type: 'eyes', rarity: 'COMMON', cssClass: 'eyes-determined', preview: '😤', description: 'Focused determination' },
  { id: 'eyes_relaxed', name: 'Relaxed', type: 'eyes', rarity: 'COMMON', cssClass: 'eyes-relaxed', preview: '😎', description: 'Chill relaxed look' },

  // Uncommon
  { id: 'eyes_wink', name: 'Wink', type: 'eyes', rarity: 'UNCOMMON', cssClass: 'eyes-wink', preview: '😉', description: 'Playful wink' },
  { id: 'eyes_cool', name: 'Cool', type: 'eyes', rarity: 'UNCOMMON', cssClass: 'eyes-cool', preview: '😎', description: 'Cool blue eyes' },
  { id: 'eyes_surprised', name: 'Surprised', type: 'eyes', rarity: 'UNCOMMON', cssClass: 'eyes-surprised', preview: '😲', description: 'Wide surprised eyes' },
  { id: 'eyes_sleepy', name: 'Sleepy', type: 'eyes', rarity: 'UNCOMMON', cssClass: 'eyes-sleepy', preview: '😴', description: 'Drowsy tired eyes' },
  { id: 'eyes_angry', name: 'Angry', type: 'eyes', rarity: 'UNCOMMON', cssClass: 'eyes-angry', preview: '😠', description: 'Fierce angry eyes' },
  { id: 'eyes_sad', name: 'Sad', type: 'eyes', rarity: 'UNCOMMON', cssClass: 'eyes-sad', preview: '😢', description: 'Tearful sad eyes' },
  { id: 'eyes_confident', name: 'Confident', type: 'eyes', rarity: 'UNCOMMON', cssClass: 'eyes-confident', preview: '😏', description: 'Self-assured gaze' },
  { id: 'eyes_curious', name: 'Curious', type: 'eyes', rarity: 'UNCOMMON', cssClass: 'eyes-curious', preview: '🤔', description: 'Inquisitive look' },

  // Rare
  { id: 'eyes_star', name: 'Starry', type: 'eyes', rarity: 'RARE', cssClass: 'eyes-star', preview: '🤩', description: 'Eyes full of stars' },
  { id: 'eyes_sparkle', name: 'Sparkle', type: 'eyes', rarity: 'RARE', cssClass: 'eyes-sparkle', preview: '✨', description: 'Sparkling anime eyes' },
  { id: 'eyes_cat', name: 'Cat Eyes', type: 'eyes', rarity: 'RARE', cssClass: 'eyes-cat', preview: '🐱', description: 'Feline slit pupils' },
  { id: 'eyes_heterochromia', name: 'Heterochromia', type: 'eyes', rarity: 'RARE', cssClass: 'eyes-hetero', preview: '👁️‍🗨️', description: 'Two different colors' },
  { id: 'eyes_green', name: 'Emerald', type: 'eyes', rarity: 'RARE', cssClass: 'eyes-green', preview: '💚', description: 'Deep emerald green' },
  { id: 'eyes_gold', name: 'Golden', type: 'eyes', rarity: 'RARE', cssClass: 'eyes-gold', preview: '🌟', description: 'Striking golden eyes' },
  { id: 'eyes_purple', name: 'Violet', type: 'eyes', rarity: 'RARE', cssClass: 'eyes-purple', preview: '💜', description: 'Mysterious violet' },

  // Epic
  { id: 'eyes_heart', name: 'Heart Eyes', type: 'eyes', rarity: 'EPIC', cssClass: 'eyes-heart', preview: '😍', description: 'Love in your eyes' },
  { id: 'eyes_fire', name: 'Flame Eyes', type: 'eyes', rarity: 'EPIC', cssClass: 'eyes-fire', preview: '🔥', description: 'Eyes of burning fire' },
  { id: 'eyes_ice', name: 'Frost Eyes', type: 'eyes', rarity: 'EPIC', cssClass: 'eyes-ice', preview: '❄️', description: 'Icy cold stare' },
  { id: 'eyes_galaxy', name: 'Galaxy Eyes', type: 'eyes', rarity: 'EPIC', cssClass: 'eyes-galaxy', preview: '🌌', description: 'Contains the cosmos' },
  { id: 'eyes_spiral', name: 'Hypnotic', type: 'eyes', rarity: 'EPIC', cssClass: 'eyes-spiral', preview: '🌀', description: 'Mesmerizing spirals' },
  { id: 'eyes_crying', name: 'Tears of Joy', type: 'eyes', rarity: 'EPIC', cssClass: 'eyes-crying', preview: '😂', description: 'Happy tears streaming' },
  { id: 'eyes_diamond', name: 'Diamond', type: 'eyes', rarity: 'EPIC', cssClass: 'eyes-diamond', preview: '💎', description: 'Crystalline diamond eyes' },

  // Legendary
  { id: 'eyes_rainbow', name: 'Rainbow', type: 'eyes', rarity: 'LEGENDARY', cssClass: 'eyes-rainbow', preview: '🌈', description: 'Color-shifting rainbow' },
  { id: 'eyes_cyber', name: 'Cybernetic', type: 'eyes', rarity: 'LEGENDARY', cssClass: 'eyes-cyber', preview: '🤖', description: 'High-tech cyber eyes' },
  { id: 'eyes_eclipse', name: 'Eclipse', type: 'eyes', rarity: 'LEGENDARY', cssClass: 'eyes-eclipse', preview: '🌑', description: 'Solar eclipse pupils' },
  { id: 'eyes_sharingan', name: 'Crimson Wheel', type: 'eyes', rarity: 'LEGENDARY', cssClass: 'eyes-sharingan', preview: '🔴', description: 'Ancient power awakened' },
  { id: 'eyes_moon', name: 'Moonlit', type: 'eyes', rarity: 'LEGENDARY', cssClass: 'eyes-moon', preview: '🌙', description: 'Glowing moon eyes' },

  // Mythical
  { id: 'eyes_void', name: 'Void Gaze', type: 'eyes', rarity: 'MYTHICAL', cssClass: 'eyes-void', preview: '🕳️', description: 'Endless void within' },
  { id: 'eyes_omniscient', name: 'All-Seeing', type: 'eyes', rarity: 'MYTHICAL', cssClass: 'eyes-omniscient', preview: '👁️', description: 'Sees all that exists' },
  { id: 'eyes_divine', name: 'Divine Light', type: 'eyes', rarity: 'MYTHICAL', cssClass: 'eyes-divine', preview: '✝️', description: 'Blessed divine glow' },

  // EXCLUSIVE - Shop Only (not in boxes!)
  { id: 'eyes_neon', name: 'Neon Glow Eyes', type: 'eyes', rarity: 'LEGENDARY', cssClass: 'eyes-neon', preview: '💡', description: 'EXCLUSIVE: Eyes that glow with neon light!', exclusive: true },
  { id: 'eyes_demon', name: 'Demon Eyes', type: 'eyes', rarity: 'LEGENDARY', cssClass: 'eyes-demon', preview: '😈', description: 'EXCLUSIVE: Fiery demon eyes!', exclusive: true },

  // ============================================
  // === MOUTH ===
  // ============================================
  // Common
  { id: 'mouth_smile', name: 'Smile', type: 'mouth', rarity: 'COMMON', cssClass: 'mouth-smile', preview: '😊', description: 'Friendly smile' },
  { id: 'mouth_grin', name: 'Big Grin', type: 'mouth', rarity: 'COMMON', cssClass: 'mouth-grin', preview: '😄', description: 'Big happy grin' },
  { id: 'mouth_neutral', name: 'Neutral', type: 'mouth', rarity: 'COMMON', cssClass: 'mouth-neutral', preview: '😐', description: 'Calm neutral expression' },
  { id: 'mouth_slight', name: 'Slight Smile', type: 'mouth', rarity: 'COMMON', cssClass: 'mouth-slight', preview: '🙂', description: 'Subtle pleasant smile' },

  // Uncommon
  { id: 'mouth_open', name: 'Surprised', type: 'mouth', rarity: 'UNCOMMON', cssClass: 'mouth-open', preview: '😮', description: 'Surprised expression' },
  { id: 'mouth_smirk', name: 'Smirk', type: 'mouth', rarity: 'UNCOMMON', cssClass: 'mouth-smirk', preview: '😏', description: 'Confident smirk' },
  { id: 'mouth_laugh', name: 'Laughing', type: 'mouth', rarity: 'UNCOMMON', cssClass: 'mouth-laugh', preview: '😆', description: 'Big laugh' },
  { id: 'mouth_frown', name: 'Frown', type: 'mouth', rarity: 'UNCOMMON', cssClass: 'mouth-frown', preview: '🙁', description: 'Slight frown' },
  { id: 'mouth_pout', name: 'Pout', type: 'mouth', rarity: 'UNCOMMON', cssClass: 'mouth-pout', preview: '😤', description: 'Cute pouty lips' },
  { id: 'mouth_excited', name: 'Excited', type: 'mouth', rarity: 'UNCOMMON', cssClass: 'mouth-excited', preview: '🤩', description: 'Super excited expression' },
  { id: 'mouth_whistle', name: 'Whistle', type: 'mouth', rarity: 'UNCOMMON', cssClass: 'mouth-whistle', preview: '😗', description: 'Whistling lips' },
  { id: 'mouth_teeth', name: 'Toothy Grin', type: 'mouth', rarity: 'UNCOMMON', cssClass: 'mouth-teeth', preview: '😁', description: 'Showing teeth' },

  // Rare
  { id: 'mouth_cat', name: 'Cat Mouth', type: 'mouth', rarity: 'RARE', cssClass: 'mouth-cat', preview: '😺', description: 'Cute cat-like mouth' },
  { id: 'mouth_fangs', name: 'Fangs', type: 'mouth', rarity: 'RARE', cssClass: 'mouth-fangs', preview: '🧛', description: 'Vampire fangs' },
  { id: 'mouth_tongue', name: 'Tongue Out', type: 'mouth', rarity: 'RARE', cssClass: 'mouth-tongue', preview: '😛', description: 'Playful tongue' },
  { id: 'mouth_kiss', name: 'Kiss', type: 'mouth', rarity: 'RARE', cssClass: 'mouth-kiss', preview: '😘', description: 'Blowing a kiss' },
  { id: 'mouth_determined', name: 'Determined', type: 'mouth', rarity: 'RARE', cssClass: 'mouth-determined', preview: '😬', description: 'Gritting teeth' },
  { id: 'mouth_derp', name: 'Derp', type: 'mouth', rarity: 'RARE', cssClass: 'mouth-derp', preview: '🤪', description: 'Silly derp face' },

  // Epic
  { id: 'mouth_fire', name: 'Fire Breath', type: 'mouth', rarity: 'EPIC', cssClass: 'mouth-fire', preview: '🔥', description: 'Breathing fire' },
  { id: 'mouth_bubble', name: 'Bubble Gum', type: 'mouth', rarity: 'EPIC', cssClass: 'mouth-bubble', preview: '🫧', description: 'Blowing bubble gum' },
  { id: 'mouth_rainbow', name: 'Rainbow Smile', type: 'mouth', rarity: 'EPIC', cssClass: 'mouth-rainbow', preview: '🌈', description: 'Colorful rainbow smile' },
  { id: 'mouth_drool', name: 'Drooling', type: 'mouth', rarity: 'EPIC', cssClass: 'mouth-drool', preview: '🤤', description: 'Drooling with desire' },
  { id: 'mouth_zipper', name: 'Zipped', type: 'mouth', rarity: 'EPIC', cssClass: 'mouth-zipper', preview: '🤐', description: 'Lips are sealed' },

  // Legendary
  { id: 'mouth_void', name: 'Void Maw', type: 'mouth', rarity: 'LEGENDARY', cssClass: 'mouth-void', preview: '🕳️', description: 'Endless darkness within' },
  { id: 'mouth_diamond', name: 'Diamond Smile', type: 'mouth', rarity: 'LEGENDARY', cssClass: 'mouth-diamond', preview: '💎', description: 'Teeth of pure diamond' },
  { id: 'mouth_galaxy', name: 'Cosmic Smile', type: 'mouth', rarity: 'LEGENDARY', cssClass: 'mouth-galaxy', preview: '🌌', description: 'Stars in your smile' },

  // Mythical
  { id: 'mouth_golden', name: 'Golden Lips', type: 'mouth', rarity: 'MYTHICAL', cssClass: 'mouth-golden', preview: '👑', description: 'Lips of pure gold' },
  { id: 'mouth_aurora', name: 'Aurora Smile', type: 'mouth', rarity: 'MYTHICAL', cssClass: 'mouth-aurora', preview: '🎇', description: 'Northern lights in a smile' },

  // ============================================
  // === ACCESSORIES ===
  // ============================================
  // Common
  { id: 'acc_glasses', name: 'Glasses', type: 'accessory', rarity: 'COMMON', cssClass: 'acc-glasses', preview: '👓', description: 'Classic spectacles' },
  { id: 'acc_earring_stud', name: 'Stud Earring', type: 'accessory', rarity: 'COMMON', cssClass: 'acc-earring-stud', preview: '💫', description: 'Simple stud earring' },
  { id: 'acc_bandaid', name: 'Band-Aid', type: 'accessory', rarity: 'COMMON', cssClass: 'acc-bandaid', preview: '🩹', description: 'Cute band-aid' },
  { id: 'acc_freckles', name: 'Freckles', type: 'accessory', rarity: 'COMMON', cssClass: 'acc-freckles', preview: '🔴', description: 'Adorable freckles' },

  // Uncommon
  { id: 'acc_sunglasses', name: 'Sunglasses', type: 'accessory', rarity: 'UNCOMMON', cssClass: 'acc-sunglasses', preview: '🕶️', description: 'Cool shades' },
  { id: 'acc_earring_hoop', name: 'Hoop Earring', type: 'accessory', rarity: 'UNCOMMON', cssClass: 'acc-earring-hoop', preview: '⭕', description: 'Golden hoop earring' },
  { id: 'acc_blush', name: 'Blush', type: 'accessory', rarity: 'UNCOMMON', cssClass: 'acc-blush', preview: '🌸', description: 'Rosy cheek blush' },
  { id: 'acc_beauty_mark', name: 'Beauty Mark', type: 'accessory', rarity: 'UNCOMMON', cssClass: 'acc-beauty-mark', preview: '⚫', description: 'Classic beauty mark' },
  { id: 'acc_necklace', name: 'Simple Necklace', type: 'accessory', rarity: 'UNCOMMON', cssClass: 'acc-necklace', preview: '📿', description: 'Delicate necklace' },
  { id: 'acc_scarf', name: 'Scarf', type: 'accessory', rarity: 'UNCOMMON', cssClass: 'acc-scarf', preview: '🧣', description: 'Cozy scarf' },
  { id: 'acc_headphones', name: 'Headphones', type: 'accessory', rarity: 'UNCOMMON', cssClass: 'acc-headphones', preview: '🎧', description: 'Music headphones' },
  { id: 'acc_nose_ring', name: 'Nose Ring', type: 'accessory', rarity: 'UNCOMMON', cssClass: 'acc-nose-ring', preview: '💍', description: 'Small nose ring' },

  // Rare
  { id: 'acc_monocle', name: 'Monocle', type: 'accessory', rarity: 'RARE', cssClass: 'acc-monocle', preview: '🧐', description: 'Fancy monocle' },
  { id: 'acc_eyepatch', name: 'Eyepatch', type: 'accessory', rarity: 'RARE', cssClass: 'acc-eyepatch', preview: '🏴‍☠️', description: 'Pirate eyepatch' },
  { id: 'acc_scar', name: 'Battle Scar', type: 'accessory', rarity: 'RARE', cssClass: 'acc-scar', preview: '⚔️', description: 'Cool battle scar' },
  { id: 'acc_teardrop', name: 'Tear Tattoo', type: 'accessory', rarity: 'RARE', cssClass: 'acc-teardrop', preview: '💧', description: 'Teardrop marking' },
  { id: 'acc_face_paint', name: 'War Paint', type: 'accessory', rarity: 'RARE', cssClass: 'acc-face-paint', preview: '🎨', description: 'Tribal face paint' },
  { id: 'acc_bandana_face', name: 'Face Bandana', type: 'accessory', rarity: 'RARE', cssClass: 'acc-bandana-face', preview: '🥷', description: 'Ninja face cover' },
  { id: 'acc_piercing', name: 'Facial Piercing', type: 'accessory', rarity: 'RARE', cssClass: 'acc-piercing', preview: '📌', description: 'Edgy piercing' },
  { id: 'acc_goggles', name: 'Goggles', type: 'accessory', rarity: 'RARE', cssClass: 'acc-goggles', preview: '🥽', description: 'Steampunk goggles' },
  { id: 'acc_heart_cheek', name: 'Heart Cheeks', type: 'accessory', rarity: 'RARE', cssClass: 'acc-heart-cheek', preview: '💕', description: 'Heart-shaped blush' },

  // Epic
  { id: 'acc_mask', name: 'Eco Mask', type: 'accessory', rarity: 'EPIC', cssClass: 'acc-mask', preview: '😷', description: 'Environmental protection mask' },
  { id: 'acc_robot_eye', name: 'Cyber Eye', type: 'accessory', rarity: 'EPIC', cssClass: 'acc-robot-eye', preview: '🤖', description: 'Robotic eye implant' },
  { id: 'acc_third_eye', name: 'Third Eye', type: 'accessory', rarity: 'EPIC', cssClass: 'acc-third-eye', preview: '👁️', description: 'Mystical third eye' },
  { id: 'acc_star_cheeks', name: 'Star Cheeks', type: 'accessory', rarity: 'EPIC', cssClass: 'acc-star-cheeks', preview: '⭐', description: 'Starry cheek marks' },
  { id: 'acc_crystal', name: 'Face Crystal', type: 'accessory', rarity: 'EPIC', cssClass: 'acc-crystal', preview: '💎', description: 'Embedded crystal gem' },
  { id: 'acc_glowing_marks', name: 'Glowing Marks', type: 'accessory', rarity: 'EPIC', cssClass: 'acc-glowing-marks', preview: '✨', description: 'Magical glowing markings' },
  { id: 'acc_vr_visor', name: 'VR Visor', type: 'accessory', rarity: 'EPIC', cssClass: 'acc-vr-visor', preview: '🎮', description: 'Virtual reality headset' },
  { id: 'acc_mask_phantom', name: 'Phantom Mask', type: 'accessory', rarity: 'EPIC', cssClass: 'acc-mask-phantom', preview: '🎭', description: 'Half-face phantom mask' },

  // Legendary
  { id: 'acc_golden_mask', name: 'Golden Mask', type: 'accessory', rarity: 'LEGENDARY', cssClass: 'acc-golden-mask', preview: '👑', description: 'Mask of pure gold' },
  { id: 'acc_dragon_marks', name: 'Dragon Marks', type: 'accessory', rarity: 'LEGENDARY', cssClass: 'acc-dragon-marks', preview: '🐉', description: 'Ancient dragon tattoos' },
  { id: 'acc_angelic', name: 'Angelic Glow', type: 'accessory', rarity: 'LEGENDARY', cssClass: 'acc-angelic', preview: '😇', description: 'Divine light around face' },
  { id: 'acc_demon', name: 'Demon Marks', type: 'accessory', rarity: 'LEGENDARY', cssClass: 'acc-demon', preview: '😈', description: 'Dark demonic markings' },
  { id: 'acc_electric', name: 'Electric Marks', type: 'accessory', rarity: 'LEGENDARY', cssClass: 'acc-electric', preview: '⚡', description: 'Lightning bolt marks' },

  // Mythical
  { id: 'acc_cosmic_marks', name: 'Cosmic Marks', type: 'accessory', rarity: 'MYTHICAL', cssClass: 'acc-cosmic-marks', preview: '🌌', description: 'Marks of the cosmos' },
  { id: 'acc_rainbow_face', name: 'Rainbow Glow', type: 'accessory', rarity: 'MYTHICAL', cssClass: 'acc-rainbow-face', preview: '🌈', description: 'Prismatic face glow' },
  { id: 'acc_divine_marks', name: 'Divine Marks', type: 'accessory', rarity: 'MYTHICAL', cssClass: 'acc-divine-marks', preview: '✝️', description: 'Blessed holy markings' },

  // ============================================
  // === HATS ===
  // ============================================
  // Common
  { id: 'hat_cap', name: 'Baseball Cap', type: 'hat', rarity: 'COMMON', cssClass: 'hat-cap', preview: '🧢', description: 'Casual baseball cap' },
  { id: 'hat_beanie', name: 'Beanie', type: 'hat', rarity: 'COMMON', cssClass: 'hat-beanie', preview: '🧶', description: 'Cozy knit beanie' },
  { id: 'hat_headband', name: 'Headband', type: 'hat', rarity: 'COMMON', cssClass: 'hat-headband', preview: '💫', description: 'Simple headband' },
  { id: 'hat_bandana', name: 'Bandana', type: 'hat', rarity: 'COMMON', cssClass: 'hat-bandana', preview: '🎀', description: 'Cool bandana' },
  { id: 'hat_bow', name: 'Hair Bow', type: 'hat', rarity: 'COMMON', cssClass: 'hat-bow', preview: '🎀', description: 'Cute hair bow' },

  // Uncommon
  { id: 'hat_leaves', name: 'Leaf Crown', type: 'hat', rarity: 'UNCOMMON', cssClass: 'hat-leaves', preview: '🌿', description: 'Nature crown' },
  { id: 'hat_flower', name: 'Flower Crown', type: 'hat', rarity: 'UNCOMMON', cssClass: 'hat-flower', preview: '🌸', description: 'Pretty flower crown' },
  { id: 'hat_bucket', name: 'Bucket Hat', type: 'hat', rarity: 'UNCOMMON', cssClass: 'hat-bucket', preview: '👒', description: 'Trendy bucket hat' },
  { id: 'hat_cowboy', name: 'Cowboy Hat', type: 'hat', rarity: 'UNCOMMON', cssClass: 'hat-cowboy', preview: '🤠', description: 'Yee-haw cowboy hat' },
  { id: 'hat_beret', name: 'Beret', type: 'hat', rarity: 'UNCOMMON', cssClass: 'hat-beret', preview: '🎨', description: 'Artist beret' },
  { id: 'hat_fedora', name: 'Fedora', type: 'hat', rarity: 'UNCOMMON', cssClass: 'hat-fedora', preview: '🎩', description: 'Classic fedora' },
  { id: 'hat_visor', name: 'Sun Visor', type: 'hat', rarity: 'UNCOMMON', cssClass: 'hat-visor', preview: '⛳', description: 'Sporty sun visor' },
  { id: 'hat_chef', name: 'Chef Hat', type: 'hat', rarity: 'UNCOMMON', cssClass: 'hat-chef', preview: '👨‍🍳', description: 'Professional chef hat' },
  { id: 'hat_party', name: 'Party Hat', type: 'hat', rarity: 'UNCOMMON', cssClass: 'hat-party', preview: '🥳', description: 'Festive party hat' },

  // Rare
  { id: 'hat_tophat', name: 'Top Hat', type: 'hat', rarity: 'RARE', cssClass: 'hat-tophat', preview: '🎩', description: 'Classy top hat' },
  { id: 'hat_pirate', name: 'Pirate Hat', type: 'hat', rarity: 'RARE', cssClass: 'hat-pirate', preview: '🏴‍☠️', description: 'Arrr matey!' },
  { id: 'hat_wizard', name: 'Wizard Hat', type: 'hat', rarity: 'RARE', cssClass: 'hat-wizard', preview: '🧙', description: 'Magical wizard hat' },
  { id: 'hat_witch', name: 'Witch Hat', type: 'hat', rarity: 'RARE', cssClass: 'hat-witch', preview: '🧹', description: 'Spooky witch hat' },
  { id: 'hat_viking', name: 'Viking Helm', type: 'hat', rarity: 'RARE', cssClass: 'hat-viking', preview: '⚔️', description: 'Nordic warrior helm' },
  { id: 'hat_samurai', name: 'Samurai Helm', type: 'hat', rarity: 'RARE', cssClass: 'hat-samurai', preview: '⚔️', description: 'Ancient samurai kabuto' },
  { id: 'hat_cat_ears', name: 'Cat Ears', type: 'hat', rarity: 'RARE', cssClass: 'hat-cat-ears', preview: '🐱', description: 'Cute cat ears' },
  { id: 'hat_bunny_ears', name: 'Bunny Ears', type: 'hat', rarity: 'RARE', cssClass: 'hat-bunny-ears', preview: '🐰', description: 'Fluffy bunny ears' },
  { id: 'hat_antlers', name: 'Antlers', type: 'hat', rarity: 'RARE', cssClass: 'hat-antlers', preview: '🦌', description: 'Majestic deer antlers' },
  { id: 'hat_santa', name: 'Santa Hat', type: 'hat', rarity: 'RARE', cssClass: 'hat-santa', preview: '🎅', description: 'Festive Santa hat' },
  { id: 'hat_graduation', name: 'Graduation Cap', type: 'hat', rarity: 'RARE', cssClass: 'hat-graduation', preview: '🎓', description: 'Scholar cap' },

  // Epic
  { id: 'hat_halo', name: 'Halo', type: 'hat', rarity: 'EPIC', cssClass: 'hat-halo', preview: '😇', description: 'Angelic halo' },
  { id: 'hat_wolf_ears', name: 'Wolf Ears', type: 'hat', rarity: 'EPIC', cssClass: 'hat-wolf-ears', preview: '🐺', description: 'Fierce wolf ears' },
  { id: 'hat_fox_ears', name: 'Fox Ears', type: 'hat', rarity: 'EPIC', cssClass: 'hat-fox-ears', preview: '🦊', description: 'Clever fox ears' },
  { id: 'hat_knight', name: 'Knight Helm', type: 'hat', rarity: 'EPIC', cssClass: 'hat-knight', preview: '⚔️', description: 'Medieval knight helmet' },
  { id: 'hat_astronaut', name: 'Space Helmet', type: 'hat', rarity: 'EPIC', cssClass: 'hat-astronaut', preview: '👨‍🚀', description: 'Astronaut helmet' },
  { id: 'hat_pilot', name: 'Pilot Cap', type: 'hat', rarity: 'EPIC', cssClass: 'hat-pilot', preview: '✈️', description: 'Aviator pilot cap' },
  { id: 'hat_tiara', name: 'Tiara', type: 'hat', rarity: 'EPIC', cssClass: 'hat-tiara', preview: '👸', description: 'Princess tiara' },
  { id: 'hat_laurel', name: 'Laurel Wreath', type: 'hat', rarity: 'EPIC', cssClass: 'hat-laurel', preview: '🏆', description: 'Champion wreath' },
  { id: 'hat_ninja', name: 'Ninja Hood', type: 'hat', rarity: 'EPIC', cssClass: 'hat-ninja', preview: '🥷', description: 'Stealthy ninja hood' },
  { id: 'hat_flame', name: 'Flaming Hair', type: 'hat', rarity: 'EPIC', cssClass: 'hat-flame', preview: '🔥', description: 'Hair made of flames' },

  // Legendary
  { id: 'hat_crown', name: 'Royal Crown', type: 'hat', rarity: 'LEGENDARY', cssClass: 'hat-crown', preview: '👑', description: 'Crown fit for eco royalty' },
  { id: 'hat_dragon', name: 'Dragon Helm', type: 'hat', rarity: 'LEGENDARY', cssClass: 'hat-dragon', preview: '🐉', description: 'Fearsome dragon helm' },
  { id: 'hat_phoenix', name: 'Phoenix Plume', type: 'hat', rarity: 'LEGENDARY', cssClass: 'hat-phoenix', preview: '🔥', description: 'Legendary phoenix feathers' },
  { id: 'hat_ice_crown', name: 'Ice Crown', type: 'hat', rarity: 'LEGENDARY', cssClass: 'hat-ice-crown', preview: '❄️', description: 'Frozen ice crown' },
  { id: 'hat_thunder', name: 'Thunder Crown', type: 'hat', rarity: 'LEGENDARY', cssClass: 'hat-thunder', preview: '⚡', description: 'Crackling with lightning' },
  { id: 'hat_nature', name: 'Nature Spirit', type: 'hat', rarity: 'LEGENDARY', cssClass: 'hat-nature', preview: '🌳', description: 'Living tree crown' },
  { id: 'hat_galaxy', name: 'Galaxy Crown', type: 'hat', rarity: 'LEGENDARY', cssClass: 'hat-galaxy', preview: '🌌', description: 'Crown of stars' },

  // Mythical
  { id: 'hat_horns', name: 'Devil Horns', type: 'hat', rarity: 'MYTHICAL', cssClass: 'hat-horns', preview: '😈', description: 'Mischievous horns' },
  { id: 'hat_ethereal', name: 'Ethereal Crown', type: 'hat', rarity: 'MYTHICAL', cssClass: 'hat-ethereal', preview: '✨', description: 'Made of pure light' },
  { id: 'hat_void', name: 'Void Crown', type: 'hat', rarity: 'MYTHICAL', cssClass: 'hat-void', preview: '🕳️', description: 'Crown of darkness' },
  { id: 'hat_divine', name: 'Divine Aureole', type: 'hat', rarity: 'MYTHICAL', cssClass: 'hat-divine', preview: '☀️', description: 'Blessed divine light' },
  { id: 'hat_reality', name: 'Reality Crown', type: 'hat', rarity: 'MYTHICAL', cssClass: 'hat-reality', preview: '🔮', description: 'Bends reality itself' },

  // EXCLUSIVE - Shop Only (not in boxes!)
  { id: 'hat_angel_halo', name: 'Divine Halo', type: 'hat', rarity: 'MYTHICAL', cssClass: 'hat-angel-halo', preview: '👼', description: 'EXCLUSIVE: A true angel\'s halo!', exclusive: true },

  // ============================================
  // === OUTFITS ===
  // ============================================
  // Common
  { id: 'outfit_tshirt', name: 'Green Tee', type: 'outfit', rarity: 'COMMON', cssClass: 'outfit-tshirt', preview: '👕', description: 'Simple green t-shirt' },
  { id: 'outfit_hoodie', name: 'Gray Hoodie', type: 'outfit', rarity: 'COMMON', cssClass: 'outfit-hoodie', preview: '🧥', description: 'Comfortable hoodie' },
  { id: 'outfit_tshirt_blue', name: 'Blue Tee', type: 'outfit', rarity: 'COMMON', cssClass: 'outfit-tshirt-blue', preview: '👕', description: 'Casual blue t-shirt' },
  { id: 'outfit_tshirt_red', name: 'Red Tee', type: 'outfit', rarity: 'COMMON', cssClass: 'outfit-tshirt-red', preview: '👕', description: 'Bold red t-shirt' },
  { id: 'outfit_tshirt_white', name: 'White Tee', type: 'outfit', rarity: 'COMMON', cssClass: 'outfit-tshirt-white', preview: '👕', description: 'Clean white t-shirt' },
  { id: 'outfit_sweater', name: 'Cozy Sweater', type: 'outfit', rarity: 'COMMON', cssClass: 'outfit-sweater', preview: '🧶', description: 'Warm knit sweater' },

  // Uncommon
  { id: 'outfit_eco', name: 'Eco Warrior', type: 'outfit', rarity: 'UNCOMMON', cssClass: 'outfit-eco', preview: '🌱', description: 'Green eco outfit' },
  { id: 'outfit_jacket', name: 'Denim Jacket', type: 'outfit', rarity: 'UNCOMMON', cssClass: 'outfit-jacket', preview: '🧥', description: 'Classic denim jacket' },
  { id: 'outfit_vest', name: 'Cool Vest', type: 'outfit', rarity: 'UNCOMMON', cssClass: 'outfit-vest', preview: '🦺', description: 'Stylish vest' },
  { id: 'outfit_polo', name: 'Polo Shirt', type: 'outfit', rarity: 'UNCOMMON', cssClass: 'outfit-polo', preview: '👔', description: 'Smart casual polo' },
  { id: 'outfit_jersey', name: 'Sports Jersey', type: 'outfit', rarity: 'UNCOMMON', cssClass: 'outfit-jersey', preview: '🏃', description: 'Athletic jersey' },
  { id: 'outfit_flannel', name: 'Flannel Shirt', type: 'outfit', rarity: 'UNCOMMON', cssClass: 'outfit-flannel', preview: '🪵', description: 'Plaid flannel shirt' },
  { id: 'outfit_cardigan', name: 'Cardigan', type: 'outfit', rarity: 'UNCOMMON', cssClass: 'outfit-cardigan', preview: '🧶', description: 'Soft cardigan' },
  { id: 'outfit_tank', name: 'Tank Top', type: 'outfit', rarity: 'UNCOMMON', cssClass: 'outfit-tank', preview: '💪', description: 'Athletic tank top' },

  // Rare
  { id: 'outfit_ranger', name: 'Park Ranger', type: 'outfit', rarity: 'RARE', cssClass: 'outfit-ranger', preview: '🏕️', description: 'Official ranger uniform' },
  { id: 'outfit_hero', name: 'Hero Cape', type: 'outfit', rarity: 'RARE', cssClass: 'outfit-hero', preview: '🦸', description: 'Superhero attire' },
  { id: 'outfit_scientist', name: 'Lab Coat', type: 'outfit', rarity: 'RARE', cssClass: 'outfit-scientist', preview: '🔬', description: 'Scientific lab coat' },
  { id: 'outfit_chef', name: 'Chef Uniform', type: 'outfit', rarity: 'RARE', cssClass: 'outfit-chef', preview: '👨‍🍳', description: 'Professional chef attire' },
  { id: 'outfit_pirate', name: 'Pirate Garb', type: 'outfit', rarity: 'RARE', cssClass: 'outfit-pirate', preview: '🏴‍☠️', description: 'Swashbuckler outfit' },
  { id: 'outfit_viking', name: 'Viking Tunic', type: 'outfit', rarity: 'RARE', cssClass: 'outfit-viking', preview: '⚔️', description: 'Norse warrior garb' },
  { id: 'outfit_kimono', name: 'Kimono', type: 'outfit', rarity: 'RARE', cssClass: 'outfit-kimono', preview: '🎎', description: 'Traditional kimono' },
  { id: 'outfit_toga', name: 'Toga', type: 'outfit', rarity: 'RARE', cssClass: 'outfit-toga', preview: '🏛️', description: 'Ancient Roman toga' },
  { id: 'outfit_ninja', name: 'Ninja Suit', type: 'outfit', rarity: 'RARE', cssClass: 'outfit-ninja', preview: '🥷', description: 'Stealthy ninja garb' },
  { id: 'outfit_sailor', name: 'Sailor Uniform', type: 'outfit', rarity: 'RARE', cssClass: 'outfit-sailor', preview: '⚓', description: 'Naval sailor outfit' },
  { id: 'outfit_punk', name: 'Punk Jacket', type: 'outfit', rarity: 'RARE', cssClass: 'outfit-punk', preview: '🤘', description: 'Rebellious punk style' },

  // Epic
  { id: 'outfit_suit', name: 'Formal Suit', type: 'outfit', rarity: 'EPIC', cssClass: 'outfit-suit', preview: '🤵', description: 'Sharp formal wear' },
  { id: 'outfit_cosmic', name: 'Cosmic Robe', type: 'outfit', rarity: 'EPIC', cssClass: 'outfit-cosmic', preview: '🌌', description: 'Starry cosmic outfit' },
  { id: 'outfit_knight', name: 'Knight Armor', type: 'outfit', rarity: 'EPIC', cssClass: 'outfit-knight', preview: '⚔️', description: 'Medieval knight armor' },
  { id: 'outfit_samurai', name: 'Samurai Armor', type: 'outfit', rarity: 'EPIC', cssClass: 'outfit-samurai', preview: '🗡️', description: 'Ancient samurai yoroi' },
  { id: 'outfit_wizard', name: 'Wizard Robe', type: 'outfit', rarity: 'EPIC', cssClass: 'outfit-wizard', preview: '🧙', description: 'Magical wizard robes' },
  { id: 'outfit_astronaut', name: 'Space Suit', type: 'outfit', rarity: 'EPIC', cssClass: 'outfit-astronaut', preview: '👨‍🚀', description: 'Astronaut space suit' },
  { id: 'outfit_royalty', name: 'Royal Attire', type: 'outfit', rarity: 'EPIC', cssClass: 'outfit-royalty', preview: '👑', description: 'Noble royal clothing' },
  { id: 'outfit_cyber', name: 'Cyber Suit', type: 'outfit', rarity: 'EPIC', cssClass: 'outfit-cyber', preview: '🤖', description: 'Futuristic cyber armor' },
  { id: 'outfit_steampunk', name: 'Steampunk', type: 'outfit', rarity: 'EPIC', cssClass: 'outfit-steampunk', preview: '⚙️', description: 'Victorian steampunk gear' },
  { id: 'outfit_angel', name: 'Angelic Robes', type: 'outfit', rarity: 'EPIC', cssClass: 'outfit-angel', preview: '😇', description: 'Divine angel attire' },
  { id: 'outfit_demon', name: 'Demon Garb', type: 'outfit', rarity: 'EPIC', cssClass: 'outfit-demon', preview: '😈', description: 'Dark demon outfit' },

  // Legendary
  { id: 'outfit_gold', name: 'Golden Armor', type: 'outfit', rarity: 'LEGENDARY', cssClass: 'outfit-gold', preview: '⚔️', description: 'Legendary golden armor' },
  { id: 'outfit_dragon', name: 'Dragon Scale', type: 'outfit', rarity: 'LEGENDARY', cssClass: 'outfit-dragon', preview: '🐉', description: 'Dragon scale armor' },
  { id: 'outfit_phoenix', name: 'Phoenix Garb', type: 'outfit', rarity: 'LEGENDARY', cssClass: 'outfit-phoenix', preview: '🔥', description: 'Flaming phoenix outfit' },
  { id: 'outfit_ice', name: 'Ice Armor', type: 'outfit', rarity: 'LEGENDARY', cssClass: 'outfit-ice', preview: '❄️', description: 'Frozen ice armor' },
  { id: 'outfit_lightning', name: 'Storm Armor', type: 'outfit', rarity: 'LEGENDARY', cssClass: 'outfit-lightning', preview: '⚡', description: 'Crackling storm armor' },
  { id: 'outfit_nature', name: 'Nature Guardian', type: 'outfit', rarity: 'LEGENDARY', cssClass: 'outfit-nature', preview: '🌳', description: 'Living nature armor' },
  { id: 'outfit_galaxy', name: 'Galaxy Robe', type: 'outfit', rarity: 'LEGENDARY', cssClass: 'outfit-galaxy', preview: '🌌', description: 'Woven from stars' },
  { id: 'outfit_emperor', name: 'Emperor Robes', type: 'outfit', rarity: 'LEGENDARY', cssClass: 'outfit-emperor', preview: '👑', description: 'Imperial ruler attire' },

  // Mythical
  { id: 'outfit_divine', name: 'Divine Raiment', type: 'outfit', rarity: 'MYTHICAL', cssClass: 'outfit-divine', preview: '✨', description: 'Blessed divine clothing' },
  { id: 'outfit_void', name: 'Void Armor', type: 'outfit', rarity: 'MYTHICAL', cssClass: 'outfit-void', preview: '🕳️', description: 'Armor of pure darkness' },
  { id: 'outfit_reality', name: 'Reality Weave', type: 'outfit', rarity: 'MYTHICAL', cssClass: 'outfit-reality', preview: '🔮', description: 'Shifts through dimensions' },
  { id: 'outfit_prismatic', name: 'Prismatic Armor', type: 'outfit', rarity: 'MYTHICAL', cssClass: 'outfit-prismatic', preview: '🌈', description: 'All colors at once' },
  { id: 'outfit_ethereal', name: 'Ethereal Form', type: 'outfit', rarity: 'MYTHICAL', cssClass: 'outfit-ethereal', preview: '👻', description: 'Made of pure energy' },

  // Exclusive - Starter Pack only
  { id: 'outfit_eco_hero', name: 'Eco Hero Cape', type: 'outfit', rarity: 'LEGENDARY', cssClass: 'outfit-eco-hero', preview: '🦸', description: 'EXCLUSIVE: Hero cape for true eco warriors!' },

  // ============================================
  // === BACKGROUNDS ===
  // ============================================
  // Common
  { id: 'bg_default', name: 'Default', type: 'background', rarity: 'COMMON', cssClass: '', preview: '🔵', description: 'Classic gradient' },
  { id: 'bg_forest', name: 'Forest', type: 'background', rarity: 'COMMON', cssClass: 'bg-forest', preview: '🌲', description: 'Peaceful green' },
  { id: 'bg_ocean', name: 'Ocean', type: 'background', rarity: 'COMMON', cssClass: 'bg-ocean', preview: '🌊', description: 'Calm ocean blue' },
  { id: 'bg_sky', name: 'Clear Sky', type: 'background', rarity: 'COMMON', cssClass: 'bg-sky', preview: '☁️', description: 'Bright blue sky' },
  { id: 'bg_grass', name: 'Meadow', type: 'background', rarity: 'COMMON', cssClass: 'bg-grass', preview: '🌿', description: 'Green meadow' },
  { id: 'bg_sand', name: 'Desert', type: 'background', rarity: 'COMMON', cssClass: 'bg-sand', preview: '🏜️', description: 'Sandy desert' },

  // Uncommon
  { id: 'bg_sunset', name: 'Sunset', type: 'background', rarity: 'UNCOMMON', cssClass: 'bg-sunset', preview: '🌅', description: 'Beautiful sunset' },
  { id: 'bg_night', name: 'Night Sky', type: 'background', rarity: 'UNCOMMON', cssClass: 'bg-night', preview: '🌙', description: 'Starry night' },
  { id: 'bg_sunrise', name: 'Sunrise', type: 'background', rarity: 'UNCOMMON', cssClass: 'bg-sunrise', preview: '🌄', description: 'Dawn breaking' },
  { id: 'bg_clouds', name: 'Cloudscape', type: 'background', rarity: 'UNCOMMON', cssClass: 'bg-clouds', preview: '☁️', description: 'Fluffy clouds' },
  { id: 'bg_rain', name: 'Rainy Day', type: 'background', rarity: 'UNCOMMON', cssClass: 'bg-rain', preview: '🌧️', description: 'Gentle rainfall' },
  { id: 'bg_snow', name: 'Snowy', type: 'background', rarity: 'UNCOMMON', cssClass: 'bg-snow', preview: '❄️', description: 'Winter wonderland' },
  { id: 'bg_autumn', name: 'Autumn', type: 'background', rarity: 'UNCOMMON', cssClass: 'bg-autumn', preview: '🍂', description: 'Fall foliage' },
  { id: 'bg_spring', name: 'Spring', type: 'background', rarity: 'UNCOMMON', cssClass: 'bg-spring', preview: '🌸', description: 'Cherry blossoms' },
  { id: 'bg_cave', name: 'Cave', type: 'background', rarity: 'UNCOMMON', cssClass: 'bg-cave', preview: '🦇', description: 'Dark cave' },
  { id: 'bg_mountain', name: 'Mountain', type: 'background', rarity: 'UNCOMMON', cssClass: 'bg-mountain', preview: '🏔️', description: 'Mountain peaks' },

  // Rare
  { id: 'bg_fire', name: 'Fire', type: 'background', rarity: 'RARE', cssClass: 'bg-fire', preview: '🔥', description: 'Blazing flames' },
  { id: 'bg_ice', name: 'Ice', type: 'background', rarity: 'RARE', cssClass: 'bg-ice', preview: '❄️', description: 'Frozen tundra' },
  { id: 'bg_lightning', name: 'Storm', type: 'background', rarity: 'RARE', cssClass: 'bg-lightning', preview: '⚡', description: 'Lightning storm' },
  { id: 'bg_jungle', name: 'Jungle', type: 'background', rarity: 'RARE', cssClass: 'bg-jungle', preview: '🌴', description: 'Dense jungle' },
  { id: 'bg_underwater', name: 'Underwater', type: 'background', rarity: 'RARE', cssClass: 'bg-underwater', preview: '🐠', description: 'Deep underwater' },
  { id: 'bg_volcano', name: 'Volcano', type: 'background', rarity: 'RARE', cssClass: 'bg-volcano', preview: '🌋', description: 'Active volcano' },
  { id: 'bg_crystal', name: 'Crystal Cave', type: 'background', rarity: 'RARE', cssClass: 'bg-crystal', preview: '💎', description: 'Glittering crystals' },
  { id: 'bg_city', name: 'City Night', type: 'background', rarity: 'RARE', cssClass: 'bg-city', preview: '🌃', description: 'City skyline' },
  { id: 'bg_bamboo', name: 'Bamboo Forest', type: 'background', rarity: 'RARE', cssClass: 'bg-bamboo', preview: '🎋', description: 'Peaceful bamboo' },
  { id: 'bg_castle', name: 'Castle', type: 'background', rarity: 'RARE', cssClass: 'bg-castle', preview: '🏰', description: 'Grand castle' },

  // Epic
  { id: 'bg_aurora', name: 'Aurora', type: 'background', rarity: 'EPIC', cssClass: 'bg-aurora', preview: '🌌', description: 'Northern lights' },
  { id: 'bg_nebula', name: 'Nebula', type: 'background', rarity: 'EPIC', cssClass: 'bg-nebula', preview: '🌌', description: 'Cosmic nebula' },
  { id: 'bg_plasma', name: 'Plasma', type: 'background', rarity: 'EPIC', cssClass: 'bg-plasma', preview: '⚡', description: 'Electric plasma' },
  { id: 'bg_cherry', name: 'Sakura Storm', type: 'background', rarity: 'EPIC', cssClass: 'bg-cherry', preview: '🌸', description: 'Falling cherry blossoms' },
  { id: 'bg_neon', name: 'Neon City', type: 'background', rarity: 'EPIC', cssClass: 'bg-neon', preview: '💜', description: 'Cyberpunk neon' },
  { id: 'bg_enchanted', name: 'Enchanted', type: 'background', rarity: 'EPIC', cssClass: 'bg-enchanted', preview: '✨', description: 'Magical sparkles' },
  { id: 'bg_spirit', name: 'Spirit World', type: 'background', rarity: 'EPIC', cssClass: 'bg-spirit', preview: '👻', description: 'Ethereal dimension' },
  { id: 'bg_lava', name: 'Lava Flow', type: 'background', rarity: 'EPIC', cssClass: 'bg-lava', preview: '🔥', description: 'Molten lava' },
  { id: 'bg_arctic', name: 'Arctic', type: 'background', rarity: 'EPIC', cssClass: 'bg-arctic', preview: '🐧', description: 'Frozen arctic' },
  { id: 'bg_heaven', name: 'Heaven', type: 'background', rarity: 'EPIC', cssClass: 'bg-heaven', preview: '☁️', description: 'Heavenly clouds' },

  // Legendary
  { id: 'bg_galaxy', name: 'Galaxy', type: 'background', rarity: 'LEGENDARY', cssClass: 'bg-galaxy', preview: '🪐', description: 'Cosmic galaxy' },
  { id: 'bg_black_hole', name: 'Black Hole', type: 'background', rarity: 'LEGENDARY', cssClass: 'bg-blackhole', preview: '🕳️', description: 'Event horizon' },
  { id: 'bg_supernova', name: 'Supernova', type: 'background', rarity: 'LEGENDARY', cssClass: 'bg-supernova', preview: '💥', description: 'Exploding star' },
  { id: 'bg_dragon_lair', name: 'Dragon Lair', type: 'background', rarity: 'LEGENDARY', cssClass: 'bg-dragon-lair', preview: '🐉', description: 'Dragon treasure' },
  { id: 'bg_throne', name: 'Throne Room', type: 'background', rarity: 'LEGENDARY', cssClass: 'bg-throne', preview: '👑', description: 'Royal throne room' },
  { id: 'bg_valhalla', name: 'Valhalla', type: 'background', rarity: 'LEGENDARY', cssClass: 'bg-valhalla', preview: '⚔️', description: 'Hall of heroes' },
  { id: 'bg_olympus', name: 'Olympus', type: 'background', rarity: 'LEGENDARY', cssClass: 'bg-olympus', preview: '⚡', description: 'Home of gods' },
  { id: 'bg_matrix', name: 'Digital Matrix', type: 'background', rarity: 'LEGENDARY', cssClass: 'bg-matrix', preview: '💻', description: 'Digital rain' },

  // Mythical
  { id: 'bg_void', name: 'The Void', type: 'background', rarity: 'MYTHICAL', cssClass: 'bg-void', preview: '🕳️', description: 'Endless nothingness' },
  { id: 'bg_creation', name: 'Creation', type: 'background', rarity: 'MYTHICAL', cssClass: 'bg-creation', preview: '✨', description: 'Birth of universe' },
  { id: 'bg_rainbow_dimension', name: 'Prism Realm', type: 'background', rarity: 'MYTHICAL', cssClass: 'bg-rainbow-dim', preview: '🌈', description: 'All colors infinite' },
  { id: 'bg_eternity', name: 'Eternity', type: 'background', rarity: 'MYTHICAL', cssClass: 'bg-eternity', preview: '♾️', description: 'Beyond time itself' },
  { id: 'bg_paradise', name: 'Paradise', type: 'background', rarity: 'MYTHICAL', cssClass: 'bg-paradise', preview: '🏝️', description: 'Perfect paradise' },

  // ============================================
  // === FRAMES ===
  // ============================================
  // Common
  { id: 'frame_simple', name: 'Simple', type: 'frame', rarity: 'COMMON', cssClass: 'frame-simple', preview: '⬜', description: 'Clean simple frame' },
  { id: 'frame_thin', name: 'Thin Border', type: 'frame', rarity: 'COMMON', cssClass: 'frame-thin', preview: '▫️', description: 'Minimal thin frame' },
  { id: 'frame_rounded', name: 'Rounded', type: 'frame', rarity: 'COMMON', cssClass: 'frame-rounded', preview: '⚪', description: 'Soft rounded corners' },

  // Uncommon
  { id: 'frame_nature', name: 'Nature', type: 'frame', rarity: 'UNCOMMON', cssClass: 'frame-nature', preview: '🌿', description: 'Green nature border' },
  { id: 'frame_wood', name: 'Wooden', type: 'frame', rarity: 'UNCOMMON', cssClass: 'frame-wood', preview: '🪵', description: 'Rustic wood frame' },
  { id: 'frame_ocean', name: 'Ocean', type: 'frame', rarity: 'UNCOMMON', cssClass: 'frame-ocean', preview: '🌊', description: 'Wave pattern frame' },
  { id: 'frame_hearts', name: 'Hearts', type: 'frame', rarity: 'UNCOMMON', cssClass: 'frame-hearts', preview: '💕', description: 'Loving heart frame' },
  { id: 'frame_stars', name: 'Stars', type: 'frame', rarity: 'UNCOMMON', cssClass: 'frame-stars', preview: '⭐', description: 'Starry frame' },
  { id: 'frame_cute', name: 'Kawaii', type: 'frame', rarity: 'UNCOMMON', cssClass: 'frame-cute', preview: '🎀', description: 'Cute kawaii frame' },

  // Rare
  { id: 'frame_fire', name: 'Fire', type: 'frame', rarity: 'RARE', cssClass: 'frame-fire', preview: '🔥', description: 'Fiery border' },
  { id: 'frame_ice', name: 'Ice', type: 'frame', rarity: 'RARE', cssClass: 'frame-ice', preview: '❄️', description: 'Frozen ice frame' },
  { id: 'frame_lightning', name: 'Electric', type: 'frame', rarity: 'RARE', cssClass: 'frame-lightning', preview: '⚡', description: 'Electric sparks' },
  { id: 'frame_vines', name: 'Vine', type: 'frame', rarity: 'RARE', cssClass: 'frame-vines', preview: '🌱', description: 'Growing vines' },
  { id: 'frame_cherry', name: 'Sakura', type: 'frame', rarity: 'RARE', cssClass: 'frame-cherry', preview: '🌸', description: 'Cherry blossom frame' },
  { id: 'frame_skull', name: 'Skull', type: 'frame', rarity: 'RARE', cssClass: 'frame-skull', preview: '💀', description: 'Edgy skull frame' },
  { id: 'frame_tribal', name: 'Tribal', type: 'frame', rarity: 'RARE', cssClass: 'frame-tribal', preview: '🔱', description: 'Tribal patterns' },
  { id: 'frame_steampunk', name: 'Steampunk', type: 'frame', rarity: 'RARE', cssClass: 'frame-steampunk', preview: '⚙️', description: 'Gears and cogs' },

  // Epic
  { id: 'frame_cosmic', name: 'Cosmic', type: 'frame', rarity: 'EPIC', cssClass: 'frame-cosmic', preview: '✨', description: 'Pulsing cosmic frame' },
  { id: 'frame_neon', name: 'Neon', type: 'frame', rarity: 'EPIC', cssClass: 'frame-neon', preview: '💜', description: 'Glowing neon lights' },
  { id: 'frame_crystal', name: 'Crystal', type: 'frame', rarity: 'EPIC', cssClass: 'frame-crystal', preview: '💎', description: 'Crystalline frame' },
  { id: 'frame_dragon', name: 'Dragon', type: 'frame', rarity: 'EPIC', cssClass: 'frame-dragon', preview: '🐉', description: 'Dragon scale border' },
  { id: 'frame_angel', name: 'Angelic', type: 'frame', rarity: 'EPIC', cssClass: 'frame-angel', preview: '😇', description: 'Heavenly glow' },
  { id: 'frame_demon', name: 'Demonic', type: 'frame', rarity: 'EPIC', cssClass: 'frame-demon', preview: '😈', description: 'Dark flames' },
  { id: 'frame_tech', name: 'Tech', type: 'frame', rarity: 'EPIC', cssClass: 'frame-tech', preview: '🤖', description: 'Futuristic tech' },
  { id: 'frame_aurora', name: 'Aurora', type: 'frame', rarity: 'EPIC', cssClass: 'frame-aurora', preview: '🎇', description: 'Northern lights' },

  // Legendary
  { id: 'frame_gold', name: 'Gold', type: 'frame', rarity: 'LEGENDARY', cssClass: 'frame-gold', preview: '👑', description: 'Prestigious gold frame' },
  { id: 'frame_diamond', name: 'Diamond', type: 'frame', rarity: 'LEGENDARY', cssClass: 'frame-diamond', preview: '💎', description: 'Diamond encrusted' },
  { id: 'frame_phoenix', name: 'Phoenix', type: 'frame', rarity: 'LEGENDARY', cssClass: 'frame-phoenix', preview: '🔥', description: 'Rising phoenix flames' },
  { id: 'frame_galaxy', name: 'Galaxy', type: 'frame', rarity: 'LEGENDARY', cssClass: 'frame-galaxy', preview: '🌌', description: 'Swirling galaxy' },
  { id: 'frame_royal', name: 'Royal', type: 'frame', rarity: 'LEGENDARY', cssClass: 'frame-royal', preview: '👑', description: 'Fit for royalty' },
  { id: 'frame_void', name: 'Void', type: 'frame', rarity: 'LEGENDARY', cssClass: 'frame-void', preview: '🕳️', description: 'Edge of darkness' },

  // Mythical
  { id: 'frame_rainbow', name: 'Rainbow', type: 'frame', rarity: 'MYTHICAL', cssClass: 'frame-rainbow', preview: '🌈', description: 'Magical rainbow frame' },
  { id: 'frame_divine', name: 'Divine', type: 'frame', rarity: 'MYTHICAL', cssClass: 'frame-divine', preview: '✝️', description: 'Blessed divine frame' },
  { id: 'frame_infinity', name: 'Infinity', type: 'frame', rarity: 'MYTHICAL', cssClass: 'frame-infinity', preview: '♾️', description: 'Infinite loop frame' },
  { id: 'frame_reality', name: 'Reality Warp', type: 'frame', rarity: 'MYTHICAL', cssClass: 'frame-reality', preview: '🔮', description: 'Bends space-time' },
  { id: 'frame_ethereal', name: 'Ethereal', type: 'frame', rarity: 'MYTHICAL', cssClass: 'frame-ethereal', preview: '✨', description: 'Made of pure light' },

  // ============================================
  // === EFFECTS (NEW CATEGORY!) ===
  // ============================================
  // Common
  { id: 'effect_none', name: 'No Effect', type: 'effect', rarity: 'COMMON', cssClass: '', preview: '➖', description: 'No special effect' },
  { id: 'effect_sparkle', name: 'Sparkles', type: 'effect', rarity: 'COMMON', cssClass: 'effect-sparkle', preview: '✨', description: 'Subtle sparkles' },

  // Uncommon
  { id: 'effect_hearts', name: 'Floating Hearts', type: 'effect', rarity: 'UNCOMMON', cssClass: 'effect-hearts', preview: '💕', description: 'Hearts float around' },
  { id: 'effect_bubbles', name: 'Bubbles', type: 'effect', rarity: 'UNCOMMON', cssClass: 'effect-bubbles', preview: '🫧', description: 'Floating bubbles' },
  { id: 'effect_leaves', name: 'Falling Leaves', type: 'effect', rarity: 'UNCOMMON', cssClass: 'effect-leaves', preview: '🍃', description: 'Autumn leaves fall' },
  { id: 'effect_petals', name: 'Flower Petals', type: 'effect', rarity: 'UNCOMMON', cssClass: 'effect-petals', preview: '🌸', description: 'Cherry petals drift' },

  // Rare
  { id: 'effect_snow', name: 'Snowfall', type: 'effect', rarity: 'RARE', cssClass: 'effect-snow', preview: '❄️', description: 'Gentle snowfall' },
  { id: 'effect_rain', name: 'Rain', type: 'effect', rarity: 'RARE', cssClass: 'effect-rain', preview: '🌧️', description: 'Light rain' },
  { id: 'effect_stars', name: 'Starfall', type: 'effect', rarity: 'RARE', cssClass: 'effect-stars', preview: '⭐', description: 'Falling stars' },
  { id: 'effect_fireflies', name: 'Fireflies', type: 'effect', rarity: 'RARE', cssClass: 'effect-fireflies', preview: '✨', description: 'Glowing fireflies' },
  { id: 'effect_music', name: 'Music Notes', type: 'effect', rarity: 'RARE', cssClass: 'effect-music', preview: '🎵', description: 'Musical notes float' },

  // Epic
  { id: 'effect_fire', name: 'Fire Aura', type: 'effect', rarity: 'EPIC', cssClass: 'effect-fire', preview: '🔥', description: 'Flames surround you' },
  { id: 'effect_ice', name: 'Frost Aura', type: 'effect', rarity: 'EPIC', cssClass: 'effect-ice', preview: '❄️', description: 'Icy frost swirls' },
  { id: 'effect_lightning', name: 'Electric', type: 'effect', rarity: 'EPIC', cssClass: 'effect-lightning', preview: '⚡', description: 'Lightning crackles' },
  { id: 'effect_shadow', name: 'Shadows', type: 'effect', rarity: 'EPIC', cssClass: 'effect-shadow', preview: '🌑', description: 'Dark shadows swirl' },
  { id: 'effect_holy', name: 'Holy Light', type: 'effect', rarity: 'EPIC', cssClass: 'effect-holy', preview: '✝️', description: 'Divine light rays' },
  { id: 'effect_confetti', name: 'Confetti', type: 'effect', rarity: 'EPIC', cssClass: 'effect-confetti', preview: '🎉', description: 'Party confetti' },

  // Legendary
  { id: 'effect_galaxy', name: 'Galaxy Swirl', type: 'effect', rarity: 'LEGENDARY', cssClass: 'effect-galaxy', preview: '🌌', description: 'Cosmic swirls' },
  { id: 'effect_phoenix', name: 'Phoenix Flames', type: 'effect', rarity: 'LEGENDARY', cssClass: 'effect-phoenix', preview: '🔥', description: 'Phoenix fire rises' },
  { id: 'effect_dragon', name: 'Dragon Breath', type: 'effect', rarity: 'LEGENDARY', cssClass: 'effect-dragon', preview: '🐉', description: 'Dragon fire swirls' },
  { id: 'effect_aurora', name: 'Aurora Waves', type: 'effect', rarity: 'LEGENDARY', cssClass: 'effect-aurora', preview: '🎇', description: 'Northern lights' },
  { id: 'effect_golden', name: 'Golden Glow', type: 'effect', rarity: 'LEGENDARY', cssClass: 'effect-golden', preview: '👑', description: 'Radiant gold aura' },

  // Mythical
  { id: 'effect_rainbow', name: 'Rainbow Aura', type: 'effect', rarity: 'MYTHICAL', cssClass: 'effect-rainbow', preview: '🌈', description: 'All colors swirl' },
  { id: 'effect_void', name: 'Void Tendrils', type: 'effect', rarity: 'MYTHICAL', cssClass: 'effect-void', preview: '🕳️', description: 'Darkness reaches out' },
  { id: 'effect_reality', name: 'Reality Warp', type: 'effect', rarity: 'MYTHICAL', cssClass: 'effect-reality', preview: '🔮', description: 'Space distorts' },
  { id: 'effect_divine', name: 'Divine Presence', type: 'effect', rarity: 'MYTHICAL', cssClass: 'effect-divine', preview: '☀️', description: 'Godly radiance' },
  { id: 'effect_creation', name: 'Creation', type: 'effect', rarity: 'MYTHICAL', cssClass: 'effect-creation', preview: '💫', description: 'Stars are born' }
];

// ========================================
// SUPERCELL-STYLE SHOP CONFIGURATION
// ========================================

// Shop timing configuration
const SHOP_CONFIG = {
  DAILY_RESET_HOUR: 0, // Midnight UTC
  DAILY_DEALS_COUNT: 4, // Number of daily deals
  SPECIAL_OFFER_DURATION: 24 * 60 * 60 * 1000, // 24 hours in ms
  STARTER_PACK_AVAILABLE_DAYS: 7 // Days after signup starter pack is available
};

// Daily deals pool - random selection each day
const DAILY_DEALS_POOL = [
  // Discounted boxes
  { id: 'deal_basic_box', type: 'box', boxType: 'BASIC', discount: 30, icon: '📦', originalPoints: 300 },
  { id: 'deal_premium_box', type: 'box', boxType: 'PREMIUM', discount: 20, icon: '🎁', originalGems: 100 },

  // Gem deals
  { id: 'deal_gems_small', type: 'gems', amount: 50, pricePoints: 500, icon: '💎', badge: 'DEAL' },
  { id: 'deal_gems_medium', type: 'gems', amount: 150, pricePoints: 1200, icon: '💎💎', badge: 'VALUE' },

  // Random avatar items at discount
  { id: 'deal_rare_item', type: 'random_item', rarity: 'RARE', priceGems: 75, originalGems: 150, icon: '🎲', badge: '50% OFF' },
  { id: 'deal_epic_item', type: 'random_item', rarity: 'EPIC', priceGems: 200, originalGems: 400, icon: '🎰', badge: '50% OFF' },

  // Box bundles
  { id: 'deal_basic_bundle', type: 'box_bundle', boxes: { basic: 3 }, pricePoints: 750, originalPoints: 900, icon: '📦📦📦', badge: 'BUNDLE' },
  { id: 'deal_premium_bundle', type: 'box_bundle', boxes: { premium: 2 }, priceGems: 160, originalGems: 200, icon: '🎁🎁', badge: '20% OFF' },

  // Free daily item
  { id: 'deal_free_ticket', type: 'free', reward: { tickets: 1 }, icon: '🎟️', badge: 'FREE', cooldown: 24 * 60 * 60 * 1000 }
];

// Special bundles - rotating featured offers
const SPECIAL_BUNDLES = [
  {
    id: 'bundle_eco_starter',
    name: 'Eco Starter Bundle',
    description: 'Perfect for new eco warriors!',
    icon: '🌱',
    badge: 'STARTER',
    contents: [
      { type: 'gems', amount: 200 },
      { type: 'boxes', boxType: 'basic', count: 3 },
      { type: 'boxes', boxType: 'premium', count: 1 }
    ],
    price: 2.99,
    originalValue: 5.99,
    oneTimePurchase: true
  },
  {
    id: 'bundle_gem_rush',
    name: 'Gem Rush',
    description: 'Massive gem bonus!',
    icon: '💎',
    badge: 'x2 VALUE',
    contents: [
      { type: 'gems', amount: 1000 },
      { type: 'boxes', boxType: 'premium', count: 2 }
    ],
    price: 9.99,
    originalValue: 19.99,
    limitedTime: true,
    duration: 48 * 60 * 60 * 1000 // 48 hours
  },
  {
    id: 'bundle_legendary_chance',
    name: 'Legendary Chance',
    description: 'Best odds for legendary items!',
    icon: '✨',
    badge: 'RARE',
    contents: [
      { type: 'gems', amount: 500 },
      { type: 'boxes', boxType: 'legendary', count: 2 }
    ],
    price: 14.99,
    originalValue: 29.99,
    limitedTime: true,
    duration: 24 * 60 * 60 * 1000
  },
  {
    id: 'bundle_weekly_special',
    name: 'Weekly Special',
    description: 'Best deal of the week!',
    icon: '🌟',
    badge: 'WEEKLY',
    contents: [
      { type: 'gems', amount: 300 },
      { type: 'boxes', boxType: 'premium', count: 3 },
      { type: 'tickets', count: 2 }
    ],
    price: 4.99,
    originalValue: 12.99,
    weeklyReset: true
  }
];

// Starter pack - one time offer for new players
const STARTER_PACK = {
  id: 'starter_pack',
  name: 'Starter Pack',
  description: 'One-time offer for new players!',
  icon: '🎁',
  badge: 'BEST VALUE',
  contents: [
    { type: 'gems', amount: 500 },
    { type: 'boxes', boxType: 'basic', count: 5 },
    { type: 'boxes', boxType: 'premium', count: 2 },
    { type: 'tickets', count: 3 },
    { type: 'item', itemId: 'outfit_eco_hero' } // Exclusive starter item
  ],
  price: 4.99,
  originalValue: 14.99,
  oneTimePurchase: true,
  exclusive: true
};

// Seasonal/Event offers
const SEASONAL_OFFERS = [
  {
    id: 'earth_day_bundle',
    name: 'Earth Day Bundle',
    description: 'Celebrate our planet!',
    icon: '🌍',
    badge: 'LIMITED',
    contents: [
      { type: 'gems', amount: 750 },
      { type: 'boxes', boxType: 'legendary', count: 1 },
      { type: 'item', itemId: 'bg_earth' }
    ],
    price: 9.99,
    eventTag: 'earth_day',
    startDate: '2024-04-20',
    endDate: '2024-04-25'
  },
  {
    id: 'ocean_week_bundle',
    name: 'Ocean Week Bundle',
    description: 'Protect our oceans!',
    icon: '🌊',
    badge: 'EVENT',
    contents: [
      { type: 'gems', amount: 600 },
      { type: 'boxes', boxType: 'premium', count: 3 },
      { type: 'item', itemId: 'bg_ocean' }
    ],
    price: 7.99,
    eventTag: 'ocean_week',
    startDate: '2024-06-01',
    endDate: '2024-06-08'
  }
];

// In-app gem packs (expanded from original)
const GEM_PACKS_EXPANDED = [
  { id: 'gems_tiny', name: 'Handful of Gems', gems: 30, price: 0.49, icon: '💎', description: 'A small pouch' },
  { id: 'gems_starter', name: 'Starter Pack', gems: 100, price: 0.99, icon: '💎', description: 'Get started!' },
  { id: 'gems_small', name: 'Small Pouch', gems: 250, price: 1.99, icon: '💎💎', description: '+25 bonus gems!' },
  { id: 'gems_value', name: 'Value Pack', gems: 500, bonusGems: 50, bonusBoxes: { premium: 1 }, price: 4.99, icon: '💎💎💎', badge: 'POPULAR', description: 'Great value!' },
  { id: 'gems_mega', name: 'Mega Pack', gems: 1200, bonusGems: 200, bonusBoxes: { premium: 3 }, price: 9.99, icon: '💎💎💎💎', badge: 'BEST VALUE', description: 'Huge savings!' },
  { id: 'gems_super', name: 'Super Pack', gems: 2000, bonusGems: 500, bonusBoxes: { premium: 2, legendary: 1 }, price: 14.99, icon: '👑', badge: 'SUPER', description: 'Amazing deal!' },
  { id: 'gems_ultimate', name: 'Ultimate Pack', gems: 5000, bonusGems: 1500, bonusBoxes: { legendary: 3 }, price: 29.99, icon: '👑👑', badge: 'ULTIMATE', description: 'Maximum value!' },
  { id: 'gems_whale', name: 'Treasure Chest', gems: 15000, bonusGems: 5000, bonusBoxes: { legendary: 10 }, price: 79.99, icon: '🏆', badge: 'LEGENDARY', description: 'For true collectors!' }
];

// Quick buy options for shop
const QUICK_BUY_OPTIONS = [
  { id: 'quick_basic', type: 'box', boxType: 'BASIC', currency: 'points', icon: '📦' },
  { id: 'quick_premium', type: 'box', boxType: 'PREMIUM', currency: 'gems', icon: '🎁' },
  { id: 'quick_legendary', type: 'box', boxType: 'LEGENDARY', currency: 'gems', icon: '✨' },
  { id: 'quick_10x_basic', type: 'multi_box', boxType: 'BASIC', count: 10, currency: 'points', discount: 10, icon: '📦x10', badge: '10% OFF' }
];

// Default avatar settings (free for all users)
const DEFAULT_AVATAR = {
  equipped: {
    skin: 'skin_fair',
    hair: 'hair_short_black',
    eyes: 'eyes_normal',
    mouth: 'mouth_smile',
    accessory: null,
    hat: null,
    outfit: 'outfit_tshirt',
    background: 'bg_default',
    frame: 'frame_simple',
    effect: null
  }
};

// Achievement badges
const ACHIEVEMENTS = [
  { id: 'first_pickup', name: 'First Steps', description: 'Complete your first trash pickup', icon: '🌱', condition: { type: 'submissions', value: 1 } },
  { id: 'ten_pickups', name: 'Getting Started', description: 'Complete 10 trash pickups', icon: '🌿', condition: { type: 'submissions', value: 10 } },
  { id: 'fifty_pickups', name: 'Dedicated Cleaner', description: 'Complete 50 trash pickups', icon: '🌳', condition: { type: 'submissions', value: 50 } },
  { id: 'hundred_pickups', name: 'Master Collector', description: 'Complete 100 trash pickups', icon: '🏅', condition: { type: 'submissions', value: 100 } },
  { id: 'streak_7', name: 'Week Warrior', description: 'Achieve a 7-day streak', icon: '🔥', condition: { type: 'streak', value: 7 } },
  { id: 'streak_30', name: 'Monthly Champion', description: 'Achieve a 30-day streak', icon: '⚡', condition: { type: 'streak', value: 30 } },
  { id: 'points_500', name: 'Rising Star', description: 'Earn 500 total points', icon: '⭐', condition: { type: 'points', value: 500 } },
  { id: 'points_2000', name: 'Eco Warrior', description: 'Earn 2000 total points', icon: '🌟', condition: { type: 'points', value: 2000 } },
  { id: 'points_10000', name: 'Legend', description: 'Earn 10000 total points', icon: '👑', condition: { type: 'points', value: 10000 } },
  { id: 'first_friend', name: 'Social Butterfly', description: 'Add your first friend', icon: '🦋', condition: { type: 'friends', value: 1 } },
  { id: 'five_friends', name: 'Popular', description: 'Have 5 friends', icon: '🤝', condition: { type: 'friends', value: 5 } },
  { id: 'first_event', name: 'Team Player', description: 'Join your first cleanup event', icon: '🎪', condition: { type: 'events', value: 1 } },
  { id: 'organize_event', name: 'Leader', description: 'Organize a cleanup event', icon: '📣', condition: { type: 'organized', value: 1 } }
];

// Rotating shop items by category
const SHOP_CATEGORIES = {
  hairstyles: {
    name: 'Hairstyles',
    icon: '💇',
    items: [
      { itemId: 'hair_pink', price: 150, currency: 'gems' },
      { itemId: 'hair_blue', price: 150, currency: 'gems' },
      { itemId: 'hair_curly_brown', price: 120, currency: 'gems' },
      { itemId: 'hair_ponytail', price: 100, currency: 'gems' },
      { itemId: 'hair_long_blonde', price: 100, currency: 'gems' },
      { itemId: 'hair_rainbow', price: 400, currency: 'gems', badge: 'EPIC' },
      { itemId: 'hair_flame', price: 500, currency: 'gems', badge: 'LEGENDARY' }
    ]
  },
  eyes: {
    name: 'Eyes',
    icon: '👁️',
    items: [
      { itemId: 'eyes_heart', price: 120, currency: 'gems' },
      { itemId: 'eyes_star', price: 150, currency: 'gems' },
      { itemId: 'eyes_cat', price: 100, currency: 'gems' },
      { itemId: 'eyes_wink', price: 80, currency: 'gems' },
      { itemId: 'eyes_sparkling', price: 180, currency: 'gems', badge: 'RARE' },
      { itemId: 'eyes_galaxy', price: 350, currency: 'gems', badge: 'LEGENDARY' }
    ]
  },
  hats: {
    name: 'Hats & Headwear',
    icon: '👑',
    items: [
      { itemId: 'hat_cat_ears', price: 180, currency: 'gems' },
      { itemId: 'hat_bunny_ears', price: 180, currency: 'gems' },
      { itemId: 'hat_crown', price: 400, currency: 'gems', badge: 'LEGENDARY' },
      { itemId: 'hat_halo', price: 300, currency: 'gems', badge: 'EPIC' },
      { itemId: 'hat_witch', price: 200, currency: 'gems' },
      { itemId: 'hat_ninja', price: 250, currency: 'gems', badge: 'EPIC' }
    ]
  },
  outfits: {
    name: 'Outfits',
    icon: '👕',
    items: [
      { itemId: 'outfit_punk', price: 200, currency: 'gems' },
      { itemId: 'outfit_ninja', price: 220, currency: 'gems' },
      { itemId: 'outfit_kimono', price: 200, currency: 'gems' },
      { itemId: 'outfit_wizard', price: 300, currency: 'gems', badge: 'EPIC' },
      { itemId: 'outfit_knight', price: 320, currency: 'gems', badge: 'EPIC' },
      { itemId: 'outfit_dragon', price: 500, currency: 'gems', badge: 'LEGENDARY' }
    ]
  },
  accessories: {
    name: 'Accessories',
    icon: '✨',
    items: [
      { itemId: 'acc_sunglasses', price: 80, currency: 'gems' },
      { itemId: 'acc_monocle', price: 150, currency: 'gems' },
      { itemId: 'acc_eyepatch', price: 120, currency: 'gems' },
      { itemId: 'acc_mask', price: 250, currency: 'gems', badge: 'EPIC' },
      { itemId: 'acc_golden_mask', price: 400, currency: 'gems', badge: 'LEGENDARY' }
    ]
  },
  backgrounds: {
    name: 'Backgrounds',
    icon: '🌅',
    items: [
      { itemId: 'bg_neon', price: 250, currency: 'gems' },
      { itemId: 'bg_aurora', price: 280, currency: 'gems', badge: 'EPIC' },
      { itemId: 'bg_galaxy', price: 400, currency: 'gems', badge: 'LEGENDARY' },
      { itemId: 'bg_nebula', price: 300, currency: 'gems', badge: 'EPIC' },
      { itemId: 'bg_cherry', price: 280, currency: 'gems', badge: 'EPIC' }
    ]
  }
};

// Export for use in other files
window.EcoVentureConfig = {
  CONFIG,
  TRASHNET_CONFIG,
  COCO_TRASH_CLASSES,
  TACO_TRASH_CATEGORIES,
  BIN_CLASSES,
  IGNORE_CLASSES,
  LEVELS,
  DAILY_CHALLENGES,
  ACHIEVEMENTS,
  // Gamification exports
  RARITY_TIERS,
  AVATAR_ITEM_TYPES,
  BOX_TYPES,
  QUEST_CONDITIONS,
  DAILY_QUEST_TEMPLATES,
  WEEKLY_QUEST_TEMPLATES,
  GEM_PACKS,
  AVATAR_ITEMS,
  DEFAULT_AVATAR,
  // Supercell-style shop exports
  SHOP_CONFIG,
  DAILY_DEALS_POOL,
  SPECIAL_BUNDLES,
  STARTER_PACK,
  SEASONAL_OFFERS,
  GEM_PACKS_EXPANDED,
  QUICK_BUY_OPTIONS,
  // Gambling/Gacha systems
  LUCKY_WHEEL,
  PITY_SYSTEM,
  SCRATCH_CARDS,
  MYSTERY_BOX,
  TOKEN_SYSTEM,
  SLOT_MACHINE,
  BOX_MILESTONES,
  FLASH_SALES,
  // Direct purchase cosmetics
  FEATURED_COSMETICS,
  LIMITED_ITEMS,
  SHOP_CATEGORIES,
  SEASON_ITEMS
};

