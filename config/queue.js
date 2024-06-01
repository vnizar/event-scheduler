const Queue = require('bee-queue');
const { redisClient } = require('./redis');

const notificationQueue = new Queue('notification', {
    redis: redisClient,
    settings: {
        activateDelayedJobs: true,
        concurrency: 5
    }
});

module.exports = { notificationQueue }
