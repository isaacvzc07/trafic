/**
 * Timezone utilities for Mexico City (UTC-6)
 */

export const MEXICO_CITY_TIMEZONE = 'America/Mexico_City';

/**
 * Convert a date or timestamp to Mexico City time
 * Note: This returns a Date object with Mexico City time values
 * To properly display this date, use formatMexicoCityTime() or getMexicoCityHourKey()
 */
export function toMexicoCityTime(date: Date | string): Date {
  const utcDate = typeof date === 'string' ? new Date(date) : date;

  // Create formatter that gives us Mexico City time in ISO format
  // We'll parse this to get the actual timezone-aware components
  const parts = utcDate.toLocaleDateString('sv-SE', {
    timeZone: MEXICO_CITY_TIMEZONE,
  }).split('-'); // sv-SE gives YYYY-MM-DD format

  const timeParts = utcDate.toLocaleTimeString('sv-SE', {
    timeZone: MEXICO_CITY_TIMEZONE,
    hour12: false
  }).split(':'); // sv-SE gives HH:mm:ss format

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = parseInt(timeParts[2], 10);

  // Create new Date with these values as if they were in local browser timezone
  // This preserves the Mexico City time values for use with getHours(), getMinutes(), etc.
  const mexicoCityDate = new Date(year, month, day, hours, minutes, seconds);

  return mexicoCityDate;
}

/**
 * Format a date or timestamp to Mexico City time string
 */
export function formatMexicoCityTime(
  date: Date | string, 
  options: Intl.DateTimeFormatOptions = {}
): string {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: MEXICO_CITY_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...options
  };
  
  return utcDate.toLocaleString('es-MX', defaultOptions);
}

/**
 * Format a date or timestamp to Mexico City date string
 */
export function formatMexicoCityDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: MEXICO_CITY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };
  
  return utcDate.toLocaleDateString('es-MX', defaultOptions);
}

/**
 * Format a date or timestamp to Mexico City date and time string
 */
export function formatMexicoCityDateTime(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const utcDate = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: MEXICO_CITY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...options
  };
  
  return utcDate.toLocaleString('es-MX', defaultOptions);
}

/**
 * Get current Mexico City time
 */
export function getMexicoCityTime(): Date {
  return toMexicoCityTime(new Date());
}

/**
 * Get current hour timestamp in Mexico City timezone (ISO format)
 */
export function getMexicoCityHourTimestamp(): string {
  const mexicoCityNow = getMexicoCityTime();
  return new Date(
    mexicoCityNow.getFullYear(), 
    mexicoCityNow.getMonth(), 
    mexicoCityNow.getDate(), 
    mexicoCityNow.getHours(), 
    0, 
    0
  ).toISOString();
}

/**
 * Format relative time in Mexico City timezone
 */
export function formatRelativeMexicoCityTime(date: Date | string): string {
  const mexicoCityDate = toMexicoCityTime(date);
  const now = getMexicoCityTime();
  const diffMs = now.getTime() - mexicoCityDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'ahora mismo';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
}

/**
 * Convert UTC hour timestamp to Mexico City hour key for grouping
 * Returns ISO string of the hour in Mexico City timezone
 */
export function getMexicoCityHourKey(utcHourString: string): string {
  const mexicoCityTime = toMexicoCityTime(utcHourString);
  const year = mexicoCityTime.getFullYear();
  const month = String(mexicoCityTime.getMonth() + 1).padStart(2, '0');
  const day = String(mexicoCityTime.getDate()).padStart(2, '0');
  const hour = String(mexicoCityTime.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:00:00Z`;
}
