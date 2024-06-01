const Redis = require('redis');
const redisClient = Redis.createClient()
    .on('error', err => console.log('Redis client error ', err))
    .connect();

module.exports = { redisClient };