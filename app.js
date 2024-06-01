const express = require('express');
const bodyParser = require('body-parser');
const users = require('./routes/users');
const cron = require('./jobs/cron');
const { notificationQueue } = require('./config/queue');

const app = express();

app.use(bodyParser.json());

app.use('/', users);

cron.init();

app.listen(3000, () => {
    console.log('Listening...');
    notificationQueue;
});
