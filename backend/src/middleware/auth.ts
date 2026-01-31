import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../config/database.js';
import { isValidApiKeyFormat, verifyApiKey } from '../utils/apiKey.js';

// Simple in-memory cache for API key validation (5 min TTL)
const authCache = new Map<string, { agentId: string; name: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Extend FastifyRequest to include agent info
declare module 'fastify' {
  interface FastifyRequest {
    agent?: {
      id: string;
      name: string;
    };
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Missing Authorization header',
    });
  }

  // Extract Bearer token
  const [scheme, apiKey] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !apiKey) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid Authorization format. Use: Bearer <api_key>',
    });
  }

  // Validate format
  if (!isValidApiKeyFormat(apiKey)) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid API key format',
    });
  }

  // Check cache first
  const cached = authCache.get(apiKey);
  if (cached && cached.expiresAt > Date.now()) {
    request.agent = { id: cached.agentId, name: cached.name };
    return;
  }

  // Find agent with matching API key (need to check all agents since hash comparison)
  const agents = await prisma.agent.findMany({
    select: { id: true, name: true, apiKeyHash: true },
  });

  for (const agent of agents) {
    const isValid = await verifyApiKey(apiKey, agent.apiKeyHash);
    if (isValid) {
      // Cache the result
      authCache.set(apiKey, {
        agentId: agent.id,
        name: agent.name,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      request.agent = { id: agent.id, name: agent.name };
      return;
    }
  }

  return reply.status(401).send({
    statusCode: 401,
    error: 'Unauthorized',
    message: 'Invalid API key',
  });
}

// Optional auth middleware - doesn't fail if no auth provided
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return; // No auth is fine for optional auth
  }

  const [scheme, apiKey] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !apiKey || !isValidApiKeyFormat(apiKey)) {
    return; // Invalid auth format, just skip
  }

  // Check cache first
  const cached = authCache.get(apiKey);
  if (cached && cached.expiresAt > Date.now()) {
    request.agent = { id: cached.agentId, name: cached.name };
    return;
  }

  // Find agent with matching API key
  const agents = await prisma.agent.findMany({
    select: { id: true, name: true, apiKeyHash: true },
  });

  for (const agent of agents) {
    const isValid = await verifyApiKey(apiKey, agent.apiKeyHash);
    if (isValid) {
      authCache.set(apiKey, {
        agentId: agent.id,
        name: agent.name,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      request.agent = { id: agent.id, name: agent.name };
      return;
    }
  }
}

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of authCache.entries()) {
    if (value.expiresAt <= now) {
      authCache.delete(key);
    }
  }
}, 60 * 1000); // Every minute
