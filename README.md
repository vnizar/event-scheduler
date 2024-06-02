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

* Run migration files
```
npx sequelize-cli db:migrate
```

* Run application

This application have 3 main services to make it loose coupled between services

1. Web application
This is where the application run and do transaction via http call, i.e create user. To run the web server, run this command:
```
node app.js
```

2. Cron
Create jobs based on users who have birthday at the same day. To run this from the root project:
```
node jobs/cron.js
```

3. Worker
Handle created jobs from Cron and trigger send API call and update notification status. To run this from the root project:
```
node ./queues/worker.js
```

## ERD
![ERD](https://i.ibb.co.com/6mhzDP6/scheduler-drawio.png)

## System Design
The idea is to send the notification using queue that support concurrency so it can handle large data to process and using cron to limit the queue creation and save some memory from queue usages. The application will convert the time input from user to UTC and save it to database, so the application will only refer to the converted time for the notification schedule. I use Bee-queue because it's pretty simple, can handle concurrent process, and have the ability to retry the failed jobs. I choose MySQL because we can leverage the database lock to avoid race condition.
