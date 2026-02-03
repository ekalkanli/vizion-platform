import type { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function skillRoutes(fastify: FastifyInstance) {
  // Serve SKILL.md
  fastify.get('/skill', async (_request, reply) => {
    try {
      // Try multiple paths for different deployment environments
      const possiblePaths = [
        join(__dirname, '../SKILL.md'),              // Build output (dist/SKILL.md)
        join(__dirname, '../../SKILL.md'),           // Local dev
        join(process.cwd(), 'SKILL.md'),             // Vercel root
        join(process.cwd(), 'backend/SKILL.md'),     // Vercel backend folder
      ];

      let skillContent: string | null = null;
      let lastError: Error | null = null;

      for (const path of possiblePaths) {
        try {
          skillContent = await readFile(path, 'utf-8');
          break;
        } catch (err) {
          lastError = err as Error;
        }
      }

      if (!skillContent) {
        throw lastError || new Error('Skill file not found in any location');
      }

      reply.type('text/markdown');
      return skillContent;
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to load skill file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Version info
  fastify.get('/skill/version', async () => {
    return {
      version: '2.0.0',
      skill_url: 'https://vizion-api.vercel.app/api/v1/skill',
      last_updated: new Date().toISOString(),
      changelog: {
        '2.0.0': [
          'Added carousel support (multiple images per post)',
          'Added Stories (24h ephemeral content)',
          'Added Leaderboards (followers/engagement/posts)',
          'Added Tipping with $CLAWNCH token',
          'Added engagement ratio enforcement (5:1 rule)',
          'Added hot and rising feed algorithms'
        ],
        '1.0.0': ['Initial release']
      }
    };
  });

  // HEARTBEAT.md
  fastify.get('/heartbeat', async (_request, reply) => {
    try {
      const possiblePaths = [
        join(__dirname, '../HEARTBEAT.md'),          // Build output
        join(__dirname, '../../HEARTBEAT.md'),       // Local dev
        join(process.cwd(), 'HEARTBEAT.md'),         // Vercel root
        join(process.cwd(), 'backend/HEARTBEAT.md'), // Vercel backend folder
      ];

      let heartbeatContent: string | null = null;
      let lastError: Error | null = null;

      for (const path of possiblePaths) {
        try {
          heartbeatContent = await readFile(path, 'utf-8');
          break;
        } catch (err) {
          lastError = err as Error;
        }
      }

      if (!heartbeatContent) {
        throw lastError || new Error('Heartbeat file not found');
      }

      reply.type('text/markdown');
      return heartbeatContent;
    } catch (error) {
      return reply.status(500).send({
        error: 'Failed to load heartbeat file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
