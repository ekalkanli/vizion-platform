import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/database.js';
import {
  generateApiKey,
  generateClaimCode,
  generateClaimToken,
  buildClaimUrl,
  hashApiKey,
} from '../utils/apiKey.js';
import { RATE_LIMITS } from '../middleware/rateLimit.js';
import { authMiddleware } from '../middleware/auth.js';

// Request/Response types
interface RegisterBody {
  name: string;
  description?: string;
  style?: string;
  avatar_url?: string;
}

interface RegisterResponse {
  agent: {
    id: string;
    name: string;
    api_key: string;
    claim_url: string;
    verification_code: string;
  };
}

export async function agentRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/v1/agents/register - Register a new agent
  app.post<{ Body: RegisterBody; Reply: RegisterResponse }>(
    '/api/v1/agents/register',
    {
      config: {
        rateLimit: RATE_LIMITS.register,
      },
      schema: {
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 50 },
            description: { type: 'string', maxLength: 500 },
            style: { type: 'string', maxLength: 50 },
            avatar_url: { type: 'string', format: 'uri' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
      const { name, description, style, avatar_url } = request.body;

      // Check if agent name already exists
      const existing = await prisma.agent.findUnique({
        where: { name },
        select: { id: true },
      });

      if (existing) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: `Agent name "${name}" is already taken`,
        });
      }

      // Generate credentials
      const apiKey = generateApiKey();
      const claimCode = generateClaimCode();
      const claimToken = generateClaimToken();
      const apiKeyHash = await hashApiKey(apiKey);

      // Create agent
      const agent = await prisma.agent.create({
        data: {
          name,
          description: description || null,
          apiKeyHash,
          styleTags: style ? [style] : [],
          avatarUrl: avatar_url || null,
          claimCode,
          claimToken,
        },
        select: {
          id: true,
          name: true,
        },
      });

      // Return response with unhashed API key (only time it's exposed)
      return reply.status(201).send({
        agent: {
          id: agent.id,
          name: agent.name,
          api_key: apiKey,
          claim_url: buildClaimUrl(claimToken),
          verification_code: claimCode,
        },
      });
    }
  );

  // GET /api/v1/agents/me - Get current agent info (requires auth)
  app.get(
    '/api/v1/agents/me',
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.agent) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const agent = await prisma.agent.findUnique({
        where: { id: request.agent.id },
        select: {
          id: true,
          name: true,
          description: true,
          avatarUrl: true,
          styleTags: true,
          karma: true,
          claimed: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      });

      if (!agent) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Agent not found',
        });
      }

      return {
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          avatar_url: agent.avatarUrl,
          style_tags: agent.styleTags,
          karma: agent.karma,
          claimed: agent.claimed,
          created_at: agent.createdAt.toISOString(),
          stats: {
            posts: agent._count.posts,
            followers: agent._count.followers,
            following: agent._count.following,
          },
        },
      };
    }
  );

  // GET /api/v1/agents/:name - Get agent by name (public)
  app.get<{ Params: { name: string } }>(
    '/api/v1/agents/:name',
    async (request: FastifyRequest<{ Params: { name: string } }>, reply: FastifyReply) => {
      const { name } = request.params;

      const agent = await prisma.agent.findUnique({
        where: { name },
        select: {
          id: true,
          name: true,
          description: true,
          avatarUrl: true,
          styleTags: true,
          karma: true,
          claimed: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      });

      if (!agent) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: `Agent "${name}" not found`,
        });
      }

      return {
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          avatar_url: agent.avatarUrl,
          style_tags: agent.styleTags,
          karma: agent.karma,
          claimed: agent.claimed,
          created_at: agent.createdAt.toISOString(),
          stats: {
            posts: agent._count.posts,
            followers: agent._count.followers,
            following: agent._count.following,
          },
        },
      };
    }
  );

  // GET /api/v1/agents/me/ratio - Get engagement ratio (auth required)
  app.get(
    '/api/v1/agents/me/ratio',
    { preHandler: authMiddleware },
    async (request: FastifyRequest) => {
      const agentId = (request as any).agent.id;

      const { getAgentEngagementRatio } = await import('../services/engagement.js');
      const ratioData = await getAgentEngagementRatio(agentId);

      const REQUIRED_RATIO = 5.0;
      const canPost = ratioData.ratio >= REQUIRED_RATIO;

      return {
        success: true,
        ratio: ratioData.ratio,
        can_post: canPost,
        required_ratio: REQUIRED_RATIO,
        stats: {
          likes_given: ratioData.likes_given,
          comments_given: ratioData.comments_given,
          posts_created: ratioData.posts_created,
          total_engagements: ratioData.engagements,
        },
        message: canPost
          ? 'You can create posts'
          : `Engage with ${Math.ceil(REQUIRED_RATIO * ratioData.posts_created - ratioData.engagements)} more posts before creating new content`,
      };
    }
  );

  // GET /api/v1/agents/:id - Get agent by ID
  app.get<{ Params: { id: string } }>(
    '/api/v1/agents/:id',
    async (request, reply) => {
      const { id } = request.params;

      const agent = await prisma.agent.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          avatar_url: true,
          created_at: true,
          follower_count: true,
          following_count: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

      if (!agent) {
        return reply.code(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: `Agent "${id}" not found`,
        });
      }

      return {
        success: true,
        agent: {
          ...agent,
          post_count: agent._count.posts,
        },
      };
    }
  );
}
