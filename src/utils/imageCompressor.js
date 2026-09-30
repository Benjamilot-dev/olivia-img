/**
 * Client-side Image Compression Utility
 * Prevents multi-megabyte base64 uploads and quota exceeded errors.
 */

/**
 * Compress an image File or Blob using HTML5 Canvas
 * @param {File|Blob} file 
 * @param {Object} options 
 * @returns {Promise<{ file: File, dataUrl: string, width: number, height: number, sizeBytes: number }>}
 */
export async function compressImage(file, { maxWidth = 1400, maxHeight = 1400, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No se proporcionó ningún archivo para comprimir.'));
    }

    // If not an image, resolve with original
    if (file.type && !file.type.startsWith('image/')) {
      return resolve({ file, dataUrl: null, width: 0, height: 0, sizeBytes: file.size });
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al decodificar la imagen en el navegador.'));

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve({ file, dataUrl: reader.result, width, height, sizeBytes: file.size });
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with controlled quality
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({ file, dataUrl, width, height, sizeBytes: dataUrl.length });
            }

            const fileName = (file.name || 'image').replace(/\.[^/.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });

            resolve({
              file: compressedFile,
              dataUrl,
              width,
              height,
              sizeBytes: blob.size
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Recompress an existing base64 Data URL to reduce its byte size
 * @param {string} dataUrl 
 * @param {Object} options 
 * @returns {Promise<string>} compressed dataUrl
 */
export async function compressDataUrl(dataUrl, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(dataUrl); // Return original if error
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const optimizedUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(optimizedUrl.length < dataUrl.length ? optimizedUrl : dataUrl);
    };

    img.src = dataUrl;
  });
}
