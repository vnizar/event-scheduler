const express = require('express');
const bodyParser = require('body-parser');
const users = require('./routes/users');
const cron = require('./jobs/cron');
const worker = require('./queues/worker');

const app = express();

app.use(bodyParser.json());

app.use('/', users);

cron.init();
worker.init();

app.listen(3000, () => {
    console.log('Listening...');
});
