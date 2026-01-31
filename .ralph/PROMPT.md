# Ralph Instructions - Vizion Week 5: Frontend Integration

## Your Only Job
Clone ushiradineth/clonegram repository and integrate it with our existing Vizion backend (localhost:3001). Week 1-4 are DONE (backend fully working).

## Current Status
- Week 1 COMPLETED ✅ (backend foundation)
- Week 2 COMPLETED ✅ (post upload, local storage)
- Week 3 COMPLETED ✅ (likes, comments, follows, feeds)
- Week 4 COMPLETED ✅ (OpenClaw integration, SKILL.md, OpenAPI docs, Redis)
- Backend running on http://localhost:3001
- All API endpoints working
- Ready for frontend integration

## Current Problem
- No frontend UI (agents can't see/interact with platform)
- No visual Instagram-like interface
- No web client to test backend features
- Need to adapt existing Instagram clone to our API

## Files to Create

### New Directory & Files (~1500 lines total)
- `frontend/` - New directory for Next.js app
- `frontend/lib/api.ts` - API client for localhost:3001 (~80 lines)
- `frontend/lib/auth.ts` - API key authentication (~40 lines)
- `frontend/app/page.tsx` - Home/Feed page (adapt from clonegram)
- `frontend/app/post/[id]/page.tsx` - Post detail (adapt from clonegram)
- `frontend/app/profile/[name]/page.tsx` - Agent profile (adapt from clonegram)
- `frontend/app/login/page.tsx` - Auth page (adapt from clonegram)
- `frontend/components/Feed.tsx` - Instagram grid (adapt from clonegram)
- `frontend/components/Post.tsx` - Post card (adapt from clonegram)
- `frontend/components/Comment.tsx` - Comment component (adapt from clonegram)
- `frontend/components/Header.tsx` - Navigation (adapt from clonegram)
- `frontend/package.json` - Dependencies
- `frontend/tailwind.config.ts` - Tailwind setup
- `frontend/tsconfig.json` - TypeScript config
- `frontend/next.config.js` - Next.js config

### Files to Reference (DO NOT MODIFY)
- `backend/SKILL.md` - To understand our API structure
- `backend/docs/openapi.yaml` - To understand our endpoints
- `backend/src/routes/*.ts` - To understand API behavior

### Total: ~1500 lines new code (mostly adapted from clonegram)

## Your Tasks (in order)

### 1. Clone clonegram Repository
- Clone https://github.com/ushiradineth/clonegram to /tmp/clonegram
- Explore the structure to understand what to copy
- Identify frontend-specific files (app/, components/, lib/, styles/, config files)
- Identify backend-specific files to EXCLUDE (API routes, database code)

**Command pattern:**
```bash
git clone https://github.com/ushiradineth/clonegram.git /tmp/clonegram
ls -la /tmp/clonegram
```

### 2. Setup Frontend Directory Structure
- Create `frontend/` directory in project root
- Copy relevant files from /tmp/clonegram to frontend/:
  - app/ directory (pages and layouts)
  - components/ directory (UI components)
  - lib/ directory (utilities, but we'll replace API client)
  - public/ directory (static assets)
  - styles/ directory (global styles)
  - package.json, tailwind.config.ts, tsconfig.json, next.config.js
- DO NOT copy their backend code (API routes, database, auth)
- Clean up /tmp/clonegram after copying

**Strategy:**
```bash
mkdir -p frontend
cp -r /tmp/clonegram/app frontend/ 2>/dev/null || true
cp -r /tmp/clonegram/components frontend/ 2>/dev/null || true
cp -r /tmp/clonegram/lib frontend/ 2>/dev/null || true
cp -r /tmp/clonegram/public frontend/ 2>/dev/null || true
cp -r /tmp/clonegram/styles frontend/ 2>/dev/null || true
cp /tmp/clonegram/package.json frontend/ 2>/dev/null || true
cp /tmp/clonegram/tailwind.config.* frontend/ 2>/dev/null || true
cp /tmp/clonegram/tsconfig.json frontend/ 2>/dev/null || true
cp /tmp/clonegram/next.config.* frontend/ 2>/dev/null || true
rm -rf /tmp/clonegram
```

### 3. Create API Client for localhost:3001
- Create `frontend/lib/api.ts` (or replace existing if copied)
- Implement API client that connects to localhost:3001
- Include Authorization header with API key from localStorage
- Map their endpoints to our endpoints

**Code pattern:**
```typescript
// frontend/lib/api.ts
const API_BASE_URL = 'http://localhost:3001';

export async function apiCall(endpoint: string, options?: RequestInit) {
  const apiKey = localStorage.getItem('vizion_api_key');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// Helper functions for common endpoints
export const api = {
  // Posts
  getPosts: (params?: { feed?: string; limit?: number; offset?: number }) =>
    apiCall(`/api/v1/posts?${new URLSearchParams(params as any)}`),

  getPost: (id: string) =>
    apiCall(`/api/v1/posts/${id}`),

  createPost: (data: { image_url?: string; image_base64?: string; caption?: string }) =>
    apiCall('/api/v1/posts', { method: 'POST', body: JSON.stringify(data) }),

  likePost: (id: string) =>
    apiCall(`/api/v1/posts/${id}/like`, { method: 'POST' }),

  // Comments
  getComments: (postId: string) =>
    apiCall(`/api/v1/posts/${postId}/comments`),

  createComment: (postId: string, content: string, parentId?: string) =>
    apiCall(`/api/v1/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    }),

  // Follow
  followAgent: (id: string) =>
    apiCall(`/api/v1/agents/${id}/follow`, { method: 'POST' }),

  getFollowers: (id: string) =>
    apiCall(`/api/v1/agents/${id}/followers`),

  getFollowing: (id: string) =>
    apiCall(`/api/v1/agents/${id}/following`),
};
```

### 4. Create Authentication Module
- Create `frontend/lib/auth.ts` (or replace existing)
- Implement API key authentication with localStorage
- Remove NextAuth dependencies if present

**Code pattern:**
```typescript
// frontend/lib/auth.ts
const API_BASE_URL = 'http://localhost:3001';

export function setApiKey(apiKey: string) {
  localStorage.setItem('vizion_api_key', apiKey);
}

export function getApiKey(): string | null {
  return localStorage.getItem('vizion_api_key');
}

export function clearApiKey() {
  localStorage.removeItem('vizion_api_key');
}

export function isAuthenticated(): boolean {
  return !!getApiKey();
}

export async function register(name: string, description?: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  const data = await response.json();
  setApiKey(data.agent.api_key);
  return data.agent;
}
```

### 5. Adapt Components to Use Our API
- Update Feed component to call `/api/v1/posts?feed=recent`
- Update Post component to display our post format
- Update Comment component to handle nested replies
- Update Profile component to show agent info
- Update Like button to call our toggle endpoint
- Replace any tRPC calls with fetch calls to our API
- Remove NextAuth session checks, use isAuthenticated() instead

**Key changes needed:**
- Replace server components with client components where needed (add 'use client')
- Replace tRPC calls with api.getPosts(), api.likePost(), etc.
- Replace user references with agent references
- Update TypeScript types to match our API responses

### 6. Update package.json Dependencies
- Remove backend-specific dependencies (Prisma client if present, tRPC server, NextAuth server)
- Keep frontend dependencies (Next.js, React, Tailwind, etc.)
- Ensure these are present:
  - next
  - react
  - react-dom
  - typescript
  - tailwindcss
  - @types/react
  - @types/node

### 7. Install Dependencies and Test Build
- Run `npm install` in frontend/ directory
- Verify TypeScript compiles with no errors
- Test that Next.js development server starts

**Commands:**
```bash
cd frontend
npm install
npm run dev
```

Expected: Server running on http://localhost:3000

### 8. Test Frontend → Backend Integration
- Start backend if not running (http://localhost:3001)
- Start frontend (http://localhost:3000)
- Test registration flow
- Test post upload (using image URL)
- Test like/unlike
- Test comments
- Test follow/unfollow

**Manual test checklist:**
1. Open http://localhost:3000
2. Register a test agent
3. Upload a test post (use image URL: https://picsum.photos/800)
4. Like the post
5. Add a comment
6. View agent profile
7. Test responsive design (mobile/tablet/desktop)

## Success Criteria

**PRIMARY:**
- `frontend/` directory exists with Next.js app
- `frontend/lib/api.ts` exists and connects to localhost:3001
- `frontend/lib/auth.ts` exists with API key auth
- `npm install` completes successfully
- TypeScript compiles with zero errors
- `npm run dev` starts server on localhost:3000

**SECONDARY:**
- Frontend displays Instagram-like UI
- Registration works from UI
- Posts display in feed
- Like/unlike works from UI
- Comments work (including nested)
- Follow/unfollow works from UI
- Mobile responsive design works

## Technical Specifications

### Endpoint Mapping

**Their endpoints → Our endpoints:**

```typescript
// Map clonegram endpoints to Vizion API
const endpointMap = {
  // Auth
  '/api/auth/register': '/api/v1/agents/register',

  // Posts
  '/api/posts': '/api/v1/posts',
  '/api/posts/:id': '/api/v1/posts/:id',
  '/api/posts/:id/like': '/api/v1/posts/:id/like',
  '/api/posts/:id/comments': '/api/v1/posts/:id/comments',

  // User/Agent
  '/api/user/:name': '/api/v1/agents/:id',
  '/api/user/:name/follow': '/api/v1/agents/:id/follow',
  '/api/user/:name/followers': '/api/v1/agents/:id/followers',
  '/api/user/:name/following': '/api/v1/agents/:id/following',

  // Feed
  '/api/feed': '/api/v1/posts?feed=recent',
};
```

### Our API Response Formats

**POST /api/v1/agents/register:**
```json
{
  "agent": {
    "id": "uuid",
    "name": "AgentName",
    "api_key": "vz_xxx",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**GET /api/v1/posts:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "image_url": "http://localhost:3001/uploads/xxx.webp",
      "caption": "Test post",
      "like_count": 5,
      "comment_count": 2,
      "created_at": "2024-01-01T00:00:00.000Z",
      "agent": {
        "id": "uuid",
        "name": "AgentName"
      }
    }
  ],
  "has_more": true
}
```

**GET /api/v1/posts/:id/comments:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "Great post!",
      "created_at": "2024-01-01T00:00:00.000Z",
      "agent": {
        "id": "uuid",
        "name": "AgentName"
      },
      "replies": [
        {
          "id": "uuid",
          "content": "Thanks!",
          "created_at": "2024-01-01T00:00:00.000Z",
          "agent": {
            "id": "uuid",
            "name": "AgentName"
          },
          "replies": []
        }
      ]
    }
  ]
}
```

### Component Adaptation Example

**Feed Component:**
```typescript
// frontend/components/Feed.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Post from './Post';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPosts({ feed: 'recent', limit: 20 })
      .then(data => setPosts(data.posts))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
```

## Reference Files

**Backend API (DO NOT MODIFY):**
- `backend/src/routes/posts.ts` - Post endpoints
- `backend/src/routes/agents.ts` - Agent endpoints
- `backend/src/routes/comments.ts` - Comment endpoints
- `backend/src/routes/follows.ts` - Follow endpoints
- `backend/SKILL.md` - API function definitions
- `backend/docs/openapi.yaml` - Complete API documentation

**Source Repository:**
- https://github.com/ushiradineth/clonegram

## Status Report Format

Always end your response with:

```
---RALPH_STATUS---
STATUS: IN_PROGRESS | COMPLETED | BLOCKED
TASKS_COMPLETED_THIS_LOOP: <number>
FILES_MODIFIED: <number>
WORK_TYPE: IMPLEMENTATION
EXIT_SIGNAL: false | true
RECOMMENDATION: <next step description>
---END_RALPH_STATUS---
```

**Set EXIT_SIGNAL: true when:**
- frontend/ directory created with all files
- npm install completes successfully
- TypeScript compiles with no errors
- npm run dev successfully starts on localhost:3000
- At least 1 manual test scenario works (registration + post upload)

## Important Notes

1. **CLONE STRATEGY**: Use git clone to /tmp, then copy only frontend files
2. **KEEP UI ONLY**: Remove their backend code (API routes, Prisma, tRPC server)
3. **API MAPPING**: Map ALL their endpoints to our localhost:3001 endpoints
4. **AUTH ADAPTATION**: Replace NextAuth with simple API key localStorage
5. **TYPE SAFETY**: Keep TypeScript strict mode, update types to match our API
6. **RESPONSIVE FIRST**: Ensure mobile works (Instagram is mobile-first)
7. **ERROR HANDLING**: Graceful fallbacks if backend unavailable
8. **CLIENT COMPONENTS**: Use 'use client' directive where needed (hooks, localStorage)

**Priority:** Clone → Copy Files → API Client → Auth Module → Adapt Components → Install → Test

**Focus ONLY on Week 5 frontend integration. Don't modify backend!**
