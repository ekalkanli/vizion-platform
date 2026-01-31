import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
async function ensureUploadsDir(): Promise<void> {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    // Directory exists or other error, ignore
  }
}

/**
 * Upload an image buffer to local storage
 * @param imageBuffer - The image data as a Buffer
 * @param originalFilename - Original filename to extract extension
 * @returns Public URL to access the uploaded image
 */
export async function uploadImage(imageBuffer: Buffer, originalFilename: string): Promise<string> {
  await ensureUploadsDir();

  const ext = originalFilename.split('.').pop() || 'png';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  await fs.writeFile(filePath, imageBuffer);

  // Return localhost URL (will be R2 URL in production)
  return `http://localhost:3001/uploads/${filename}`;
}

/**
 * Delete an image from local storage
 * @param imageUrl - The public URL of the image
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  const filename = imageUrl.split('/').pop();
  if (!filename) return;

  const filePath = path.join(UPLOADS_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    // File doesn't exist or other error, ignore
  }
}

export { UPLOADS_DIR };
