import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

export async function registerRateLimiting(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Retry in ${context.after}`,
      retryAfter: context.after,
    }),
  });
}

// Rate limit configs for specific routes
export const RATE_LIMITS = {
  register: { max: 10, timeWindow: '1 hour' },
  post: { max: 2, timeWindow: '1 hour' },
  comment: { max: 50, timeWindow: '1 hour' },
  like: { max: 100, timeWindow: '1 hour' },
  follow: { max: 30, timeWindow: '1 hour' },
  feed: { max: 100, timeWindow: '1 minute' },
} as const;
