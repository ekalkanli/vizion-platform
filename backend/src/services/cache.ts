import { createClient, RedisClientType } from 'redis';

let redis: RedisClientType | null = null;
let isConnected = false;

// TTL values in seconds for different feed types
export const CACHE_TTL = {
  recent: 60,      // 1 minute
  following: 120,  // 2 minutes
  trending: 300,   // 5 minutes
  top: 600,        // 10 minutes
  post: 3600,      // 1 hour for individual posts
} as const;

/**
 * Initialize Redis connection
 * Gracefully handles connection failures - caching is optional
 */
export async function initCache(): Promise<void> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  try {
    redis = createClient({ url: redisUrl });

    redis.on('error', (err) => {
      console.warn('[Cache] Redis error:', err.message);
      isConnected = false;
    });

    redis.on('connect', () => {
      console.log('[Cache] Redis connected');
      isConnected = true;
    });

    redis.on('disconnect', () => {
      console.warn('[Cache] Redis disconnected');
      isConnected = false;
    });

    await redis.connect();
    isConnected = true;
  } catch (error) {
    console.warn('[Cache] Redis unavailable, running without cache:', (error as Error).message);
    redis = null;
    isConnected = false;
  }
}

/**
 * Check if cache is available
 */
export function isCacheAvailable(): boolean {
  return redis !== null && isConnected;
}

/**
 * Get cached feed data
 * @param feedType - Type of feed (recent, following, trending, top)
 * @param key - Cache key suffix (e.g., offset or agent_id)
 * @returns Cached data or null if not found/unavailable
 */
export async function getCachedFeed(
  feedType: string,
  key: string
): Promise<any[] | null> {
  if (!isCacheAvailable()) {
    return null;
  }

  try {
    const cacheKey = `feed:${feedType}:${key}`;
    const cached = await redis!.get(cacheKey);

    if (cached) {
      console.log(`[Cache] HIT: ${cacheKey}`);
      return JSON.parse(cached);
    }

    console.log(`[Cache] MISS: ${cacheKey}`);
    return null;
  } catch (error) {
    console.warn('[Cache] Get error:', (error as Error).message);
    return null;
  }
}

/**
 * Set cached feed data
 * @param feedType - Type of feed
 * @param key - Cache key suffix
 * @param data - Data to cache
 * @param ttl - Time to live in seconds (optional, uses default for feedType)
 */
export async function setCachedFeed(
  feedType: string,
  key: string,
  data: any[],
  ttl?: number
): Promise<void> {
  if (!isCacheAvailable()) {
    return;
  }

  try {
    const cacheKey = `feed:${feedType}:${key}`;
    const cacheTtl = ttl || CACHE_TTL[feedType as keyof typeof CACHE_TTL] || 60;

    await redis!.setEx(cacheKey, cacheTtl, JSON.stringify(data));
    console.log(`[Cache] SET: ${cacheKey} (TTL: ${cacheTtl}s)`);
  } catch (error) {
    console.warn('[Cache] Set error:', (error as Error).message);
  }
}

/**
 * Invalidate cache for a specific pattern
 * Use when data changes (new post, like, comment)
 * @param pattern - Pattern to match (e.g., "feed:recent:*")
 */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!isCacheAvailable()) {
    return;
  }

  try {
    const keys = await redis!.keys(pattern);
    if (keys.length > 0) {
      await redis!.del(keys);
      console.log(`[Cache] Invalidated ${keys.length} keys matching: ${pattern}`);
    }
  } catch (error) {
    console.warn('[Cache] Invalidate error:', (error as Error).message);
  }
}

/**
 * Close Redis connection
 */
export async function closeCache(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    isConnected = false;
    console.log('[Cache] Redis connection closed');
  }
}
