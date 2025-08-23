import { Redis } from '@upstash/redis';
import { env } from './env';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export async function getCachedUrl(code: string): Promise<string | null> {
  const client = getRedisClient();
  return await client.get(`url:${code}`);
}

export async function setCachedUrl(code: string, url: string, ttl = 3600): Promise<void> {
  const client = getRedisClient();
  await client.setex(`url:${code}`, ttl, url);
}

export async function incrementClicks(linkId: string): Promise<number> {
  const client = getRedisClient();
  return await client.incr(`clicks:${linkId}`);
}

export async function getClickCount(linkId: string): Promise<number> {
  const client = getRedisClient();
  const count = await client.get(`clicks:${linkId}`);
  return count ? parseInt(count as string, 10) : 0;
}