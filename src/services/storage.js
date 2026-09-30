/**
 * Safe LocalStorage Service for Olivia the Cat! IMG
 * Handles QuotaExceededError, SSR/private-browsing restrictions, and cache pruning gracefully.
 */

const PINS_CACHE_KEY = 'olivia_pins';
const FOLDERS_CACHE_KEY = 'olivia_folders';
const LIKED_PINS_KEY = 'olivia_liked_pins';
const SAVED_PINS_KEY = 'olivia_saved_pins';
const ADMIN_KEY = 'olivia_is_admin';
const STATUS_KEY = 'olivia_user_status';

export const safeStorage = {
  /**
   * Safely retrieve a string from localStorage
   */
  getItem(key, fallback = null) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const value = localStorage.getItem(key);
      return value !== null ? value : fallback;
    } catch (e) {
      console.warn(`[safeStorage] Error reading "${key}":`, e);
      return fallback;
    }
  },

  /**
   * Safely retrieve and parse JSON from localStorage
   */
  getJSON(key, fallback = null) {
    try {
      const raw = this.getItem(key, null);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[safeStorage] Error parsing JSON for "${key}":`, e);
      return fallback;
    }
  },

  /**
   * Safely set a string in localStorage, handling QuotaExceededError gracefully
   */
  setItem(key, value) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn(`[safeStorage] Failed to set "${key}":`, e.message || e);
      // Handle quota exceeded
      if (
        e.name === 'QuotaExceededError' ||
        e.code === 22 ||
        e.code === 1014 ||
        e.number === -2147024882
      ) {
        // Prune non-critical large caches
        try {
          localStorage.removeItem(PINS_CACHE_KEY);
        } catch {}

        // If the key we failed to set wasn't the pins cache, retry saving it now
        if (key !== PINS_CACHE_KEY) {
          try {
            localStorage.setItem(key, value);
            return true;
          } catch {}
        }
      }
      return false;
    }
  },

  /**
   * Safely serialize and store JSON in localStorage
   */
  setJSON(key, value) {
    try {
      const str = JSON.stringify(value);
      return this.setItem(key, str);
    } catch (e) {
      console.warn(`[safeStorage] Error serializing JSON for "${key}":`, e);
      return false;
    }
  },

  /**
   * Safely remove an item from localStorage
   */
  removeItem(key) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[safeStorage] Error removing "${key}":`, e);
    }
  },

  /**
   * Safely clean up heavy obsolete caches on startup
   */
  cleanupHeavyCaches() {
    try {
      const pinsRaw = this.getItem(PINS_CACHE_KEY, '');
      // If pins cache is over 500KB or contains large base64 images, purge it
      if (pinsRaw && (pinsRaw.length > 500000 || pinsRaw.includes('data:image/'))) {
        console.info('[safeStorage] Cleared oversized pins cache from localStorage to prevent quota errors.');
        this.removeItem(PINS_CACHE_KEY);
      }
    } catch {}
  }
};

/**
 * Helper to cache pins safely without ever exceeding localStorage quota.
 * Strips huge base64 data URLs before caching.
 */
export const cachePinsSafely = (pins) => {
  if (!Array.isArray(pins) || pins.length === 0) return;
  try {
    // Sanitize pins for cache: do not store heavy data URLs in localStorage
    const lightweightPins = pins.slice(0, 50).map((pin) => {
      if (pin.imageUrl && pin.imageUrl.startsWith('data:')) {
        // Don't save huge base64 to localStorage; RTDB is the remote store
        return {
          ...pin,
          imageUrl: pin.imageUrl.length < 50000 ? pin.imageUrl : ''
        };
      }
      return pin;
    });

    const serialized = JSON.stringify(lightweightPins);
    // Only cache if smaller than 500KB
    if (serialized.length < 500000) {
      safeStorage.setItem(PINS_CACHE_KEY, serialized);
    } else {
      safeStorage.removeItem(PINS_CACHE_KEY);
    }
  } catch (e) {
    console.warn('[safeStorage] Could not cache pins safely:', e);
  }
};
