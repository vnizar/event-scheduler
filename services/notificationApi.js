const { client } = require('../config/api');

exports.sendNotification = async (email, message) => {
    try {
        const response = await client.post('/send-email', {
            email,
            message,
        });

        if (response && response.status === 200 && response.data.status === 'sent') {
            return 'sent';
        }

        return 'failed';
    } catch (error) {
        console.log(error);
        return 'failed';
    }
}
