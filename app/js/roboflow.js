/**
 * EcoVenture Roboflow Integration
 * Uses Roboflow's trained trash detection models for accurate litter detection
 *
 * IMPORTANT: Use your PUBLISHABLE API key (starts with "rf_")
 * NOT your private API key!
 *
 * Get your free key at: roboflow.com -> Settings -> Roboflow API -> Publishable Key
 *
 * Models used:
 * - TACO (Trash Annotations in Context) - trained on real-world litter
 * - Trash Detection models from Roboflow Universe
 */

// Roboflow API Configuration
const ROBOFLOW_CONFIG = {
  // Public API endpoint
  API_URL: 'https://detect.roboflow.com',

  // Custom model ID (user can set their own)
  // Format: "project-name/version" from your Roboflow workspace
  CUSTOM_MODEL_ID: null,

  // Pre-configured models (these require access in your workspace)
  MODELS: {
    // User's custom model (set via setupCustomModel)
    CUSTOM: {
      id: null,
      name: 'Custom Model',
      classes: []
    },
    // TACO Dataset model - best for general litter
    TACO: {
      id: 'taco-trash-annotations-in-context/5',
      name: 'TACO Trash Detection',
      classes: ['Bottle', 'Bottle cap', 'Can', 'Carton', 'Cup', 'Lid', 'Other', 'Paper', 'Plastic bag', 'Plastic container', 'Pop tab', 'Straw', 'Styrofoam', 'Cigarette', 'Food waste']
    },
    // Alternative: General trash detection
    TRASH_DETECT: {
      id: 'trash-detection-kcsnu/4',
      name: 'Trash Detection',
      classes: ['trash', 'garbage', 'litter', 'waste']
    },
    // TrashNet style classification
    TRASH_ITEMS: {
      id: 'trash-items-qj39n/2',
      name: 'Trash Items',
      classes: ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']
    }
  },

  // Current active model
  ACTIVE_MODEL: 'CUSTOM',

  // Detection settings
  CONFIDENCE_THRESHOLD: 0.25,
  OVERLAP_THRESHOLD: 0.3
};

// Store for API key (user must set this)
let apiKey = null;

/**
 * Set the Roboflow API key
 * @param {string} key - Your Roboflow API key (get free at roboflow.com)
 */
function setApiKey(key) {
  apiKey = key;
  localStorage.setItem('roboflow_api_key', key);
  console.log('Roboflow API key set successfully');
}

/**
 * Set custom model ID
 * @param {string} modelId - Model ID from your Roboflow workspace (e.g., "my-project/1")
 */
function setCustomModelId(modelId) {
  ROBOFLOW_CONFIG.CUSTOM_MODEL_ID = modelId;
  ROBOFLOW_CONFIG.MODELS.CUSTOM.id = modelId;
  ROBOFLOW_CONFIG.ACTIVE_MODEL = 'CUSTOM';
  localStorage.setItem('roboflow_model_id', modelId);
  console.log('Roboflow custom model set:', modelId);
}

/**
 * Get the stored custom model ID
 */
function getCustomModelId() {
  if (!ROBOFLOW_CONFIG.CUSTOM_MODEL_ID) {
    ROBOFLOW_CONFIG.CUSTOM_MODEL_ID = localStorage.getItem('roboflow_model_id');
    if (ROBOFLOW_CONFIG.CUSTOM_MODEL_ID) {
      ROBOFLOW_CONFIG.MODELS.CUSTOM.id = ROBOFLOW_CONFIG.CUSTOM_MODEL_ID;
    }
  }
  return ROBOFLOW_CONFIG.CUSTOM_MODEL_ID;
}

/**
 * Get the stored API key
 */
function getApiKey() {
  if (!apiKey) {
    apiKey = localStorage.getItem('roboflow_api_key');
  }
  return apiKey;
}

/**
 * Check if Roboflow is configured
 */
function isConfigured() {
  return !!getApiKey();
}

/**
 * Convert canvas/image to base64
 */
function imageToBase64(imageElement) {
  let canvas;

  if (imageElement instanceof HTMLCanvasElement) {
    canvas = imageElement;
  } else if (imageElement instanceof HTMLVideoElement) {
    canvas = document.createElement('canvas');
    canvas.width = imageElement.videoWidth || 640;
    canvas.height = imageElement.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
  } else if (imageElement instanceof HTMLImageElement) {
    canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth || imageElement.width;
    canvas.height = imageElement.naturalHeight || imageElement.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageElement, 0, 0);
  } else {
    throw new Error('Unsupported image element type');
  }

  // Get base64 without the data URL prefix
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  return dataUrl.split(',')[1];
}

/**
 * Detect trash in an image using Roboflow API
 * @param {HTMLCanvasElement|HTMLVideoElement|HTMLImageElement} imageElement
 * @returns {Promise<Array>} Array of detections
 */
async function detectTrash(imageElement) {
  const key = getApiKey();

  if (!key) {
    console.warn('Roboflow API key not set. Get a free key at roboflow.com');
    return [];
  }

  // Get the custom model ID if set
  const customModelId = getCustomModelId();

  try {
    // Use custom model ID if available, otherwise fall back to active model
    let modelId;
    let modelName = 'Custom Model';

    if (customModelId) {
      modelId = customModelId;
      modelName = 'Custom Model';
    } else {
      const model = ROBOFLOW_CONFIG.MODELS[ROBOFLOW_CONFIG.ACTIVE_MODEL];
      modelId = model?.id;
      modelName = model?.name || 'Unknown Model';
    }

    if (!modelId) {
      console.warn('No Roboflow model configured. Please set up your model ID.');
      return [];
    }

    const base64Image = imageToBase64(imageElement);

    // Build API URL
    const url = `${ROBOFLOW_CONFIG.API_URL}/${modelId}?api_key=${key}&confidence=${ROBOFLOW_CONFIG.CONFIDENCE_THRESHOLD}&overlap=${ROBOFLOW_CONFIG.OVERLAP_THRESHOLD}`;

    // Make API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: base64Image
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Roboflow API error:', response.status, errorText);
      return [];
    }

    const result = await response.json();

    // Convert Roboflow format to our standard format
    const detections = (result.predictions || []).map(pred => ({
      class: pred.class,
      score: pred.confidence,
      bbox: [
        pred.x - pred.width / 2,  // x
        pred.y - pred.height / 2, // y
        pred.width,               // width
        pred.height               // height
      ],
      source: 'Roboflow',
      model: modelName
    }));

    console.log(`Roboflow detected ${detections.length} items:`, detections.map(d => `${d.class} (${Math.round(d.score * 100)}%)`).join(', '));

    return detections;

  } catch (error) {
    console.error('Roboflow detection failed:', error.message);
    return [];
  }
}

/**
 * Detect trash with rate limiting for video frames
 * Only calls API every N milliseconds to avoid rate limits
 */
let lastDetectionTime = 0;
const MIN_DETECTION_INTERVAL = 1000; // 1 second between API calls

async function detectTrashThrottled(imageElement) {
  const now = Date.now();

  if (now - lastDetectionTime < MIN_DETECTION_INTERVAL) {
    return null; // Skip this frame
  }

  lastDetectionTime = now;
  return detectTrash(imageElement);
}

/**
 * Get available models
 */
function getAvailableModels() {
  return Object.entries(ROBOFLOW_CONFIG.MODELS).map(([key, model]) => ({
    id: key,
    name: model.name,
    classes: model.classes
  }));
}

/**
 * Set active model
 */
function setActiveModel(modelKey) {
  if (ROBOFLOW_CONFIG.MODELS[modelKey]) {
    ROBOFLOW_CONFIG.ACTIVE_MODEL = modelKey;
    console.log('Active model set to:', ROBOFLOW_CONFIG.MODELS[modelKey].name);
    return true;
  }
  return false;
}

/**
 * Map Roboflow classes to TrashNet categories
 */
function mapToTrashNetCategory(roboflowClass) {
  const classLower = roboflowClass.toLowerCase();

  const mappings = {
    // Plastic
    'bottle': 'plastic',
    'plastic bag': 'plastic',
    'plastic container': 'plastic',
    'straw': 'plastic',
    'styrofoam': 'plastic',
    'cup': 'plastic',
    'lid': 'plastic',
    'bottle cap': 'plastic',

    // Metal
    'can': 'metal',
    'pop tab': 'metal',
    'aluminium': 'metal',

    // Paper/Cardboard
    'paper': 'paper',
    'carton': 'cardboard',
    'cardboard': 'cardboard',

    // Glass
    'glass': 'glass',
    'glass bottle': 'glass',

    // General trash
    'cigarette': 'trash',
    'food waste': 'trash',
    'other': 'trash',
    'trash': 'trash',
    'garbage': 'trash',
    'litter': 'trash',
    'waste': 'trash'
  };

  for (const [key, category] of Object.entries(mappings)) {
    if (classLower.includes(key)) {
      return category;
    }
  }

  return 'trash'; // Default
}

/**
 * Show API key setup dialog
 */
function showSetupDialog() {
  const existingKey = getApiKey();
  const existingModel = getCustomModelId();

  // Step 1: Get API Key
  const key = prompt(
    '🔑 Step 1: Enter your Roboflow PUBLISHABLE API Key\n\n' +
    '⚠️ Use PUBLISHABLE key (starts with "rf_"), NOT private key!\n\n' +
    'Get your FREE key:\n' +
    '1. Go to roboflow.com and create account\n' +
    '2. Go to Settings > Roboflow API\n' +
    '3. Copy your PUBLISHABLE API Key (rf_...)\n\n' +
    'Current key: ' + (existingKey ? existingKey.slice(0, 6) + '****' : 'Not set'),
    existingKey || ''
  );

  if (!key || !key.trim()) {
    return false;
  }

  const trimmedKey = key.trim();
  if (!trimmedKey.startsWith('rf_')) {
    alert('⚠️ Warning: Roboflow publishable keys usually start with "rf_"\n\nMake sure you\'re using the PUBLISHABLE key, not the private key!');
  }
  setApiKey(trimmedKey);

  // Step 2: Get Model ID
  const modelId = prompt(
    '📦 Step 2: Enter your Model ID\n\n' +
    'This is the model from YOUR Roboflow workspace.\n\n' +
    'To find it:\n' +
    '1. Go to your Roboflow project\n' +
    '2. Go to Deploy > Hosted API\n' +
    '3. Look for the model ID (e.g., "my-trash-model/1")\n\n' +
    'Format: project-name/version\n' +
    'Example: trash-detector/3\n\n' +
    'Current model: ' + (existingModel || 'Not set'),
    existingModel || ''
  );

  if (modelId && modelId.trim()) {
    const trimmedModelId = modelId.trim();
    if (!trimmedModelId.includes('/')) {
      alert('⚠️ Model ID should include version number\n\nFormat: project-name/version\nExample: my-trash-model/1');
    }
    setCustomModelId(trimmedModelId);
  }

  return true;
}

// Export module
window.EcoVentureRoboflow = {
  setApiKey,
  getApiKey,
  setCustomModelId,
  getCustomModelId,
  isConfigured,
  detectTrash,
  detectTrashThrottled,
  getAvailableModels,
  setActiveModel,
  mapToTrashNetCategory,
  showSetupDialog,
  config: ROBOFLOW_CONFIG
};

// Auto-load saved API key and model ID
document.addEventListener('DOMContentLoaded', () => {
  const savedKey = localStorage.getItem('roboflow_api_key');
  if (savedKey) {
    apiKey = savedKey;
    console.log('Roboflow API key loaded from storage');
  }

  const savedModelId = localStorage.getItem('roboflow_model_id');
  if (savedModelId) {
    ROBOFLOW_CONFIG.CUSTOM_MODEL_ID = savedModelId;
    ROBOFLOW_CONFIG.MODELS.CUSTOM.id = savedModelId;
    ROBOFLOW_CONFIG.ACTIVE_MODEL = 'CUSTOM';
    console.log('Roboflow custom model loaded from storage:', savedModelId);
  }
});
