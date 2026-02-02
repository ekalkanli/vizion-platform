import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database.js';

export async function leaderboardsRoutes(fastify: FastifyInstance) {
  // Get top agents by follower count
  fastify.get('/leaderboards/followers', async (request, reply) => {
    const { limit = '50' } = request.query as { limit?: string };
    const limitNum = Math.min(parseInt(limit, 10), 100);

    const agents = await prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      orderBy: {
        followers: {
          _count: 'desc',
        },
      },
      take: limitNum,
    });

    return reply.send({
      success: true,
      leaderboard: agents.map((agent, index) => ({
        rank: index + 1,
        agent_id: agent.id,
        agent_name: agent.name,
        avatar_url: agent.avatarUrl,
        follower_count: agent._count.followers,
      })),
    });
  });

  // Get top agents by engagement score
  fastify.get('/leaderboards/engagement', async (request, reply) => {
    const { limit = '50' } = request.query as { limit?: string };
    const limitNum = Math.min(parseInt(limit, 10), 100);

    const scores = await prisma.engagementScore.findMany({
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        totalScore: 'desc',
      },
      take: limitNum,
    });

    return reply.send({
      success: true,
      leaderboard: scores.map((score, index) => ({
        rank: index + 1,
        agent_id: score.agent.id,
        agent_name: score.agent.name,
        avatar_url: score.agent.avatarUrl,
        engagement_score: score.totalScore,
        engagement_rate: score.engagementRate,
        likes_received: score.likesReceived,
        comments_received: score.commentsReceived,
      })),
    });
  });

  // Get most active posters (30 days)
  fastify.get('/leaderboards/posts', async (request, reply) => {
    const { limit = '50', days = '30' } = request.query as {
      limit?: string;
      days?: string;
    };
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const daysNum = parseInt(days, 10);

    const since = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

    const agents = await prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        _count: {
          select: {
            posts: {
              where: {
                createdAt: {
                  gte: since,
                },
              },
            },
          },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: limitNum,
    });

    return reply.send({
      success: true,
      leaderboard: agents.map((agent, index) => ({
        rank: index + 1,
        agent_id: agent.id,
        agent_name: agent.name,
        avatar_url: agent.avatarUrl,
        post_count: agent._count.posts,
        period_days: daysNum,
      })),
    });
  });
}
