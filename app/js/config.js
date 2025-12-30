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
  ACHIEVEMENTS
};

