import 'dotenv/config';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import axios from 'axios';
import { z } from 'zod';
import Redis from 'ioredis';

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const PORT = parseInt(process.env.PORT || '3001', 10);
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';
const REDIS_URL = process.env.REDIS_URL || '';

// Initialize Redis client if configured
const redis = REDIS_URL ? new Redis(REDIS_URL) : null;

const postSchema = z.object({
  message: z.string().min(1, 'message is required'),
  username: z.string().optional(),
  userId: z.string().optional(),
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'discord-api', hasWebhook: Boolean(DISCORD_WEBHOOK_URL) });
});

app.get('/health', async (_req: Request, res: Response) => {
  let redisOk: boolean | null = null;
  if (redis) {
    try {
      await redis.ping();
      redisOk = true;
    } catch {
      redisOk = false;
    }
  }
  res.json({ ok: true, port: PORT, hasWebhook: Boolean(DISCORD_WEBHOOK_URL), uptimeSecs: Math.floor(process.uptime()), redis: redisOk });
});

app.post('/discord/post', async (req: Request, res: Response) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_body', details: parsed.error.flatten() });
  }
  const { message, username, userId } = parsed.data;

  if (!DISCORD_WEBHOOK_URL) {
    return res.status(500).json({ error: 'webhook_not_configured' });
  }

  try {
    // Rate limit: 1 message per hour per user
    // user key preference: userId (body) > X-User-Id header > IP
    const headerUser = (req.header('x-user-id') || '').trim();
    const derivedId = (userId && userId.trim()) || headerUser || req.ip || 'anonymous';

    if (redis) {
      const key = `rate:discord:${derivedId}`;
      // SETNX key to create if not exists
      const created = await redis.setnx(key, '1');
      if (created === 0) {
        // Already exists within the hour
        const ttl = await redis.ttl(key);
        return res.status(429).json({
          error: 'rate_limited',
          message: 'Only 1 message per hour allowed for this user',
          retryAfterSeconds: ttl >= 0 ? ttl : undefined,
          userId: derivedId,
        });
      }
      // Apply 1-hour expiration
      await redis.expire(key, 60 * 60);
    }

    const resp = await axios.post(DISCORD_WEBHOOK_URL, {
      content: message,
      // username override supported by Discord webhooks
      username,
    }, {
      // webhook may return 204 No Content
      validateStatus: () => true,
    });

    if (resp.status === 204) {
      return res.json({ ok: true, status: 204 });
    }
    if (resp.status < 200 || resp.status >= 300) {
      return res.status(502).json({ error: 'discord_error', status: resp.status, data: resp.data });
    }
    return res.json(resp.data ?? { ok: true, status: resp.status });
  } catch (err: any) {
    return res.status(500).json({ error: 'post_failed', message: err?.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Discord API listening on :${PORT}`);
  console.log('env_summary', { hasWebhook: Boolean(DISCORD_WEBHOOK_URL), redis: Boolean(redis) });
});
