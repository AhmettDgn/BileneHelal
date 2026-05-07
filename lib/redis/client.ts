/**
 * Upstash Redis istemcisi — anlık oyun state ve lider tahtası caching için.
 */

import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

/**
 * Upstash Redis istemcisini oluşturur veya mevcut instance'ı döner.
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        'UPSTASH_REDIS_REST_URL ve UPSTASH_REDIS_REST_TOKEN ortam değişkenleri gereklidir',
      );
    }

    redisClient = new Redis({ url, token });
  }

  return redisClient;
}
