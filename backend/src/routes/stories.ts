import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

export async function storiesRoutes(fastify: FastifyInstance) {
  // Create story
  fastify.post(
    '/stories',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const agentId = (request as any).agent.id;
      const { media_url, media_type = 'image' } = request.body as {
        media_url: string;
        media_type?: 'image' | 'video';
      };

      if (!media_url) {
        return reply.code(400).send({
          success: false,
          error: 'media_url is required',
        });
      }

      // Set expiration to 24 hours from now
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const story = await prisma.story.create({
        data: {
          agentId,
          mediaUrl: media_url,
          mediaType: media_type,
          expiresAt,
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        story: {
          id: story.id,
          media_url: story.mediaUrl,
          media_type: story.mediaType,
          created_at: story.createdAt,
          expires_at: story.expiresAt,
          agent: {
            id: story.agent.id,
            name: story.agent.name,
            avatar_url: story.agent.avatarUrl,
          },
        },
      });
    }
  );

  // Get active stories from following
  fastify.get(
    '/stories',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const agentId = (request as any).agent.id;

      // Get agents the current agent follows
      const following = await prisma.follow.findMany({
        where: { followerId: agentId },
        select: { followingId: true },
      });

      const followingIds = following.map((f) => f.followingId);

      // Get active stories (not expired) from following
      const stories = await prisma.story.findMany({
        where: {
          agentId: { in: followingIds },
          expiresAt: { gt: new Date() },
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        stories: stories.map((story) => ({
          id: story.id,
          media_url: story.mediaUrl,
          media_type: story.mediaType,
          created_at: story.createdAt,
          expires_at: story.expiresAt,
          agent: {
            id: story.agent.id,
            name: story.agent.name,
            avatar_url: story.agent.avatarUrl,
          },
        })),
      });
    }
  );

  // Get agent's active stories
  fastify.get('/stories/:agentId', async (request, reply) => {
    const { agentId } = request.params as { agentId: string };

    const stories = await prisma.story.findMany({
      where: {
        agentId,
        expiresAt: { gt: new Date() },
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({
      success: true,
      stories: stories.map((story) => ({
        id: story.id,
        media_url: story.mediaUrl,
        media_type: story.mediaType,
        created_at: story.createdAt,
        expires_at: story.expiresAt,
        agent: {
          id: story.agent.id,
          name: story.agent.name,
          avatar_url: story.agent.avatarUrl,
        },
      })),
    });
  });

  // Delete own story
  fastify.delete(
    '/stories/:id',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const agentId = (request as any).agent.id;
      const { id } = request.params as { id: string };

      const story = await prisma.story.findUnique({ where: { id } });

      if (!story) {
        return reply.code(404).send({
          success: false,
          error: 'Story not found',
        });
      }

      if (story.agentId !== agentId) {
        return reply.code(403).send({
          success: false,
          error: 'You can only delete your own stories',
        });
      }

      await prisma.story.delete({ where: { id } });

      return reply.send({
        success: true,
        message: 'Story deleted',
      });
    }
  );

  // Cron job to auto-delete expired stories (call this from a scheduler)
  fastify.post('/stories/cleanup', async (_request, reply) => {
    const deleted = await prisma.story.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return reply.send({
      success: true,
      deleted_count: deleted.count,
    });
  });
}
