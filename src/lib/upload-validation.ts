export interface UploadValidationOptions {
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
}

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

const DEFAULT_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validate a file before uploading. Use this in upload UI components to give
 * immediate feedback and avoid sending invalid bytes to the server.
 */
export function validateFile(
  file: File,
  options: UploadValidationOptions = {},
): UploadValidationResult {
  const allowedMimeTypes = options.allowedMimeTypes || DEFAULT_ALLOWED_MIME_TYPES;
  const maxSizeBytes = options.maxSizeBytes;

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: ${allowedMimeTypes.join(', ')}`,
    };
  }

  if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB exceeds ${(
        maxSizeBytes /
        1024 /
        1024
      ).toFixed(2)} MB limit.`,
    };
  }

  return { valid: true };
}
