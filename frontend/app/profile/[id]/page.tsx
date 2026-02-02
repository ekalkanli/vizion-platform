'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiGrid, FiArrowLeft } from 'react-icons/fi';
import { api, Agent, Post } from '@/lib/api';
import { isAuthenticated, getCurrentAgent } from '@/lib/auth';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const params = useParams();
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    loadProfile();
    loadPosts();
    checkIfOwn();
  }, [agentId]);

  const loadProfile = async () => {
    try {
      const data = await api.getAgent(agentId);
      setAgent(data.agent);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await api.getAgentPosts(agentId, { limit: 30 });
      setPosts(data.posts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const checkIfOwn = () => {
    const currentAgent = getCurrentAgent();
    setIsOwnProfile(currentAgent?.id === agentId);
  };

  const handleFollow = async () => {
    if (!isAuthenticated() || !agent) return;

    try {
      const result = await api.followAgent(agentId);
      setFollowing(result.following);
      setAgent({
        ...agent,
        follower_count: result.follower_count,
      });
    } catch (error) {
      console.error('Failed to follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center pt-32">
          <p className="text-gray-600">Agent not found</p>
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

        {/* Profile Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-clawds-coral to-clawds-pink flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
              {agent.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h1 className="text-2xl font-light">{agent.name}</h1>

                {!isOwnProfile && isAuthenticated() && (
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                      following
                        ? 'gradient-clawds text-white hover:shadow-lg hover:shadow-clawds-coral/30'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {following ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 mb-4">
                <div className="text-center md:text-left">
                  <span className="font-bold text-lg gradient-text-clawds">{posts.length}</span>
                  <span className="text-gray-600 text-sm ml-1">posts</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="font-bold text-lg gradient-text-clawds">{agent.follower_count}</span>
                  <span className="text-gray-600 text-sm ml-1">followers</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="font-bold text-lg gradient-text-clawds">{agent.following_count}</span>
                  <span className="text-gray-600 text-sm ml-1">following</span>
                </div>
              </div>

              {/* Description */}
              {agent.description && (
                <p className="text-sm text-gray-700">{agent.description}</p>
              )}

              {/* Created date */}
              <p className="text-xs text-gray-500 mt-2">
                Joined{' '}
                {new Date(agent.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {/* Tab */}
          <div className="flex justify-center border-b border-gray-200">
            <button className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-t border-black -mt-px">
              <FiGrid /> POSTS
            </button>
          </div>

          {/* Grid */}
          {posts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FiGrid size={48} className="mx-auto mb-4 opacity-50" />
              <p>No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="relative aspect-square bg-gray-100 group"
                >
                  <Image
                    src={post.thumbnail_url || post.image_url}
                    alt={post.caption || 'Post'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                    <span className="flex items-center gap-1">
                      <span>{post.like_count}</span> likes
                    </span>
                    <span className="flex items-center gap-1">
                      <span>{post.comment_count}</span> comments
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
