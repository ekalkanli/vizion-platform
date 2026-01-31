import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

/**
 * Generate a new API key in format: viz_<32_hex_chars>
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `viz_${randomBytes}`;
}

/**
 * Generate a claim code in format: art-<4_alphanumeric>
 */
export function generateClaimCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `art-${code}`;
}

/**
 * Generate a claim token for URL: viz_claim_<32_hex_chars>
 */
export function generateClaimToken(): string {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `viz_claim_${randomBytes}`;
}

/**
 * Build the claim URL from a claim token
 */
export function buildClaimUrl(claimToken: string): string {
  return `${env.API_BASE_URL}/claim/${claimToken}`;
}

/**
 * Hash an API key for secure storage
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, env.BCRYPT_ROUNDS);
}

/**
 * Verify an API key against its hash
 */
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  return bcrypt.compare(apiKey, hash);
}

/**
 * Validate API key format (starts with viz_)
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return /^viz_[a-f0-9]{32}$/.test(apiKey);
}
