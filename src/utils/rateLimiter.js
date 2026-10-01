/**
 * Client-Side Rate Limiter & Anti-Spam / Anti-Flood Engine
 * Protects Firebase quotas and prevents malicious flooding of comments, likes, and pin uploads.
 */

const actionHistory = new Map();

/**
 * Checks if an action is allowed based on rate limits.
 * @param {string} action Unique action identifier (e.g. 'comment', 'upload', 'like')
 * @param {Object} options
 * @param {number} options.minIntervalMs Minimum time required between consecutive actions
 * @param {number} options.maxPerWindow Maximum actions allowed within windowMs
 * @param {number} options.windowMs Time window in milliseconds
 * @returns {{ allowed: boolean, waitSeconds: number, message: string }}
 */
export function checkRateLimit(action, { minIntervalMs = 2500, maxPerWindow = 6, windowMs = 60000 } = {}) {
  const now = Date.now();
  const timestamps = actionHistory.get(action) || [];

  // Filter out timestamps older than the active window
  const recentTimestamps = timestamps.filter((t) => now - t < windowMs);
  actionHistory.set(action, recentTimestamps);

  // Check 1: Minimum interval between individual actions (e.g. at least 3 seconds)
  if (recentTimestamps.length > 0) {
    const lastActionTime = recentTimestamps[recentTimestamps.length - 1];
    const elapsed = now - lastActionTime;
    if (elapsed < minIntervalMs) {
      const waitSeconds = Math.ceil((minIntervalMs - elapsed) / 1000);
      return {
        allowed: false,
        waitSeconds,
        message: `Por favor espera ${waitSeconds} segundo${waitSeconds > 1 ? 's' : ''} antes de realizar esta acción ⏳`
      };
    }
  }

  // Check 2: Maximum actions within window (e.g. max 6 comments per minute)
  if (recentTimestamps.length >= maxPerWindow) {
    const oldestInWindow = recentTimestamps[0];
    const waitSeconds = Math.ceil((windowMs - (now - oldestInWindow)) / 1000);
    return {
      allowed: false,
      waitSeconds,
      message: `Has alcanzado el límite de intentos. Espera ${waitSeconds} segundo${waitSeconds > 1 ? 's' : ''} para continuar ⏳`
    };
  }

  return { allowed: true, waitSeconds: 0, message: '' };
}

/**
 * Records that an action successfully occurred.
 * @param {string} action 
 */
export function recordAction(action) {
  const now = Date.now();
  const timestamps = actionHistory.get(action) || [];
  timestamps.push(now);
  actionHistory.set(action, timestamps);
}

/**
 * Clears rate limiting history (e.g. on logout)
 */
export function resetRateLimits() {
  actionHistory.clear();
}
