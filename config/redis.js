const Redis = require('ioredis');
const env = require('./env');

let redisClient = null;
let isRedisAvailable = false;

/**
 * Initialize Redis connection
 * Returns null if Redis is not available (graceful degradation)
 */
function initRedis() {
  // Skip Redis in test environment if not explicitly configured
  if (env.NODE_ENV === 'test' && !env.REDIS_URL) {
    console.log('ℹ️  Test mode: Redis disabled');
    return null;
  }

  if (!env.REDIS_URL) {
    console.warn('⚠️  REDIS_URL not configured - running without Redis');
    return null;
  }

  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.error('❌ Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 200, 1000);
      },
      reconnectOnError(err) {
        console.error('Redis reconnect error:', err.message);
        return false;
      },
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      console.log('✅ Redis connected');
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      console.error('Redis error:', err.message);
    });

    redisClient.on('close', () => {
      isRedisAvailable = false;
      console.warn('⚠️  Redis connection closed');
    });

    return redisClient;
  } catch (error) {
    console.error('Failed to initialize Redis:', error.message);
    return null;
  }
}

/**
 * Get Redis client (with availability check)
 * Returns null if Redis is not available (for graceful degradation)
 */
function getRedisClient() {
  // In test mode, return a mock Redis client
  if (env.NODE_ENV === 'test') {
    return {
      get: () => Promise.resolve(null),
      set: () => Promise.resolve('OK'),
      setex: () => Promise.resolve('OK'),
      del: () => Promise.resolve(1),
      exists: () => Promise.resolve(0),
      incr: () => Promise.resolve(1),
      expire: () => Promise.resolve(1),
      ttl: () => Promise.resolve(-1),
      disconnect: () => Promise.resolve(),
    };
  }

  if (!redisClient || !isRedisAvailable) {
    console.warn('⚠️  Redis not available - operations will be skipped');
    return null;
  }

  return redisClient;
}

/**
 * Close Redis connection
 */
async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis connection closed');
  }
}

// Initialize Redis on module load (except in test mode)
if (env.NODE_ENV !== 'test') {
  initRedis();
}

module.exports = getRedisClient();
module.exports.getRedisClient = getRedisClient;
module.exports.closeRedis = closeRedis;
module.exports.isAvailable = () => isRedisAvailable;
