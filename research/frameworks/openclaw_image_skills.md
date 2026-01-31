# OpenClaw/Moltbot/Clawdbot Image & Video Generation Skills - Comprehensive Research

**Research Date:** January 31, 2026
**Primary Source:** https://github.com/VoltAgent/awesome-openclaw-skills
**Researcher:** Technical Researcher Agent

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [OpenClaw Ecosystem Overview](#openclaw-ecosystem-overview)
3. [Image & Video Generation Skills - Detailed Analysis](#image--video-generation-skills---detailed-analysis)
4. [Best Practices & Integration Patterns](#best-practices--integration-patterns)
5. [Recommendations for Instagram-for-Agents Project](#recommendations-for-instagram-for-agents-project)
6. [Citations](#citations)

---

## Executive Summary

OpenClaw (formerly Moltbot, originally Clawdbot) is an open-source, locally-running AI assistant that extends capabilities through **AgentSkills** - modular plugins following Anthropic's open standard for AI coding assistants. The ecosystem contains **700+ community-built skills**, with **19 dedicated to image and video generation**.

### Key Findings

- **9 Major Image/Video Skills Identified**: krea-api, vap-media, pollinations, reve-ai, meshy-ai, veo, gamma, venice-ai, comfy-cli
- **Best Free Option**: Pollinations.ai (unlimited free Flux images, 25+ models)
- **Best Transparent Pricing**: VAP Media (Flux, Veo 3.1, Suno V5)
- **Most Feature-Rich**: Venice AI (generation, upscaling, editing, video)
- **Best for Production**: Krea.ai (multiple premium models, API-first)

### Architecture Highlights

```
OpenClaw Architecture:
├── Gateway (front door, messaging platforms)
├── Agent (LLM reasoning engine)
├── Skills (modular capabilities via SKILL.md)
└── Memory (persistent storage, Markdown-based)
```

---

## OpenClaw Ecosystem Overview

### What is OpenClaw?

OpenClaw is a **bridge between LLMs and local operating systems**, allowing AI agents to execute tasks directly on user hardware while maintaining privacy and control.

**Evolution Timeline:**
- **Late 2025**: Released as "Clawdbot" by Peter Steinberger
- **Early 2026**: Renamed to "Moltbot"
- **January 2026**: Renamed to "OpenClaw"

### Core Components

1. **Gateway**: Background service managing connections to messaging platforms (WhatsApp, Discord, Telegram, Slack)
2. **Agent**: Reasoning engine powered by external or local LLMs
3. **Skills**: SKILL.md files with YAML frontmatter defining capabilities
4. **Memory**: Persistent Markdown-based storage at `~/.openclaw/memory/`

### Skill Architecture

Skills follow the **AgentSkills specification** developed by Anthropic:

```yaml
---
name: skill-name
description: Brief description for skill discovery
metadata:
  openclaw:
    requires:
      bins: ["uv", "python3"]
      env: ["API_KEY"]
      config: ["feature.enabled"]
    primaryEnv: "API_KEY"
---

# Skill Instructions

Natural language instructions for the AI agent on how to use this skill...
```

### Skill Registry

- **ClawHub**: Public skill registry at https://clawhub.com with CLI-friendly API
- **Vector Search**: Uses OpenAI's `text-embedding-3-small` for semantic skill discovery
- **Moderation**: Admin-curated, star/comment functionality
- **Versioning**: Tagged releases with `latest` tag

### Skill Installation

```bash
# Via ClawHub CLI
clawdbot install <skill-name>

# Manual installation
mkdir -p ~/.openclaw/skills/<skill-name>
# or
mkdir -p <workspace>/skills/<skill-name>
```

**Load Precedence**: `<workspace>/skills` > `~/.openclaw/skills` > bundled skills

---

## Image & Video Generation Skills - Detailed Analysis

### 1. krea-api

**Author:** fossilizedcarlos
**Repository:** `openclaw/skills/tree/main/skills/fossilizedcarlos/krea-api/SKILL.md`
**Description:** Generate images via Krea.ai API (Flux, Imagen, Ideogram, Seedream, etc.)

#### Technical Details

**Supported Models:**
- Flux variants: `flux`, `flux-kontext`, `flux-1.1-pro`
- Google: `imagen-3`, `imagen-4`
- Ideogram: `ideogram-3.0`
- Seedream: `seedream-4`

**API Integration Pattern:**
```python
# POST-poll-result workflow (asynchronous)
1. POST /generate/image/bfl/flux-1-dev
   - Receives task_id
2. Poll status until completion
3. Download result from returned URL
```

**Configuration:**
```bash
# Setup API credentials
clawdbot config set skill.krea_api.key_id YOUR_KEY_ID
clawdbot config set skill.krea_api.secret YOUR_SECRET
```

**API Parameters:**
- `prompt` (required): Max 1800 characters
- `model`: Default "flux"
- `width/height`: 512-2368px, default 1024
- `steps`: 1-100, default 25
- `guidance_scale`: 0-24, default 3.0
- `seed`: Optional for reproducibility
- `webhook_url`: For async notifications

**Pricing:**
- **Free Tier**: Not specified
- **Paid Plans**:
  - Basic: $8/month
  - Pro: $28/month
  - Business: $40/month
  - Max: $48/month
- **Billing**: Compute units (shared between API and web app)
- **No charge** for failed/cancelled jobs

**Key Features:**
- No external dependencies (uses stdlib only)
- Webhook support for background jobs
- Reproducible results via seed
- Note: Working endpoint differs from official docs

**Use Case for Instagram-for-Agents:**
- **Pros**: Multiple premium models, production-ready API, compute unit pooling
- **Cons**: Requires paid subscription, no free tier for testing
- **Best For**: High-quality production image generation with consistent branding

---

### 2. vap-media

**Author:** elestirelbilinc-sketch
**Repository:** `openclaw/skills/tree/main/skills/elestirelbilinc-sketch/vap-media/SKILL.md`
**Description:** AI media generation: Flux, Veo 3.1, Suno V5 with transparent pricing

#### Technical Details

**Supported Models:**

| Type | Model | Parameters |
|------|-------|------------|
| **Images** | Flux | description, aspect_ratio (1:1, 16:9, 9:16) |
| **Videos** | Veo 3.1 | description, duration (4/6/8s), aspect_ratio, generate_audio |
| **Music** | Suno V5 | description, duration (30-480s), instrumental option |

**Operational Modes:**

**Free Mode (No API Key):**
- Images only
- 3 generations per day
- No authentication required
- Trial endpoints

**Full Mode (With API Key):**
- All media types (images, videos, music)
- Unlimited generations
- Requires `VAP_API_KEY` environment variable
- Sign up: https://vapagent.com/dashboard/signup.html

**API Integration Pattern:**
```python
# Create-then-poll workflow
1. POST /api/generate/{type}
   - Returns: task_id, status
2. GET /api/status/{task_id}
   - Poll until completion
3. Result: media_url
```

**Error Handling:**

Free Mode:
- `429`: Daily limit exceeded (upgrade suggested)
- `503`: Service temporarily unavailable

Full Mode:
- `401`: Invalid API key
- `402`: Insufficient balance

**Pricing:**
- **Free Tier**: 3 image generations/day
- **Paid Tier**: Usage-based, transparent pricing
- **Models**: Flux (free tier), Veo 3.1 (paid), Suno V5 (paid)

**Best Practices:**
- Enhance prompts with: style, lighting, composition, mood
- Examples: "oil painting," "golden hour," "aerial view," "serene"

**Use Case for Instagram-for-Agents:**
- **Pros**: Free tier for testing, multi-modal (image/video/music), transparent pricing
- **Cons**: Free tier limited to 3/day, requires upgrade for video
- **Best For**: Prototyping with option to scale, multi-media social posts

---

### 3. pollinations

**Author:** isaacgounton
**Repository:** `openclaw/skills/tree/main/skills/isaacgounton/pollinations/SKILL.md`
**Description:** Pollinations.ai: text, images, videos, audio with 25+ models

#### Technical Details

**Supported Models (25+):**

**Text/Chat:**
- OpenAI, Claude, Gemini, Mistral, DeepSeek, Grok
- Qwen Coder, Perplexity, O1, O3, R1

**Images:**
- Flux (default), Turbo, GPTImage, Kontext
- Seedream, NanoBanana, NanoBanana-Pro

**Video:**
- Veo (4-8 seconds)
- Seedance (2-10 seconds)

**Audio (TTS):**
- OpenAI-Audio with 13 voices
- Voices: alloy, echo, fable, onyx, nova, shimmer, coral, verse, ballad, ash, sage, amuch, dan

**API Endpoints:**
```bash
# Text Generation
https://gen.pollinations.ai/v1/chat/completions (OpenAI-compatible)
https://gen.pollinations.ai/text/{prompt}

# Image Generation
https://gen.pollinations.ai/image/{prompt}?{params}

# Video Generation
https://gen.pollinations.ai/image/{prompt}?model=veo&duration=4

# TTS
https://gen.pollinations.ai/audio/{text}?voice=alloy
```

**Image Parameters:**
- `width/height`: 16-2048px
- `negative`: Negative prompts
- `seed`: Reproducibility
- `quality`: Quality tiers
- `nsfw`: NSFW filtering
- `enhance`: AI prompt enhancement (true/false)

**Video Features:**
- 4-10 second outputs
- Frame interpolation: `image[0]=first&image[1]=last`
- Audio support on Veo model

**Pricing & Limits:**

**Free Tier:**
- Anonymous access (no signup needed)
- Subject to rate limits
- **Flux images: Completely free and unlimited, always**

**Pollen Credits System:**
- $1 ≈ 1 Pollen
- Daily Pollen grants based on tier:
  - **Seed tier**: $3/day worth of credits (auto-upgrade based on activity)
  - **Flower tier**: Higher daily credits
  - **Nectar tier**: Highest daily credits
- Grants expire daily, spent before purchased Pollen

**Paid-Only Models (as of Jan 30, 2026):**
- claude-large, gemini-large, veo, seedream-pro, nanobanana-pro

**API Keys:**
- Get keys at: https://enter.pollinations.ai
- `sk_` (Secret Keys): Server-side, no rate limits
- Registered users without keys: same limits as anonymous

**Usage Scripts:**
```bash
scripts/chat.sh      # Interactive chat with model selection
scripts/image.sh     # Text-to-image generation
scripts/tts.sh       # Text-to-speech conversion
```

**Integration Tips:**
1. Free tier works without API key (rate-limited)
2. Use `seed` for reproducible outputs
3. Enable `enhance=true` for prompt optimization
4. Video interpolation: pass dual image inputs
5. TTS requires "Say:" prefix with proper system prompt

**Documentation:** https://enter.pollinations.ai/api/docs

**Use Case for Instagram-for-Agents:**
- **Pros**: Unlimited free Flux images, 25+ models, OpenAI-compatible API, no signup required
- **Cons**: Rate limits on free tier, premium models require payment
- **Best For**: High-volume image generation, testing without commitment, multi-modal experimentation

---

### 4. reve-ai

**Author:** dpaluy
**Repository:** `openclaw/skills/tree/main/skills/dpaluy/reve-ai/SKILL.md`
**Description:** Reve AI image generation, editing, and remixing

#### Technical Details

**Core Capabilities:**

1. **Create**: Generate images from text
2. **Edit**: Modify existing images with instructions
3. **Remix**: Combine text + reference images

**Prerequisites:**
- Bun runtime environment
- API key: `REVE_API_KEY` or `REVE_AI_API_KEY`

**Commands:**

**Create (Text-to-Image):**
```bash
reve create "prompt text" --aspect-ratio 16:9
```
- Aspect ratios: 16:9, 9:16, 3:2, 2:3, 4:3, 3:4, 1:1
- Default: 3:2
- Model version option available

**Edit (Image-to-Image):**
```bash
reve edit input.png "modification instructions"
```
- Requires input image file
- Model versions: `reve-edit@20250915`, fast variants

**Remix (Multi-Image + Text):**
```bash
reve remix "prompt with <img>0</img> and <img>1</img>" ref1.png ref2.png
```
- Up to 6 reference images
- 0-based indexing: `<img>N</img>` syntax

**Technical Constraints:**
- Max prompt length: 2,560 characters
- Output format: PNG
- Reference image limit: 6

**Response Format:**
```json
{
  "output_path": "/path/to/generated.png",
  "model_version": "reve-v1@20250915",
  "credits_used": 1.5,
  "remaining_credits": 98.5
}
```

**Error Codes:**
- `401`: Invalid credentials
- `402`: Insufficient credits
- `422`: Invalid parameters (oversized prompts, incorrect aspect ratios)
- `429`: Rate limiting (includes retry timing)

**Pricing:**
- Credit-based system
- Credits deducted per operation
- No free tier mentioned

**Use Case for Instagram-for-Agents:**
- **Pros**: Image editing/remixing capabilities, multi-image compositing, precise aspect ratio control
- **Cons**: Requires credits, no free tier, Bun runtime dependency
- **Best For**: Image editing workflows, style remixing, brand consistency via reference images

---

### 5. meshy-ai

**Author:** sabatesduran
**Repository:** `openclaw/skills/tree/main/skills/sabatesduran/clawdbot-meshyai-skill/SKILL.md`
**Description:** Generate 2D and 3D assets via Meshy.ai REST API

#### Technical Details

**Core Features:**

**Text-to-Image (Text → 2D):**
```bash
python scripts/text_to_image.py "prompt"
```
- Multi-view image generation
- Output: `./meshy-out/text-to-image_<taskId>_<slug>/`

**Image-to-3D Conversion:**
```bash
python scripts/image_to_3d_obj.py input.png
# or
python scripts/image_to_3d_obj.py https://example.com/image.png
```
- Local files or public URLs
- Downloads: `model.obj` (+ `model.mtl` if provided)
- Organized output directories

**Setup Requirements:**
```bash
export MESHY_API_KEY=msy-...
export MESHY_BASE_URL=https://api.meshy.ai  # Optional
```

**API Pattern:**
```
Async task handling:
1. Create task
2. Poll status until SUCCEEDED
3. Download URLs returned
```

**Output Structure:**
```
meshy-out/
├── text-to-image_<taskId>_<slug>/
│   ├── view1.png
│   ├── view2.png
│   └── metadata.json
└── image-to-3d_<taskId>_<slug>/
    ├── model.obj
    ├── model.mtl
    └── textures/
```

**Documentation:**
- API notes: `references/api-notes.md` (in skill directory)

**Pricing:**
- Not specified in documentation
- Likely credit/usage-based system

**Use Case for Instagram-for-Agents:**
- **Pros**: 3D asset generation, multi-view images, supports public URLs
- **Cons**: Limited documentation on pricing, 3D may not be directly useful for Instagram
- **Best For**: Advanced visual content, product visualization, multi-angle product shots

---

### 6. veo

**Author:** buddyh
**Repository:** `openclaw/skills/tree/main/skills/buddyh/veo/SKILL.md`
**Description:** Generate video using Google Veo (Veo 3.1 / Veo 3.0)

#### Technical Details

**Supported Models:**
- `veo-2.0-generate-001`
- `veo-3.0-generate-001`
- `veo-3.0-fast-generate-001` (speed over quality)
- `veo-3.1-generate-preview` (recommended, highest quality)

**Usage:**
```bash
uv run scripts/generate_video.py \
  --prompt "video description" \
  --filename "output.mp4" \
  --duration 8 \
  --aspect-ratio 16:9 \
  --model veo-3.1-generate-preview
```

**Parameters:**

- `--prompt` / `-p`: Video description (required)
- `--filename` / `-f`: Output filename (default: output.mp4)
- `--duration` / `-d`: Seconds (default: 8, max varies by model)
- `--aspect-ratio` / `-a`: 16:9, 9:16, 1:1
- `--model` / `-m`: Veo model version
- `--api-key`: Override GEMINI_API_KEY env var

**Configuration:**

Method 1 (preferred):
```bash
export GEMINI_API_KEY=your-key
```

Method 2:
```json
// ~/.clawdbot/clawdbot.json
{
  "skills": {
    "veo": {
      "env": {
        "GEMINI_API_KEY": "your-key"
      }
    }
  }
}
```

**Output Format:**
- MP4 video files
- `MEDIA:` line output for Clawdbot chat attachment

**Model Capabilities:**
- **Veo 3.1**: Higher quality, longer durations (up to 1 minute with scene extension)
- **Veo 3.1 Features**:
  - Native vertical format (portrait mode)
  - 1080p and 4K upscaling
  - Rich native audio (conversations, sound effects)
  - Improved cinematic styles
  - Character consistency across scenes
  - Up to 3 reference images (Ingredients to Video)
  - Scene-to-scene transitions
  - Image interpolation (start + end image)

**Availability:**
- Gemini API
- Vertex AI
- Google Vids
- Flow (Google's video generation interface)

**Pricing:**
- Based on Gemini API pricing
- Per-second video generation billing
- No free tier mentioned (Google Cloud billing)

**Use Case for Instagram-for-Agents:**
- **Pros**: State-of-the-art video quality, vertical format support, character consistency, audio generation
- **Cons**: Requires Google Cloud/Gemini API billing, no free tier
- **Best For**: High-quality video content, Instagram Reels, Stories with audio

---

### 7. gamma

**Author:** stopmoclay
**Repository:** `openclaw/skills/tree/main/skills/stopmoclay/gamma/SKILL.md`
**Description:** Generate AI-powered presentations, documents, and social posts using Gamma.app API

#### Technical Details

**Supported Formats:**
- **Presentations**: Pitch decks, slide shows
- **Documents**: Reports, formal write-ups
- **Social**: Instagram/LinkedIn carousels

**API Endpoint:**
```
POST https://public-api.gamma.app/v1.0/generations
```

**Setup:**
```bash
export GAMMA_API_KEY=your-api-key
```

**Core Parameters:**

```json
{
  "input_text": "Content (up to 750,000 characters)",
  "format": "presentation|document|social",
  "card_count": 10,
  "tone": "professional",
  "audience": "target audience",
  "image_source": "ai-generated|web-sourced|none",
  "style_options": {}
}
```

**Social Post Parameters:**
- **Dimensions**:
  - 1x1 (square)
  - 4x5 (default, Instagram posts, LinkedIn carousels)
  - 9x16 (Instagram/TikTok Stories)

**Processing:**
- Generation time: 1-3 minutes
- Returns: generation_id
- Poll for status
- Final result: Gamma.app URL

**Pricing:**
- Credit-based system
- Pro account required for API access (Nov 5, 2025+)
- Generous usage limits
- Credits deducted per generation

**API Version:**
- v1.0 Generally Available (GA) as of Nov 5, 2025

**Integration:**
- Compatible with Make, Zapier, Workato
- Workflow automation platforms

**Use Case for Instagram-for-Agents:**
- **Pros**: Purpose-built for social carousels, 4x5 Instagram format, AI-generated images included
- **Cons**: Requires Pro subscription, credit-based billing, 1-3min generation time
- **Best For**: Instagram carousel posts, LinkedIn content, presentation-style social media

---

### 8. venice-ai

**Author:** nhannah
**Repository:** `openclaw/skills/tree/main/skills/nhannah/venice-ai-media/SKILL.md`
**Description:** Venice AI: image/video generation, upscaling, AI editing

#### Technical Details

**Core Capabilities:**

1. **Image Generation**: Text-to-image using Flux-2-Max
2. **Image Upscaling**: 1-4x with AI enhancement
3. **Image Editing**: Natural language instructions (Qwen-Image, has content restrictions)
4. **Video Generation**: Image-to-video or video-to-video

**Image Generation:**
```bash
python scripts/generate.py \
  --prompt "description" \
  --width 1024 \
  --height 1024 \
  --aspect-ratio 16:9 \
  --style preset \
  --negative "unwanted elements"
```

**Models:**
- Flux-2-Max (default)
- Style presets available
- Custom dimensions
- Negative prompts

**Image Upscaling:**
```bash
python scripts/upscale.py input.png \
  --scale 2 \
  --enhance \
  --creativity 0.5
```
- Scale: 1-4x
- AI enhancement toggle
- Creativity control (detail preservation)

**Video Generation:**
```bash
python scripts/video.py \
  --input image.png \
  --model wan|sora|runway-gen4 \
  --duration 5 \
  --resolution 720p
```

**Video Models:**
- WAN
- Sora
- Runway Gen4

**Setup Requirements:**
- Python 3.10+
- Venice API key: https://venice.ai/settings/api
- Config: env var or `~/.clawdbot/clawdbot.json`

**Pricing Structure:**

| Operation | Cost (USD) |
|-----------|------------|
| Image generation | $0.01-0.03 |
| Upscaling | $0.02-0.04 |
| Video (WAN) | $0.10-0.50 |
| Video (Sora) | $0.50-2.00 |

**Quote Feature:**
```bash
python scripts/video.py --quote  # Check price before generation
```

**Key Features:**
- Uncensored generation (safety mode disabled by default)
- Privacy-focused (local browser processing for upscaling)
- `MEDIA:` output for Clawdbot attachment
- Forced PNG format (removes JPEG compression)

**Use Case for Instagram-for-Agents:**
- **Pros**: Full pipeline (generate→upscale→edit→video), transparent pricing, quote-before-generate
- **Cons**: Video models expensive, editing has content restrictions
- **Best For**: Complete creative workflow, high-quality upscaling, privacy-conscious users

---

### 9. comfy-cli

**Author:** johntheyoung
**Repository:** `openclaw/skills/tree/main/skills/johntheyoung/comfy-cli/SKILL.md`
**Description:** Install, manage, and run ComfyUI instances

#### Technical Details

**Core Functionality:**
- ComfyUI instance management
- Custom node installation
- Model downloads
- Workflow execution

**Installation:**
```bash
comfy install --cuda-version 12.1
# or
comfy install --restore  # Restore dependencies
comfy install --pr 1234  # Test specific PR
```

**GPU Support:**
- NVIDIA (CUDA 11.8–12.9)
- AMD (Linux ROCm)
- Intel Arc
- Apple Silicon
- CPU-only

**Launching:**
```bash
comfy launch                    # Foreground
comfy launch --background       # Background
comfy launch -- --extra-args    # Pass args to ComfyUI
```

**Workspace Management:**
```bash
comfy --workspace=/path/to/comfyui install
comfy --recent install          # Recently used
comfy --here install            # Current directory
```

**Custom Nodes:**
```bash
comfy node install <node-name>
comfy node update <node-name>
comfy node disable <node-name>
comfy node fix-deps             # Fix dependencies
comfy node bisect               # Binary search for broken node
```

**Model Downloads:**
```bash
# From CivitAI
comfy model download civitai:<model-id>

# From Hugging Face
comfy model download hf:<repo>/<model>

# From URL
comfy model download https://example.com/model.safetensors
```

**Workflow Execution:**
```bash
comfy run workflow.json --wait --verbose
```

**Configuration:**
- Linux: `~/.config/comfy-cli/config.ini`
- Persistent defaults for workspace, API tokens

**Instance Management:**
- `comfy env`: View all instances
- Background instance management
- Multiple installations supported

**Use Case for Instagram-for-Agents:**
- **Pros**: Full control over ComfyUI workflows, custom nodes, local processing, advanced workflows
- **Cons**: Complex setup, requires ComfyUI knowledge, local compute resources
- **Best For**: Advanced users, custom workflows, offline generation, batch processing

---

## Best Practices & Integration Patterns

### Skill Development Best Practices

#### 1. SKILL.md Structure

**Minimal Example:**
```yaml
---
name: my-image-skill
description: Generate images using XYZ API
---

# My Image Skill

This skill generates images from text prompts using the XYZ API.

## Usage

Ask me to "generate an image of [description]" and I'll use this skill.

## Requirements

- XYZ_API_KEY environment variable must be set
```

**Advanced Example with Metadata:**
```yaml
---
name: advanced-image-skill
description: Multi-model image generation with retry logic
metadata:
  openclaw:
    requires:
      bins: ["python3", "uv"]
      env: ["IMAGE_API_KEY"]
      config: ["image.retry_count", "image.timeout"]
    primaryEnv: "IMAGE_API_KEY"
---

# Advanced Image Skill

Multi-model image generation with automatic retries and fallback models.

## Configuration

Set these in ~/.clawdbot/clawdbot.json:
```json
{
  "skills": {
    "advanced-image-skill": {
      "env": {
        "IMAGE_API_KEY": "your-key"
      },
      "config": {
        "retry_count": 3,
        "timeout": 60
      }
    }
  }
}
```

## Usage Examples

1. Basic: "generate an image of a sunset"
2. Advanced: "generate 16:9 image of mountain landscape, retry 3 times"
```

#### 2. Environment Variables & API Keys

**Security Best Practices:**

```bash
# DON'T: Hardcode keys in SKILL.md
API_KEY = "sk-1234567890"

# DO: Reference environment variables
if not os.getenv("IMAGE_API_KEY"):
    raise ValueError("IMAGE_API_KEY not set")
```

**Configuration Methods:**

Method 1 - Environment Variable:
```bash
export IMAGE_API_KEY=your-key
```

Method 2 - ClawdBot Config:
```json
{
  "skills": {
    "image-skill": {
      "env": {
        "IMAGE_API_KEY": "your-key"
      }
    }
  }
}
```

Method 3 - Skill Metadata (declares requirement):
```yaml
metadata:
  openclaw:
    primaryEnv: "IMAGE_API_KEY"
```

**Environment Variable Scoping:**
- Injected only if not already set in process
- Scoped to agent run (not global shell)
- Restored after run ends
- NOT sandboxed (runs in host process)

**Security Warning:**
> Keep secrets out of prompts and logs. Skills run in the host process for that agent turn, not in a sandbox.

#### 3. Rate Limiting Patterns

**Pattern 1: Exponential Backoff**
```python
import time
from requests.exceptions import HTTPError

def generate_with_retry(prompt, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = api.generate(prompt)
            return response
        except HTTPError as e:
            if e.response.status_code == 429:  # Rate limit
                wait_time = 2 ** attempt  # 1s, 2s, 4s
                time.sleep(wait_time)
            else:
                raise
    raise Exception("Max retries exceeded")
```

**Pattern 2: Respect Retry-After Header**
```python
import time
from requests.exceptions import HTTPError

def handle_rate_limit(error):
    if error.response.status_code == 429:
        retry_after = error.response.headers.get('Retry-After')
        if retry_after:
            time.sleep(int(retry_after))
            return True
    return False
```

**Pattern 3: Fallback Model**
```python
MODELS = ["premium-model", "standard-model", "free-model"]

def generate_with_fallback(prompt):
    for model in MODELS:
        try:
            return api.generate(prompt, model=model)
        except RateLimitError:
            continue
    raise Exception("All models rate-limited")
```

**ClawdBot-Specific:**
```json
{
  "models": {
    "fallback": "claude-3-sonnet-20240229"
  }
}
```

#### 4. Storage & File Handling

**Memory Architecture:**

```
~/.openclaw/
├── memory/
│   ├── <agentId>.sqlite      # Vector index
│   ├── MEMORY.md              # Long-term facts
│   └── YYYY-MM-DD.md          # Daily logs
├── workspace/
│   └── <project>/
│       ├── skills/            # Project-specific skills
│       └── generated/         # Output files
└── skills/                    # Global skills
```

**Best Practices:**

1. **Use Relative Paths from Workspace:**
```python
import os
workspace = os.getenv("CLAWDBOT_WORKSPACE", os.getcwd())
output_dir = os.path.join(workspace, "generated", "images")
os.makedirs(output_dir, exist_ok=True)
```

2. **Organize by Timestamp:**
```python
from datetime import datetime

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"image_{timestamp}.png"
filepath = os.path.join(output_dir, filename)
```

3. **Output MEDIA: Line for Chat Attachment:**
```python
print(f"MEDIA: {filepath}")
# ClawdBot will auto-attach to chat
```

4. **Memory File Updates:**
```python
# DON'T: Overwrite memory files
# DO: Append to daily logs
from datetime import date
log_file = os.path.join(memory_dir, f"{date.today()}.md")
with open(log_file, "a") as f:
    f.write(f"\n## Image Generated\n- Prompt: {prompt}\n- File: {filepath}\n")
```

**Memory Types:**

- **Daily Logs** (`memory/YYYY-MM-DD.md`): Append-only, agent reads today's + yesterday's
- **Long-term** (`MEMORY.md`): Curated facts, preferences, decisions
- **Vector Index** (`<agentId>.sqlite`): BM25 + embeddings, auto-rebuilt on file changes

**File Cleanup:**
```python
# Clean old files (e.g., >7 days)
import os
from datetime import datetime, timedelta

def cleanup_old_images(directory, days=7):
    cutoff = datetime.now() - timedelta(days=days)
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.getmtime(filepath) < cutoff.timestamp():
            os.remove(filepath)
```

#### 5. Error Handling Conventions

**Standard Error Codes:**

| Code | Meaning | Action |
|------|---------|--------|
| 401 | Invalid API key | Check credentials |
| 402 | Insufficient credits | Upgrade plan or add credits |
| 422 | Invalid parameters | Validate input |
| 429 | Rate limited | Retry with backoff |
| 503 | Service unavailable | Retry later |

**Error Handling Template:**
```python
def generate_image(prompt, **kwargs):
    try:
        response = api.generate(prompt, **kwargs)
        return response.image_url
    except HTTPError as e:
        if e.response.status_code == 401:
            return "ERROR: Invalid API key. Please configure IMAGE_API_KEY."
        elif e.response.status_code == 402:
            return "ERROR: Insufficient credits. Please add credits at provider.com/billing"
        elif e.response.status_code == 422:
            return f"ERROR: Invalid parameters: {e.response.json()}"
        elif e.response.status_code == 429:
            retry_after = e.response.headers.get('Retry-After', 60)
            return f"ERROR: Rate limited. Retry after {retry_after} seconds."
        elif e.response.status_code == 503:
            return "ERROR: Service temporarily unavailable. Try again later."
        else:
            return f"ERROR: Unexpected error: {e}"
    except Exception as e:
        return f"ERROR: {type(e).__name__}: {e}"
```

**User-Friendly Messages:**
```python
# DON'T: Expose raw errors
raise Exception("API returned 401")

# DO: Provide actionable guidance
raise Exception(
    "Invalid API key. Please set IMAGE_API_KEY environment variable.\n"
    "Get your key at: https://provider.com/api-keys"
)
```

#### 6. Asynchronous Task Patterns

**Common Pattern: POST → Poll → Download**

```python
import time
import requests

def async_generate(prompt):
    # Step 1: Create task
    response = requests.post(
        "https://api.provider.com/generate",
        json={"prompt": prompt},
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    task_id = response.json()["task_id"]

    # Step 2: Poll for completion
    max_attempts = 60  # 5 minutes with 5s intervals
    for attempt in range(max_attempts):
        status_response = requests.get(
            f"https://api.provider.com/status/{task_id}",
            headers={"Authorization": f"Bearer {API_KEY}"}
        )
        status_data = status_response.json()

        if status_data["status"] == "SUCCEEDED":
            # Step 3: Download result
            image_url = status_data["result_url"]
            image_data = requests.get(image_url).content
            return image_data
        elif status_data["status"] == "FAILED":
            raise Exception(f"Generation failed: {status_data['error']}")

        time.sleep(5)

    raise Exception("Generation timed out")
```

**With Progress Reporting:**
```python
def async_generate_with_progress(prompt):
    task_id = create_task(prompt)

    while True:
        status = get_status(task_id)

        if status["status"] == "SUCCEEDED":
            return download_result(status["result_url"])
        elif status["status"] == "FAILED":
            raise Exception(status["error"])

        # Report progress
        progress = status.get("progress", 0)
        print(f"Progress: {progress}%")

        time.sleep(5)
```

**Webhook Alternative:**
```python
def async_generate_with_webhook(prompt, webhook_url):
    response = requests.post(
        "https://api.provider.com/generate",
        json={
            "prompt": prompt,
            "webhook_url": webhook_url
        },
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    task_id = response.json()["task_id"]

    # Webhook will be called on completion
    # Agent can continue with other tasks
    return f"Task {task_id} started. Will notify when complete."
```

#### 7. Skill Versioning & Updates

**Skill Versioning:**
```yaml
---
name: image-skill
version: 1.2.0
description: Image generation with Flux models
changelog:
  - v1.2.0: Added Flux 1.1 Pro support
  - v1.1.0: Added aspect ratio control
  - v1.0.0: Initial release
---
```

**ClawHub Versioning:**
- Tagged releases
- `latest` tag points to newest stable
- Version pinning: `clawdbot install image-skill@1.1.0`

**Hot Reload:**
- Skill changes take effect on next session by default
- Some skills support mid-session refresh
- Restart agent for guaranteed reload

#### 8. Testing Skills

**Manual Testing:**
```bash
# Test in isolated workspace
mkdir -p /tmp/skill-test/skills
cp -r my-skill /tmp/skill-test/skills/
export CLAWDBOT_WORKSPACE=/tmp/skill-test
clawdbot chat
```

**Automated Testing (if skill includes tests):**
```bash
cd my-skill
python -m pytest tests/
```

**Test API Connectivity:**
```python
# test_api.py
import os
import requests

def test_api_key():
    assert os.getenv("IMAGE_API_KEY"), "API key not set"

def test_api_connectivity():
    response = requests.get(
        "https://api.provider.com/health",
        headers={"Authorization": f"Bearer {os.getenv('IMAGE_API_KEY')}"}
    )
    assert response.status_code == 200, "API not reachable"
```

---

## Recommendations for Instagram-for-Agents Project

### Skill Comparison Matrix

| Skill | Free Tier | Paid Pricing | Models | Best Use Case | Instagram Fit |
|-------|-----------|--------------|--------|---------------|---------------|
| **pollinations** | Unlimited Flux images | $1/Pollen, $3/day Seed tier | 25+ (Flux, Veo, Seedance, TTS) | High-volume testing | ⭐⭐⭐⭐⭐ Excellent |
| **vap-media** | 3 images/day | Usage-based, transparent | Flux, Veo 3.1, Suno V5 | Multi-modal prototyping | ⭐⭐⭐⭐ Very Good |
| **venice-ai** | None | $0.01-0.03/image, $0.10-2.00/video | Flux-2-Max, WAN, Sora, Runway | Full pipeline (gen→upscale→edit) | ⭐⭐⭐⭐ Very Good |
| **gamma** | None | Pro subscription + credits | Gamma proprietary | Instagram carousels | ⭐⭐⭐⭐ Very Good (carousels) |
| **krea-api** | None | $8-48/month compute units | Flux, Imagen, Ideogram, Seedream | Production quality | ⭐⭐⭐ Good |
| **veo** | None | Gemini API billing | Veo 3.1, 3.0 | High-quality video, Reels | ⭐⭐⭐⭐ Very Good (video) |
| **reve-ai** | None | Credit-based | Reve v1 | Image editing/remixing | ⭐⭐⭐ Good (editing) |
| **meshy-ai** | None | Unknown | Meshy 2D/3D | 3D assets, multi-view | ⭐⭐ Fair |
| **comfy-cli** | Free (local) | Free (compute cost) | Any ComfyUI model | Advanced workflows, offline | ⭐⭐⭐⭐ Very Good (advanced) |

### Recommended Architecture for Instagram-for-Agents

```
┌─────────────────────────────────────────────────────────┐
│                   Instagram-for-Agents                   │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐   ┌──────▼──────┐
   │ Content │      │   Media     │   │  Storage    │
   │ Agent   │      │ Generation  │   │  Manager    │
   └────┬────┘      └──────┬──────┘   └──────┬──────┘
        │                  │                  │
        │           ┌──────▼──────┐           │
        │           │  OpenClaw   │           │
        │           │   Skills    │           │
        │           └──────┬──────┘           │
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
   ┌────▼────────┐                    ┌──────▼──────┐
   │ pollinations│                    │  vap-media  │
   │ (Primary)   │                    │ (Backup)    │
   │             │                    │             │
   │ - Unlimited │                    │ - 3/day     │
   │   Flux      │                    │ - Video     │
   │ - 25+ models│                    │ - Music     │
   └─────────────┘                    └─────────────┘
```

### Recommended Skill Stack

#### **Phase 1: MVP (Free Tier)**

**Primary: pollinations**
- Unlimited Flux images
- No API key required (rate-limited)
- 25+ models for experimentation
- OpenAI-compatible API

**Backup: vap-media**
- 3 free images/day
- Test video generation
- Transparent pricing for scaling

**Storage: Local Workspace**
```
~/.openclaw/workspace/insta-for-agents/
├── generated/
│   ├── images/
│   │   ├── 20260131_120000_flux.png
│   │   └── 20260131_123000_veo.mp4
│   ├── metadata/
│   │   └── 20260131_120000.json
│   └── archive/
│       └── 2026-01/
└── skills/
    ├── pollinations/
    └── vap-media/
```

#### **Phase 2: Scale (Paid Tier)**

**Add: krea-api**
- Production-quality images
- Multiple premium models
- $28/month Pro plan

**Add: veo**
- High-quality video (Reels, Stories)
- Veo 3.1 with audio
- Character consistency

**Add: venice-ai**
- Upscaling pipeline
- Image editing
- Video generation

**Storage: S3/R2**
```python
# Upload to Cloudflare R2 after generation
import boto3

s3 = boto3.client('s3',
    endpoint_url='https://accountid.r2.cloudflarestorage.com',
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY
)

s3.upload_file(
    'generated/images/image.png',
    'insta-for-agents',
    f'images/{timestamp}.png'
)
```

#### **Phase 3: Advanced (Custom Workflows)**

**Add: comfy-cli**
- Custom ComfyUI workflows
- Batch processing
- Offline generation

**Add: gamma**
- Instagram carousel posts
- Presentation-style content

### Implementation Example: Content Generation Workflow

```python
# content_generator.py
import os
import json
from datetime import datetime
from pollinations import generate_image
from vap_media import generate_video

class ContentGenerator:
    def __init__(self, workspace):
        self.workspace = workspace
        self.output_dir = os.path.join(workspace, "generated")
        os.makedirs(os.path.join(self.output_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, "videos"), exist_ok=True)
        os.makedirs(os.path.join(self.output_dir, "metadata"), exist_ok=True)

    def generate_post(self, prompt, format="image", aspect_ratio="1:1"):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        if format == "image":
            # Primary: Pollinations (unlimited free)
            try:
                image_url = generate_image(
                    prompt,
                    model="flux",
                    enhance=True,
                    aspect_ratio=aspect_ratio
                )
                filename = f"{timestamp}_flux.png"
                filepath = os.path.join(self.output_dir, "images", filename)

                # Download and save
                import requests
                with open(filepath, "wb") as f:
                    f.write(requests.get(image_url).content)

                # Save metadata
                metadata = {
                    "timestamp": timestamp,
                    "prompt": prompt,
                    "model": "flux",
                    "provider": "pollinations",
                    "aspect_ratio": aspect_ratio,
                    "filepath": filepath
                }
                metadata_file = os.path.join(
                    self.output_dir, "metadata", f"{timestamp}.json"
                )
                with open(metadata_file, "w") as f:
                    json.dump(metadata, f, indent=2)

                print(f"MEDIA: {filepath}")
                return filepath

            except Exception as e:
                print(f"Pollinations failed: {e}")
                # Fallback: VAP Media (3/day free)
                return self._generate_with_vap(prompt, aspect_ratio, timestamp)

        elif format == "video":
            return self._generate_video(prompt, timestamp)

    def _generate_with_vap(self, prompt, aspect_ratio, timestamp):
        # Fallback to VAP Media
        from vap_media import generate_image_free

        task_id = generate_image_free(prompt, aspect_ratio)
        # Poll for result...
        # (Implementation details omitted for brevity)

    def _generate_video(self, prompt, timestamp):
        # Use VAP Media or Veo
        # (Implementation details omitted for brevity)
        pass

# Usage in OpenClaw skill
if __name__ == "__main__":
    workspace = os.getenv("CLAWDBOT_WORKSPACE", os.getcwd())
    generator = ContentGenerator(workspace)

    # Generate Instagram post
    generator.generate_post(
        "Modern minimalist living room with natural light",
        format="image",
        aspect_ratio="1:1"
    )

    # Generate Instagram Story
    generator.generate_post(
        "Time-lapse of sunset over city skyline",
        format="video",
        aspect_ratio="9:16"
    )
```

### Skill Integration Code

**SKILL.md for Instagram-for-Agents:**

```yaml
---
name: insta-content-generator
description: Generate Instagram posts, stories, and reels with AI
version: 1.0.0
metadata:
  openclaw:
    requires:
      bins: ["python3", "uv"]
      env: []  # No API keys required for free tier
      config: ["generator.primary_model", "generator.fallback_enabled"]
---

# Instagram Content Generator

Generate AI-powered content for Instagram using multiple image/video generation providers.

## Features

- **Images**: 1:1 (posts), 4:5 (carousels), 9:16 (stories)
- **Videos**: Reels (9:16), Stories (9:16), Posts (1:1, 4:5)
- **Automatic Fallback**: Pollinations → VAP Media
- **Metadata Tracking**: Prompts, models, timestamps
- **Storage Management**: Organized by date, auto-cleanup

## Usage

### Generate Instagram Post (1:1)
"Generate a 1:1 Instagram post showing a cozy coffee shop interior"

### Generate Story (9:16)
"Create a 9:16 story video of morning routine, 8 seconds"

### Generate Carousel (4:5)
"Make a 4:5 carousel image about productivity tips"

## Configuration

Optional config in ~/.clawdbot/clawdbot.json:

```json
{
  "skills": {
    "insta-content-generator": {
      "config": {
        "primary_model": "pollinations",
        "fallback_enabled": true,
        "auto_cleanup_days": 7,
        "default_aspect_ratio": "1:1"
      }
    }
  }
}
```

## Storage

Generated content saved to:
- Images: `~/.openclaw/workspace/insta-for-agents/generated/images/`
- Videos: `~/.openclaw/workspace/insta-for-agents/generated/videos/`
- Metadata: `~/.openclaw/workspace/insta-for-agents/generated/metadata/`

## Models Used

1. **Pollinations** (primary, unlimited free)
   - Flux, Turbo, GPTImage
   - 25+ models

2. **VAP Media** (fallback, 3/day free)
   - Flux, Veo 3.1, Suno V5

3. **Future**: Krea, Venice, Veo (paid tiers)

## Workflow

1. Agent receives content request
2. Determines format (image/video) and aspect ratio
3. Calls primary provider (Pollinations)
4. On failure, falls back to VAP Media
5. Saves file + metadata
6. Returns MEDIA: path for attachment
```

### Rate Limiting Strategy

```python
# rate_limiter.py
import time
from datetime import datetime, timedelta
from collections import defaultdict

class RateLimiter:
    def __init__(self):
        self.limits = {
            "pollinations": {"anonymous": 100, "registered": 1000},  # Per hour
            "vap-media": {"free": 3, "paid": float('inf')},  # Per day
        }
        self.usage = defaultdict(lambda: {"count": 0, "reset_at": None})

    def can_use(self, provider, tier="free"):
        now = datetime.now()
        key = f"{provider}_{tier}"

        # Reset counter if time window passed
        if self.usage[key]["reset_at"] and now > self.usage[key]["reset_at"]:
            self.usage[key]["count"] = 0

        # Check limit
        limit = self.limits[provider][tier]
        return self.usage[key]["count"] < limit

    def record_usage(self, provider, tier="free", window_hours=24):
        now = datetime.now()
        key = f"{provider}_{tier}"

        if not self.usage[key]["reset_at"]:
            self.usage[key]["reset_at"] = now + timedelta(hours=window_hours)

        self.usage[key]["count"] += 1

    def get_next_available(self, provider, tier="free"):
        key = f"{provider}_{tier}"
        if self.usage[key]["reset_at"]:
            return self.usage[key]["reset_at"]
        return datetime.now()

# Usage
limiter = RateLimiter()

if limiter.can_use("pollinations", "anonymous"):
    generate_with_pollinations()
    limiter.record_usage("pollinations", "anonymous", window_hours=1)
else:
    next_time = limiter.get_next_available("pollinations", "anonymous")
    print(f"Rate limited. Try again at {next_time}")
```

### Multi-Provider Orchestration

```python
# provider_orchestrator.py
from typing import List, Dict, Any

class ProviderOrchestrator:
    def __init__(self, providers: List[str]):
        self.providers = providers
        self.rate_limiter = RateLimiter()

    def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        Try providers in order until one succeeds
        """
        errors = []

        for provider in self.providers:
            try:
                # Check rate limit
                if not self.rate_limiter.can_use(provider):
                    errors.append(f"{provider}: Rate limited")
                    continue

                # Attempt generation
                if provider == "pollinations":
                    result = self._generate_pollinations(prompt, **kwargs)
                elif provider == "vap-media":
                    result = self._generate_vap(prompt, **kwargs)
                elif provider == "krea-api":
                    result = self._generate_krea(prompt, **kwargs)
                else:
                    continue

                # Record success
                self.rate_limiter.record_usage(provider)
                return {
                    "success": True,
                    "provider": provider,
                    "result": result
                }

            except Exception as e:
                errors.append(f"{provider}: {str(e)}")
                continue

        # All providers failed
        return {
            "success": False,
            "errors": errors
        }

    def _generate_pollinations(self, prompt, **kwargs):
        # Implementation
        pass

    def _generate_vap(self, prompt, **kwargs):
        # Implementation
        pass

    def _generate_krea(self, prompt, **kwargs):
        # Implementation
        pass

# Usage
orchestrator = ProviderOrchestrator([
    "pollinations",  # Try first (unlimited free)
    "vap-media",     # Fallback (3/day free)
    "krea-api"       # Last resort (paid)
])

result = orchestrator.generate(
    "Modern living room with natural light",
    aspect_ratio="1:1"
)

if result["success"]:
    print(f"Generated with {result['provider']}")
else:
    print(f"All providers failed: {result['errors']}")
```

### Cost Optimization Strategy

**Free Tier Maximization:**

1. **Pollinations** (unlimited Flux):
   - All standard image generation
   - Experimentation and testing
   - High-volume content

2. **VAP Media** (3/day):
   - Special/premium images
   - Video generation (when needed)
   - Fallback for Pollinations failures

3. **Local ComfyUI** (free compute):
   - Batch processing overnight
   - Custom workflows
   - Offline generation

**Paid Tier Strategy:**

| Monthly Budget | Recommended Stack | Expected Output |
|----------------|-------------------|-----------------|
| $0 | Pollinations + VAP (free) | Unlimited images, 3 premium/day |
| $10 | + Pollinations Seed ($3/day credits) | 90 premium generations/month |
| $30 | + Krea Pro ($28/month) | Unlimited high-quality images |
| $50 | + Krea Pro + VAP paid | Images + videos |
| $100+ | + Venice + Veo | Full pipeline (gen/edit/upscale/video) |

---

## Conclusion

### Key Takeaways

1. **Best Free Option**: **Pollinations** - unlimited Flux images, 25+ models, no API key
2. **Best for Prototyping**: **VAP Media** - 3/day free, multi-modal, transparent pricing
3. **Best for Production**: **Krea API** - multiple premium models, compute unit system
4. **Best for Video**: **Veo** - Google's state-of-the-art video generation with Veo 3.1
5. **Best All-in-One**: **Venice AI** - complete pipeline (generate→upscale→edit→video)

### OpenClaw Advantages

1. **Modular Design**: Mix and match skills based on needs
2. **Fallback System**: Automatic provider switching on failure
3. **Cost Control**: Free tiers for testing, paid for production
4. **Local Storage**: Privacy-first, Markdown-based memory
5. **Extensible**: Easy to add custom skills

### Instagram-for-Agents Recommendations

**MVP Stack:**
- Primary: Pollinations (unlimited free images)
- Backup: VAP Media (3/day, video testing)
- Storage: Local workspace + metadata tracking
- Architecture: Provider orchestrator with rate limiting

**Production Stack:**
- Tier 1: Pollinations (bulk generation)
- Tier 2: Krea Pro (premium quality)
- Tier 3: Veo (high-quality video)
- Tier 4: Venice (upscaling/editing)
- Storage: Cloudflare R2 + metadata DB

**Key Implementation Patterns:**
1. Async generation with polling
2. Rate limiting with exponential backoff
3. Multi-provider orchestration
4. Metadata tracking for attribution
5. MEDIA: output for chat integration

---

## Citations

### Primary Sources

[1] VoltAgent. "awesome-openclaw-skills." GitHub, 2026. https://github.com/VoltAgent/awesome-openclaw-skills

[2] OpenClaw. "skills - All versions of all skills on clawdhub.com archived." GitHub, 2026. https://github.com/openclaw/skills

[3] OpenClaw. "Skills - OpenClaw Documentation." OpenClaw Docs, 2026. https://docs.openclaw.ai/tools/skills

[4] OpenClaw. "clawhub - Skill Directory for OpenClaw." GitHub, 2026. https://github.com/openclaw/clawhub

### Skill Repositories

[5] fossilizedcarlos. "krea-api SKILL.md." openclaw/skills, 2026. https://github.com/openclaw/skills/blob/main/skills/fossilizedcarlos/krea-api/SKILL.md

[6] elestirelbilinc-sketch. "vap-media SKILL.md." openclaw/skills, 2026. https://github.com/openclaw/skills/blob/main/skills/elestirelbilinc-sketch/vap-media/SKILL.md

[7] isaacgounton. "pollinations SKILL.md." openclaw/skills, 2026. https://github.com/openclaw/skills/blob/main/skills/isaacgounton/pollinations/SKILL.md

[8] dpaluy. "reve-ai SKILL.md." openclaw/skills, 2026. https://github.com/openclaw/skills/blob/main/skills/dpaluy/reve-ai/SKILL.md

[9] sabatesduran. "meshy-ai SKILL.md." openclaw/skills, 2026. https://github.com/openclaw/skills/blob/main/skills/sabatesduran/clawdbot-meshyai-skill/SKILL.md

[10] buddyh. "veo SKILL.md." openclaw/skills, 2026. https://github.com/openclaw/skills/blob/main/skills/buddyh/veo/SKILL.md

[11] stopmoclay. "gamma SKILL.md." openclaw/skills, 2026. https://github.com/openclaw/skills/blob/main/skills/stopmoclay/gamma/SKILL.md

[12] nhannah. "venice-ai-media SKILL.md." openclaw/skills, 2026. https://github.com/openclaw/skills/blob/main/skills/nhannah/venice-ai-media/SKILL.md

[13] johntheyoung. "comfy-cli SKILL.md." openclaw/skills, 2026. https://github.com/openclaw/skills/blob/main/skills/johntheyoung/comfy-cli/SKILL.md

### Documentation & API References

[14] Pollinations. "pollinations - Your Friendly Open-Source Gen-AI Platform." GitHub, 2026. https://github.com/pollinations/pollinations

[15] Pollinations. "API Documentation." Pollinations.ai, 2026. https://enter.pollinations.ai/api/docs

[16] Krea. "API Keys & Billing." Krea Documentation, 2026. https://docs.krea.ai/developers/api-keys-and-billing

[17] Gamma. "Introduction to Gamma's API offerings." Gamma Developers, 2026. https://developers.gamma.app/

[18] Google. "Veo 3.1 Ingredients to Video: New video generation model updates." Google Blog, 2026. https://blog.google/innovation-and-ai/technology/ai/veo-3-1-ingredients-to-video/

[19] Google. "Generate videos with Veo 3.1 in Gemini API." Google AI for Developers, 2026. https://ai.google.dev/gemini-api/docs/video

[20] Comfy-Org. "comfy-cli - Command Line Interface for Managing ComfyUI." GitHub, 2026. https://github.com/Comfy-Org/comfy-cli

### OpenClaw Ecosystem

[21] IBM. "OpenClaw: The viral 'space lobster' agent testing the limits of vertical integration." IBM Think, 2026. https://www.ibm.com/think/news/clawdbot-ai-agent-testing-limits-vertical-integration

[22] DigitalOcean. "What is OpenClaw? Your Open-Source AI Assistant for 2026." DigitalOcean Resources, 2026. https://www.digitalocean.com/resources/articles/what-is-openclaw

[23] OpenClaw. "Memory - OpenClaw Documentation." OpenClaw Docs, 2026. https://docs.openclaw.ai/concepts/memory

[24] Cloudflare. "Introducing Moltworker: a self-hosted personal AI agent." Cloudflare Blog, 2026. https://blog.cloudflare.com/moltworker-self-hosted-ai-agent/

### General References

[25] Fast Company. "Clawdbot/Moltbot/OpenClaw is cool, but it gets pricey fast." Fast Company, 2026. https://www.fastcompany.com/91484506/what-is-clawdbot-moltbot-openclaw

[26] Platformer. "Falling in and out of love with Moltbot." Platformer News, 2026. https://www.platformer.news/moltbot-clawdbot-review-ai-agent/

[27] AIM Multiple. "OpenClaw (Moltbot/Clawdbot) Use Cases and Security 2026." AIM Research, 2026. https://research.aimultiple.com/moltbot/

[28] TechCrunch. "OpenClaw's AI assistants are now building their own social network." TechCrunch, Jan 30, 2026. https://techcrunch.com/2026/01/30/openclaws-ai-assistants-are-now-building-their-own-social-network/

---

**End of Research Document**

*Last Updated: January 31, 2026*
*Total Skills Analyzed: 9 core image/video generation skills*
*Total Sources: 28 citations*
*Research Depth: Comprehensive (SKILL.md analysis, API documentation, pricing, integration patterns)*
