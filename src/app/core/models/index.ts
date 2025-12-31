// ============================================================================
// BREWLOG DOMAIN MODELS
// ============================================================================

// Base types
//export type Date = { seconds: number; nanoseconds: number };
export type ID = string;

// ============================================================================
// WEIGHT UNIT
// ============================================================================

export type WeightUnit = 'g' | 'oz' | 'lb';

// ============================================================================
// CUSTOM FIELDS SYSTEM
// ============================================================================

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'range'
  | 'select'
  | 'toggle'
  | 'date';

export interface CustomFieldDefinition {
  id: ID;
  label: string;
  type: CustomFieldType;
  required: boolean;
  placeholder?: string;
  // Number/Range specific
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  // Select specific
  options?: string[];
  // Default value
  defaultValue?: string | number | boolean;
}

export interface CustomFieldValue {
  fieldId: ID;
  value: string | number | boolean | null;
}

// ============================================================================
// USER
// ============================================================================

export interface User {
  id: ID;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  defaultWaterTemp: number; // Celsius
  defaultRatio: number; // e.g., 16 for 1:16
  theme: 'light' | 'dark' | 'system';
  measurementSystem: 'metric'; // Grams only as per requirements
}

export interface UserStats {
  totalBrews: number;
  currentStreak: number;
  longestStreak: number;
  lastBrewDate: Date | null;
  averageRating: number;
  totalBeans: number;
  totalEquipment: number;
  totalTechniques: number;
}

// ============================================================================
// EQUIPMENT
// ============================================================================

export type EquipmentCategory =
  | 'brewer'
  | 'grinder'
  | 'kettle'
  | 'scale'
  | 'accessory'
  | 'machine'
  | 'other';

export interface Equipment {
  id: ID;
  userId: ID;
  name: string;
  category: EquipmentCategory;
  brand?: string;
  model?: string;
  notes?: string;
  icon?: string; // emoji or icon identifier
  customFields: CustomFieldDefinition[];
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

export interface EquipmentUsage {
  equipmentId: ID;
  customFieldValues: CustomFieldValue[];
}

// ============================================================================
// BEANS
// ============================================================================

export type RoastLevel =
  | 'light'
  | 'light-medium'
  | 'medium'
  | 'medium-dark'
  | 'dark';
export type ProcessMethod =
  | 'washed'
  | 'natural'
  | 'honey'
  | 'anaerobic'
  | 'experimental'
  | 'other';

export interface Bean {
  id: ID;
  userId: ID;
  name: string;
  roaster: string;
  origin: string;
  region?: string;
  variety?: string;
  process: ProcessMethod;
  roastLevel: RoastLevel;
  roastDate?: Date;
  purchaseDate?: Date;
  price?: number;
  weight?: number; // optional now
  weightRemaining?: number; // optional now
  weightUnit?: WeightUnit; // g, oz, lb
  photoURL?: string;
  notes?: string;
  customFields: CustomFieldDefinition[];
  customFieldValues: CustomFieldValue[];
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

// ============================================================================
// TECHNIQUE
// ============================================================================

export type InputMode = 'ratio' | 'absolute';

export interface Technique {
  id: ID;
  userId: ID;
  name: string;
  description?: string;
  inputMode: InputMode;
  coffeeGrams?: number;
  waterGrams?: number;
  ratio?: number; // e.g., 16 for 1:16
  waterTemp?: number;
  brewTimeSeconds?: number;
  bloomTimeSeconds?: number;
  bloomWaterGrams?: number;
  preInfusionSeconds?: number;
  pressureBars?: number;
  yieldGrams?: number;
  grindDescription?: string;
  steps?: string[];
  customFields: CustomFieldDefinition[];
  customFieldValues: CustomFieldValue[];
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

// ============================================================================
// BREW LOG
// ============================================================================

export interface BrewLog {
  id?: ID;
  userId?: ID;
  date: Date;

  // References
  beanIds: ID[]; // 1 or more beans
  equipmentUsages: EquipmentUsage[];
  techniqueId?: ID;

  // Brew parameters (can override technique)
  inputMode: InputMode;
  coffeeGrams: number;
  waterGrams: number;
  ratio: number;
  waterTemp?: number;
  brewTimeSeconds?: number;
  bloomTimeSeconds?: number;
  bloomWaterGrams?: number;
  preInfusionSeconds?: number;
  pressureBars?: number;
  yieldGrams?: number;
  grindDescription?: string;

  // Evaluation
  rating: number; // 1-10 (displayed as half-stars 0.5-5)
  notes?: string;

  // Tasting notes (commented out for future use)
  // tastingNotes?: TastingNote[];

  customFields: CustomFieldDefinition[];
  customFieldValues: CustomFieldValue[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Future: Tasting notes
// export interface TastingNote {
//   category: 'aroma' | 'flavor' | 'aftertaste' | 'acidity' | 'body' | 'balance';
//   descriptors: string[];
//   intensity?: number;
// }

// ============================================================================
// QUERY/FILTER TYPES
// ============================================================================

export interface PaginationParams {
  limit: number;
  startAfter?: Date;
}

export interface BrewLogFilters {
  beanId?: ID;
  equipmentId?: ID;
  techniqueId?: ID;
  dateFrom?: Date;
  dateTo?: Date;
  minRating?: number;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface BrewStatistics {
  totalBrews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  brewsByDay: { date: string; count: number }[];
  topBeans: { beanId: ID; name: string; count: number }[];
  topEquipment: { equipmentId: ID; name: string; count: number }[];
  topTechniques: { techniqueId: ID; name: string; count: number }[];
  averageBrewParams: {
    coffeeGrams: number;
    waterGrams: number;
    ratio: number;
    brewTimeSeconds: number;
  };
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastBrewDate: Date | null;
  isActiveToday: boolean;
}
