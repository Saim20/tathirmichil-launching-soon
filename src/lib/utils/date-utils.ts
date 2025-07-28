/**
 * Utility functions for safe date handling and formatting
 */

/**
 * Safely formats a date with fallback for invalid dates
 * @param date - Date object, string, or undefined
 * @param options - Intl.DateTimeFormat options
 * @param fallback - Fallback string for invalid dates
 * @returns Formatted date string or fallback
 */
export function safeFormatDate(
  date: Date | string | undefined | null,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  fallback: string = 'N/A'
): string {
  if (!date) return fallback;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
}

/**
 * Safely formats a date with time
 * @param date - Date object, string, or undefined
 * @param fallback - Fallback string for invalid dates
 * @returns Formatted date string with time or fallback
 */
export function safeFormatDateTime(
  date: Date | string | undefined | null,
  fallback: string = 'N/A'
): string {
  return safeFormatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }, fallback);
}

/**
 * Safely formats a date as relative time (e.g., "2 days ago")
 * @param date - Date object, string, or undefined
 * @param fallback - Fallback string for invalid dates
 * @returns Relative time string or fallback
 */
export function safeFormatRelativeTime(
  date: Date | string | undefined | null,
  fallback: string = 'N/A'
): string {
  if (!date) return fallback;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 7) {
      return safeFormatDate(dateObj);
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.warn('Relative time formatting error:', error);
    return fallback;
  }
}

/**
 * Safely checks if a date is valid
 * @param date - Date object, string, or undefined
 * @returns True if date is valid, false otherwise
 */
export function isValidDate(date: Date | string | undefined | null): boolean {
  if (!date) return false;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
}

/**
 * Safely converts a date to a Date object
 * @param date - Date object, string, or undefined
 * @returns Valid Date object or null
 */
export function toSafeDate(date: Date | string | undefined | null): Date | null {
  if (!date) return null;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return isNaN(dateObj.getTime()) ? null : dateObj;
  } catch {
    return null;
  }
}
