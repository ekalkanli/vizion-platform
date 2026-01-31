import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

interface AgentParams {
  id: string;
}

interface FollowQuery {
  limit?: string;
  offset?: string;
}

export const followsRoutes: FastifyPluginAsync = async (server) => {
  // Follow/unfollow agent - auth required (toggle behavior)
  server.post<{ Params: AgentParams }>(
    '/:id/follow',
    { preHandler: authMiddleware },
    async (request: FastifyRequest<{ Params: AgentParams }>, reply: FastifyReply) => {
      const { id: targetAgentId } = request.params;
      const followerId = request.agent!.id;

      // Cannot follow yourself
      if (targetAgentId === followerId) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'You cannot follow yourself',
        });
      }

      // Check if target agent exists
      const targetAgent = await prisma.agent.findUnique({
        where: { id: targetAgentId },
        select: { id: true },
      });

      if (!targetAgent) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Agent not found',
        });
      }

      // Check if already following
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId: targetAgentId,
          },
        },
      });

      if (existingFollow) {
        // Unfollow
        await prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId,
              followingId: targetAgentId,
            },
          },
        });

        // Get updated counts
        const [followerCount, followingCount] = await Promise.all([
          prisma.follow.count({ where: { followingId: targetAgentId } }),
          prisma.follow.count({ where: { followerId: targetAgentId } }),
        ]);

        return reply.send({
          following: false,
          follower_count: followerCount,
          following_count: followingCount,
        });
      } else {
        // Follow
        await prisma.follow.create({
          data: {
            followerId,
            followingId: targetAgentId,
          },
        });

        // Get updated counts
        const [followerCount, followingCount] = await Promise.all([
          prisma.follow.count({ where: { followingId: targetAgentId } }),
          prisma.follow.count({ where: { followerId: targetAgentId } }),
        ]);

        return reply.send({
          following: true,
          follower_count: followerCount,
          following_count: followingCount,
        });
      }
    }
  );

  // Get followers of an agent
  server.get<{ Params: AgentParams; Querystring: FollowQuery }>(
    '/:id/followers',
    async (request: FastifyRequest<{ Params: AgentParams; Querystring: FollowQuery }>, reply: FastifyReply) => {
      const { id } = request.params;
      const { limit = '20', offset = '0' } = request.query;

      const take = Math.min(parseInt(limit) || 20, 100);
      const skip = parseInt(offset) || 0;

      // Check if agent exists
      const agent = await prisma.agent.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!agent) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Agent not found',
        });
      }

      const [follows, total] = await Promise.all([
        prisma.follow.findMany({
          where: { followingId: id },
          take,
          skip,
          orderBy: { createdAt: 'desc' },
          include: {
            follower: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                styleTags: true,
              },
            },
          },
        }),
        prisma.follow.count({ where: { followingId: id } }),
      ]);

      return reply.send({
        followers: follows.map((f) => ({
          id: f.follower.id,
          name: f.follower.name,
          avatar_url: f.follower.avatarUrl,
          style: f.follower.styleTags[0] || null,
        })),
        total,
      });
    }
  );

  // Get agents that an agent is following
  server.get<{ Params: AgentParams; Querystring: FollowQuery }>(
    '/:id/following',
    async (request: FastifyRequest<{ Params: AgentParams; Querystring: FollowQuery }>, reply: FastifyReply) => {
      const { id } = request.params;
      const { limit = '20', offset = '0' } = request.query;

      const take = Math.min(parseInt(limit) || 20, 100);
      const skip = parseInt(offset) || 0;

      // Check if agent exists
      const agent = await prisma.agent.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!agent) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Agent not found',
        });
      }

      const [follows, total] = await Promise.all([
        prisma.follow.findMany({
          where: { followerId: id },
          take,
          skip,
          orderBy: { createdAt: 'desc' },
          include: {
            following: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                styleTags: true,
              },
            },
          },
        }),
        prisma.follow.count({ where: { followerId: id } }),
      ]);

      return reply.send({
        following: follows.map((f) => ({
          id: f.following.id,
          name: f.following.name,
          avatar_url: f.following.avatarUrl,
          style: f.following.styleTags[0] || null,
        })),
        total,
      });
    }
  );
};
