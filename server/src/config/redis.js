import Redis from 'ioredis';
import { ENV } from './env.js';

class InMemoryRedisFallback {
  constructor() {
    this.store = new Map();
    this.sets = new Map();
    this.subscribers = new Map();
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async set(key, value, mode, duration) {
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => this.store.delete(key), duration * 1000);
    }
    return 'OK';
  }

  async del(key) {
    const existed = this.store.delete(key) || this.sets.delete(key);
    return existed ? 1 : 0;
  }

  async sadd(key, ...members) {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    const set = this.sets.get(key);
    let added = 0;
    for (const member of members) {
      if (!set.has(member)) {
        set.add(member);
        added++;
      }
    }
    return added;
  }

  async srem(key, ...members) {
    const set = this.sets.get(key);
    if (!set) return 0;
    let removed = 0;
    for (const member of members) {
      if (set.delete(member)) {
        removed++;
      }
    }
    return removed;
  }

  async smembers(key) {
    const set = this.sets.get(key);
    return set ? Array.from(set) : [];
  }

  async sismember(key, member) {
    const set = this.sets.get(key);
    return set && set.has(member) ? 1 : 0;
  }

  async publish(channel, message) {
    const listeners = this.subscribers.get(channel);
    if (!listeners) return 0;
    listeners.forEach((callback) => callback(message));
    return listeners.size;
  }

  async subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel).add(callback);
  }
}

let redisClient;

if (ENV.REDIS_URL && ENV.REDIS_URL.trim().length > 0) {
  try {
    const client = new Redis(ENV.REDIS_URL, {
      maxRetriesPerRequest: 2,
      retryStrategy(times) {
        if (times > 3) {
          console.warn('[Redis] Connection failed after 3 retries. Switching to in-memory fallback.');
          return null;
        }
        return Math.min(times * 100, 2000);
      },
    });

    client.on('connect', () => {
      console.log('[Redis] Connected to Redis server.');
    });

    client.on('error', (err) => {
      console.warn('[Redis] Connection error. Using in-memory fallback store:', err.message);
    });

    redisClient = client;
  } catch {
    console.log('[Redis] Initializing fallback in-memory cache/presence store.');
    redisClient = new InMemoryRedisFallback();
  }
} else {
  console.log('[Redis] No REDIS_URL configured. Active in-memory cache & presence store.');
  redisClient = new InMemoryRedisFallback();
}

export { redisClient };
