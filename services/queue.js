const Queue = require('bee-queue');
const Redis = require('redis');
const moment = require('moment-timezone');
const models = require('../models');

const redisClient = Redis.createClient()
    .on('error', err => console.log('Redis client error ', err))
    .connect();
const notificationQueue = new Queue('notification', {
    redis: redisClient,
    settings: {
        activateDelayedJobs: true,
        concurrency: 5
    }
});

const updateNotificationStatusById = async (notif, status) => {
    const nextScheduleServer = moment(notif.scheduleServer).add(1, 'hours');
    const nextScheduleLocal = moment(notif.scheduleLocal).add(1, 'hours');
    await models.Notification.update({
        status: status,
        scheduleLocal: nextScheduleLocal,
        scheduleServer: nextScheduleServer
    }, {
        where: {
            id: notif.id,
        }
    });
}

const createDelayedJob = (jobs) => {
    const jobList = [];
    for (const data of jobs) {
        console.log(`Creating job ${data.id}`);
        const now = moment.utc();
        const date = moment(data.scheduleServer, now);
        const duration = moment.duration(now.diff(date, 'minute'));
        const diff = duration.asMinutes();

        const job = notificationQueue.createJob(data);

        job.retries(3);
        job.on('succeeded', (result) => {
            console.log('completed job ');
            console.log(job.id);
            console.log(result);

            updateNotificationStatusById(data, result);
        });

        if (diff < 0) {
            // job.delayUntil(Date.parse(data.scheduleServer));
        }
        console.log('End creating job');

        jobList.push(job);
    }
    notificationQueue.saveAll(jobList)
        .then((errors) => {
            console.log(errors);
        });
}

module.exports = { createDelayedJob, notificationQueue }
