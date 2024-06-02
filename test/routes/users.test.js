const chai = require('chai');
const expect = chai.expect;
const express = require('express');
const request = require('supertest');
const router = require('../../routes/users');
const models = require('../../models');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const app = express();
const bodyParser = require('body-parser');
const moment = require('moment');

app.use(bodyParser.json());
app.use('/', router);

describe('users route test', function () {
    this.timeout(5000);
    beforeEach(() => {
        sandbox.restore();
    });

    describe('post user', function () {
        it('should return correct data when success', async () => {
            const requestData = {
                firstName: "Thomas",
                lastName: "Anderson",
                birthday: "1/1/1990",
                email: "abc@abc.com",
                location: "Los Angeles"
            };
            const createdUser = {
                id: 1,
                firstName: "Thomas",
                lastName: "Anderson",
                birthday: "1990-01-01",
                email: "abc@abc.com",
                location: "America/Los_Angeles"
            };
            const today = moment('2024-02-06').set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            const createdNotification = {
                id: 1,
                scheduleServer: today,
                status: 'scheduled',
                User: { email: 'user@example.com' }
            };
            const findOneUserStub = sandbox.stub(models.User, 'findOne').resolves(null);
            const createUserStub = sandbox.stub(models.User, 'create').resolves(createdUser);
            const findOneNotificationStub = sandbox.stub(models.Notification, 'findOne').resolves(null);
            const createNotificationStub = sandbox.stub(models.Notification, 'create').resolves(createdNotification);

            const res = await request(app).post('/user').expect('Content-Type', /json/).send(requestData);

            expect(res.status).to.equal(201);
            expect(findOneUserStub.calledOnce).to.be.true;
            expect(createUserStub.calledOnce).to.be.true;
            expect(findOneNotificationStub.calledOnce).to.be.true;
            expect(createNotificationStub.calledOnce).to.be.true;
            expect(res._body.user.firstName, requestData.firstName);
        });
    });
});
