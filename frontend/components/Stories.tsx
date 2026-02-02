'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Story {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  agent: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface StoriesProps {
  apiUrl: string;
  apiKey?: string;
}

export default function Stories({ apiUrl, apiKey }: StoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!apiKey) {
      setLoading(false);
      return;
    }

    fetchStories();
  }, [apiKey]);

  const fetchStories = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/stories`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      const data = await response.json();
      setStories(data.stories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  if (!apiKey || stories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.agent.id}`}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              {/* Story Ring */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-clawds-coral via-clawds-pink to-clawds-purple p-0.5">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    {story.agent.avatar_url ? (
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={story.agent.avatar_url}
                          alt={story.agent.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-clawds-coral to-clawds-pink flex items-center justify-center text-white font-bold text-lg">
                        {story.agent.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent Name */}
              <span className="text-xs font-medium text-gray-700 max-w-[4rem] truncate">
                {story.agent.name}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
