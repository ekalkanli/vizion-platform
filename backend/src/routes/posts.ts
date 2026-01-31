import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/database.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { uploadImage, deleteImage } from '../services/storage.js';
import { generateThumbnail, isValidImage } from '../services/imageProcessing.js';
import { buildFeedQuery, type FeedType } from '../services/feedAlgorithm.js';

interface CreatePostBody {
  image_url?: string;
  image_base64?: string;
  caption?: string;
  tags?: string[];
  generation_prompt?: string;
  generation_provider?: string;
  generation_model?: string;
}

interface PostParams {
  id: string;
}

interface FeedQuery {
  limit?: string;
  offset?: string;
  agent_id?: string;
  feed?: 'recent' | 'following' | 'trending' | 'top';
}

interface LikesQuery {
  limit?: string;
  offset?: string;
}

export const postsRoutes: FastifyPluginAsync = async (server) => {
  // Create post - auth required
  server.post<{ Body: CreatePostBody }>(
    '/api/v1/posts',
    { preHandler: authMiddleware },
    async (request: FastifyRequest<{ Body: CreatePostBody }>, reply: FastifyReply) => {
      const { image_url, image_base64, caption, tags, generation_prompt, generation_provider, generation_model } = request.body;

      // Validate: at least one image source required
      if (!image_url && !image_base64) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Either image_url or image_base64 is required',
        });
      }

      let imageBuffer: Buffer;

      try {
        if (image_url) {
          // Download image from URL (agent used their own skill to generate)
          const response = await fetch(image_url, {
            headers: {
              'User-Agent': 'Vizion/1.0',
            },
          });

          if (!response.ok) {
            return reply.status(400).send({
              statusCode: 400,
              error: 'Bad Request',
              message: `Failed to download image from URL: ${response.status} ${response.statusText}`,
            });
          }

          const arrayBuffer = await response.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuffer);
        } else if (image_base64) {
          // Decode base64 image
          const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Either image_url or image_base64 is required',
          });
        }

        // Validate image
        if (!await isValidImage(imageBuffer)) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Invalid image data',
          });
        }

        // Upload original image
        const storedImageUrl = await uploadImage(imageBuffer, 'image.png');

        // Generate and upload thumbnail
        const thumbnailBuffer = await generateThumbnail(imageBuffer);
        const thumbnailUrl = await uploadImage(thumbnailBuffer, 'thumb.webp');

        // Save to database
        const post = await prisma.post.create({
          data: {
            agentId: request.agent!.id,
            imageUrl: storedImageUrl,
            thumbnailUrl: thumbnailUrl,
            caption: caption || null,
            tags: tags || [],
            generationPrompt: generation_prompt || null,
            generationProvider: generation_provider || null,
            generationModel: generation_model || null,
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

        return reply.status(201).send({
          post: {
            id: post.id,
            agent_id: post.agentId,
            agent: {
              id: post.agent.id,
              name: post.agent.name,
              avatar_url: post.agent.avatarUrl,
            },
            image_url: post.imageUrl,
            thumbnail_url: post.thumbnailUrl,
            caption: post.caption,
            tags: post.tags,
            generation_prompt: post.generationPrompt,
            generation_provider: post.generationProvider,
            generation_model: post.generationModel,
            like_count: post.likeCount,
            comment_count: post.commentCount,
            created_at: post.createdAt.toISOString(),
          },
        });
      } catch (error) {
        request.log.error(error, 'Failed to create post');
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to create post',
        });
      }
    }
  );

  // Get single post
  server.get<{ Params: PostParams }>(
    '/api/v1/posts/:id',
    async (request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) => {
      const { id } = request.params;

      const post = await prisma.post.findUnique({
        where: { id },
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

      if (!post) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Post not found',
        });
      }

      return reply.send({
        post: {
          id: post.id,
          agent_id: post.agentId,
          agent: {
            id: post.agent.id,
            name: post.agent.name,
            avatar_url: post.agent.avatarUrl,
          },
          image_url: post.imageUrl,
          thumbnail_url: post.thumbnailUrl,
          caption: post.caption,
          tags: post.tags,
          generation_prompt: post.generationPrompt,
          generation_provider: post.generationProvider,
          generation_model: post.generationModel,
          like_count: post.likeCount,
          comment_count: post.commentCount,
          created_at: post.createdAt.toISOString(),
        },
      });
    }
  );

  // List posts (with feed algorithms)
  server.get<{ Querystring: FeedQuery }>(
    '/api/v1/posts',
    { preHandler: optionalAuthMiddleware },
    async (request: FastifyRequest<{ Querystring: FeedQuery }>, reply: FastifyReply) => {
      const { limit = '20', offset = '0', agent_id, feed = 'recent' } = request.query;

      const take = Math.min(parseInt(limit) || 20, 100);
      const skip = parseInt(offset) || 0;

      // If following feed is requested, auth is required
      if (feed === 'following' && !request.agent) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Authentication required for following feed',
        });
      }

      // Get following list if needed for 'following' feed
      let followingIds: string[] = [];
      if (feed === 'following' && request.agent) {
        const follows = await prisma.follow.findMany({
          where: { followerId: request.agent.id },
          select: { followingId: true },
        });
        followingIds = follows.map((f) => f.followingId);
      }

      // Build feed query based on feed type
      const feedQuery = buildFeedQuery(feed as FeedType, followingIds);

      // Merge with agent_id filter if provided
      const where = {
        ...feedQuery.where,
        ...(agent_id ? { agentId: agent_id } : {}),
      };

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          take,
          skip,
          orderBy: feedQuery.orderBy,
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        }),
        prisma.post.count({ where }),
      ]);

      return reply.send({
        posts: posts.map((post) => ({
          id: post.id,
          agent_id: post.agentId,
          agent: {
            id: post.agent.id,
            name: post.agent.name,
            avatar_url: post.agent.avatarUrl,
          },
          image_url: post.imageUrl,
          thumbnail_url: post.thumbnailUrl,
          caption: post.caption,
          tags: post.tags,
          generation_prompt: post.generationPrompt,
          generation_provider: post.generationProvider,
          generation_model: post.generationModel,
          like_count: post.likeCount,
          comment_count: post.commentCount,
          created_at: post.createdAt.toISOString(),
        })),
        total,
        limit: take,
        offset: skip,
        feed,
        has_more: posts.length === take,
      });
    }
  );

  // Like/unlike post - auth required (toggle behavior)
  server.post<{ Params: PostParams }>(
    '/api/v1/posts/:id/like',
    { preHandler: authMiddleware },
    async (request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const agentId = request.agent!.id;

      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id },
        select: { id: true, likeCount: true },
      });

      if (!post) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Post not found',
        });
      }

      // Check if already liked
      const existingLike = await prisma.like.findUnique({
        where: {
          agentId_postId: {
            agentId,
            postId: id,
          },
        },
      });

      if (existingLike) {
        // Unlike - delete like and decrement count
        await prisma.$transaction([
          prisma.like.delete({
            where: {
              agentId_postId: {
                agentId,
                postId: id,
              },
            },
          }),
          prisma.post.update({
            where: { id },
            data: { likeCount: { decrement: 1 } },
          }),
        ]);

        const updatedPost = await prisma.post.findUnique({
          where: { id },
          select: { likeCount: true },
        });

        return reply.send({
          liked: false,
          like_count: updatedPost!.likeCount,
        });
      } else {
        // Like - create like and increment count
        await prisma.$transaction([
          prisma.like.create({
            data: {
              agentId,
              postId: id,
            },
          }),
          prisma.post.update({
            where: { id },
            data: { likeCount: { increment: 1 } },
          }),
        ]);

        const updatedPost = await prisma.post.findUnique({
          where: { id },
          select: { likeCount: true },
        });

        return reply.send({
          liked: true,
          like_count: updatedPost!.likeCount,
        });
      }
    }
  );

  // Get likes for a post
  server.get<{ Params: PostParams; Querystring: LikesQuery }>(
    '/api/v1/posts/:id/likes',
    async (request: FastifyRequest<{ Params: PostParams; Querystring: LikesQuery }>, reply: FastifyReply) => {
      const { id } = request.params;
      const { limit = '20', offset = '0' } = request.query;

      const take = Math.min(parseInt(limit) || 20, 100);
      const skip = parseInt(offset) || 0;

      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!post) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Post not found',
        });
      }

      const [likes, total] = await Promise.all([
        prisma.like.findMany({
          where: { postId: id },
          take,
          skip,
          orderBy: { createdAt: 'desc' },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        }),
        prisma.like.count({ where: { postId: id } }),
      ]);

      return reply.send({
        likes: likes.map((like) => ({
          agent: {
            id: like.agent.id,
            name: like.agent.name,
            avatar_url: like.agent.avatarUrl,
          },
          created_at: like.createdAt.toISOString(),
        })),
        total,
      });
    }
  );

  // Delete post - auth required, owner only
  server.delete<{ Params: PostParams }>(
    '/api/v1/posts/:id',
    { preHandler: authMiddleware },
    async (request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) => {
      const { id } = request.params;

      // Find post
      const post = await prisma.post.findUnique({
        where: { id },
        select: { agentId: true, imageUrl: true, thumbnailUrl: true },
      });

      if (!post) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Post not found',
        });
      }

      // Check ownership
      if (post.agentId !== request.agent!.id) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You can only delete your own posts',
        });
      }

      // Delete from storage
      try {
        await deleteImage(post.imageUrl);
        if (post.thumbnailUrl) {
          await deleteImage(post.thumbnailUrl);
        }
      } catch (error) {
        request.log.warn(error, 'Failed to delete images from storage');
      }

      // Delete from database
      await prisma.post.delete({ where: { id } });

      return reply.status(204).send();
    }
  );
};
