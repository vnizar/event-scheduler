const cron = require('node-cron');
const moment = require('moment-timezone');
const models = require('./models');
const { Op } = require('sequelize');
const { createDelayedJob } = require('./services/queue');

cron.schedule('1 * * * *', async () => {
    const now = moment();
    await createJobs(now);
});

async function createJobs(date) {
    const today = moment(date);
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


    createDelayedJob(notifications);
}
