interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  plant_log: { maxAttempts: 1000, windowMs: 24 * 60 * 60 * 1000 }, // 1000/day
  league_create: { maxAttempts: 10, windowMs: 60 * 60 * 1000 }, // 10/hour
  challenge_create: { maxAttempts: 50, windowMs: 60 * 60 * 1000 }, // 50/hour
  bulk_log: { maxAttempts: 20, windowMs: 60 * 60 * 1000 }, // 20/hour
};

class RateLimiter {
  private storage: Storage;
  private prefix = 'ratelimit_';

  constructor() {
    this.storage = localStorage;
  }

  private getKey(userId: string, action: string): string {
    return `${this.prefix}${userId}_${action}`;
  }

  private getRecord(key: string): RateLimitRecord | null {
    const data = this.storage.getItem(key);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private setRecord(key: string, record: RateLimitRecord): void {
    this.storage.setItem(key, JSON.stringify(record));
  }

  /**
   * Check if an action is rate limited
   * @returns true if allowed, false if rate limited
   */
  checkLimit(userId: string, action: string): boolean {
    const config = DEFAULT_LIMITS[action];
    if (!config) {
      console.warn(`No rate limit config for action: ${action}`);
      return true; // Allow if not configured
    }

    const key = this.getKey(userId, action);
    const now = Date.now();
    const record = this.getRecord(key);

    // No record or expired - allow and create new record
    if (!record || now >= record.resetAt) {
      this.setRecord(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      return true;
    }

    // Within window - check count
    if (record.count >= config.maxAttempts) {
      return false; // Rate limited!
    }

    // Increment count
    record.count++;
    this.setRecord(key, record);
    return true;
  }

  /**
   * Get remaining attempts for an action
   */
  getRemaining(userId: string, action: string): number {
    const config = DEFAULT_LIMITS[action];
    if (!config) return Infinity;

    const key = this.getKey(userId, action);
    const now = Date.now();
    const record = this.getRecord(key);

    if (!record || now >= record.resetAt) {
      return config.maxAttempts;
    }

    return Math.max(0, config.maxAttempts - record.count);
  }

  /**
   * Get time until rate limit resets (in ms)
   */
  getResetTime(userId: string, action: string): number {
    const key = this.getKey(userId, action);
    const record = this.getRecord(key);

    if (!record) return 0;

    const now = Date.now();
    return Math.max(0, record.resetAt - now);
  }

  /**
   * Manually reset a user's rate limit (for testing/admin)
   */
  reset(userId: string, action: string): void {
    const key = this.getKey(userId, action);
    this.storage.removeItem(key);
  }

  /**
   * Clear all rate limits for a user (on logout)
   */
  clearUser(userId: string): void {
    const keys = Object.keys(this.storage);
    const userPrefix = `${this.prefix}${userId}_`;

    keys.forEach(key => {
      if (key.startsWith(userPrefix)) {
        this.storage.removeItem(key);
      }
    });
  }
}

export const rateLimiter = new RateLimiter();

// Helper to format time remaining
export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}