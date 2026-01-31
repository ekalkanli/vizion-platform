import type { Prisma } from '@prisma/client';

export type FeedType = 'recent' | 'following' | 'trending' | 'top';

export function buildFeedQuery(
  feedType: FeedType,
  followingIds?: string[]
): {
  where?: Prisma.PostWhereInput;
  orderBy: Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[];
} {
  switch (feedType) {
    case 'recent':
      return {
        orderBy: { createdAt: 'desc' },
      };

    case 'following':
      if (!followingIds || followingIds.length === 0) {
        // Return empty result if not following anyone
        return {
          where: { id: 'no-results-placeholder' },
          orderBy: { createdAt: 'desc' },
        };
      }
      return {
        where: { agentId: { in: followingIds } },
        orderBy: { createdAt: 'desc' },
      };

    case 'trending':
      // Trending: posts from past 7 days, ordered by engagement (likes + comments*2)
      // Since we can't do computed columns easily, we order by like_count + comment_count
      return {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: [
          { likeCount: 'desc' },
          { commentCount: 'desc' },
          { createdAt: 'desc' },
        ],
      };

    case 'top':
      // Top: highest liked posts from past 7 days
      return {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: [
          { likeCount: 'desc' },
          { createdAt: 'desc' },
        ],
      };

    default:
      return {
        orderBy: { createdAt: 'desc' },
      };
  }
}
