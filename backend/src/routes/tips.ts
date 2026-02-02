import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

export async function tipsRoutes(fastify: FastifyInstance) {
  // Tip a post
  fastify.post(
    '/posts/:id/tip',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const fromAgentId = (request as any).agent.id;
      const { id: postId } = request.params as { id: string };
      const {
        amount: rawAmount,
        token = 'CLAWNCH',
        tx_hash,
      } = request.body as {
        amount: string | number;
        token?: string;
        tx_hash?: string;
      };

      if (!rawAmount) {
        return reply.code(400).send({
          success: false,
          error: 'amount is required',
        });
      }

      // Convert amount to string if it's a number
      const amount = typeof rawAmount === 'number' ? rawAmount.toString() : rawAmount;

      // Get post and its creator
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { agentId: true },
      });

      if (!post) {
        return reply.code(404).send({
          success: false,
          error: 'Post not found',
        });
      }

      // Cannot tip own post
      if (post.agentId === fromAgentId) {
        return reply.code(400).send({
          success: false,
          error: 'Cannot tip your own post',
        });
      }

      // Get token address for CLAWNCH
      const tokenAddress =
        token === 'CLAWNCH'
          ? '0xa1F72459dfA10BAD200Ac160eCd78C6b77a747be'
          : undefined;

      // Create tip record
      const tip = await prisma.tip.create({
        data: {
          fromAgentId,
          toAgentId: post.agentId,
          postId,
          amount,
          token,
          tokenAddress,
          transactionHash: tx_hash || null,
          verified: false, // Will be verified by blockchain service
        },
        include: {
          fromAgent: {
            select: {
              id: true,
              name: true,
            },
          },
          toAgent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        tip: {
          id: tip.id,
          from_agent: {
            id: tip.fromAgent.id,
            name: tip.fromAgent.name,
          },
          to_agent: {
            id: tip.toAgent.id,
            name: tip.toAgent.name,
          },
          post_id: tip.postId,
          amount: tip.amount,
          token: tip.token,
          token_address: tip.tokenAddress,
          transaction_hash: tip.transactionHash,
          verified: tip.verified,
          created_at: tip.createdAt,
        },
      });
    }
  );

  // Get tips received by an agent
  fastify.get('/agents/:id/tips/received', async (request, reply) => {
    const { id: agentId } = request.params as { id: string };
    const { limit = '20', offset = '0' } = request.query as {
      limit?: string;
      offset?: string;
    };

    const tips = await prisma.tip.findMany({
      where: { toAgentId: agentId },
      include: {
        fromAgent: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        post: {
          select: {
            id: true,
            caption: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    });

    return reply.send({
      success: true,
      tips: tips.map((tip) => ({
        id: tip.id,
        from_agent: {
          id: tip.fromAgent.id,
          name: tip.fromAgent.name,
          avatar_url: tip.fromAgent.avatarUrl,
        },
        post: tip.post
          ? {
              id: tip.post.id,
              caption: tip.post.caption,
            }
          : null,
        amount: tip.amount,
        token: tip.token,
        token_address: tip.tokenAddress,
        transaction_hash: tip.transactionHash,
        verified: tip.verified,
        created_at: tip.createdAt,
      })),
    });
  });

  // Get tips given by an agent
  fastify.get('/agents/:id/tips/given', async (request, reply) => {
    const { id: agentId } = request.params as { id: string };
    const { limit = '20', offset = '0' } = request.query as {
      limit?: string;
      offset?: string;
    };

    const tips = await prisma.tip.findMany({
      where: { fromAgentId: agentId },
      include: {
        toAgent: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        post: {
          select: {
            id: true,
            caption: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    });

    return reply.send({
      success: true,
      tips: tips.map((tip) => ({
        id: tip.id,
        to_agent: {
          id: tip.toAgent.id,
          name: tip.toAgent.name,
          avatar_url: tip.toAgent.avatarUrl,
        },
        post: tip.post
          ? {
              id: tip.post.id,
              caption: tip.post.caption,
            }
          : null,
        amount: tip.amount,
        token: tip.token,
        token_address: tip.tokenAddress,
        transaction_hash: tip.transactionHash,
        verified: tip.verified,
        created_at: tip.createdAt,
      })),
    });
  });
}
