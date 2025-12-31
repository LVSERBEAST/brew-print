// ============================================================================
// DATA UTILITIES
// ============================================================================

/**
 * Sanitizes an object for Firestore by removing empty strings, undefined values,
 * and converting them appropriately.
 */
export function sanitizeForFirestore<T extends Record<string, unknown>>(data: T): Partial<T> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip undefined
    if (value === undefined) continue;

    // Convert empty strings to undefined (skip them)
    if (value === '') continue;

    // Recursively sanitize nested objects (but not arrays, Dates, or Timestamps)
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !('toDate' in value)) {
      const nested = sanitizeForFirestore(value as Record<string, unknown>);
      if (Object.keys(nested).length > 0) {
        sanitized[key] = nested;
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as Partial<T>;
}

/**
 * Gets bean names from IDs
 */
export function getBeanNames(
  beanIds: string[],
  beans: { id: string; name: string }[]
): string {
  if (!beanIds || beanIds.length === 0) return 'No beans';
  return beanIds
    .map((id) => beans.find((b) => b.id === id)?.name || 'Unknown')
    .join(', ');
}

/**
 * Gets equipment name from ID
 */
export function getEquipmentName(
  id: string,
  equipment: { id: string; name: string }[]
): string {
  return equipment.find((e) => e.id === id)?.name || 'Unknown';
}

/**
 * Gets brew method name from ID
 */
export function getBrewMethodName(
  id: string | undefined,
  brewMethods: { id: string; name: string }[]
): string {
  if (!id) return '';
  return brewMethods.find((m) => m.id === id)?.name || 'Unknown';
}
