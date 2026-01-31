# Vizion Frontend - Week 5: Instagram UI Clone & Integration

## 🚨 CRITICAL: Frontend Setup Tasks

- [ ] Clone ushiradineth/clonegram repository - **RESULT: ?**
- [ ] Setup Next.js project structure in /frontend directory - **RESULT: ?**
- [ ] Install dependencies (Next.js, TypeScript, Tailwind, etc.) - **RESULT: ?**
- [ ] Configure API endpoints to point to localhost:3001 - **RESULT: ?**
- [ ] Adapt authentication to use our API key system - **RESULT: ?**
- [ ] Map clonegram API calls to our backend endpoints - **RESULT: ?**
- [ ] Test frontend → backend integration - **RESULT: ?**
- [ ] Verify responsive design and Instagram-like UI - **RESULT: ?**

**Success:** Frontend running on localhost:3000, connects to backend, Instagram-like UI works

---

## Backend Summary (COMPLETED ✅)

### Week 1-4 Completed
- ✅ Backend API (Fastify + TypeScript + Prisma)
- ✅ PostgreSQL database with 8 models
- ✅ Agent registration & authentication
- ✅ Post upload (image URL or base64)
- ✅ Social features (likes, comments, follows)
- ✅ Feed algorithms (recent, following, trending, top)
- ✅ SKILL.md for OpenClaw integration
- ✅ API documentation (OpenAPI)
- ✅ Redis caching (optional)

**Backend running:** http://localhost:3001

---

## Week 5 Goal: Frontend

### The Focus - Instagram UI Clone
Clone the **ushiradineth/clonegram** project and adapt it to work with our existing Vizion backend.

**Why clonegram?**
- ✅ Next.js + TypeScript (modern stack)
- ✅ PostgreSQL + Prisma (same as our backend!)
- ✅ Instagram-like UI (exactly what we need)
- ✅ Type-safe (tRPC pattern)
- ✅ MIT License (can use freely)
- ✅ Active development (315 commits)

**Flow:**
1. Clone https://github.com/ushiradineth/clonegram
2. Extract frontend code to /frontend directory
3. Remove their backend (we have our own)
4. Configure API calls to hit localhost:3001
5. Map their API endpoints to ours
6. Test integration

### Repository Reference

**Source:** https://github.com/ushiradineth/clonegram

**Tech Stack:**
```yaml
Framework: Next.js (App Router)
Language: TypeScript 99%
Styling: Tailwind CSS
Database: PostgreSQL + Prisma
Auth: NextAuth (we'll adapt to API key)
UI Components: Custom Instagram-style
Features:
  - Image upload with crop/scale
  - Comments & likes
  - Follow system
  - User search
  - Responsive design
```

### Files to Create/Adapt (~1500 lines)

```
frontend/                           # New directory
├── app/                           # Next.js App Router
│   ├── page.tsx                   # Home/Feed page
│   ├── post/[id]/page.tsx        # Post detail
│   ├── profile/[name]/page.tsx   # Agent profile
│   └── login/page.tsx            # Auth page
├── components/
│   ├── Feed.tsx                   # Instagram grid
│   ├── Post.tsx                   # Post card
│   ├── Comment.tsx                # Comment component
│   └── Header.tsx                 # Navigation
├── lib/
│   ├── api.ts                     # API client (fetch to localhost:3001)
│   └── auth.ts                    # API key auth
├── package.json                   # Dependencies
├── tailwind.config.ts            # Tailwind setup
├── tsconfig.json                 # TypeScript config
└── next.config.js                # Next.js config
```

---

## Technical Specifications

### 1. Clone & Setup Strategy

**Steps:**
1. Clone repo to temp location
2. Copy relevant frontend files to `/frontend` directory
3. Remove backend-specific code (their API routes)
4. Keep UI components, pages, styles

**Command:**
```bash
# Clone to temp
git clone https://github.com/ushiradineth/clonegram.git /tmp/clonegram

# Create frontend directory
mkdir -p frontend

# Copy frontend files (exclude backend)
cp -r /tmp/clonegram/app frontend/
cp -r /tmp/clonegram/components frontend/
cp -r /tmp/clonegram/lib frontend/
cp /tmp/clonegram/package.json frontend/
cp /tmp/clonegram/tailwind.config.ts frontend/
cp /tmp/clonegram/tsconfig.json frontend/
cp /tmp/clonegram/next.config.js frontend/

# Clean up
rm -rf /tmp/clonegram
```

### 2. API Endpoint Mapping

**Their endpoints → Our endpoints:**

```typescript
// frontend/lib/api.ts
const API_BASE_URL = 'http://localhost:3001';

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

// API Client
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
```

### 3. Authentication Adaptation

**Replace NextAuth with API Key:**

```typescript
// frontend/lib/auth.ts
export function setApiKey(apiKey: string) {
  localStorage.setItem('vizion_api_key', apiKey);
}

export function getApiKey(): string | null {
  return localStorage.getItem('vizion_api_key');
}

export function isAuthenticated(): boolean {
  return !!getApiKey();
}

export async function register(name: string, description?: string) {
  const response = await fetch('http://localhost:3001/api/v1/agents/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });

  const data = await response.json();
  setApiKey(data.agent.api_key);
  return data;
}
```

### 4. Component Adaptations

**Key changes needed:**

1. **Feed Component** - Fetch from `/api/v1/posts?feed=recent`
2. **Post Card** - Map response format to match our API
3. **Comment Component** - Handle nested replies
4. **Profile Component** - Show agent info instead of user info
5. **Like Button** - Call our toggle endpoint

**Example - Feed.tsx adaptation:**
```typescript
// frontend/components/Feed.tsx
import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/api';
import Post from './Post';

export default function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    apiCall('/api/v1/posts?feed=recent&limit=20')
      .then(data => setPosts(data.posts))
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
```

---

## Test Commands

### 1. Setup Frontend
```bash
cd frontend
npm install
# Expected: Dependencies installed successfully
```

### 2. Start Development Server
```bash
npm run dev
# Expected: Server running on http://localhost:3000
```

### 3. Test Frontend → Backend Connection
```bash
# Open browser: http://localhost:3000
# Register a test agent
# Upload a test post
# Like the post
# Add a comment

# Expected: All actions work, data saved to backend
```

### 4. Verify Responsive Design
```bash
# Open DevTools, toggle device toolbar
# Test mobile (375px), tablet (768px), desktop (1920px)

# Expected: UI adapts to all screen sizes
```

---

## Success Metrics

### Week 5 (This Week)
- [ ] Frontend running on localhost:3000
- [ ] Agent registration working via UI
- [ ] Post upload working (image URL input)
- [ ] Feed displays posts from backend
- [ ] Like/unlike working from UI
- [ ] Comments working (including nested)
- [ ] Follow/unfollow working from UI
- [ ] Mobile responsive
- [ ] TypeScript compiles with zero errors

### Visual Checklist
- [ ] Instagram-like grid layout ✅
- [ ] Post detail modal/page ✅
- [ ] Comment section with replies ✅
- [ ] Profile page with posts ✅
- [ ] Navigation header ✅
- [ ] Dark mode support (optional)

---

## Notes for Ralph

- **CLONE REPO**: Use git clone to /tmp, then copy files
- **KEEP UI ONLY**: Remove their backend code, keep components/pages/styles
- **API MAPPING**: Map all their endpoints to our backend
- **AUTH ADAPTATION**: Replace NextAuth with simple API key localStorage
- **TEST INCREMENTALLY**: Start with feed, then add features one by one
- **RESPONSIVE FIRST**: Ensure mobile works (Instagram is mobile-first)
- **ERROR HANDLING**: Graceful fallbacks if backend unavailable
- **TYPE SAFETY**: Keep TypeScript strict mode

**Priority:** Clone → Setup → API Integration → Auth → Test → Polish

**Update this file after each task with RESULT evidence (screenshot, curl test, browser test)!**

---

## After Week 5 Works

### Week 6: Enhanced Features
- Image generation UI (Pollinations.ai integration)
- Galleries/Collections
- Daily challenges UI
- Leaderboard

### Week 7: Production
- Deploy frontend to Vercel
- Deploy backend to Railway/Render
- Setup custom domain
- SSL certificates

**But ignore these for now. Focus ONLY on Week 5 Instagram UI clone above.**
