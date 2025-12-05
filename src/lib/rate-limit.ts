import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new Redis instance
// We use the REST API which works perfectly in serverless environments
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Helper to create a rate limiter
// If Redis vars are missing (e.g. during build or local dev without creds), 
// we return a dummy limiter that allows everything to prevent crashes.
function createLimiter(limit: number, window: string) {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
        return {
            limit: async () => ({ success: true, limit: 100, remaining: 99, reset: 0 }),
        } as any as Ratelimit;
    }

    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, window as any),
        analytics: true,
        prefix: '@upstash/ratelimit',
    });
}

// 1. Login Rate Limit
// Strict: 5 attempts per 15 minutes to prevent brute force
export const loginRateLimit = createLimiter(5, '15 m');

// 2. Registration Rate Limit
// Moderate: 3 accounts per hour per IP to prevent spam
export const registrationRateLimit = createLimiter(3, '1 h');

// 3. Password Reset Rate Limit
// Moderate: 3 requests per hour to prevent harassment
export const passwordResetRateLimit = createLimiter(3, '1 h');
