const { notificationQueue } = require('../config/queue');
const { sendNotification } = require('../services/api');

notificationQueue.process(async (job) => {
    try {
        console.log(`Processing job ${job.id}...`);
        console.log(job.options);
        const status = await sendNotification(job.data.User.email, job.data.message);

        console.log("process : " + job.id + " return " + status);
        if (status != 'sent') {
            if (job.options.retries === 0) {
                return 'failed';
            }

            throw new Error('failed');
        }

        return status;
    } catch (error) {
        console.log(`Job ${job.id} got error ${error}`);
        throw error;
    }
});
