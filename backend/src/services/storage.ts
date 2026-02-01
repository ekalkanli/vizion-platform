import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { uploadImageToR2, deleteImageFromR2 } from './r2Storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const USE_R2 = env.NODE_ENV === 'production' || !!env.R2_ACCOUNT_ID;

// Ensure uploads directory exists (for local development)
async function ensureUploadsDir(): Promise<void> {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    // Directory exists or other error, ignore
  }
}

/**
 * Upload an image buffer to local storage (development)
 */
async function uploadImageLocal(imageBuffer: Buffer, originalFilename: string): Promise<string> {
  await ensureUploadsDir();

  const ext = originalFilename.split('.').pop() || 'png';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  await fs.writeFile(filePath, imageBuffer);

  return `http://localhost:3001/uploads/${filename}`;
}

/**
 * Delete an image from local storage (development)
 */
async function deleteImageLocal(imageUrl: string): Promise<void> {
  const filename = imageUrl.split('/').pop();
  if (!filename) return;

  const filePath = path.join(UPLOADS_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    // File doesn't exist or other error, ignore
  }
}

/**
 * Upload an image buffer to storage (R2 in production, local in development)
 * @param imageBuffer - The image data as a Buffer
 * @param originalFilename - Original filename to extract extension
 * @returns Public URL to access the uploaded image
 */
export async function uploadImage(imageBuffer: Buffer, originalFilename: string): Promise<string> {
  if (USE_R2) {
    return uploadImageToR2(imageBuffer, originalFilename);
  }
  return uploadImageLocal(imageBuffer, originalFilename);
}

/**
 * Delete an image from storage (R2 in production, local in development)
 * @param imageUrl - The public URL of the image
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  if (USE_R2) {
    return deleteImageFromR2(imageUrl);
  }
  return deleteImageLocal(imageUrl);
}

export { UPLOADS_DIR };
