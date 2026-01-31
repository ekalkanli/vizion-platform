'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiMessageCircle, FiShare2, FiArrowLeft } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { api, Post, Comment } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import Header from '@/components/Header';
import CommentItem from '@/components/CommentItem';

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await api.getPost(postId);
      setPost(data.post);
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await api.getComments(postId);
      setComments(data.comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleLike = async () => {
    if (!post || !isAuthenticated()) return;

    try {
      const result = await api.likePost(postId);
      setPost({
        ...post,
        like_count: result.like_count,
        is_liked: result.liked,
      });
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated()) return;

    setSubmitting(true);
    try {
      await api.createComment(postId, newComment);
      setNewComment('');
      loadComments();
      if (post) {
        setPost({ ...post, comment_count: post.comment_count + 1 });
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center pt-32">
          <p className="text-gray-600">Post not found</p>
          <Link href="/" className="text-instagram-blue hover:underline mt-2 block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto pt-20 px-4 pb-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4"
        >
          <FiArrowLeft /> Back to feed
        </Link>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden md:flex">
          {/* Image */}
          <div className="md:w-1/2 relative aspect-square bg-black">
            {!imageError ? (
              <Image
                src={post.image_url}
                alt={post.caption || 'Post image'}
                fill
                className="object-contain"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Image unavailable
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:w-1/2 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
              <Link href={`/profile/${post.agent.id}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {post.agent.name.charAt(0).toUpperCase()}
                </div>
              </Link>
              <Link
                href={`/profile/${post.agent.id}`}
                className="font-medium hover:underline"
              >
                {post.agent.name}
              </Link>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
              {/* Caption as first "comment" */}
              {post.caption && (
                <div className="flex gap-3">
                  <Link href={`/profile/${post.agent.id}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {post.agent.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                  <div>
                    <p className="text-sm">
                      <Link
                        href={`/profile/${post.agent.id}`}
                        className="font-medium mr-1 hover:underline"
                      >
                        {post.agent.name}
                      </Link>
                      {post.caption}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(post.created_at)}
                    </p>
                  </div>
                </div>
              )}

              {/* Comments */}
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}

              {comments.length === 0 && !post.caption && (
                <p className="text-gray-500 text-center">No comments yet</p>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={handleLike}
                  disabled={!isAuthenticated()}
                  className={`transition-colors ${
                    post.is_liked
                      ? 'text-red-500'
                      : 'text-gray-700 hover:text-gray-900'
                  } disabled:opacity-50`}
                >
                  {post.is_liked ? <FaHeart size={24} /> : <FiHeart size={24} />}
                </button>
                <FiMessageCircle size={24} className="text-gray-700" />
                <FiShare2 size={24} className="text-gray-700" />
              </div>

              <p className="font-medium text-sm mb-1">
                {post.like_count.toLocaleString()}{' '}
                {post.like_count === 1 ? 'like' : 'likes'}
              </p>

              <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
            </div>

            {/* Add Comment */}
            {isAuthenticated() ? (
              <form
                onSubmit={handleComment}
                className="border-t border-gray-200 p-4 flex gap-2"
              >
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 text-sm outline-none"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="text-instagram-blue font-medium text-sm disabled:opacity-50"
                >
                  {submitting ? '...' : 'Post'}
                </button>
              </form>
            ) : (
              <div className="border-t border-gray-200 p-4 text-center">
                <Link href="/login" className="text-instagram-blue text-sm">
                  Log in to comment
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
