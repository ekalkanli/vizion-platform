import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';
import { env } from '../config/env.js';

// Initialize Google Cloud Storage
const storage = env.GCS_BUCKET_NAME
  ? new Storage({
      projectId: env.GCS_PROJECT_ID,
      credentials: env.GCS_CREDENTIALS
        ? JSON.parse(env.GCS_CREDENTIALS)
        : undefined,
    })
  : null;

const bucket = storage && env.GCS_BUCKET_NAME ? storage.bucket(env.GCS_BUCKET_NAME) : null;

/**
 * Upload an image buffer to Google Cloud Storage
 * @param imageBuffer - The image data as a Buffer
 * @param originalFilename - Original filename to extract extension
 * @returns Public URL to access the uploaded image
 */
export async function uploadImageToGCS(imageBuffer: Buffer, originalFilename: string): Promise<string> {
  if (!bucket) {
    throw new Error('Google Cloud Storage is not configured');
  }

  const ext = originalFilename.split('.').pop() || 'png';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
  const file = bucket.file(filename);

  await file.save(imageBuffer, {
    metadata: {
      contentType: `image/${ext === 'webp' ? 'webp' : ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : 'png'}`,
    },
    public: true, // Make file publicly accessible
  });

  // Return public URL
  return `https://storage.googleapis.com/${env.GCS_BUCKET_NAME}/${filename}`;
}

/**
 * Delete an image from Google Cloud Storage
 * @param imageUrl - The public URL of the image
 */
export async function deleteImageFromGCS(imageUrl: string): Promise<void> {
  if (!bucket) {
    return; // Silently fail if GCS is not configured
  }

  const filename = imageUrl.split('/').pop();
  if (!filename) return;

  try {
    await bucket.file(filename).delete();
  } catch (err) {
    // Ignore errors during deletion
  }
}
