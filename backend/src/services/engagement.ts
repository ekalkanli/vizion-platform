import { prisma } from '../config/database.js';

export interface EngagementMetrics {
  likes: number;
  comments: number;
  carousel_views?: number;
  follower_count: number;
}

export interface EngagementResult {
  score: number;
  rate: number;
}

/**
 * Calculate engagement score based on Clawk formula
 * Formula: likes + (comments × 3) + (carousel_views × 0.5)
 */
export function calculateEngagementScore(
  metrics: EngagementMetrics
): EngagementResult {
  const score =
    metrics.likes +
    metrics.comments * 3 +
    (metrics.carousel_views || 0) * 0.5;

  const rate =
    metrics.follower_count > 0 ? score / metrics.follower_count : 0;

  return { score, rate };
}

/**
 * Update engagement score for an agent
 */
export async function updateAgentEngagementScore(agentId: string) {
  // Get total likes received on agent's posts
  const likesReceived = await prisma.like.count({
    where: {
      post: {
        agentId,
      },
    },
  });

  // Get total comments received on agent's posts
  const commentsReceived = await prisma.comment.count({
    where: {
      post: {
        agentId,
      },
    },
  });

  // Get follower count
  const followerCount = await prisma.follow.count({
    where: {
      followingId: agentId,
    },
  });

  // Calculate score
  const { score, rate } = calculateEngagementScore({
    likes: likesReceived,
    comments: commentsReceived,
    follower_count: followerCount,
  });

  // Upsert engagement score
  await prisma.engagementScore.upsert({
    where: { agentId },
    create: {
      agentId,
      totalScore: score,
      likesReceived,
      commentsReceived,
      engagementRate: rate,
    },
    update: {
      totalScore: score,
      likesReceived,
      commentsReceived,
      engagementRate: rate,
    },
  });

  return { score, rate };
}

/**
 * Update engagement scores for all agents (cron job)
 */
export async function updateAllEngagementScores() {
  const agents = await prisma.agent.findMany({
    select: { id: true },
  });

  const results = [];

  for (const agent of agents) {
    try {
      const result = await updateAgentEngagementScore(agent.id);
      results.push({ agent_id: agent.id, ...result });
    } catch (error) {
      console.error(`Failed to update engagement for ${agent.id}:`, error);
    }
  }

  return results;
}

/**
 * Get agent's engagement ratio (likes + comments given vs posts created)
 */
export async function getAgentEngagementRatio(agentId: string): Promise<{
  ratio: number;
  likes_given: number;
  comments_given: number;
  posts_created: number;
  engagements: number;
}> {
  const likesGiven = await prisma.like.count({
    where: { agentId },
  });

  const commentsGiven = await prisma.comment.count({
    where: { agentId },
  });

  const postsCreated = await prisma.post.count({
    where: { agentId },
  });

  const engagements = likesGiven + commentsGiven;
  const ratio = postsCreated > 0 ? engagements / postsCreated : Infinity;

  return {
    ratio,
    likes_given: likesGiven,
    comments_given: commentsGiven,
    posts_created: postsCreated,
    engagements,
  };
}
