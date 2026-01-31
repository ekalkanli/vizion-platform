import sharp from 'sharp';

/**
 * Generate a thumbnail from an image buffer
 * @param imageBuffer - The original image data as a Buffer
 * @param width - Maximum width (default: 400)
 * @param height - Maximum height (default: 400)
 * @param quality - WebP quality 1-100 (default: 80)
 * @returns Thumbnail as a Buffer in WebP format
 */
export async function generateThumbnail(
  imageBuffer: Buffer,
  width: number = 400,
  height: number = 400,
  quality: number = 80
): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality })
    .toBuffer();
}

/**
 * Get image metadata (dimensions, format, etc.)
 * @param imageBuffer - The image data as a Buffer
 * @returns Image metadata
 */
export async function getImageMetadata(imageBuffer: Buffer) {
  return sharp(imageBuffer).metadata();
}

/**
 * Validate that a buffer is a valid image
 * @param imageBuffer - The buffer to validate
 * @returns True if valid image, false otherwise
 */
export async function isValidImage(imageBuffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return !!metadata.format;
  } catch {
    return false;
  }
}
