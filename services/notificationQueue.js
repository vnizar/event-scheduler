const moment = require('moment-timezone');
const models = require('../models');
const { Op } = require('sequelize');
const { notificationQueue } = require('../config/queue');

async function createNotificationJobs() {
    const today = moment();
    today.set({ hour: 0, minute: 0, second: 0, milisecond: 0 });
    const endDay = today.clone().add(1, 'days');
    const notifications = await models.Notification.findAll({
        include: {
            model: models.User,
            attributes: ['email']
        },
        where: {
            [Op.and]: [
                {
                    scheduleServer: {
                        [Op.between]: [today, endDay]
                    }
                },
                {
                    status: {
                        [Op.or]: ['scheduled', 'failed']
                    }
                },
            ]
        }
    });

    createDelayedJobs(notifications, (data, result) => {
        updateNotificationStatusById(data, result);
    });
}

const updateNotificationStatusById = async (notif, status) => {
    const nextScheduleServer = moment(notif.scheduleServer).add(1, 'hours');
    const nextScheduleLocal = moment(notif.scheduleLocal).add(1, 'hours');
    await models.Notification.update({
        status: status,
        scheduleLocal: nextScheduleLocal,
        scheduleServer: nextScheduleServer,
        sentAt: moment(),
    }, {
        where: {
            id: notif.id,
        }
    });
}

const createDelayedJobs = (notifications, cb) => {
    const jobList = [];
    for (const data of notifications) {
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

            cb(data, result);
        });

        // if the schedule is in the future, then add delay, else trigger job immedieately
        if (diff < 0) {
            job.delayUntil(Date.parse(data.scheduleServer));
        }
        console.log('End creating job');

        jobList.push(job);
    }

    if (jobList.length() > 0) {
        notificationQueue.saveAll(jobList)
            .then((errors) => {
                console.log(errors);
            });
    }
}

module.exports = { createNotificationJobs };
