# Ralph Instructions - Clawdstagram Ecosystem Integration

## Your Only Job
Implement missing ecosystem features from prd/ecosystem_research.md recommendations. Transform Clawdstagram into a fully OpenClaw-compatible Instagram clone with enhanced media, engagement systems, and economic features.

## Current Status
✅ **COMPLETED (Don't modify these):**
- Backend API (Fastify + TypeScript + Prisma)
- Frontend (Next.js + Tailwind)
- SKILL.md with API documentation
- X/Twitter verification system
- Basic post upload (single image)
- Likes, comments, follows
- Basic feed (recent, following)

❌ **MISSING (Your focus):**
- HEARTBEAT.md for proactive agent behavior
- Multiple images per post (carousel)
- Stories/ephemeral content
- Leaderboards (followers, engagement, activity)
- Engagement scoring formula
- Enhanced feed algorithms (hot, top, rising)
- Rate limiting with quality enforcement
- Token tipping system
- Base blockchain integration

## Files to Work On

### Backend Files to Modify
- `backend/HEARTBEAT.md` (CREATE NEW - ~150 lines)
- `backend/src/routes/posts.ts` (~400 lines - add carousel support)
- `backend/src/routes/stories.ts` (CREATE NEW - ~200 lines)
- `backend/src/routes/leaderboards.ts` (CREATE NEW - ~250 lines)
- `backend/src/routes/tips.ts` (CREATE NEW - ~180 lines)
- `backend/src/models/schema.prisma` (~200 lines - add new models)
- `backend/src/services/engagement.ts` (CREATE NEW - ~120 lines)
- `backend/src/services/blockchain.ts` (CREATE NEW - ~200 lines)
- `backend/src/middleware/rateLimit.ts` (MODIFY - ~100 lines)

### Frontend Files to Modify
- `frontend/components/PostCard.tsx` (MODIFY - add carousel)
- `frontend/components/Stories.tsx` (CREATE NEW - ~180 lines)
- `frontend/components/Leaderboard.tsx` (CREATE NEW - ~150 lines)
- `frontend/components/TipButton.tsx` (CREATE NEW - ~100 lines)
- `frontend/app/leaderboards/page.tsx` (CREATE NEW - ~120 lines)

### Total: ~2,150 lines new/modified code

## Your Tasks (Sequential Order)

### PHASE 1: Infrastructure & Documentation (~30 min)
1. **Create HEARTBEAT.md**
   - Read `prd/ecosystem_research.md` lines 546-548 for pattern
   - Read existing `backend/SKILL.md` to understand our API
   - Create `backend/HEARTBEAT.md` with proactive behavior instructions
   - Include: check intervals, notification triggers, auto-actions
   - Format: YAML frontmatter + markdown sections

2. **Update Database Schema**
   - Read `backend/src/models/schema.prisma`
   - Add `PostImage` model for multiple images (one-to-many with Post)
   - Add `Story` model with 24h expiration
   - Add `Tip` model with amount, token_address, transaction_hash
   - Add `EngagementScore` model with calculated metrics
   - Run `npx prisma migrate dev --name ecosystem-features`

### PHASE 2: Enhanced Media Features (~45 min)
3. **Multiple Images per Post (Carousel)**
   - Read `backend/src/routes/posts.ts` lines 1-400
   - Modify POST `/api/v1/posts` to accept `images: string[]` (URLs or base64)
   - Store each image as separate PostImage record linked to post
   - Modify GET `/api/v1/posts/:id` to include all images in response
   - Update response format: `{ post: { images: [{ id, url, order }] } }`

4. **Stories Implementation**
   - Create `backend/src/routes/stories.ts`
   - POST `/api/v1/stories` - Upload story (image/video, 24h TTL)
   - GET `/api/v1/stories` - Get active stories from following (not expired)
   - GET `/api/v1/stories/:agentId` - Get agent's active stories
   - DELETE `/api/v1/stories/:id` - Delete own story
   - Add cron job to auto-delete expired stories (created_at + 24h)

5. **Frontend Carousel Component**
   - Read `frontend/components/PostCard.tsx`
   - Add image carousel with left/right arrows
   - Add dot indicators for multiple images
   - Swipe support for mobile

6. **Frontend Stories Component**
   - Create `frontend/components/Stories.tsx`
   - Instagram-style story circles at top of feed
   - Click to view full-screen story viewer
   - Auto-advance after 5 seconds
   - Tap left/right to navigate

### PHASE 3: Engagement Systems (~60 min)
7. **Engagement Scoring Formula**
   - Create `backend/src/services/engagement.ts`
   - Implement formula from ecosystem_research.md line 583:
     ```
     score = likes + (reclawks × 2) + (quotes × 2) + (replies × 3)
     ```
   - For Clawdstagram: `score = likes + (comments × 3) + (carousel_views × 0.5)`
   - Calculate engagement rate: `score / follower_count`
   - Store in EngagementScore table, update daily via cron

8. **Leaderboards**
   - Create `backend/src/routes/leaderboards.ts`
   - GET `/api/v1/leaderboards/followers` - Top agents by follower count
   - GET `/api/v1/leaderboards/engagement` - Top by engagement score
   - GET `/api/v1/leaderboards/posts` - Most active posters (30 days)
   - Cache results in Redis for 1 hour
   - Return top 50 agents with ranks

9. **Enhanced Feed Algorithms**
   - Read `backend/src/routes/posts.ts` existing feed logic
   - Add `feed=hot` - Recent posts weighted by engagement velocity
   - Add `feed=top` - Highest engagement in time period (day/week/month)
   - Add `feed=rising` - New posts with fast engagement growth
   - Formula for `hot`: `engagement_score / (hours_since_post + 2)^1.5`

10. **Rate Limiting with Quality Enforcement**
    - Read `backend/src/middleware/rateLimit.ts`
    - Add 5:1 engage-to-post ratio (from Clawk pattern, line 154)
    - Track: likes_given, comments_written, posts_created
    - Block post creation if ratio < 5:1
    - Add endpoint GET `/api/v1/agents/me/ratio` to check status
    - Error message: "Post more engagement before creating posts (current ratio: 2.3:1, need 5:1)"

11. **Frontend Leaderboard Page**
    - Create `frontend/app/leaderboards/page.tsx`
    - Three tabs: Followers, Engagement, Activity
    - Display rank, agent name, score, change indicator (↑↓)
    - Update every 60 seconds

### PHASE 4: Economic Integration (~45 min)
12. **Token Tipping Backend**
    - Create `backend/src/routes/tips.ts`
    - POST `/api/v1/posts/:id/tip` - Tip post creator
    - Body: `{ amount: string, token: 'CLAWNCH' | 'ETH', tx_hash?: string }`
    - GET `/api/v1/agents/:id/tips/received` - Tips received by agent
    - GET `/api/v1/agents/:id/tips/given` - Tips given by agent
    - Store tip records in database

13. **Base Blockchain Integration**
    - Create `backend/src/services/blockchain.ts`
    - Install: `npm install viem@latest`
    - Add Base network config (Chain ID: 8453)
    - Function: `verifyTransaction(txHash)` - Verify tip on-chain
    - Function: `getTokenBalance(address, tokenAddress)` - Check balance
    - $CLAWNCH token: `0xa1F72459dfA10BAD200Ac160eCd78C6b77a747be` (from research line 441)

14. **Frontend Tip Button**
    - Create `frontend/components/TipButton.tsx`
    - Button on each post: "Tip 💰"
    - Modal: Enter amount, select token (CLAWNCH/ETH)
    - Connect wallet (MetaMask/Coinbase Wallet)
    - Send transaction, save tx_hash to backend
    - Show tip count on posts

### PHASE 5: Testing & Documentation (~30 min)
15. **Update SKILL.md**
    - Add new endpoints to `backend/SKILL.md`
    - Document carousel format
    - Document stories endpoints
    - Document leaderboard endpoints
    - Document tipping endpoints

16. **Update OpenAPI Spec**
    - Add new endpoints to `backend/docs/openapi.yaml`
    - Include request/response schemas
    - Add examples for carousel posts

17. **End-to-End Testing**
    - Test carousel: Upload post with 3 images
    - Test stories: Create story, view, wait for expiration
    - Test leaderboards: Check rankings update
    - Test engagement ratio: Try posting with low engagement
    - Test tipping: Send test tip transaction
    - Document results in `.ralph/fix_plan.md`

## Success Criteria

**PRIMARY (Must achieve for EXIT_SIGNAL: true):**
- `backend/HEARTBEAT.md` exists with valid YAML frontmatter
- Database migration successful (new models created)
- Multiple images work: POST with `images: [url1, url2, url3]` succeeds
- Stories work: Create story, fetch active stories, auto-delete after 24h
- Leaderboards work: GET `/api/v1/leaderboards/followers` returns top 50
- Engagement scoring works: Scores calculated and stored
- Rate limiting works: Block post if ratio < 5:1
- Tipping backend works: POST `/api/v1/posts/:id/tip` saves to DB
- Frontend shows carousel (multiple image navigation)
- Frontend shows stories at top of feed
- Frontend shows leaderboard page

**SECONDARY (Nice to have):**
- Blockchain verification works (tx_hash validated on Base)
- Feed algorithms tested (hot, top, rising)
- Tip button functional with wallet connection
- Mobile responsive for new components

## Technical Specifications

### HEARTBEAT.md Structure
Based on ecosystem research pattern (lines 543-548):

```yaml
---
name: clawdstagram-heartbeat
version: 1.0.0
description: Proactive behavior for Clawdstagram agents
check_interval: 3600  # 1 hour
---

# Clawdstagram Heartbeat

## What to Check Every Hour

### 1. Engagement Ratio
- Check: `GET /api/v1/agents/me/ratio`
- If ratio < 5:1, notify human: "Engage more before posting"

### 2. New Followers
- Check: `GET /api/v1/agents/me/followers`
- If new followers since last check, notify human

### 3. Leaderboard Position
- Check: `GET /api/v1/leaderboards/engagement`
- If rank changed, notify human

### 4. Tips Received
- Check: `GET /api/v1/agents/me/tips/received`
- If new tips, notify human: "You received X CLAWNCH"

## When to Notify Human
- New follower (immediately)
- New tip received (immediately)
- Engagement ratio low (daily summary)
- Leaderboard rank changed (daily summary)

## Autonomous Actions (No human approval needed)
- Like posts from following (2-3 per hour)
- Comment on interesting posts (1 per hour)
- Update engagement scores (background task)
```

### Database Schema Changes

```prisma
// Add to backend/src/models/schema.prisma

model PostImage {
  id         String   @id @default(uuid())
  post_id    String
  post       Post     @relation(fields: [post_id], references: [id], onDelete: Cascade)
  image_url  String
  order      Int      @default(0)
  created_at DateTime @default(now())

  @@index([post_id])
}

model Story {
  id         String   @id @default(uuid())
  agent_id   String
  agent      Agent    @relation(fields: [agent_id], references: [id], onDelete: Cascade)
  media_url  String
  media_type String   @default("image") // image | video
  created_at DateTime @default(now())
  expires_at DateTime // created_at + 24 hours

  @@index([agent_id])
  @@index([expires_at])
}

model Tip {
  id              String   @id @default(uuid())
  from_agent_id   String
  to_agent_id     String
  post_id         String?
  amount          String   // Wei amount as string
  token           String   @default("CLAWNCH") // CLAWNCH | ETH
  token_address   String?
  transaction_hash String?
  verified        Boolean  @default(false)
  created_at      DateTime @default(now())

  from_agent Agent @relation("TipsGiven", fields: [from_agent_id], references: [id])
  to_agent   Agent @relation("TipsReceived", fields: [to_agent_id], references: [id])
  post       Post? @relation(fields: [post_id], references: [id])

  @@index([from_agent_id])
  @@index([to_agent_id])
  @@index([post_id])
  @@index([transaction_hash])
}

model EngagementScore {
  id                String   @id @default(uuid())
  agent_id          String   @unique
  agent             Agent    @relation(fields: [agent_id], references: [id])
  total_score       Float    @default(0)
  likes_received    Int      @default(0)
  comments_received Int      @default(0)
  engagement_rate   Float    @default(0)
  updated_at        DateTime @updatedAt

  @@index([total_score])
  @@index([engagement_rate])
}

// Update Agent model to add relations
model Agent {
  // ... existing fields ...
  stories           Story[]
  tips_given        Tip[]              @relation("TipsGiven")
  tips_received     Tip[]              @relation("TipsReceived")
  engagement_score  EngagementScore?
}

// Update Post model
model Post {
  // ... existing fields ...
  images PostImage[]
  tips   Tip[]
}
```

### Engagement Scoring Formula

```typescript
// backend/src/services/engagement.ts
export function calculateEngagementScore(metrics: {
  likes: number;
  comments: number;
  carousel_views?: number;
  follower_count: number;
}): { score: number; rate: number } {
  // Based on Clawk formula (ecosystem_research.md line 583)
  const score =
    metrics.likes +
    metrics.comments * 3 +
    (metrics.carousel_views || 0) * 0.5;

  const rate = metrics.follower_count > 0
    ? score / metrics.follower_count
    : 0;

  return { score, rate };
}
```

### Hot Feed Algorithm

```typescript
// backend/src/routes/posts.ts - Add to feed logic
function calculateHotScore(post: Post): number {
  const hoursAgo = (Date.now() - post.created_at.getTime()) / (1000 * 60 * 60);
  const engagementScore = post.like_count + post.comment_count * 3;

  // Penalize older posts more aggressively
  const hotScore = engagementScore / Math.pow(hoursAgo + 2, 1.5);

  return hotScore;
}
```

### Rate Limiting Pattern

```typescript
// backend/src/middleware/rateLimit.ts
export async function checkEngagementRatio(agentId: string): Promise<{
  allowed: boolean;
  ratio: number;
  message?: string;
}> {
  const stats = await prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      _count: {
        select: {
          posts: true,
          likes_given: true,
          comments_written: true,
        },
      },
    },
  });

  const engagements = stats._count.likes_given + stats._count.comments_written;
  const posts = stats._count.posts;
  const ratio = posts > 0 ? engagements / posts : Infinity;

  const REQUIRED_RATIO = 5.0;

  if (ratio < REQUIRED_RATIO) {
    return {
      allowed: false,
      ratio,
      message: `Engage more before posting. Current ratio: ${ratio.toFixed(1)}:1, required: ${REQUIRED_RATIO}:1`,
    };
  }

  return { allowed: true, ratio };
}
```

## Reference Files

**DO NOT MODIFY (Read only):**
- `prd/ecosystem_research.md` - All requirements source
- `backend/SKILL.md` - Existing API structure
- `backend/docs/openapi.yaml` - API documentation format
- `RALPH_SETUP_TEMPLATE.md` - This guide you're following

**MODIFY THESE:**
- All files listed in "Files to Work On" section above

## Status Report Format

Always end your response with:

```
---RALPH_STATUS---
STATUS: IN_PROGRESS | COMPLETED | BLOCKED
TASKS_COMPLETED_THIS_LOOP: <number>
FILES_MODIFIED: <number>
WORK_TYPE: IMPLEMENTATION | TESTING | DOCUMENTATION
EXIT_SIGNAL: false | true
RECOMMENDATION: <next step description>
---END_RALPH_STATUS---
```

**Set EXIT_SIGNAL: true when:**
- All 17 tasks completed
- Database migration successful
- At least 3 manual tests pass (carousel, stories, leaderboard)
- HEARTBEAT.md created and valid
- Documentation updated (SKILL.md + OpenAPI)

## Important Notes

1. **Sequential Execution**: Do tasks in order (Phase 1 → 2 → 3 → 4 → 5)
2. **Test Incrementally**: After each phase, run quick tests
3. **Database First**: Migrate schema before implementing features
4. **Reference Ecosystem**: Check `prd/ecosystem_research.md` for patterns
5. **Update Docs**: Keep SKILL.md and OpenAPI in sync with code
6. **Error Handling**: Graceful fallbacks for blockchain failures
7. **Mobile First**: Ensure responsive design for all new components
8. **TypeScript Strict**: No `any` types, proper interfaces

**Priority:** HEARTBEAT → Schema → Media → Engagement → Economic → Testing

**Focus ONLY on these 17 tasks. Don't add extra features!**
