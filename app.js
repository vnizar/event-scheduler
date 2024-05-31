const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
const users = require('./routes/users');

const app = express();

app.use(bodyParser.json());

app.use('/', users);

app.listen(3000, () => {
    console.log('Listening...');
});

// create cron job to check users who have birthday today
// check when the cron last run
//      if it's more than x day / hour / minute then run the [birthday date check] from x day / hour / minut before
//      else run the [birthday date check] for today only
// create [birthday date check] 
//      perform query to users who have birthday from x date until today
//      convert user local time to server time
//      find diff and store it to nextRun
//      schedule a job [sendNotification] with delayUntil(nextRun)
// create worker for [sendNotification]
//      get the last sent notification from user data
//      if last sent notification is greater than nextRun then return
//      send request to api and store the response
//      if response is success then update the last sent notification to now() then return
//      else attempt retry for x times
//      if attempt error then add nextRun 1 day then schedule a job [sendNotification] with delayUntil(nextRun) and send log / alert
