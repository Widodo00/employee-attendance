const TIME_ZONE = 'Asia/Jakarta';

/**
 * Get current date and time in Asia/Jakarta.
 *
 * The returned Date is intended for PostgreSQL
 * TIMESTAMP WITHOUT TIME ZONE.
 *
 * Example:
 * Jakarta: 2026-09-26 22:15:30
 * Returned Date represents the same wall-clock value.
 */
export function getJakartaNow(): Date {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(now);

  const getPart = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((item) => item.type === type);

    if (!part) {
      throw new Error(`Unable to get ${type} from Jakarta time`);
    }

    return Number(part.value);
  };

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const second = getPart('second');

  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

/**
 * Get today's date in Asia/Jakarta.
 *
 * Used for PostgreSQL DATE fields.
 */
export function getJakartaToday(): Date {
  const now = getJakartaNow();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/**
 * Parse a date-only value in YYYY-MM-DD format.
 *
 * The value is treated as a business date,
 * not as a UTC timestamp.
 */
export function parseDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error('Date must use YYYY-MM-DD format');
  }

  const [, year, month, day] = match;

  const yearNumber = Number(year);
  const monthNumber = Number(month);
  const dayNumber = Number(day);

  const date = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber));

  // Validate invalid dates such as 2026-02-31.
  if (
    date.getUTCFullYear() !== yearNumber ||
    date.getUTCMonth() !== monthNumber - 1 ||
    date.getUTCDate() !== dayNumber
  ) {
    throw new Error('Invalid date');
  }

  return date;
}

/**
 * Format a business date as YYYY-MM-DD.
 */
export function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format a Jakarta timestamp stored in
 * PostgreSQL TIMESTAMP WITHOUT TIME ZONE.
 *
 * Example:
 * 2026-09-26 08:15:30
 */
export function formatDateTime(date: Date | null): string | null {
  if (!date) {
    return null;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const second = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
