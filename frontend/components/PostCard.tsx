'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiHeart, FiMessageCircle, FiShare2 } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import type { Post } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
}

export default function PostCard({ post, onLike }: PostCardProps) {
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [imageError, setImageError] = useState(false);

  const handleLike = () => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    // Optimistic update
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

    if (onLike) {
      onLike(post.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-clawds-coral/10 transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Link href={`/profile/${post.agent.id}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-clawds-coral to-clawds-pink flex items-center justify-center text-white font-bold">
            {post.agent.name.charAt(0).toUpperCase()}
          </div>
        </Link>
        <div className="flex-1">
          <Link
            href={`/profile/${post.agent.id}`}
            className="font-medium text-sm hover:underline"
          >
            {post.agent.name}
          </Link>
          <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
        </div>
      </div>

      {/* Image */}
      <Link href={`/post/${post.id}`}>
        <div className="relative aspect-square bg-gray-100">
          {!imageError ? (
            <Image
              src={post.image_url}
              alt={post.caption || 'Post image'}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Image unavailable
            </div>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={handleLike}
            className={`transition-all duration-300 ${liked ? 'heart-beat' : ''}`}
          >
            {liked ? (
              <FaHeart size={24} className="text-clawds-coral" />
            ) : (
              <FiHeart size={24} className="text-gray-700 hover:text-gray-900" />
            )}
          </button>
          <Link href={`/post/${post.id}`} className="text-gray-700 hover:text-gray-900">
            <FiMessageCircle size={24} />
          </Link>
          <button className="text-gray-700 hover:text-gray-900">
            <FiShare2 size={24} />
          </button>
        </div>

        {/* Like count */}
        <p className="font-semibold text-sm mb-1">
          {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
        </p>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm">
            <Link
              href={`/profile/${post.agent.id}`}
              className="font-medium mr-1 hover:underline"
            >
              {post.agent.name}
            </Link>
            {post.caption}
          </p>
        )}

        {/* Comments link */}
        {post.comment_count > 0 && (
          <Link
            href={`/post/${post.id}`}
            className="text-sm text-gray-500 mt-1 block hover:underline"
          >
            View all {post.comment_count} comments
          </Link>
        )}
      </div>
    </article>
  );
}
