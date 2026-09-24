// Cloudinary Service for Olivia the Cat! IMG

const STORAGE_KEY_CONFIG = 'olivia_cloudinary_config';

// Default configuration (can be customized by user in the Settings modal)
const DEFAULT_CONFIG = {
  cloudName: 'duy58b6re', // preconfigured default or customizable
  uploadPreset: 'olivia', // unsigned preset created by user
  baseFolder: 'olivia-cat'
};

// Retrieve Cloudinary config from localStorage or defaults
export const getCloudinaryConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("Could not load Cloudinary config from storage", e);
  }
  return DEFAULT_CONFIG;
};

// Save updated Cloudinary config
export const saveCloudinaryConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error("Could not save Cloudinary config", e);
  }
};

// Available default folders
export const DEFAULT_FOLDERS = [
  { id: 'all', name: 'Todos los Pines', slug: '', icon: 'Sparkles', color: '#ff6b8b' },
  { id: 'portraits', name: 'Retratos Reales', slug: 'olivia-cat/portraits', icon: 'Crown', color: '#f59e0b' },
  { id: 'sleepy', name: 'Modo Siesta', slug: 'olivia-cat/sleepy', icon: 'Moon', color: '#8b5cf6' },
  { id: 'adventures', name: 'Aventuras', slug: 'olivia-cat/adventures', icon: 'Compass', color: '#10b981' },
  { id: 'cozy', name: 'Rincones Cálidos', slug: 'olivia-cat/cozy', icon: 'Coffee', color: '#ec4899' },
  { id: 'playtime', name: 'Travesuras & Caza', slug: 'olivia-cat/playtime', icon: 'Zap', color: '#3b82f6' },
  { id: 'memes', name: 'Caritas & Memes', slug: 'olivia-cat/memes', icon: 'Smile', color: '#f97316' }
];

/**
 * Upload an image file directly to Cloudinary
 * @param {File|Blob} file 
 * @param {string} folder 
 * @param {Function} onProgress 
 * @returns {Promise<{url: string, publicId: string, width: number, height: number, format: string, folder: string}>}
 */
export const uploadToCloudinary = async (file, folder = 'olivia-cat/portraits', onProgress = null) => {
  const config = getCloudinaryConfig();
  const cloudName = config.cloudName?.trim();
  const uploadPreset = config.uploadPreset?.trim();

  if (!cloudName) {
    throw new Error('Debes configurar el Cloud Name de Cloudinary en los ajustes.');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset || 'olivia');
  if (folder) {
    formData.append('folder', folder);
  }
  formData.append('tags', 'olivia,cat,pinterest,olivia-the-cat');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.secure_url || data.url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            bytes: data.bytes,
            folder: data.folder || folder,
            createdAt: data.created_at
          });
        } catch (err) {
          reject(new Error('Respuesta inválida de Cloudinary'));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          const message = errData.error?.message || `Error ${xhr.status} de Cloudinary`;
          reject(new Error(message));
        } catch (e) {
          reject(new Error(`Error ${xhr.status} al subir a Cloudinary`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Error de red al intentar conectar con Cloudinary'));
    };

    xhr.send(formData);
  });
};

/**
 * Generate an optimized Cloudinary URL with transformations
 */
export const getOptimizedImageUrl = (url, { width = 800, quality = 'auto', format = 'auto' } = {}) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;

  // Insert transformation after /upload/
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const transforms = [];
  if (width) transforms.push(`w_${width}`);
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);

  const transformString = transforms.join(',') + '/';
  return url.slice(0, uploadIndex + 8) + transformString + url.slice(uploadIndex + 8);
};
