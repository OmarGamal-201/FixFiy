/**
 * Idempotency Service
 * Prevents duplicate payment processing
 * 
 * Uses crypto hash to generate unique idempotency key from payment details
 * Checks cache (Redis) for existing payment with same key
 */

const crypto = require('crypto');
const redis = require('redis');

// Redis client (singleton)
let redisClient = null;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });

    await redisClient.connect();
    redisClient.on('error', (err) => console.error('Redis error:', err));
  }
  return redisClient;
};

class IdempotencyService {
  /**
   * Generate idempotency key from payment details
   * Format: sha256(jobId-clientId-amount-type-timestamp)
   */
  static generateKey(jobId, clientId, amount, type) {
    const data = `${jobId}:${clientId}:${amount}:${type}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Check if payment with this key already exists
   * Returns existing payment record if found
   */
  static async checkDuplicate(idempotencyKey, timeWindowMs = 3600000) {
    try {
      const client = await getRedisClient();
      const cached = await client.get(`payment:${idempotencyKey}`);

      if (cached) {
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      // If Redis fails, don't block payment - log warning
      console.warn('Idempotency check failed:', error.message);
      return null;
    }
  }

  /**
   * Store payment result for duplicate detection
   * TTL: 1 hour (configurable)
   */
  static async storePayment(idempotencyKey, paymentData, ttlSeconds = 3600) {
    try {
      const client = await getRedisClient();
      const key = `payment:${idempotencyKey}`;

      // Store with TTL for automatic cleanup
      await client.setEx(key, ttlSeconds, JSON.stringify(paymentData));

      return true;
    } catch (error) {
      // If Redis fails, log warning but continue
      console.warn('Failed to store idempotency key:', error.message);
      return false;
    }
  }

  /**
   * Clean up idempotency key (after successful processing)
   */
  static async removePayment(idempotencyKey) {
    try {
      const client = await getRedisClient();
      await client.del(`payment:${idempotencyKey}`);
      return true;
    } catch (error) {
      console.warn('Failed to remove idempotency key:', error.message);
      return false;
    }
  }

  /**
   * Get all pending payments for a job
   * Used to prevent concurrent payments
   */
  static async getPendingPayments(jobId) {
    try {
      const client = await getRedisClient();
      const pattern = `payment:*${jobId}*`;
      const keys = await client.keys(pattern);

      if (!keys || keys.length === 0) return [];

      const payments = [];
      for (const key of keys) {
        const data = await client.get(key);
        if (data) {
          payments.push(JSON.parse(data));
        }
      }

      return payments;
    } catch (error) {
      console.warn('Failed to get pending payments:', error.message);
      return [];
    }
  }

  /**
   * Clear all idempotency keys (use with caution)
   */
  static async clearAll() {
    try {
      const client = await getRedisClient();
      const pattern = 'payment:*';
      const keys = await client.keys(pattern);

      if (!keys || keys.length === 0) return 0;

      await client.del(keys);
      return keys.length;
    } catch (error) {
      console.warn('Failed to clear idempotency keys:', error.message);
      return 0;
    }
  }

  /**
   * Cleanup old Redis connections (graceful shutdown)
   */
  static async disconnect() {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
    }
  }
}

module.exports = IdempotencyService;
