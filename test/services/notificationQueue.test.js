const moment = require('moment');
const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
const notificationQueue = require('../../services/notificationQueue');
const models = require('../../models');

const sandbox = sinon.createSandbox();

describe('notificationQueue Service Test', async function () {
    beforeEach(() => {
        sandbox.restore();
    });

    it('should create delayed job when have notification data', async function () {
        const today = moment('2024-02-06').set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        const mockNotifications = [
            {
                id: 1,
                scheduleServer: today,
                status: 'scheduled',
                User: { email: 'user@example.com' }
            }
        ];

        const findAllStub = sandbox.stub(models.Notification, 'findAll').resolves(mockNotifications);
        const createDelayedJobsStub = sandbox.stub().callsFake((notifications, callback) => {
            notifications.forEach(notification => callback(notification, 'success'));
        });

        sandbox.replace(notificationQueue, "createDelayedJobs", createDelayedJobsStub);
        sandbox.replace(notificationQueue, 'updateNotificationStatusById', sandbox.stub());

        await notificationQueue.createNotificationJobs();

        expect(findAllStub.calledOnce).to.be.true;
        expect(createDelayedJobsStub.calledOnce).to.be.true;
        expect(createDelayedJobsStub.firstCall.args[0]).to.deep.equal(mockNotifications);
    });
});