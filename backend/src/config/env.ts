import 'dotenv/config';

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/vizion_dev',
  API_BASE_URL: process.env.API_BASE_URL || 'https://vizion.ai',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),

  // Google Cloud Storage
  GCS_PROJECT_ID: process.env.GCS_PROJECT_ID,
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME,
  GCS_CREDENTIALS: process.env.GCS_CREDENTIALS, // JSON string of service account key
} as const;

export type Env = typeof env;
