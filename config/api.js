const axios = require('axios');
require('dotenv').config({ override: true });

const client = axios.create({
    baseURL: process.env.NOTIFICATION_BASE_URL
});

client.defaults.headers.common['Content-Type'] = 'application/json';

module.exports = { client }
