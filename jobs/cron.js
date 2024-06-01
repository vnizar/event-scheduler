const cron = require('node-cron');
const { createNotificationJobs } = require('../services/notificationQueue');

exports.init = () => {
    cron.schedule('*/20 * * * * *', async () => {
        await createNotificationJobs();
    });
};
