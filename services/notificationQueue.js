const moment = require('moment-timezone');
const models = require('../models');
const { Op } = require('sequelize');
const { notificationQueue } = require('../config/queue');

exports.createNotificationJobs = async () => {
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

    exports.createDelayedJobs(notifications, (data, result) => {
        exports.updateNotificationStatusById(data, result);
    });
}

exports.updateNotificationStatusById = async (notif, status) => {
    const nextScheduleServer = moment(notif.scheduleServer).add(1, 'years');
    const nextScheduleLocal = moment(notif.scheduleLocal).add(1, 'years');
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

exports.createDelayedJobs = (notifications, cb) => {
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

            cb(data, result);
        });

        // if the schedule is in the future, then add delay, else trigger job immedieately
        if (diff < 0) {
            job.delayUntil(Date.parse(data.scheduleServer));
        }

        jobList.push(job);
        console.log('End creating job');
    }

    if (jobList.length > 0) {
        notificationQueue.saveAll(jobList)
            .then((errors) => {
                console.log(errors);
            });
    }
}
