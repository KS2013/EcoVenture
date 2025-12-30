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

// Export for use in other files
window.EcoVentureConfig = {
  CONFIG,
  TRASHNET_CONFIG,
  COCO_TRASH_CLASSES,
  TACO_TRASH_CATEGORIES,
  BIN_CLASSES,
  IGNORE_CLASSES,
  LEVELS
};

