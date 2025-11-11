// lib/fileValidation.ts

export const FILE_VALIDATION = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
    acceptString: 'image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif',
  },
  video: {
    maxSize: 50 * 1024 * 1024, // 50MB
    acceptedFormats: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'],
    acceptString: 'video/mp4,video/quicktime,video/webm',
  },
  pdf: {
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedFormats: ['application/pdf'],
    acceptString: 'application/pdf',
  },
};

export type FileValidationResult = {
  valid: boolean;
  error?: string;
};

export function validateImageFile(file: File): FileValidationResult {
  if (!FILE_VALIDATION.image.acceptedFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato de imagen no válido. Solo se aceptan JPG, PNG, WebP y HEIC.',
    };
  }

  if (file.size > FILE_VALIDATION.image.maxSize) {
    return {
      valid: false,
      error: `La imagen es muy pesada. Tamaño máximo: ${FILE_VALIDATION.image.maxSize / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

export function validateVideoFile(file: File): FileValidationResult {
  if (!FILE_VALIDATION.video.acceptedFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato de video no válido. Solo se aceptan MP4, MOV y WebM.',
    };
  }

  if (file.size > FILE_VALIDATION.video.maxSize) {
    return {
      valid: false,
      error: `El video es muy pesado. Tamaño máximo: ${FILE_VALIDATION.video.maxSize / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

export function validatePDFFile(file: File): FileValidationResult {
  if (!FILE_VALIDATION.pdf.acceptedFormats.includes(file.type)) {
    return {
      valid: false,
      error: 'Solo se aceptan archivos PDF.',
    };
  }

  if (file.size > FILE_VALIDATION.pdf.maxSize) {
    return {
      valid: false,
      error: `El PDF es muy pesado. Tamaño máximo: ${FILE_VALIDATION.pdf.maxSize / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

export function validateMediaFile(file: File): FileValidationResult {
  // Valida imágenes o videos
  const isImage = FILE_VALIDATION.image.acceptedFormats.includes(file.type);
  const isVideo = FILE_VALIDATION.video.acceptedFormats.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: 'Solo se aceptan imágenes (JPG, PNG, WebP) o videos (MP4, MOV).',
    };
  }

  if (isImage) {
    return validateImageFile(file);
  }

  return validateVideoFile(file);
}