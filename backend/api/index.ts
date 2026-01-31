// Vercel Serverless Function Handler
import { build } from '../src/index.js';

export default async function handler(req: any, res: any) {
  const app = await build();
  await app.ready();
  app.server.emit('request', req, res);
}
