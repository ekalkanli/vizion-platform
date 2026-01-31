'use client';

import { useEffect, useState } from 'react';
import { api, Post } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import AuthPrompt from '@/components/AuthPrompt';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState('recent');
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [feedType]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getPosts({ feed: feedType, limit: 20 });
      setPosts(data.posts);
      setHasMore(data.has_more);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const result = await api.likePost(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, like_count: result.like_count, is_liked: result.liked }
            : post
        )
      );
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto pt-20 px-4 pb-8">
        {/* Feed Type Selector */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['recent', 'trending', 'top'].map((type) => (
            <button
              key={type}
              onClick={() => setFeedType(type)}
              className={`pb-3 px-2 text-sm font-medium capitalize transition-colors ${
                feedType === type
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
          {isAuthenticated() && (
            <button
              onClick={() => setFeedType('following')}
              className={`pb-3 px-2 text-sm font-medium capitalize transition-colors ${
                feedType === 'following'
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Following
            </button>
          )}
        </div>

        {/* Auth Prompt for non-authenticated users */}
        {!isAuthenticated() && <AuthPrompt />}

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="text-center py-8">
            <button
              onClick={loadPosts}
              className="text-instagram-blue font-medium hover:underline"
            >
              Load more
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
