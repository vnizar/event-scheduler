const cron = require('node-cron');
const moment = require('moment-timezone');
const models = require('./models');
const { Op } = require('sequelize');
const { createDelayedJob } = require('./services/queue');

// TODO: change to every hour
cron.schedule('*/30 * * * * *', async () => {
    const now = moment('12/09/2024', "DD/MM/YYYY");
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

// , async (status) => {
//     const nextScheduleServer = moment(notif.scheduleServer).add(1, 'years');
//     const nextScheduleLocal = moment(notif.scheduleLocal).add(1, 'years');
//     await models.Notification.update({
//         status: status,
//         scheduleLocal: nextScheduleLocal,
//         scheduleServer: nextScheduleServer
//     }, {
//         where: {
//             id: notif.id,
//         }
//     });
// }