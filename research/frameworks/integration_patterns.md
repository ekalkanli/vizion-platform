# AI Agent Framework Integration Patterns Research

**Research Date:** 2026-01-31
**Target Platform:** Instagram/Social Media Integration
**Frameworks Analyzed:** ElizaOS, OpenClaw, A2A Protocol, MCP

---

## Executive Summary

This research document analyzes four major AI agent frameworks and protocols for integrating social media platforms (specifically Instagram). Each framework offers unique architectural patterns, with ElizaOS providing the most mature social media integration capabilities through its plugin ecosystem.

### Key Findings

- **ElizaOS**: Most production-ready for social media with existing Instagram, Twitter, Discord plugins
- **OpenClaw**: Best for multi-channel messaging (WhatsApp, Telegram, Discord) with skill-based extensions
- **A2A Protocol**: Emerging standard for agent-to-agent communication, complementary to other frameworks
- **MCP**: Tool-focused protocol for LLM-to-service integration, less suited for autonomous social agents

---

## 1. ElizaOS Framework

### Overview

ElizaOS is a TypeScript-based framework for building autonomous AI agents with extensive social media integration capabilities. It features a modular plugin architecture with 90+ official plugins.

**Repository:** https://github.com/elizaOS/eliza
**Documentation:** https://docs.elizaos.ai
**License:** Open Source

### Plugin Architecture

#### Core Components

Every ElizaOS plugin consists of these TypeScript interfaces:

```typescript
interface Plugin {
  name: string;                    // Unique identifier
  description: string;             // Human-readable description
  config?: { [key: string]: any }; // Optional configuration
  init?: (config: Record<string, string>, runtime: IAgentRuntime) => Promise<void>;
  actions?: Action[];              // Executable behaviors
  providers?: Provider[];          // Context/data providers
  evaluators?: Evaluator[];        // Response evaluators
  services?: (typeof Service)[];   // Background services
}
```

#### Action Structure

Actions define executable behaviors that agents can perform:

```typescript
interface Action {
  name: string;                    // Action identifier
  similes?: string[];              // Alternative names
  description: string;             // What the action does
  examples?: ActionExample[][];    // Usage examples
  handler: Handler;                // Execution logic
  validate: Validator;             // Pre-execution validation
}

// Handler signature
type Handler = (
  runtime: IAgentRuntime,
  message: Memory,
  state?: State
) => Promise<ActionResult>;

interface ActionResult {
  success: boolean;
  text?: string;
  values?: Record<string, any>;
  data?: any;
}
```

#### Provider Structure

Providers inject contextual data into agent prompts:

```typescript
interface Provider {
  name: string;
  description: string;
  get: (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ) => Promise<string>;
}
```

#### Evaluator Structure

Evaluators assess agent responses and determine behavior:

```typescript
interface Evaluator {
  name: string;
  description: string;
  similes: string[];
  examples: EvaluationExample[];
  handler: Handler;
  validate: Validator;
  alwaysRun?: boolean;
}
```

### Instagram Plugin Implementation

**Repository:** https://github.com/elizaos-plugins/plugin-instagram

#### Architecture

The Instagram plugin uses three client components:

1. **ClientBase** - Authentication and session management
2. **PostClient** - Media uploads and scheduling
3. **InteractionClient** - Comments, likes, notifications

#### Authentication Pattern

```typescript
// Environment Variables Required
INSTAGRAM_USERNAME=your_username
INSTAGRAM_PASSWORD=your_password
INSTAGRAM_APP_ID=optional_app_id
INSTAGRAM_APP_SECRET=optional_app_secret
INSTAGRAM_BUSINESS_ACCOUNT_ID=optional_business_id

// Initialization
const instagramManager = await InstagramClientInterface.start(runtime);
```

#### API Usage Examples

**Single Image Post:**

```typescript
await instagramManager.post.createPost({
  media: [
    {
      type: 'IMAGE',
      url: 'path/to/image.jpg'
    }
  ],
  caption: 'Your caption here #hashtags'
});
```

**Carousel Post:**

```typescript
await instagramManager.post.createPost({
  media: [
    { type: 'IMAGE', url: 'path/to/image1.jpg' },
    { type: 'IMAGE', url: 'path/to/image2.jpg' },
    { type: 'VIDEO', url: 'path/to/video.mp4' }
  ],
  caption: 'Multi-media carousel post'
});
```

**Comment Handling:**

```typescript
await instagramManager.interaction.handleComment({
  mediaId: 'media-123',
  comment: 'Great post!',
  userId: 'user-123'
});
```

**Like Media:**

```typescript
await instagramManager.interaction.likeMedia({
  mediaId: 'media-123'
});
```

#### Configuration Parameters

```env
POST_INTERVAL_MIN=90          # Minimum minutes between posts
POST_INTERVAL_MAX=180         # Maximum spacing
ACTION_INTERVAL=5             # Action processing frequency
MAX_ACTIONS_PROCESSING=1      # Concurrent actions
ENABLE_ACTION_PROCESSING=true # Enable/disable processing
```

### Twitter/X Integration

**Repository:** https://github.com/elizaos-plugins/client-twitter

The Twitter client enables:
- Automated tweet posting
- Context-aware content generation
- Tweet interaction handling
- Twitter Spaces support
- Optional Discord approval workflow

### Creating a Custom ElizaOS Plugin

#### Step 1: Project Setup

```bash
# Clone starter template
git clone https://github.com/elizaOS/eliza-plugin-starter
cd eliza-plugin-starter

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

#### Step 2: Plugin Structure

```
src/
├── plugins/
│   └── instagram-custom/
│       ├── index.ts           # Plugin export
│       ├── actions/
│       │   ├── post.ts        # Post action
│       │   └── comment.ts     # Comment action
│       ├── providers/
│       │   └── analytics.ts   # Analytics provider
│       └── services/
│           └── scheduler.ts   # Scheduling service
├── common/
│   └── types.ts               # Shared types
└── index.ts                   # Main entry
```

#### Step 3: Define Plugin

```typescript
// src/plugins/instagram-custom/index.ts
import { type Plugin } from '@elizaos/core';
import { postAction } from './actions/post';
import { commentAction } from './actions/comment';
import { analyticsProvider } from './providers/analytics';
import { SchedulerService } from './services/scheduler';

const instagramPlugin: Plugin = {
  name: 'instagram-custom',
  description: 'Custom Instagram integration for our platform',

  init: async (config, runtime) => {
    // Initialize API clients, validate credentials
    console.log('Initializing Instagram plugin...');
  },

  actions: [
    postAction,
    commentAction
  ],

  providers: [
    analyticsProvider
  ],

  services: [
    SchedulerService
  ]
};

export default instagramPlugin;
```

#### Step 4: Implement Action

```typescript
// src/plugins/instagram-custom/actions/post.ts
import { Action, ActionExample, IAgentRuntime, Memory, State } from '@elizaos/core';

interface PostConfig {
  imageUrl: string;
  caption: string;
  hashtags?: string[];
}

export const postAction: Action = {
  name: 'POST_TO_INSTAGRAM',

  similes: ['SHARE_ON_INSTAGRAM', 'PUBLISH_INSTAGRAM'],

  description: 'Posts an image with caption to Instagram',

  examples: [
    [
      {
        user: 'user',
        content: { text: 'Post this image to Instagram with caption "Hello World"' }
      },
      {
        user: 'assistant',
        content: {
          text: 'I will post the image to Instagram with your caption.',
          action: 'POST_TO_INSTAGRAM'
        }
      }
    ]
  ],

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    // Validate credentials exist
    const username = runtime.getSetting('INSTAGRAM_USERNAME');
    const password = runtime.getSetting('INSTAGRAM_PASSWORD');

    if (!username || !password) {
      return false;
    }

    return true;
  },

  handler: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    try {
      // Extract post data from message
      const postConfig = extractPostConfig(message);

      // Call Instagram API
      const instagram = await getInstagramClient(runtime);
      const result = await instagram.post.createPost({
        media: [{ type: 'IMAGE', url: postConfig.imageUrl }],
        caption: buildCaption(postConfig.caption, postConfig.hashtags)
      });

      return {
        success: true,
        text: `Successfully posted to Instagram! Post ID: ${result.id}`,
        data: { postId: result.id, url: result.permalink }
      };

    } catch (error) {
      return {
        success: false,
        text: `Failed to post to Instagram: ${error.message}`
      };
    }
  }
};

function extractPostConfig(message: Memory): PostConfig {
  // Parse message content to extract image URL, caption, hashtags
  // Implementation depends on your message structure
  return {
    imageUrl: '...',
    caption: '...',
    hashtags: []
  };
}

function buildCaption(caption: string, hashtags?: string[]): string {
  if (!hashtags || hashtags.length === 0) return caption;
  return `${caption}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
}

async function getInstagramClient(runtime: IAgentRuntime) {
  // Return authenticated Instagram client
  // Can cache in runtime state
  return instagramClientSingleton;
}
```

#### Step 5: Implement Provider

```typescript
// src/plugins/instagram-custom/providers/analytics.ts
import { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';

export const analyticsProvider: Provider = {
  name: 'instagram_analytics',

  description: 'Provides Instagram analytics and metrics',

  get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    const instagram = await getInstagramClient(runtime);

    // Fetch analytics data
    const insights = await instagram.getAccountInsights();

    // Format for injection into prompt
    return `
Instagram Analytics:
- Followers: ${insights.followerCount}
- Following: ${insights.followingCount}
- Posts: ${insights.mediaCount}
- Engagement Rate: ${insights.engagementRate}%
- Top Hashtags: ${insights.topHashtags.join(', ')}
    `.trim();
  }
};
```

#### Step 6: Testing

```bash
# Run with mock Eliza environment
pnpm mock-eliza --characters=./characters/agent.character.json

# Or integrate into main Eliza repo for full testing
```

### Authentication Handling

ElizaOS uses environment-based configuration:

1. **Environment Variables:** Store credentials in `.env` files
2. **Runtime Settings:** Access via `runtime.getSetting(key)`
3. **Session Management:** Plugins manage their own sessions
4. **Rate Limiting:** Implement in service layer

### Best Practices

1. **Error Handling:** Always wrap API calls in try-catch blocks
2. **Rate Limiting:** Respect platform rate limits (Instagram: 200 requests/hour)
3. **Validation:** Validate inputs before execution
4. **Logging:** Use runtime logging for debugging
5. **State Management:** Cache authentication sessions
6. **Idempotency:** Handle duplicate action execution gracefully

### Example Plugin Template for Our Platform

```typescript
// src/plugins/our-platform/index.ts
import { Plugin } from '@elizaos/core';
import { postContentAction } from './actions/postContent';
import { schedulePostAction } from './actions/schedulePost';
import { analyzeEngagementAction } from './actions/analyzeEngagement';
import { contentSuggestionsProvider } from './providers/contentSuggestions';
import { trendingTopicsProvider } from './providers/trendingTopics';
import { SchedulingService } from './services/scheduling';

const ourPlatformPlugin: Plugin = {
  name: 'our-platform-integration',
  description: 'Integration with our Instagram automation platform',

  config: {
    apiEndpoint: process.env.PLATFORM_API_ENDPOINT || 'https://api.ourplatform.com',
    apiKey: process.env.PLATFORM_API_KEY,
    maxPostsPerDay: 10,
    minPostInterval: 90 // minutes
  },

  init: async (config, runtime) => {
    // Validate API credentials
    if (!config.apiKey) {
      throw new Error('PLATFORM_API_KEY is required');
    }

    // Initialize API client
    runtime.platformClient = createPlatformClient(config);

    // Start scheduling service
    await SchedulingService.start(runtime);
  },

  actions: [
    postContentAction,
    schedulePostAction,
    analyzeEngagementAction
  ],

  providers: [
    contentSuggestionsProvider,
    trendingTopicsProvider
  ],

  services: [
    SchedulingService
  ]
};

export default ourPlatformPlugin;
```

---

## 2. OpenClaw Framework

### Overview

OpenClaw (formerly Moltbot/Clawdbot) is a personal AI assistant focused on multi-channel messaging integration. It uses a skill-based architecture with SKILL.md files following the Agent Skills specification developed by Anthropic.

**Repository:** https://github.com/openclaw/openclaw
**Documentation:** https://docs.openclaw.ai
**Skills Registry:** https://clawhub.ai

### Skill.md Pattern

#### File Structure

Each skill is a directory containing a `SKILL.md` file with YAML frontmatter and markdown instructions.

```
skills/
└── instagram-integration/
    ├── SKILL.md          # Skill definition
    ├── tools/            # Optional executables
    └── config/           # Optional config files
```

#### Minimum SKILL.md

```markdown
---
name: instagram-post
description: Post images to Instagram with captions
---

# Instagram Posting Skill

This skill enables the agent to post images to Instagram.

## Usage

Ask the agent to "post to Instagram" with an image and caption.

## Requirements

- Instagram credentials configured
- Image file or URL
```

#### Complete SKILL.md Example

```markdown
---
name: instagram-automation
description: Complete Instagram automation including posting, commenting, and analytics
homepage: https://github.com/our-org/instagram-skill
user-invocable: true
disable-model-invocation: false
metadata: {
  "openclaw": {
    "emoji": "📸",
    "requires": {
      "env": ["INSTAGRAM_USERNAME", "INSTAGRAM_PASSWORD", "INSTAGRAM_API_KEY"],
      "config": ["instagram.enabled", "instagram.business_account"],
      "bins": ["imagemagick", "ffmpeg"]
    },
    "primaryEnv": "INSTAGRAM_API_KEY",
    "install": [
      {
        "id": "brew-imagemagick",
        "kind": "brew",
        "formula": "imagemagick",
        "bins": ["convert", "identify"],
        "label": "Install ImageMagick (brew)"
      },
      {
        "id": "npm-instagram-client",
        "kind": "node",
        "package": "instagram-private-api",
        "bins": [],
        "label": "Install Instagram API client (npm)"
      }
    ]
  }
}
---

# Instagram Automation Skill

Complete Instagram automation for posting, engagement, and analytics.

## Capabilities

### Posting
- Single image posts
- Carousel posts (multiple images/videos)
- Story posts
- Reels

### Engagement
- Automatic comment responses
- Like posts based on hashtags
- Follow/unfollow management
- DM automation

### Analytics
- Engagement metrics
- Follower growth tracking
- Best posting times
- Hashtag performance

## Usage Examples

**Post an image:**
> Post this image to Instagram with caption "Beautiful sunset" and hashtags travel, photography

**Schedule a post:**
> Schedule this for tomorrow at 6pm on Instagram

**Analyze performance:**
> What are my top performing posts this week?

## Configuration

Add to `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "instagram-automation": {
        "enabled": true,
        "env": {
          "INSTAGRAM_USERNAME": "your_username",
          "INSTAGRAM_PASSWORD": "your_password",
          "INSTAGRAM_API_KEY": "your_api_key"
        },
        "config": {
          "max_posts_per_day": 10,
          "min_interval_minutes": 90,
          "auto_respond_comments": true,
          "hashtag_limit": 30
        }
      }
    }
  }
}
```

## API Integration

This skill uses the Instagram Private API through the `instagram-private-api` npm package.

### Authentication Flow

1. Login with username/password
2. Handle 2FA if enabled
3. Save session for reuse
4. Automatic session refresh

### Rate Limiting

Respects Instagram's rate limits:
- 200 requests per hour
- Max 10 posts per day (configurable)
- 90 minute minimum between posts

## Tools

The skill provides these tools:

### post_image
Posts a single image to Instagram.

**Parameters:**
- `image_path`: Path to image file
- `caption`: Post caption
- `hashtags`: Array of hashtags (max 30)
- `location`: Optional location tag

### schedule_post
Schedules a post for future publication.

**Parameters:**
- `image_path`: Path to image file
- `caption`: Post caption
- `scheduled_time`: ISO 8601 datetime
- `hashtags`: Array of hashtags

### get_analytics
Retrieves analytics for specified time period.

**Parameters:**
- `start_date`: ISO 8601 date
- `end_date`: ISO 8601 date
- `metrics`: Array of metric names

## Error Handling

- **Authentication Failed:** Check credentials in config
- **Rate Limited:** Automatic retry with exponential backoff
- **Invalid Image:** Verify format (JPEG, PNG) and size (<8MB)
- **Caption Too Long:** Max 2,200 characters
```

### YAML Frontmatter Fields

#### Standard Fields

```yaml
name: skill-identifier          # Required: unique identifier
description: What this skill does  # Required: triggers skill selection
homepage: https://...           # Optional: documentation URL
user-invocable: true            # Optional: expose as slash command
disable-model-invocation: false # Optional: exclude from model
command-dispatch: tool          # Optional: bypass model
command-tool: tool_name         # Required if command-dispatch set
command-arg-mode: raw           # Optional: argument handling
```

#### Metadata Object

The `metadata` field is a single-line JSON object:

```yaml
metadata: {"openclaw":{"emoji":"📸","requires":{"env":["API_KEY"],"bins":["tool"],"config":["key"]},"install":[...]}}
```

Expanded for readability:

```json
{
  "openclaw": {
    "emoji": "📸",
    "always": false,
    "os": ["darwin", "linux", "win32"],
    "requires": {
      "bins": ["imagemagick", "ffmpeg"],
      "env": ["INSTAGRAM_API_KEY"],
      "config": ["instagram.enabled"]
    },
    "primaryEnv": "INSTAGRAM_API_KEY",
    "install": [
      {
        "id": "unique-installer-id",
        "kind": "brew|node|go|uv|download",
        "formula": "package-name",    // for brew
        "package": "npm-package",     // for node
        "bins": ["binary-names"],
        "label": "User-facing label"
      }
    ]
  }
}
```

### Skill Directory Locations

Skills load from three locations in precedence order:

1. **Workspace skills:** `<workspace>/skills` (highest priority)
2. **User skills:** `~/.openclaw/skills`
3. **Bundled skills:** Shipped with OpenClaw (lowest priority)

### Configuration Integration

```json
{
  "skills": {
    "load": {
      "extraDirs": ["/path/to/custom/skills"]
    },
    "entries": {
      "instagram-automation": {
        "enabled": true,
        "apiKey": "your_api_key",
        "env": {
          "INSTAGRAM_USERNAME": "username",
          "INSTAGRAM_PASSWORD": "password"
        },
        "config": {
          "max_posts_per_day": 10,
          "auto_respond": true
        }
      }
    }
  }
}
```

### API Integration Examples

OpenClaw skills integrate with APIs through standard HTTP clients or SDK libraries.

#### HTTP API Pattern

```markdown
## API Integration

This skill calls the Instagram Graph API.

### Endpoints

- POST /me/media - Create media container
- POST /me/media_publish - Publish media
- GET /me/media - List media
- GET /{media-id}/insights - Get analytics

### Authentication

Uses OAuth 2.0 with access token stored in `INSTAGRAM_ACCESS_TOKEN` environment variable.

### Rate Limits

- 200 requests per hour per user
- Automatic retry with exponential backoff
```

#### Example Tool Implementation

While SKILL.md is declarative, actual tool execution happens in the agent. Document expected behavior:

```markdown
## Tool: post_to_instagram

**Description:** Posts an image to Instagram with caption and hashtags.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "image_url": { "type": "string", "description": "URL or path to image" },
    "caption": { "type": "string", "description": "Post caption" },
    "hashtags": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 30,
      "description": "Hashtags without # symbol"
    }
  },
  "required": ["image_url", "caption"]
}
```

**Output:**
```json
{
  "success": true,
  "post_id": "12345678901234567",
  "permalink": "https://www.instagram.com/p/ABC123/",
  "timestamp": "2026-01-31T10:00:00Z"
}
```

**Error Codes:**
- `AUTH_FAILED`: Invalid credentials
- `RATE_LIMITED`: Too many requests
- `INVALID_IMAGE`: Image format or size issue
- `CAPTION_TOO_LONG`: Caption exceeds 2,200 characters
```

### ClawHub Skills Registry

ClawHub provides a centralized registry for discovering and sharing skills.

**Features:**
- Vector-based semantic search
- Version management
- Community ratings and comments
- Installation via CLI

**Publishing a Skill:**

```bash
# Login to ClawHub
openclaw skills login

# Publish skill
openclaw skills publish ./skills/instagram-automation

# Update skill
openclaw skills update instagram-automation --version 1.1.0
```

### Example Skill Template for Our Platform

Create: `~/.openclaw/skills/our-platform/SKILL.md`

```markdown
---
name: our-platform-instagram
description: Integration with our Instagram automation platform API
homepage: https://docs.ourplatform.com
user-invocable: true
metadata: {
  "openclaw": {
    "emoji": "🚀",
    "requires": {
      "env": ["PLATFORM_API_KEY", "PLATFORM_USER_ID"],
      "config": ["platform.enabled"]
    },
    "primaryEnv": "PLATFORM_API_KEY"
  }
}
---

# Our Platform Instagram Integration

Connects OpenClaw to our Instagram automation platform.

## Features

- Post content through our platform API
- Schedule posts with optimal timing
- Get AI-generated content suggestions
- Track engagement analytics
- Automatic hashtag optimization

## Setup

1. Get API key from https://platform.ourplatform.com/settings
2. Configure in `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "our-platform-instagram": {
        "enabled": true,
        "env": {
          "PLATFORM_API_KEY": "your_api_key_here",
          "PLATFORM_USER_ID": "your_user_id"
        },
        "config": {
          "auto_optimize_hashtags": true,
          "use_ai_suggestions": true
        }
      }
    }
  }
}
```

## Usage

**Post content:**
> Post this image to Instagram using our platform

**Get suggestions:**
> What content should I post today?

**Schedule post:**
> Schedule this for the best time tomorrow

**Analytics:**
> Show me my Instagram performance this week

## API Reference

All requests go to `https://api.ourplatform.com/v1/`

### POST /instagram/post
Create and publish Instagram post.

**Headers:**
- Authorization: Bearer {PLATFORM_API_KEY}

**Body:**
```json
{
  "user_id": "string",
  "image_url": "string",
  "caption": "string",
  "hashtags": ["string"],
  "schedule_time": "ISO 8601 datetime (optional)"
}
```

### GET /instagram/suggestions
Get AI-powered content suggestions.

**Response:**
```json
{
  "suggestions": [
    {
      "caption": "string",
      "hashtags": ["string"],
      "best_time": "ISO 8601 datetime",
      "confidence": 0.95
    }
  ]
}
```

### GET /instagram/analytics
Retrieve engagement analytics.

**Query Params:**
- start_date: ISO 8601 date
- end_date: ISO 8601 date

**Response:**
```json
{
  "total_posts": 42,
  "total_likes": 1250,
  "total_comments": 85,
  "engagement_rate": 4.2,
  "follower_growth": 127,
  "top_posts": [...]
}
```
```

---

## 3. Agent-to-Agent (A2A) Protocol

### Overview

The Agent2Agent (A2A) Protocol is an open communication standard for AI agent interoperability, initially developed by Google and now managed by the Linux Foundation. It enables agents from different vendors and frameworks to communicate seamlessly.

**Specification:** https://a2a-protocol.org/latest/specification/
**Repository:** https://github.com/a2aproject/A2A
**Version:** 0.3.0 (Released July 2025)

### Protocol Architecture

#### Layered Design

1. **Layer 1:** Core data structures and message formats (protocol-agnostic)
2. **Layer 2:** Fundamental capabilities and behaviors
3. **Layer 3:** Protocol bindings (JSON-RPC, gRPC, HTTP/REST)

#### Communication Patterns

- **Synchronous:** Request/response via JSON-RPC 2.0
- **Streaming:** Server-Sent Events (SSE) for real-time updates
- **Asynchronous:** Push notifications to webhooks

### Agent Card Specification

The Agent Card is a JSON document describing an agent's capabilities, published at `/.well-known/agent-card.json`.

#### Basic Agent Card

```json
{
  "jsonrpc": "2.0",
  "name": "instagram-automation-agent",
  "description": "AI agent for Instagram content management and automation",
  "version": "1.0.0",
  "url": "https://api.ourplatform.com/agents/instagram",
  "protocolVersion": "0.3.0",
  "preferredTransport": "JSONRPC",

  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "multiTurn": true
  },

  "defaultInputModes": ["text", "image"],
  "defaultOutputModes": ["text", "image", "structured_data"],

  "skills": [
    {
      "id": "post-content",
      "name": "Post to Instagram",
      "description": "Create and publish Instagram posts with images and captions",
      "tags": ["social-media", "instagram", "posting"],
      "inputSchema": {
        "type": "object",
        "properties": {
          "image": { "type": "string", "format": "uri" },
          "caption": { "type": "string", "maxLength": 2200 },
          "hashtags": {
            "type": "array",
            "items": { "type": "string" },
            "maxItems": 30
          }
        },
        "required": ["image", "caption"]
      }
    },
    {
      "id": "get-analytics",
      "name": "Get Analytics",
      "description": "Retrieve Instagram account analytics and insights",
      "tags": ["analytics", "insights"],
      "inputSchema": {
        "type": "object",
        "properties": {
          "start_date": { "type": "string", "format": "date" },
          "end_date": { "type": "string", "format": "date" },
          "metrics": {
            "type": "array",
            "items": {
              "enum": ["likes", "comments", "shares", "saves", "reach", "impressions"]
            }
          }
        }
      }
    },
    {
      "id": "schedule-post",
      "name": "Schedule Post",
      "description": "Schedule Instagram post for future publication",
      "tags": ["scheduling"],
      "inputSchema": {
        "type": "object",
        "properties": {
          "image": { "type": "string", "format": "uri" },
          "caption": { "type": "string" },
          "scheduled_time": { "type": "string", "format": "date-time" }
        },
        "required": ["image", "caption", "scheduled_time"]
      }
    }
  ],

  "security": [
    {
      "type": "http",
      "scheme": "bearer",
      "bearerFormat": "JWT"
    },
    {
      "type": "apiKey",
      "in": "header",
      "name": "X-API-Key"
    }
  ]
}
```

#### Extended Agent Card

Extended cards require authentication and may include:
- Detailed configuration options
- User-specific capabilities
- Rate limit information
- Usage statistics

```json
{
  // ... basic fields ...

  "extendedCapabilities": {
    "rateLimits": {
      "requests_per_hour": 200,
      "posts_per_day": 10
    },
    "features": {
      "ai_suggestions": true,
      "hashtag_optimization": true,
      "auto_scheduling": true
    },
    "userLimits": {
      "max_accounts": 5,
      "storage_gb": 10
    }
  }
}
```

### Message Formats

#### Send Message (JSON-RPC)

```json
{
  "jsonrpc": "2.0",
  "id": "req-123",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "Post this image to Instagram with caption 'Beautiful sunset' and hashtags travel, photography"
        },
        {
          "type": "file",
          "mimeType": "image/jpeg",
          "uri": "https://storage.example.com/images/sunset.jpg"
        }
      ]
    },
    "contextId": "conv-456",
    "configuration": {
      "blocking": true
    }
  }
}
```

#### Response (Task-Based)

```json
{
  "jsonrpc": "2.0",
  "id": "req-123",
  "result": {
    "taskId": "task-789",
    "contextId": "conv-456",
    "status": {
      "state": "completed",
      "message": "Post created successfully"
    },
    "artifacts": [
      {
        "parts": [
          {
            "type": "text",
            "text": "Successfully posted to Instagram!"
          },
          {
            "type": "structured_data",
            "mimeType": "application/json",
            "data": {
              "post_id": "12345678901234567",
              "permalink": "https://www.instagram.com/p/ABC123/",
              "timestamp": "2026-01-31T10:00:00Z"
            }
          }
        ]
      }
    ]
  }
}
```

#### Streaming Response (SSE)

```
event: status-update
data: {"taskId":"task-789","state":"processing","message":"Uploading image..."}

event: artifact-update
data: {"taskId":"task-789","parts":[{"type":"text","text":"Image uploaded, creating post..."}],"append":true}

event: status-update
data: {"taskId":"task-789","state":"completed","final":true}

event: artifact-update
data: {"taskId":"task-789","parts":[{"type":"text","text":"Post published!"}],"append":true,"final":true}
```

### Authentication Patterns

#### API Key Authentication

```http
POST /message/send HTTP/1.1
Host: api.ourplatform.com
X-API-Key: your_api_key_here
Content-Type: application/json

{...}
```

#### Bearer Token (JWT)

```http
POST /message/send HTTP/1.1
Host: api.ourplatform.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{...}
```

#### OAuth 2.0

Agent Card declares OAuth endpoints:

```json
{
  "security": [
    {
      "type": "oauth2",
      "flows": {
        "authorizationCode": {
          "authorizationUrl": "https://auth.ourplatform.com/oauth/authorize",
          "tokenUrl": "https://auth.ourplatform.com/oauth/token",
          "scopes": {
            "instagram:post": "Create Instagram posts",
            "instagram:read": "Read Instagram data",
            "instagram:analytics": "Access analytics"
          }
        }
      }
    }
  ]
}
```

### SDK Implementation Examples

#### Python SDK

```bash
pip install a2a-sdk
```

```python
from a2a import Agent, AgentCard, Skill, Message

# Define agent card
card = AgentCard(
    name="instagram-automation-agent",
    description="Instagram automation agent",
    version="1.0.0",
    url="https://api.ourplatform.com/agents/instagram",
    skills=[
        Skill(
            id="post-content",
            name="Post to Instagram",
            description="Create Instagram posts",
            input_schema={
                "type": "object",
                "properties": {
                    "image": {"type": "string"},
                    "caption": {"type": "string"}
                }
            }
        )
    ]
)

# Create agent
agent = Agent(card=card)

@agent.skill("post-content")
async def post_to_instagram(image: str, caption: str, **kwargs):
    # Implementation
    result = await instagram_api.create_post(image, caption)
    return {
        "success": True,
        "post_id": result.id,
        "permalink": result.permalink
    }

# Run agent server
agent.run(host="0.0.0.0", port=8080)
```

#### JavaScript/TypeScript SDK

```bash
npm install @a2a-js/sdk
```

```typescript
import { Agent, AgentCard, Skill } from '@a2a-js/sdk';

const card: AgentCard = {
  name: 'instagram-automation-agent',
  description: 'Instagram automation agent',
  version: '1.0.0',
  url: 'https://api.ourplatform.com/agents/instagram',
  skills: [
    {
      id: 'post-content',
      name: 'Post to Instagram',
      description: 'Create Instagram posts',
      inputSchema: {
        type: 'object',
        properties: {
          image: { type: 'string' },
          caption: { type: 'string' }
        }
      }
    }
  ]
};

const agent = new Agent(card);

agent.registerSkill('post-content', async (params) => {
  const { image, caption } = params;
  const result = await instagramAPI.createPost(image, caption);

  return {
    success: true,
    post_id: result.id,
    permalink: result.permalink
  };
});

agent.listen(8080);
```

### Multi-Turn Conversations

A2A supports stateful conversations through Context IDs:

```json
// First message
{
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [{"type": "text", "text": "I want to post to Instagram"}]
    }
  }
}

// Response requesting more info
{
  "result": {
    "taskId": "task-1",
    "contextId": "conv-123",
    "status": {
      "state": "input-required",
      "message": "Please provide the image and caption"
    }
  }
}

// Follow-up with context
{
  "method": "message/send",
  "params": {
    "contextId": "conv-123",  // Same context
    "message": {
      "role": "user",
      "parts": [
        {"type": "text", "text": "Here's the image and caption"},
        {"type": "file", "uri": "..."}
      ]
    }
  }
}
```

### Use Cases for Instagram Integration

1. **Agent-to-Agent Content Sharing**
   - Content creation agent sends to publishing agent
   - Analytics agent queries performance from Instagram agent

2. **Workflow Orchestration**
   - Scheduler agent triggers Instagram agent at optimal times
   - Moderation agent reviews content before publication

3. **Cross-Platform Coordination**
   - Single content agent distributes to Instagram, Twitter, Facebook agents
   - Each platform agent handles platform-specific formatting

### Example Integration Template

```typescript
// instagram-a2a-agent.ts
import { Agent, AgentCard, Message, Task } from '@a2a-js/sdk';
import { InstagramAPI } from './instagram-api';

const agentCard: AgentCard = {
  name: 'our-platform-instagram-agent',
  description: 'Instagram automation via our platform',
  version: '1.0.0',
  url: 'https://api.ourplatform.com/a2a/instagram',
  protocolVersion: '0.3.0',
  preferredTransport: 'JSONRPC',

  capabilities: {
    streaming: true,
    pushNotifications: true,
    multiTurn: true
  },

  defaultInputModes: ['text', 'image'],
  defaultOutputModes: ['text', 'structured_data'],

  skills: [
    {
      id: 'post-instagram',
      name: 'Post to Instagram',
      description: 'Create and publish Instagram post',
      tags: ['instagram', 'posting'],
      inputSchema: {
        type: 'object',
        properties: {
          image: { type: 'string', format: 'uri' },
          caption: { type: 'string' },
          hashtags: { type: 'array', items: { type: 'string' } },
          schedule_time: { type: 'string', format: 'date-time' }
        },
        required: ['image', 'caption']
      }
    },
    {
      id: 'get-suggestions',
      name: 'Get Content Suggestions',
      description: 'AI-powered content suggestions',
      tags: ['ai', 'suggestions'],
      inputSchema: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          count: { type: 'number', default: 3 }
        }
      }
    }
  ],

  security: [
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  ]
};

const agent = new Agent(agentCard);
const instagram = new InstagramAPI();

// Post skill implementation
agent.registerSkill('post-instagram', async (params, context) => {
  const { image, caption, hashtags, schedule_time } = params;

  try {
    let result;

    if (schedule_time) {
      // Schedule for later
      result = await instagram.schedulePost({
        image,
        caption,
        hashtags,
        scheduledTime: new Date(schedule_time)
      });

      return {
        parts: [
          {
            type: 'text',
            text: `Post scheduled for ${schedule_time}`
          },
          {
            type: 'structured_data',
            mimeType: 'application/json',
            data: {
              scheduled_id: result.id,
              scheduled_time: result.scheduledTime
            }
          }
        ]
      };
    } else {
      // Post immediately
      result = await instagram.createPost({
        image,
        caption,
        hashtags
      });

      return {
        parts: [
          {
            type: 'text',
            text: 'Successfully posted to Instagram!'
          },
          {
            type: 'structured_data',
            mimeType: 'application/json',
            data: {
              post_id: result.id,
              permalink: result.permalink,
              timestamp: result.timestamp
            }
          }
        ]
      };
    }
  } catch (error) {
    throw new Error(`Failed to post: ${error.message}`);
  }
});

// Suggestions skill implementation
agent.registerSkill('get-suggestions', async (params, context) => {
  const { topic, count } = params;

  const suggestions = await instagram.getAISuggestions(topic, count);

  return {
    parts: [
      {
        type: 'text',
        text: `Here are ${suggestions.length} content suggestions for "${topic}":`
      },
      {
        type: 'structured_data',
        mimeType: 'application/json',
        data: {
          suggestions: suggestions.map(s => ({
            caption: s.caption,
            hashtags: s.hashtags,
            best_time: s.bestTime,
            confidence: s.confidence
          }))
        }
      }
    ]
  };
});

// Start agent server
agent.listen(8080, () => {
  console.log('Instagram A2A agent listening on port 8080');
  console.log('Agent card available at: /.well-known/agent-card.json');
});
```

---

## 4. Model Context Protocol (MCP)

### Overview

Model Context Protocol (MCP) is an open standard for connecting AI assistants to external data sources and tools. Introduced by Anthropic in November 2024 and now part of the Linux Foundation's Agentic AI Foundation, MCP focuses on LLM-to-service integration rather than autonomous agent behavior.

**Specification:** https://modelcontextprotocol.io/specification/2025-11-25
**Repository:** https://github.com/modelcontextprotocol
**Version:** Latest (2025-11-25)

### Protocol Architecture

MCP uses JSON-RPC 2.0 for communication between:

- **Hosts:** LLM applications (Claude, ChatGPT, Cursor, etc.)
- **Clients:** Connectors within the host application
- **Servers:** Services providing context and capabilities

### Core Components

#### 1. Resources

Resources provide context and data to the LLM:

```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'instagram://posts/recent',
        name: 'Recent Instagram Posts',
        description: 'Your 10 most recent Instagram posts',
        mimeType: 'application/json'
      },
      {
        uri: 'instagram://analytics/week',
        name: 'Weekly Analytics',
        description: 'Instagram analytics for the past week',
        mimeType: 'application/json'
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'instagram://posts/recent') {
    const posts = await instagram.getRecentPosts(10);

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(posts, null, 2)
        }
      ]
    };
  }

  // ... handle other resources
});
```

#### 2. Tools

Tools are functions the LLM can execute:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'post_to_instagram',
        description: 'Posts an image to Instagram with caption and hashtags',
        inputSchema: {
          type: 'object',
          properties: {
            image_url: {
              type: 'string',
              description: 'URL or path to the image file'
            },
            caption: {
              type: 'string',
              description: 'Post caption (max 2,200 characters)'
            },
            hashtags: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 30,
              description: 'Hashtags without # symbol'
            }
          },
          required: ['image_url', 'caption']
        }
      },
      {
        name: 'schedule_instagram_post',
        description: 'Schedules an Instagram post for future publication',
        inputSchema: {
          type: 'object',
          properties: {
            image_url: { type: 'string' },
            caption: { type: 'string' },
            scheduled_time: {
              type: 'string',
              format: 'date-time',
              description: 'ISO 8601 datetime'
            }
          },
          required: ['image_url', 'caption', 'scheduled_time']
        }
      },
      {
        name: 'get_instagram_analytics',
        description: 'Retrieves Instagram analytics for specified period',
        inputSchema: {
          type: 'object',
          properties: {
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            metrics: {
              type: 'array',
              items: {
                enum: ['likes', 'comments', 'shares', 'saves', 'reach', 'impressions']
              }
            }
          },
          required: ['start_date', 'end_date']
        }
      }
    ]
  };
});
```

#### 3. Prompts

Prompts are templated messages for users:

```typescript
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'create_instagram_post',
        description: 'Guide user through creating an Instagram post',
        arguments: [
          {
            name: 'topic',
            description: 'Topic or theme for the post',
            required: false
          }
        ]
      },
      {
        name: 'analyze_performance',
        description: 'Analyze Instagram account performance',
        arguments: [
          {
            name: 'period',
            description: 'Time period (day, week, month)',
            required: true
          }
        ]
      }
    ]
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'create_instagram_post') {
    const topic = args?.topic || 'general';

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Help me create an engaging Instagram post about ${topic}. Consider current trends, optimal hashtags, and best posting times.`
          }
        }
      ]
    };
  }

  // ... handle other prompts
});
```

### Server Implementation (TypeScript)

```typescript
// instagram-mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { InstagramAPI } from './instagram-api.js';

// Initialize server
const server = new Server(
  {
    name: 'instagram-automation-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {}
    }
  }
);

// Initialize Instagram API client
const instagram = new InstagramAPI({
  username: process.env.INSTAGRAM_USERNAME!,
  password: process.env.INSTAGRAM_PASSWORD!,
  apiKey: process.env.INSTAGRAM_API_KEY
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'post_to_instagram',
        description: 'Posts an image to Instagram',
        inputSchema: {
          type: 'object',
          properties: {
            image_url: { type: 'string' },
            caption: { type: 'string' },
            hashtags: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['image_url', 'caption']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'post_to_instagram') {
    try {
      const result = await instagram.createPost({
        imageUrl: args.image_url as string,
        caption: args.caption as string,
        hashtags: args.hashtags as string[] || []
      });

      return {
        content: [
          {
            type: 'text',
            text: `Successfully posted to Instagram!\nPost ID: ${result.id}\nPermalink: ${result.permalink}`
          },
          {
            type: 'resource',
            resource: {
              uri: `instagram://posts/${result.id}`,
              mimeType: 'application/json',
              text: JSON.stringify(result, null, 2)
            }
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error posting to Instagram: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'instagram://profile',
        name: 'Instagram Profile',
        description: 'Current Instagram account information',
        mimeType: 'application/json'
      },
      {
        uri: 'instagram://posts/recent',
        name: 'Recent Posts',
        description: 'Last 10 Instagram posts',
        mimeType: 'application/json'
      }
    ]
  };
});

// Read resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'instagram://profile') {
    const profile = await instagram.getProfile();

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(profile, null, 2)
        }
      ]
    };
  }

  if (uri === 'instagram://posts/recent') {
    const posts = await instagram.getRecentPosts(10);

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(posts, null, 2)
        }
      ]
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Instagram MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

### Client Configuration

MCP servers are configured in the host application's settings.

#### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "instagram-automation": {
      "command": "node",
      "args": [
        "/path/to/instagram-mcp-server/build/index.js"
      ],
      "env": {
        "INSTAGRAM_USERNAME": "your_username",
        "INSTAGRAM_PASSWORD": "your_password",
        "INSTAGRAM_API_KEY": "your_api_key"
      }
    }
  }
}
```

#### VSCode/Cursor Configuration

```json
{
  "mcp.servers": [
    {
      "name": "instagram-automation",
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/server/index.js"],
      "env": {
        "INSTAGRAM_USERNAME": "${env:INSTAGRAM_USERNAME}",
        "INSTAGRAM_PASSWORD": "${env:INSTAGRAM_PASSWORD}"
      }
    }
  ]
}
```

### Authentication Patterns

MCP servers typically use environment variables for authentication:

```typescript
// Environment-based
const apiKey = process.env.INSTAGRAM_API_KEY;
const username = process.env.INSTAGRAM_USERNAME;
const password = process.env.INSTAGRAM_PASSWORD;

// Session-based
let session: InstagramSession | null = null;

async function getAuthenticatedClient() {
  if (!session || session.isExpired()) {
    session = await instagram.authenticate(username, password);
  }
  return session.client;
}

// OAuth flow (for user-specific access)
server.setRequestHandler(CustomRequestSchema, async (request) => {
  if (request.params.method === 'oauth_init') {
    const authUrl = await instagram.getOAuthURL();
    return { authUrl };
  }

  if (request.params.method === 'oauth_callback') {
    const { code } = request.params;
    const tokens = await instagram.exchangeCodeForTokens(code);
    // Store tokens securely
    return { success: true };
  }
});
```

### Social Platform Use Cases

While MCP is primarily designed for tool/data integration rather than autonomous social media agents, it can be used for:

1. **Content Creation Assistance**
   - LLM has access to Instagram analytics via resources
   - Suggests optimal posting times and content
   - User reviews and approves posts

2. **Analytics Dashboard**
   - Resources expose engagement metrics
   - Tools for generating reports
   - LLM provides insights and recommendations

3. **Interactive Workflows**
   - User asks "What should I post today?"
   - LLM queries analytics resources
   - Suggests content via prompts
   - User approves, LLM calls post tool

### Limitations for Autonomous Agents

MCP is **not ideal** for fully autonomous social media agents because:

- Requires human-in-the-loop (LLM client)
- No built-in scheduling or automation
- Synchronous request/response model
- Limited agent-to-agent communication

**Better suited for:**
- IDE integrations (Cursor, VSCode)
- Chat interfaces (Claude, ChatGPT)
- Human-assisted workflows

**Use A2A or ElizaOS instead for:**
- Autonomous posting
- Agent-to-agent workflows
- Long-running background tasks

### Example Server Template for Our Platform

```typescript
// our-platform-mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'our-platform-instagram',
    version: '1.0.0'
  },
  {
    capabilities: {
      resources: {},
      tools: {}
    }
  }
);

// Platform API client
const platformAPI = {
  baseURL: process.env.PLATFORM_API_URL,
  apiKey: process.env.PLATFORM_API_KEY,

  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }
};

// Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'post_via_platform',
        description: 'Post to Instagram via our platform API',
        inputSchema: {
          type: 'object',
          properties: {
            image_url: { type: 'string' },
            caption: { type: 'string' },
            hashtags: { type: 'array', items: { type: 'string' } },
            optimize_hashtags: { type: 'boolean', default: true }
          },
          required: ['image_url', 'caption']
        }
      },
      {
        name: 'get_ai_suggestions',
        description: 'Get AI-powered content suggestions from our platform',
        inputSchema: {
          type: 'object',
          properties: {
            topic: { type: 'string' },
            count: { type: 'number', default: 3 }
          }
        }
      },
      {
        name: 'schedule_optimal_time',
        description: 'Schedule post for optimal engagement time',
        inputSchema: {
          type: 'object',
          properties: {
            image_url: { type: 'string' },
            caption: { type: 'string' },
            date_range: {
              type: 'string',
              enum: ['today', 'tomorrow', 'this_week'],
              default: 'today'
            }
          },
          required: ['image_url', 'caption']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'post_via_platform') {
    const result = await platformAPI.request('/instagram/post', {
      method: 'POST',
      body: JSON.stringify({
        image_url: args.image_url,
        caption: args.caption,
        hashtags: args.hashtags,
        optimize_hashtags: args.optimize_hashtags
      })
    });

    return {
      content: [
        {
          type: 'text',
          text: `Post scheduled successfully!\nPost ID: ${result.post_id}\nScheduled for: ${result.scheduled_time}`
        }
      ]
    };
  }

  if (name === 'get_ai_suggestions') {
    const result = await platformAPI.request(
      `/ai/suggestions?topic=${args.topic}&count=${args.count}`
    );

    return {
      content: [
        {
          type: 'text',
          text: 'Here are AI-generated content suggestions:\n\n' +
                result.suggestions.map((s: any, i: number) =>
                  `${i+1}. ${s.caption}\n   Hashtags: ${s.hashtags.join(', ')}\n   Best time: ${s.best_time}`
                ).join('\n\n')
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'platform://analytics/summary',
        name: 'Analytics Summary',
        description: 'Overall Instagram performance metrics',
        mimeType: 'application/json'
      },
      {
        uri: 'platform://suggestions/trending',
        name: 'Trending Topics',
        description: 'Current trending topics and hashtags',
        mimeType: 'application/json'
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'platform://analytics/summary') {
    const analytics = await platformAPI.request('/analytics/summary');

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(analytics, null, 2)
        }
      ]
    };
  }

  if (uri === 'platform://suggestions/trending') {
    const trending = await platformAPI.request('/ai/trending');

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(trending, null, 2)
        }
      ]
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Platform MCP server running');
}

main();
```

---

## Comparison Matrix

| Feature | ElizaOS | OpenClaw | A2A Protocol | MCP |
|---------|---------|----------|--------------|-----|
| **Primary Use Case** | Autonomous social agents | Multi-channel messaging | Agent-to-agent communication | LLM-tool integration |
| **Architecture** | Plugin-based (Actions, Providers, Evaluators) | Skill-based (SKILL.md files) | Protocol specification | Server-client (Resources, Tools, Prompts) |
| **Language** | TypeScript | TypeScript/JavaScript | Language-agnostic (SDKs: Python, JS, Go, Java, .NET) | Language-agnostic (SDKs: TypeScript, Python, Go, etc.) |
| **Social Media Support** | Excellent (Instagram, Twitter, Discord, Telegram) | Good (WhatsApp, Telegram, Discord, iMessage) | Protocol-level (implementation-dependent) | Limited (human-in-loop) |
| **Autonomy** | High (autonomous agents) | Medium (assistant-based) | High (agent-to-agent) | Low (requires LLM client) |
| **Authentication** | Environment variables, session management | Config files, environment variables | Multiple schemes (OAuth, API key, mTLS) | Environment variables |
| **Scheduling** | Built-in support | Built-in (Gateway) | Implementation-dependent | Not built-in |
| **Learning Curve** | Medium | Low | Medium-High | Low-Medium |
| **Best For** | Autonomous social media bots | Personal AI assistant | Enterprise agent ecosystems | IDE/chat integrations |
| **Production Ready** | Yes (90+ plugins) | Yes | Emerging (v0.3.0) | Yes (widespread adoption) |
| **Instagram Support** | Native plugin available | Via skills/custom integration | Via agent implementation | Via server implementation |
| **Multi-turn Conversations** | Yes (state management) | Yes (session-based) | Yes (Context IDs) | Yes (prompt history) |
| **Streaming** | Limited | Yes (Gateway) | Yes (SSE) | Limited |
| **Community** | Large (ElizaOS ecosystem) | Growing (700+ skills) | Google, Linux Foundation | Anthropic, OpenAI, Microsoft |

---

## Integration Recommendations

### For Our Instagram Automation Platform

#### Primary Recommendation: ElizaOS

**Why:**
1. **Mature Instagram Plugin:** Ready-to-use Instagram integration with posting, comments, likes
2. **Autonomous Operation:** Agents run independently without human approval
3. **Rich Plugin Ecosystem:** 90+ plugins, active development
4. **TypeScript:** Modern, type-safe development
5. **Production Ready:** Battle-tested in social media automation

**Implementation Path:**
1. Fork/extend `@elizaos/plugin-instagram`
2. Add our platform-specific features (AI suggestions, optimal scheduling)
3. Create custom actions for our API endpoints
4. Deploy as standalone agent or integrate into existing infrastructure

#### Secondary Recommendation: OpenClaw

**Why:**
1. **Multi-Channel Support:** WhatsApp, Telegram integration for customer communication
2. **Simple Extension Model:** SKILL.md files easy to create and maintain
3. **Configuration-Driven:** JSON config for easy deployment
4. **Personal Assistant Focus:** Good for user-facing interactions

**Use Cases:**
- Customer support across messaging platforms
- User notifications via WhatsApp/Telegram
- Personal Instagram automation assistant

#### Tertiary: A2A Protocol

**Why:**
1. **Future-Proof:** Industry standard backed by Google, Linux Foundation
2. **Agent-to-Agent:** Enable ecosystem of specialized agents
3. **Interoperability:** Work with other AI agent platforms

**Use Cases:**
- Expose our platform as an A2A agent
- Integrate with other AI services (content generation, analytics, moderation)
- Enterprise deployments requiring multi-agent coordination

#### Not Recommended: MCP

**Why:**
1. **Human-in-Loop Required:** Not suitable for autonomous posting
2. **Synchronous Model:** No background scheduling
3. **Limited Autonomy:** Best for IDE/chat integrations

**Exception:**
- If building IDE plugin for developers
- Chat-based Instagram management interface
- Human-supervised workflows

---

## Implementation Templates

### Template 1: ElizaOS Plugin for Our Platform

**File:** `/plugins/our-platform/index.ts`

```typescript
import { Plugin, Action, Provider, IAgentRuntime, Memory, State } from '@elizaos/core';

// Platform API client
class PlatformAPI {
  constructor(
    private apiKey: string,
    private baseURL: string = 'https://api.ourplatform.com'
  ) {}

  async post(imageUrl: string, caption: string, options: any = {}) {
    const response = await fetch(`${this.baseURL}/instagram/post`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getSuggestions(topic: string, count: number = 3) {
    const response = await fetch(
      `${this.baseURL}/ai/suggestions?topic=${topic}&count=${count}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );

    return response.json();
  }

  async getOptimalTime(dateRange: string = 'today') {
    const response = await fetch(
      `${this.baseURL}/analytics/optimal-time?range=${dateRange}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );

    return response.json();
  }
}

// Post action
const postAction: Action = {
  name: 'POST_TO_PLATFORM',
  description: 'Post to Instagram via our platform',

  validate: async (runtime: IAgentRuntime) => {
    return !!runtime.getSetting('PLATFORM_API_KEY');
  },

  handler: async (runtime: IAgentRuntime, message: Memory) => {
    const api = new PlatformAPI(runtime.getSetting('PLATFORM_API_KEY')!);

    // Extract from message
    const { imageUrl, caption, hashtags } = extractPostData(message);

    const result = await api.post(imageUrl, caption, {
      hashtags,
      optimize_hashtags: true
    });

    return {
      success: true,
      text: `Posted to Instagram! ID: ${result.post_id}`,
      data: result
    };
  }
};

// Suggestions provider
const suggestionsProvider: Provider = {
  name: 'content_suggestions',
  description: 'AI-powered content suggestions',

  get: async (runtime: IAgentRuntime, message: Memory) => {
    const api = new PlatformAPI(runtime.getSetting('PLATFORM_API_KEY')!);
    const suggestions = await api.getSuggestions('general', 3);

    return `Content Suggestions:\n${
      suggestions.map((s: any) =>
        `- ${s.caption}\n  Hashtags: ${s.hashtags.join(', ')}`
      ).join('\n')
    }`;
  }
};

// Plugin export
const ourPlatformPlugin: Plugin = {
  name: 'our-platform',
  description: 'Integration with our Instagram automation platform',

  actions: [postAction],
  providers: [suggestionsProvider]
};

export default ourPlatformPlugin;

function extractPostData(message: Memory) {
  // Parse message to extract image URL, caption, hashtags
  // Implementation depends on message structure
  return {
    imageUrl: '',
    caption: '',
    hashtags: []
  };
}
```

### Template 2: OpenClaw Skill for Our Platform

**File:** `~/.openclaw/skills/our-platform/SKILL.md`

```markdown
---
name: our-platform-instagram
description: Instagram automation via our platform API with AI-powered suggestions and optimal scheduling
homepage: https://docs.ourplatform.com
user-invocable: true
metadata: {
  "openclaw": {
    "emoji": "🚀",
    "requires": {
      "env": ["PLATFORM_API_KEY", "PLATFORM_USER_ID"]
    },
    "primaryEnv": "PLATFORM_API_KEY"
  }
}
---

# Our Platform Instagram Integration

Automate Instagram posting with AI-powered content suggestions and optimal scheduling.

## Configuration

```json
{
  "skills": {
    "entries": {
      "our-platform-instagram": {
        "enabled": true,
        "env": {
          "PLATFORM_API_KEY": "your_api_key",
          "PLATFORM_USER_ID": "your_user_id"
        },
        "config": {
          "auto_optimize": true,
          "max_posts_per_day": 10
        }
      }
    }
  }
}
```

## Usage

**Post content:**
> Post this image to Instagram using our platform

**Get suggestions:**
> What should I post about travel today?

**Schedule optimal:**
> Schedule this for the best time tomorrow

## API

Base URL: `https://api.ourplatform.com/v1`

### POST /instagram/post
```json
{
  "user_id": "string",
  "image_url": "string",
  "caption": "string",
  "hashtags": ["string"],
  "optimize_hashtags": true
}
```

### GET /ai/suggestions?topic={topic}&count={count}
Returns AI-generated content suggestions.

### GET /analytics/optimal-time?range={range}
Returns best posting time based on analytics.
```

### Template 3: A2A Agent for Our Platform

**File:** `src/a2a-agent.ts`

```typescript
import { Agent, AgentCard } from '@a2a-js/sdk';

const card: AgentCard = {
  name: 'our-platform-instagram-agent',
  description: 'Instagram automation via our platform',
  version: '1.0.0',
  url: 'https://api.ourplatform.com/a2a/instagram',
  protocolVersion: '0.3.0',

  skills: [
    {
      id: 'post-instagram',
      name: 'Post to Instagram',
      description: 'Create and publish Instagram post',
      inputSchema: {
        type: 'object',
        properties: {
          image: { type: 'string' },
          caption: { type: 'string' },
          hashtags: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    {
      id: 'get-suggestions',
      name: 'Get Content Suggestions',
      description: 'AI-powered content suggestions',
      inputSchema: {
        type: 'object',
        properties: {
          topic: { type: 'string' }
        }
      }
    }
  ]
};

const agent = new Agent(card);

agent.registerSkill('post-instagram', async (params) => {
  // Implementation
  return { success: true, post_id: '...' };
});

agent.registerSkill('get-suggestions', async (params) => {
  // Implementation
  return { suggestions: [...] };
});

agent.listen(8080);
```

---

## Best Practices Summary

### General

1. **Error Handling:** Always wrap API calls in try-catch
2. **Rate Limiting:** Respect platform limits (Instagram: 200/hour, 10 posts/day)
3. **Authentication:** Use environment variables, never hardcode credentials
4. **Logging:** Comprehensive logging for debugging and monitoring
5. **Validation:** Validate all inputs before API calls
6. **Idempotency:** Handle duplicate requests gracefully
7. **Testing:** Unit tests for actions/skills, integration tests for API calls

### ElizaOS-Specific

1. **Action Naming:** Use SCREAMING_SNAKE_CASE for action names
2. **Similes:** Provide alternative names for better agent understanding
3. **Examples:** Include realistic usage examples in action definitions
4. **Providers:** Use for injecting context, not for side effects
5. **Services:** Long-running tasks belong in services, not actions
6. **State Management:** Use runtime state for caching, session management

### OpenClaw-Specific

1. **Description is Key:** The description field triggers skill selection
2. **Metadata Gating:** Use `metadata.openclaw.requires` for dependencies
3. **Installation:** Provide clear install instructions for binaries/packages
4. **Documentation:** Write comprehensive SKILL.md with usage examples
5. **Tool Schemas:** Define clear input/output schemas for tools
6. **Error Messages:** User-friendly error messages in skill documentation

### A2A-Specific

1. **Agent Cards:** Comprehensive skill definitions with schemas
2. **Versioning:** Use semantic versioning for agent versions
3. **Streaming:** Implement for long-running tasks
4. **Multi-turn:** Use Context IDs for conversation continuity
5. **Error Codes:** Return machine-readable error codes
6. **Security:** Implement proper authentication schemes

### MCP-Specific

1. **Resources vs Tools:** Resources for data, tools for actions
2. **Schema Validation:** Use strict JSON schemas for tool inputs
3. **Error Handling:** Return isError flag in responses
4. **Transport:** Use stdio for simplicity, HTTP for network access
5. **Environment:** Configure via host application settings
6. **URI Schemes:** Use custom URI schemes for resources

---

## Citations & Resources

### ElizaOS

[1] ElizaOS Documentation. "Overview - ElizaOS Documentation." https://docs.elizaos.ai

[2] GitHub - elizaOS/eliza. "Autonomous agents for everyone." https://github.com/elizaOS/eliza

[3] GitHub - elizaOS/eliza-plugin-starter. "A starter plugin repo for the Solana hackathon." https://github.com/elizaOS/eliza-plugin-starter

[4] GitHub - elizaos-plugins/plugin-bootstrap. https://github.com/elizaos-plugins/plugin-bootstrap

[5] GitHub - elizaos-plugins/plugin-instagram. "Enables Instagram integration with support for media posting, comment handling, and interaction management." https://github.com/elizaos-plugins/plugin-instagram

[6] GitHub - elizaos-plugins/client-twitter. "This package integrates Twitter/X with the Eliza AI agent." https://github.com/elizaos-plugins/client-twitter

[7] ElizaOS Documentation. "Part 2: Deep Dive into Actions, Providers, and Evaluators." https://elizaos.github.io/eliza/community/ai-dev-school/part2/

[8] Flow Developer Portal. "Eliza Plugin Guide." https://developers.flow.com/blockchain-development-tutorials/use-AI-to-build-on-flow/agents/eliza/build-plugin

### OpenClaw

[9] OpenClaw Documentation. "Skills - OpenClaw." https://docs.openclaw.ai/tools/skills

[10] GitHub - openclaw/openclaw. "Your own personal AI assistant. Any OS. Any Platform. The lobster way." https://github.com/openclaw/openclaw

[11] GitHub - openclaw/clawhub. "Skill Directory for OpenClaw." https://github.com/openclaw/clawhub

[12] TechCrunch. "OpenClaw's AI assistants are now building their own social network." https://techcrunch.com/2026/01/30/openclaws-ai-assistants-are-now-building-their-own-social-network/

[13] GitHub - VoltAgent/awesome-openclaw-skills. "The awesome collection of OpenClaw Skills." https://github.com/VoltAgent/awesome-openclaw-skills

[14] Moltbot Documentation. "Index - Moltbot." https://docs.molt.bot/

[15] DataCamp. "Moltbot (Clawdbot) Tutorial: Control Your PC from WhatsApp." https://www.datacamp.com/tutorial/moltbot-clawdbot-tutorial

### A2A Protocol

[16] Google Developers Blog. "Announcing the Agent2Agent Protocol (A2A)." https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/

[17] GitHub - a2aproject/A2A. "An open protocol enabling communication and interoperability between opaque agentic applications." https://github.com/a2aproject/A2A

[18] A2A Protocol. "Agent2Agent Protocol (A2A) Specification." https://a2a-protocol.org/latest/specification/

[19] IBM. "What Is Agent2Agent (A2A) Protocol?" https://www.ibm.com/think/topics/agent2agent-protocol

[20] A2A Protocol Documentation. "A2A Common Workflows & Examples." https://a2aprotocol.ai/docs/guide/a2a-sample-methods-and-json-responses

[21] Google Codelabs. "Getting Started with Agent2Agent (A2A) Protocol." https://codelabs.developers.google.com/intro-a2a-purchasing-concierge

[22] A2A Protocol. "Agent Skills & Agent Card." https://a2a-protocol.org/latest/tutorials/python/3-agent-skills-and-card/

### MCP

[23] Model Context Protocol. "Specification - Model Context Protocol." https://modelcontextprotocol.io/specification/2025-11-25

[24] GitHub - modelcontextprotocol/servers. "Model Context Protocol Servers." https://github.com/modelcontextprotocol/servers

[25] GitHub - modelcontextprotocol/typescript-sdk. "The official TypeScript SDK for Model Context Protocol servers and clients." https://github.com/modelcontextprotocol/typescript-sdk

[26] Wikipedia. "Model Context Protocol." https://en.wikipedia.org/wiki/Model_Context_Protocol

[27] Generect. "What Is MCP (Model Context Protocol)? The 2026 Guide." https://generect.com/blog/what-is-mcp/

[28] CData. "2026: The Year for Enterprise-Ready MCP Adoption." https://www.cdata.com/blog/2026-year-enterprise-ready-mcp-adoption

[29] FreeCodeCamp. "How to Build a Custom MCP Server with TypeScript." https://www.freecodecamp.org/news/how-to-build-a-custom-mcp-server-with-typescript-a-handbook-for-developers/

[30] GetLate. "Social Media MCP: Master Cross-Platform Publishing with a Model Context Protocol." https://getlate.dev/blog/social-media-mcp

---

## Conclusion

For our Instagram automation platform, **ElizaOS provides the most comprehensive and production-ready solution**. Its mature Instagram plugin, autonomous operation capabilities, and rich ecosystem make it ideal for social media automation.

**Recommended Architecture:**

1. **Primary Agent Framework:** ElizaOS
   - Core Instagram automation
   - Autonomous posting and engagement
   - Custom plugin for our platform API

2. **Multi-Channel Support:** OpenClaw
   - WhatsApp/Telegram customer support
   - User notifications
   - Personal assistant features

3. **Future Integration:** A2A Protocol
   - Expose our platform as an A2A agent
   - Integrate with ecosystem of AI services
   - Enterprise deployments

4. **Developer Tools:** MCP
   - IDE integrations for developers
   - Chat-based management interface
   - Human-supervised workflows

This multi-framework approach provides maximum flexibility while leveraging each framework's strengths.

---

**End of Research Document**
