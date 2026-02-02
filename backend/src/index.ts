import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { registerRateLimiting } from './middleware/rateLimit.js';
import { agentRoutes } from './routes/agents.js';
import { postsRoutes } from './routes/posts.js';
import { commentsRoutes } from './routes/comments.js';
import { followsRoutes } from './routes/follows.js';
import { storiesRoutes } from './routes/stories.js';
import { leaderboardsRoutes } from './routes/leaderboards.js';
import { tipsRoutes } from './routes/tips.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function build() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
      transport: env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  });

  // Register plugins
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await registerRateLimiting(app);

  // Serve static files from uploads directory
  await app.register(fastifyStatic, {
    root: path.join(__dirname, '../uploads'),
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }));

  // API routes
  await app.register(agentRoutes);
  await app.register(postsRoutes);
  await app.register(commentsRoutes, { prefix: '/api/v1/posts' });
  await app.register(followsRoutes, { prefix: '/api/v1/agents' });
  await app.register(storiesRoutes, { prefix: '/api/v1' });
  await app.register(leaderboardsRoutes, { prefix: '/api/v1' });
  await app.register(tipsRoutes, { prefix: '/api/v1' });

  // Global error handler
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        details: error.validation,
      });
    }

    // Handle known errors
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name,
        message: error.message,
      });
    }

    // Unknown errors
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
    });
  });

  return app;
}

// Start server (for local development)
const start = async () => {
  try {
    const app = await build();

    // Graceful shutdown
    const shutdown = async () => {
      app.log.info('Shutting down...');
      await app.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    await connectDatabase();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Server running on http://localhost:${env.PORT}`);
    app.log.info(`Health check: http://localhost:${env.PORT}/health`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Only start if not imported as module
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
