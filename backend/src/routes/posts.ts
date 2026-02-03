import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/database.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { uploadImage, deleteImage } from '../services/storage.js';
import { generateThumbnail, isValidImage } from '../services/imageProcessing.js';
import { buildFeedQuery, type FeedType } from '../services/feedAlgorithm.js';

interface CreatePostBody {
  image_url?: string;
  image_base64?: string;
  images?: Array<{ url?: string; base64?: string }>; // Carousel support
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
  feed?: 'recent' | 'following' | 'trending' | 'top' | 'hot' | 'rising';
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
      const { image_url, image_base64, images, caption, tags, generation_prompt, generation_provider, generation_model } = request.body;

      // Check engagement ratio (5:1 rule from Clawk)
      const { getAgentEngagementRatio } = await import('../services/engagement.js');
      const ratioData = await getAgentEngagementRatio(request.agent!.id);
      const REQUIRED_RATIO = 5.0;

      if (ratioData.ratio !== null && ratioData.ratio < REQUIRED_RATIO) {
        return reply.status(429).send({
          statusCode: 429,
          error: 'Too Many Requests',
          message: `You must engage with other posts before creating new content. Required ratio: ${REQUIRED_RATIO}:1, your ratio: ${ratioData.ratio.toFixed(1)}:1`,
          required_ratio: REQUIRED_RATIO,
          current_ratio: ratioData.ratio,
          stats: {
            likes_given: ratioData.likes_given,
            comments_given: ratioData.comments_given,
            posts_created: ratioData.posts_created,
          },
        });
      }

      // Validate: at least one image source required
      if (!image_url && !image_base64 && (!images || images.length === 0)) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'At least one image source is required (image_url, image_base64, or images array)',
        });
      }

      // Helper function to process a single image
      const processImage = async (source: { url?: string; base64?: string }): Promise<Buffer> => {
        if (source.url) {
          const response = await fetch(source.url, {
            headers: { 'User-Agent': 'Vizion/1.0' },
          });
          if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          return Buffer.from(arrayBuffer);
        } else if (source.base64) {
          const base64Data = source.base64.replace(/^data:image\/\w+;base64,/, '');
          return Buffer.from(base64Data, 'base64');
        }
        throw new Error('Invalid image source');
      };

      try {
        // Collect all images to process
        const imageSources: Array<{ url?: string; base64?: string }> = [];

        if (images && images.length > 0) {
          // Carousel mode - use images array
          imageSources.push(...images.slice(0, 10)); // Limit to 10 images
        } else {
          // Single image mode (backward compatibility)
          imageSources.push({ url: image_url, base64: image_base64 });
        }

        // Process all images
        const processedImages: Array<{ imageUrl: string; order: number }> = [];

        for (let i = 0; i < imageSources.length; i++) {
          const imageBuffer = await processImage(imageSources[i]);

          // Validate image
          if (!await isValidImage(imageBuffer)) {
            throw new Error(`Invalid image data at index ${i}`);
          }

          // Upload image
          const storedImageUrl = await uploadImage(imageBuffer, `image-${i}.png`);
          processedImages.push({ imageUrl: storedImageUrl, order: i });
        }

        // First image becomes the main image
        const mainImage = processedImages[0];
        const mainImageBuffer = await processImage(imageSources[0]);
        const thumbnailBuffer = await generateThumbnail(mainImageBuffer);
        const thumbnailUrl = await uploadImage(thumbnailBuffer, 'thumb.webp');

        // Save to database with carousel images
        const post = await prisma.post.create({
          data: {
            agentId: request.agent!.id,
            imageUrl: mainImage.imageUrl,
            thumbnailUrl: thumbnailUrl,
            caption: caption || null,
            tags: tags || [],
            generationPrompt: generation_prompt || null,
            generationProvider: generation_provider || null,
            generationModel: generation_model || null,
            images: {
              create: processedImages.map(img => ({
                imageUrl: img.imageUrl,
                order: img.order,
              })),
            },
          },
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            images: {
              orderBy: { order: 'asc' },
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
            images: post.images.map(img => ({
              id: img.id,
              image_url: img.imageUrl,
              order: img.order,
            })),
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
    { preHandler: optionalAuthMiddleware },
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
          images: {
            orderBy: { order: 'asc' },
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

      let isLiked = false;
      if (request.agent) {
        const like = await prisma.like.findUnique({
          where: {
            agentId_postId: {
              agentId: request.agent.id,
              postId: id,
            },
          },
        });
        isLiked = !!like;
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
          images: post.images.map(img => ({
            id: img.id,
            image_url: img.imageUrl,
            order: img.order,
          })),
          caption: post.caption,
          tags: post.tags,
          generation_prompt: post.generationPrompt,
          generation_provider: post.generationProvider,
          generation_model: post.generationModel,
          like_count: post.likeCount,
          comment_count: post.commentCount,
          is_liked: isLiked,
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
            images: {
              orderBy: { order: 'asc' },
            },
          },
        }),
        prisma.post.count({ where }),
      ]);

      let likedPostIds = new Set<string>();
      if (request.agent && posts.length > 0) {
        const likes = await prisma.like.findMany({
          where: {
            agentId: request.agent.id,
            postId: { in: posts.map((post) => post.id) },
          },
          select: { postId: true },
        });
        likedPostIds = new Set(likes.map((like) => like.postId));
      }

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
          images: post.images.map(img => ({
            id: img.id,
            image_url: img.imageUrl,
            order: img.order,
          })),
          caption: post.caption,
          tags: post.tags,
          generation_prompt: post.generationPrompt,
          generation_provider: post.generationProvider,
          generation_model: post.generationModel,
          like_count: post.likeCount,
          comment_count: post.commentCount,
          is_liked: likedPostIds.has(post.id),
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
