# event-scheduler

Event or notification scheduler to send message on user's birthday.
Run with :
* NodeJS (18.18.2)
* Express (4.19)
* MySQL (8.10)
* Redis (7.2.5)
* Bee-queue (1.7.1)

## Quick Start

Make sure you have MySQL server and Redis client run before run the application.
Only support local.

* Install required dependencies
```
npm install
```

* Configure `.env` file

* Run application
```
node app.js
```

This application have 3 main services:
1. Web application
This is where the application run and do transaction via http call, i.e create user.

2. Cron
Create jobs based on users who have birthday at the same day. To run this from the root project:
```
node cron.js
```

3. Worker
Handle created jobs from Cron and trigger send API call and update notification status. To run this from the root project:
```
node ./services/worker.js
```

## ERD
![ERD](https://i.ibb.co.com/6mhzDP6/scheduler-drawio.png)

## System Design
The idea is to send the notification using queue that support concurrency so it can handle large data to process and using cron to limit the queue creation and save some memory from queue usages.