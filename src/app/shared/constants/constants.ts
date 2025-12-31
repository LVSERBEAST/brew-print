// ============================================================================
// BREWPRINT CONSTANTS
// ============================================================================

import { EquipmentCategory } from "@core/models/models";

// ============================================================================
// DEFAULT IMAGES
// ============================================================================

export const DEFAULT_BEAN_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23f5efe5' width='200' height='200'/%3E%3Cg transform='translate(100,100)'%3E%3Cellipse cx='-15' cy='0' rx='35' ry='50' fill='%23c4956a' transform='rotate(-20)'/%3E%3Cellipse cx='15' cy='0' rx='35' ry='50' fill='%23b8864e' transform='rotate(20)'/%3E%3Cpath d='M-5,-45 Q0,-20 -5,45' stroke='%239a6d3a' stroke-width='3' fill='none'/%3E%3Cpath d='M5,-45 Q0,-20 5,45' stroke='%239a6d3a' stroke-width='3' fill='none'/%3E%3C/g%3E%3C/svg%3E`;

// ============================================================================
// EQUIPMENT ICONS
// ============================================================================

export const DEFAULT_CATEGORY_ICONS: Record<EquipmentCategory, string> = {
  brewer: '☕',
  grinder: '⚙️',
  kettle: '🫖',
  scale: '⚖️',
  machine: '🔧',
  accessory: '📦',
  other: '📦',
};

export const EQUIPMENT_ICONS = [
  '☕', '⚙️', '🫖', '⚖️', '🔧', '📦', '🥤', '🍵',
  '🔥', '💨', '🧊', '🥛', '🫗', '⏱️', '🌡️', '📊',
  '🎚️', '🔩', '🪣', '🧹', '🧴', '🔌', '💡', '🎛️',
];

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  'brewer', 'grinder', 'kettle', 'scale', 'machine', 'accessory', 'other',
];

// ============================================================================
// APP INFO
// ============================================================================

export const APP_VERSION = '0.2.0';
export const APP_VERSION_DISPLAY = `Version ${APP_VERSION} (beta)`;

// ============================================================================
// DEFAULT BREW PARAMS
// ============================================================================

export const DEFAULT_BREW_PARAMS = {
  inputMode: 'absolute' as const,
  coffeeGrams: 18,
  waterGrams: 300,
  ratio: 16.7,
  waterTemp: 93,
  brewTimeSeconds: 180,
};
