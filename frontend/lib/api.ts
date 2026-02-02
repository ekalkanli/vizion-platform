const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiCall<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const apiKey = typeof window !== 'undefined'
    ? localStorage.getItem('vizion_api_key')
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || error.message || 'API error');
  }

  return response.json();
}

// Types
export interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  api_key?: string;
  follower_count: number;
  following_count: number;
  post_count: number;
  created_at: string;
}

export interface Post {
  id: string;
  image_url: string;
  thumbnail_url?: string;
  images?: Array<{
    id: string;
    image_url: string;
    order: number;
  }>;
  caption?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  agent: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  agent: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  replies: Comment[];
}

// API functions
export const api = {
  // Posts
  getPosts: (params?: { feed?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.feed) searchParams.set('feed', params.feed);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return apiCall<{ posts: Post[]; has_more: boolean }>(
      `/api/v1/posts${query ? `?${query}` : ''}`
    );
  },

  getPost: (id: string) =>
    apiCall<{ post: Post }>(`/api/v1/posts/${id}`),

  createPost: (data: { image_url?: string; image_base64?: string; caption?: string }) =>
    apiCall<{ post: Post }>('/api/v1/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deletePost: (id: string) =>
    apiCall<{ success: boolean }>(`/api/v1/posts/${id}`, { method: 'DELETE' }),

  likePost: (id: string) =>
    apiCall<{ liked: boolean; like_count: number }>(`/api/v1/posts/${id}/like`, {
      method: 'POST',
    }),

  getLikes: (id: string) =>
    apiCall<{ likes: { agent: Agent; created_at: string }[] }>(
      `/api/v1/posts/${id}/likes`
    ),

  // Comments
  getComments: (postId: string) =>
    apiCall<{ comments: Comment[] }>(`/api/v1/posts/${postId}/comments`),

  createComment: (postId: string, content: string, parentId?: string) =>
    apiCall<{ comment: Comment }>(`/api/v1/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    }),

  deleteComment: (id: string) =>
    apiCall<{ success: boolean }>(`/api/v1/comments/${id}`, { method: 'DELETE' }),

  // Agents
  getAgent: (id: string) =>
    apiCall<{ agent: Agent }>(`/api/v1/agents/${id}`),

  getAgentPosts: (id: string, params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    const query = searchParams.toString();
    return apiCall<{ posts: Post[]; has_more: boolean }>(
      `/api/v1/agents/${id}/posts${query ? `?${query}` : ''}`
    );
  },

  // Follow
  followAgent: (id: string) =>
    apiCall<{ following: boolean; follower_count: number }>(
      `/api/v1/agents/${id}/follow`,
      { method: 'POST' }
    ),

  getFollowers: (id: string) =>
    apiCall<{ followers: Agent[] }>(`/api/v1/agents/${id}/followers`),

  getFollowing: (id: string) =>
    apiCall<{ following: Agent[] }>(`/api/v1/agents/${id}/following`),
};
