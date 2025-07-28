/**
 * Format options for date/time display
 */
export type DateFormatOptions = {
    /** Include time in the output */
    includeTime?: boolean;
    /** Use relative format (e.g. "2 hours ago") */
    relative?: boolean;
    /** Custom locale (defaults to 'en-GB') */
    locale?: string;
    /** Include timezone */
    showTimezone?: boolean;
};

/**
 * Converts a date to a human-readable format
 * @param date - Date to format (Date object or ISO string)
 * @param options - Formatting options
 * @returns Formatted date string
 * @throws Error if date is invalid
 * @example
 * ```ts
 * humanReadableDate(new Date()) // "23/03/2024, 14:30:45"
 * humanReadableDate(new Date(), { relative: true }) // "2 hours ago"
 * humanReadableDate(new Date(), { includeTime: false }) // "23/03/2024"
 * ```
 */
export function humanReadableDate(date: Date | string, options: DateFormatOptions = {}): string {
    const {
        includeTime = true,
        relative = false,
        locale = 'en-GB',
        showTimezone = false
    } = options;

    // Input validation and conversion
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date provided');
    }

    // Handle relative time format
    if (relative) {
        return getRelativeTimeString(dateObj);
    }

    // Base formatting options
    const formatOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };

    // Add time if requested
    if (includeTime) {
        Object.assign(formatOptions, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }

    // Add timezone if requested
    if (showTimezone) {
        formatOptions.timeZoneName = 'short';
    }

    return dateObj.toLocaleString(locale, formatOptions);
}

/**
 * Converts a date to a relative time string (e.g. "2 hours ago")
 * @param date - Date to convert
 * @returns Relative time string
 */
function getRelativeTimeString(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const diff = Math.floor(diffInSeconds / secondsInUnit);
        if (diff >= 1) {
            return `${diff} ${unit}${diff === 1 ? '' : 's'} ago`;
        }
    }

    return 'just now';
}

/**
 * Formats a date to ISO string with timezone
 * @param date - Date to format
 * @returns ISO formatted date string
 */
export function toISOWithTimezone(date: Date): string {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = (num: number) => String(num).padStart(2, '0');
    
    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        sign + pad(Math.floor(Math.abs(offset) / 60)) +
        ':' + pad(Math.abs(offset) % 60);
}