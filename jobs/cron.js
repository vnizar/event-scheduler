const cron = require('node-cron');
const { createNotificationJobs } = require('../services/notificationQueue');

cron.schedule('*/5 * * * * *', async () => {
    await createNotificationJobs();
});
