// ============================================================================
// BREWPRINT DOMAIN MODELS
// ============================================================================

import { Timestamp } from '@angular/fire/firestore';

// ============================================================================
// WEIGHT UNIT
// ============================================================================

export type WeightUnit = 'g' | 'oz' | 'lb';

// ============================================================================
// INPUT MODE
// ============================================================================

export type InputMode = 'ratio' | 'absolute';

// ============================================================================
// BREW PARAMS (shared between BrewMethod and BrewLog)
// ============================================================================

export interface BrewParams {
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
}

// ============================================================================
// USER
// ============================================================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences: UserPreferences;
  stats: UserStats;
  isAdmin?: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  measurementSystem: 'metric' | 'imperial';
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  emailUpdates: boolean;
  brewReminders: boolean;
}

export interface UserStats {
  totalBrews: number;
  currentStreak: number;
  longestStreak: number;
  lastBrewDate: Timestamp | null;
  averageRating: number;
  totalBeans: number;
  totalEquipment: number;
  totalBrewMethods: number;
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
  id: string;
  userId: string;
  name: string;
  category: EquipmentCategory;
  brand?: string;
  model?: string;
  notes?: string;
  icon?: string;
  // TODO: Custom fields system - implement later
  // customFields: CustomFieldDefinition[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archived: boolean;
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
  id: string;
  userId: string;
  name: string;
  roaster?: string;
  origin?: string;
  region?: string;
  variety?: string;
  process?: ProcessMethod;
  roastLevel?: RoastLevel;
  roastDate?: Timestamp;
  purchaseDate?: Timestamp;
  price?: number;
  weight?: number;
  weightRemaining?: number;
  weightUnit?: WeightUnit;
  photoURL?: string;
  notes?: string;
  // TODO: Custom fields system - implement later
  // customFields: CustomFieldDefinition[];
  // customFieldValues: CustomFieldValue[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archived: boolean;
}

// ============================================================================
// BREW METHOD
// ============================================================================

export interface BrewMethod {
  id: string;
  userId: string;
  name: string;
  description?: string;
  params: BrewParams;
  steps?: string[];
  // TODO: Custom fields system - implement later
  // customFields: CustomFieldDefinition[];
  // customFieldValues: CustomFieldValue[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  archived: boolean;
}

// ============================================================================
// BREW LOG
// ============================================================================

export interface BrewLog {
  id: string;
  userId: string;
  date: Timestamp;
  beanIds: string[];
  equipmentIds: string[];
  brewMethodId?: string;
  params: BrewParams;
  rating: number;
  notes?: string;
  // TODO: Custom fields system - implement later
  // customFields: CustomFieldDefinition[];
  // customFieldValues: CustomFieldValue[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// QUERY/FILTER TYPES
// ============================================================================

export interface PaginationParams {
  limit: number;
  startAfter?: Timestamp;
}

export interface BrewFilters {
  beanId?: string;
  equipmentId?: string;
  brewMethodId?: string;
  dateFrom?: Timestamp;
  dateTo?: Timestamp;
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
  topBeans: { beanId: string; name: string; count: number }[];
  topEquipment: { equipmentId: string; name: string; count: number }[];
  topBrewMethods: { brewMethodId: string; name: string; count: number }[];
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
  lastBrewDate: Timestamp | null;
  isActiveToday: boolean;
}

// ============================================================================
// TODO: CUSTOM FIELDS SYSTEM (implement later)
// ============================================================================
/*
export type CustomFieldType =
  | 'text'
  | 'number'
  | 'range'
  | 'select'
  | 'toggle'
  | 'date';

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: string[];
  defaultValue?: string | number | boolean;
}

export interface CustomFieldValue {
  fieldId: string;
  value: string | number | boolean | null;
}
*/
