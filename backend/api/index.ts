// Vercel Serverless Function Handler
import { build } from '../src/index.js';
import { connectDatabase } from '../src/config/database.js';

let app: any = null;
let isConnected = false;

async function getApp() {
  if (!app) {
    if (!isConnected) {
      await connectDatabase();
      isConnected = true;
    }
    app = await build();
    await app.ready();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const fastify = await getApp();
    fastify.server.emit('request', req, res);
  } catch (error: any) {
    console.error('Handler error:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error?.message || 'Unknown error'
    }));
  }
}
