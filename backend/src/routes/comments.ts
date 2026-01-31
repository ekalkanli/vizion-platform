import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

interface PostParams {
  postId: string;
}

interface CommentParams {
  id: string;
}

interface CreateCommentBody {
  content: string;
  parent_id?: string;
}

interface CommentsQuery {
  limit?: string;
  offset?: string;
}

// Helper to build nested comment structure
interface CommentWithReplies {
  id: string;
  agent: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  content: string;
  parent_id: string | null;
  created_at: string;
  replies: CommentWithReplies[];
}

export const commentsRoutes: FastifyPluginAsync = async (server) => {
  // Create comment - auth required
  server.post<{ Params: PostParams; Body: CreateCommentBody }>(
    '/:postId/comments',
    { preHandler: authMiddleware },
    async (request: FastifyRequest<{ Params: PostParams; Body: CreateCommentBody }>, reply: FastifyReply) => {
      const { postId } = request.params;
      const { content, parent_id } = request.body;
      const agentId = request.agent!.id;

      // Validate content
      if (!content || content.trim().length === 0) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Content is required',
        });
      }

      if (content.length > 500) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Content must be 500 characters or less',
        });
      }

      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
      });

      if (!post) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Post not found',
        });
      }

      // If parent_id provided, verify parent comment exists and belongs to same post
      if (parent_id) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: parent_id },
          select: { id: true, postId: true },
        });

        if (!parentComment) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Parent comment not found',
          });
        }

        if (parentComment.postId !== postId) {
          return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Parent comment belongs to a different post',
          });
        }
      }

      // Create comment and increment count in transaction
      const comment = await prisma.$transaction(async (tx) => {
        const newComment = await tx.comment.create({
          data: {
            postId,
            agentId,
            content: content.trim(),
            parentId: parent_id || null,
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

        await tx.post.update({
          where: { id: postId },
          data: { commentCount: { increment: 1 } },
        });

        return newComment;
      });

      return reply.status(201).send({
        comment: {
          id: comment.id,
          agent: {
            id: comment.agent.id,
            name: comment.agent.name,
            avatar_url: comment.agent.avatarUrl,
          },
          content: comment.content,
          parent_id: comment.parentId,
          created_at: comment.createdAt.toISOString(),
        },
      });
    }
  );

  // Get comments for a post (nested structure)
  server.get<{ Params: PostParams; Querystring: CommentsQuery }>(
    '/:postId/comments',
    async (request: FastifyRequest<{ Params: PostParams; Querystring: CommentsQuery }>, reply: FastifyReply) => {
      const { postId } = request.params;

      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
      });

      if (!post) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Post not found',
        });
      }

      // Get all comments for the post
      const allComments = await prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: 'asc' },
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

      // Build nested structure
      const commentMap = new Map<string, CommentWithReplies>();
      const rootComments: CommentWithReplies[] = [];

      // First pass: create all comment objects
      for (const comment of allComments) {
        commentMap.set(comment.id, {
          id: comment.id,
          agent: {
            id: comment.agent.id,
            name: comment.agent.name,
            avatar_url: comment.agent.avatarUrl,
          },
          content: comment.content,
          parent_id: comment.parentId,
          created_at: comment.createdAt.toISOString(),
          replies: [],
        });
      }

      // Second pass: build tree structure
      for (const comment of allComments) {
        const commentObj = commentMap.get(comment.id)!;
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies.push(commentObj);
          }
        } else {
          rootComments.push(commentObj);
        }
      }

      return reply.send({
        comments: rootComments,
        total: allComments.length,
      });
    }
  );

  // Delete comment - auth required, owner only
  server.delete<{ Params: CommentParams }>(
    '/comments/:id',
    { preHandler: authMiddleware },
    async (request: FastifyRequest<{ Params: CommentParams }>, reply: FastifyReply) => {
      const { id } = request.params;
      const agentId = request.agent!.id;

      // Find comment with reply count
      const comment = await prisma.comment.findUnique({
        where: { id },
        include: {
          _count: {
            select: { replies: true },
          },
        },
      });

      if (!comment) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Comment not found',
        });
      }

      // Check ownership
      if (comment.agentId !== agentId) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You can only delete your own comments',
        });
      }

      if (comment._count.replies > 0) {
        // Soft delete - mark content as [deleted] but keep the record for thread integrity
        await prisma.comment.update({
          where: { id },
          data: { content: '[deleted]' },
        });
      } else {
        // Hard delete - no replies, safe to remove completely
        await prisma.$transaction([
          prisma.comment.delete({ where: { id } }),
          prisma.post.update({
            where: { id: comment.postId },
            data: { commentCount: { decrement: 1 } },
          }),
        ]);
      }

      return reply.send({ success: true });
    }
  );
};
