import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { env } from '../config/env.js';

// R2 Client (S3-compatible)
const r2Client = env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

/**
 * Upload an image buffer to R2 storage
 * @param imageBuffer - The image data as a Buffer
 * @param originalFilename - Original filename to extract extension
 * @returns Public URL to access the uploaded image
 */
export async function uploadImageToR2(imageBuffer: Buffer, originalFilename: string): Promise<string> {
  if (!r2Client || !env.R2_BUCKET_NAME || !env.R2_PUBLIC_URL) {
    throw new Error('R2 storage is not configured');
  }

  const ext = originalFilename.split('.').pop() || 'png';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: filename,
      Body: imageBuffer,
      ContentType: `image/${ext === 'webp' ? 'webp' : ext === 'jpg' || ext === 'jpeg' ? 'jpeg' : 'png'}`,
    })
  );

  return `${env.R2_PUBLIC_URL}/${filename}`;
}

/**
 * Delete an image from R2 storage
 * @param imageUrl - The public URL of the image
 */
export async function deleteImageFromR2(imageUrl: string): Promise<void> {
  if (!r2Client || !env.R2_BUCKET_NAME) {
    return; // Silently fail if R2 is not configured
  }

  const filename = imageUrl.split('/').pop();
  if (!filename) return;

  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: filename,
      })
    );
  } catch (err) {
    // Ignore errors during deletion
  }
}
