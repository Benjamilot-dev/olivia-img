/**
 * Security & Anti-XSS Utilities for Olivia the Cat! IMG
 * Provides strict URL sanitization, text filtering, and payload neutralization.
 */
import DOMPurify from 'dompurify';

// Allowed safe URL protocols
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'blob:', 'mailto:']);

/**
 * Checks if a URL is strictly safe for navigation or media rendering.
 * Blocks javascript:, data:text/html, vbscript:, and malformed control characters.
 * @param {string} url 
 * @param {boolean} allowDataImage Whether to allow base64 images (data:image/...)
 * @returns {boolean}
 */
export const isSafeUrl = (url, allowDataImage = true) => {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  // Block dangerous control characters or null bytes
  if (/[\x00-\x1F\x7F]/.test(trimmed)) return false;

  // Check for safe data:image formats (png, jpeg, jpg, webp, gif, bmp, avif)
  if (trimmed.startsWith('data:')) {
    if (!allowDataImage) return false;
    // Allow only safe raster image MIME types (specifically prevent data:text/html, data:text/javascript, etc.)
    const safeDataImageRegex = /^data:image\/(png|jpe?g|webp|gif|bmp|avif);base64,[A-Za-z0-9+/=]+$/i;
    return safeDataImageRegex.test(trimmed);
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitizes a URL, returning a safe fallback if it is malicious or malformed.
 * @param {string} url 
 * @param {string} fallback Safe fallback (default: empty string)
 * @returns {string}
 */
export const sanitizeUrl = (url, fallback = '') => {
  if (isSafeUrl(url, true)) {
    return url.trim();
  }
  return fallback;
};

/**
 * Sanitizes plain text input by stripping all HTML tags and dangerous entities.
 * Ensures user-entered strings (titles, comments, descriptions) contain no executable markup.
 * @param {string} input 
 * @param {number} maxLength Optional max length constraint
 * @returns {string}
 */
export const sanitizeText = (input, maxLength = 2000) => {
  if (input === null || input === undefined) return '';
  const str = String(input);
  if (!str.trim()) return '';

  // Use DOMPurify with ALLOWED_TAGS: [] to strip all HTML tags
  const cleaned = DOMPurify.sanitize(str, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  // Limit character length to prevent buffer/UI overflow attacks
  return cleaned.trim().slice(0, maxLength);
};

/**
 * Sanitizes an array of tags (e.g. ['olivia', '<script>alert(1)</script>']).
 * @param {string[]|string} tags 
 * @returns {string[]}
 */
export const sanitizeTags = (tags) => {
  let list = [];
  if (Array.isArray(tags)) {
    list = tags;
  } else if (typeof tags === 'string') {
    list = tags.split(',');
  }

  return list
    .map((t) => sanitizeText(t, 40).toLowerCase().replace(/[^a-z0-9_\u00C0-\u017F-]/g, ''))
    .filter((t) => t.length > 0 && t.length <= 40);
};

/**
 * Safely opens an external URL in a new window/tab, protecting against tab-nabbing and XSS.
 * @param {string} url 
 */
export const safeOpenUrl = (url) => {
  if (!isSafeUrl(url, false)) {
    console.warn('Blocked unsafe URL navigation attempt:', url);
    return;
  }
  const newWin = window.open();
  if (newWin) {
    newWin.opener = null;
    newWin.location = url;
  }
};

/**
 * Recursively sanitizes a comment object.
 * @param {Object} comment 
 * @returns {Object}
 */
export const sanitizeComment = (comment) => {
  if (!comment || typeof comment !== 'object') return null;
  return {
    id: sanitizeText(comment.id, 50) || `c_${Date.now()}`,
    author: sanitizeText(comment.author, 60) || 'Invitado',
    avatar: sanitizeUrl(comment.avatar, '/olivia-logo.png'),
    text: sanitizeText(comment.text, 1000),
    date: sanitizeText(comment.date, 40) || 'Ahora'
  };
};

/**
 * Recursively sanitizes a pin object to ensure all fields are safe before storing or rendering.
 * @param {Object} pin 
 * @returns {Object}
 */
export const sanitizePin = (pin) => {
  if (!pin || typeof pin !== 'object') return null;

  return {
    ...pin,
    id: sanitizeText(pin.id, 100) || `pin_${Date.now()}`,
    title: sanitizeText(pin.title, 120) || 'Sin título',
    description: sanitizeText(pin.description, 1000),
    imageUrl: sanitizeUrl(pin.imageUrl, '/olivia-logo.png'),
    cloudinaryFolder: sanitizeText(pin.cloudinaryFolder, 80),
    visibility: pin.visibility === 'members' ? 'members' : 'public',
    likesCount: Number.isFinite(pin.likesCount) ? Math.max(0, pin.likesCount) : 0,
    savesCount: Number.isFinite(pin.savesCount) ? Math.max(0, pin.savesCount) : 0,
    tags: sanitizeTags(pin.tags),
    author: {
      name: sanitizeText(pin.author?.name, 60) || 'Olivia Fan',
      avatar: sanitizeUrl(pin.author?.avatar, '/olivia-logo.png'),
      badge: sanitizeText(pin.author?.badge, 30) || 'Creador'
    },
    authorUid: sanitizeText(pin.authorUid, 128) || null,
    authorEmail: sanitizeText(pin.authorEmail, 120) || null,
    comments: Array.isArray(pin.comments)
      ? pin.comments.map(sanitizeComment).filter(Boolean)
      : [],
    createdAt: sanitizeText(pin.createdAt, 50) || new Date().toISOString()
  };
};

/**
 * Sanitizes a folder object.
 * @param {Object} folder 
 * @returns {Object}
 */
export const sanitizeFolder = (folder) => {
  if (!folder || typeof folder !== 'object') return null;

  // Sanitize hex/rgb/hsl color code safely
  const rawColor = String(folder.color || '').trim();
  const safeColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawColor) ? rawColor : '#f59e0b';

  return {
    ...folder,
    id: sanitizeText(folder.id, 50),
    name: sanitizeText(folder.name, 60),
    slug: sanitizeText(folder.slug, 80).toLowerCase().replace(/[^a-z0-9/_-]/g, ''),
    icon: sanitizeText(folder.icon, 30) || 'Folder',
    color: safeColor
  };
};
