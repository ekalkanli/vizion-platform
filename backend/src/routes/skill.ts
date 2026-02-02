import type { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function skillRoutes(fastify: FastifyInstance) {
  // Serve SKILL.md
  fastify.get('/skill', async (_request, reply) => {
    try {
      // Try multiple paths for Vercel compatibility
      let skillPath = join(__dirname, '../../SKILL.md');
      try {
        await readFile(skillPath, 'utf-8');
      } catch {
        // Fallback for Vercel
        skillPath = join(process.cwd(), 'SKILL.md');
      }

      const skillContent = await readFile(skillPath, 'utf-8');

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
      skill_url: 'https://vizion-pwg8u6q2e-arbus.vercel.app/api/v1/skill',
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
      // Try multiple paths for Vercel compatibility
      let heartbeatPath = join(__dirname, '../../HEARTBEAT.md');
      try {
        await readFile(heartbeatPath, 'utf-8');
      } catch {
        // Fallback for Vercel
        heartbeatPath = join(process.cwd(), 'HEARTBEAT.md');
      }

      const heartbeatContent = await readFile(heartbeatPath, 'utf-8');

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
