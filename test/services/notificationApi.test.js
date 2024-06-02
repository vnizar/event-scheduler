const sinon = require('sinon');
const chai = require('chai');
const { client } = require('../../config/api');
const notificationApi = require('../../services/notificationApi');
const { expect } = chai;

const sandbox = sinon.createSandbox();

describe('notificationApi services', async function () {
    beforeEach(() => {
        sandbox.restore();
    });

    it('should return sent when API call success', async function () {
        const request = {
            email: "abc@abc.com",
            message: "message"
        }
        const mockResponse = {
            status: 200,
            data: {
                status: 'sent'
            }
        }

        const clientStub = sandbox.stub(client, 'post').returns(mockResponse);

        const response = await notificationApi.sendNotification(request.email, request.message);

        expect(clientStub.calledOnce).to.be.true;
        expect(response).to.equal('sent');
    });

    it('should return failed when response status not 200', async function () {
        const request = {
            email: "abc@abc.com",
            message: "message"
        }
        const mockResponse = {
            status: 500
        }

        const clientStub = sandbox.stub(client, 'post').returns(mockResponse);

        const response = await notificationApi.sendNotification(request.email, request.message);

        expect(clientStub.calledOnce).to.be.true;
        expect(response).to.equal('failed');
    });

    it('should return failed when throw error', async function () {
        const request = {
            email: "abc@abc.com",
            message: "message"
        }
        const error = new Error('Something went wrong');

        const clientStub = sandbox.stub(client, 'post').throws(error);

        const response = await notificationApi.sendNotification(request.email, request.message);

        expect(clientStub.calledOnce).to.be.true;
        expect(response).to.equal('failed');
    });
});
