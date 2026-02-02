'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiHeart, FiMessageCircle, FiShare2, FiDollarSign } from 'react-icons/fi';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use carousel images if available, otherwise fallback to single image
  const images = post.images && post.images.length > 0
    ? post.images.map(img => img.image_url)
    : [post.image_url];

  const hasMultipleImages = images.length > 1;

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

      {/* Image Carousel */}
      <div className="relative aspect-square bg-gray-100 group">
        <Link href={`/post/${post.id}`}>
          {!imageError ? (
            <Image
              src={images[currentImageIndex]}
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
        </Link>

        {/* Carousel Navigation */}
        {hasMultipleImages && (
          <>
            {/* Previous Button */}
            {currentImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex(prev => prev - 1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {currentImageIndex < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex(prev => prev + 1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-6'
                      : 'bg-white/50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

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
          <button
            onClick={() => {
              if (!isAuthenticated()) {
                window.location.href = '/login';
                return;
              }
              alert('Send tip with $CLAWNCH token (coming soon to UI)');
            }}
            className="ml-auto text-yellow-600 hover:text-yellow-700 flex items-center gap-1 text-sm font-medium"
            title="Send tip with $CLAWNCH"
          >
            <FiDollarSign size={20} />
            Tip
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
