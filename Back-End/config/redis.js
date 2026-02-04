// const redis = require('redis');

// // Build Redis configuration
// const redisConfig = {
//   socket: {
//     host: process.env.REDIS_HOST || 'localhost',
//     port: parseInt(process.env.REDIS_PORT) || 6379,
//   }
// };

// // IMPORTANT: Only add password if it exists AND is not an empty string
// if (process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim().length > 0) {
//   redisConfig.password = process.env.REDIS_PASSWORD;
//   console.log('🔐 Redis: Using password authentication');
// } else {
//   console.log('🔓 Redis: Connecting without password');
// }

// const redisClient = redis.createClient(redisConfig);

// redisClient.on('error', (err) => {
//   console.error('❌ Redis error:', err.message);
// });

// redisClient.on('connect', () => {
//   console.log('✅ Connected to Redis successfully');
// });

// redisClient.on('ready', () => {
//   console.log('✅ Redis client is ready');
// });

// // Connect to Redis
// (async () => {
//   try {
//     await redisClient.connect();
//   } catch (error) {
//     console.error('❌ Failed to connect to Redis:', error.message);
//     // In development, log but don't crash
//     if (process.env.NODE_ENV === 'production') {
//       process.exit(1);
//     }
//   }
// })();

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   console.log('Closing Redis connection...');
//   await redisClient.quit();
//     process.exit(0);
// });

// module.exports = redisClient;