const models = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');

router.post('/user', async (req, res) => {
    const { firstName, email, lastName, birthday, location } = req.body;
    if (!firstName || !email || !lastName || !birthday || !location) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const birthdayDate = moment(new Date(birthday)).format('YYYY-MM-DD');
    if (birthdayDate === null) {
        return res.status(400).json({ message: 'Invalid birthday date' });
    }

    const user = { email, firstName, lastName, birthday: birthdayDate, location };

    const emailExists = await models.User.findOne({
        where: {
            email: email
        }
    });

    if (emailExists) {
        return res.status(400).json({ message: 'Email already exists.' });
    }

    try {
        await sequelize.transaction(async t => {
            const saveUser = await models.User.create(user);

            if (!saveUser) {
                return res.status(500).json({ message: 'something went wrong' });
            }

            scheduleBirthdayNotification(saveUser);
        });

        return res.status(201).json({ message: 'User created', user });
    } catch (err) {
        return res.status(500).json({ message: 'something went wrong' });
    }
});

router.delete('/user/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    const user = await models.User.findOne({
        where: { id: id }
    });
    if (!user) {
        return res.status(404).json({ message: 'User Not Found' });
    }

    await models.Notification.destroy({
        where: {
            userId: user.id
        }
    });
    await user.destroy();

    return res.status(200).json({ message: 'User deleted' });
});

router.put('/user/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    const { firstName, lastName, birthday, location } = req.body;
    if (!firstName || !lastName || !birthday || !location) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await models.User.findOne({
        where: { id: id }
    });
    if (!user) {
        return res.status(404).json({ message: 'User Not Found' });
    }

    try {
        await sequelize.transaction(async t => {
            const saveUser = await models.User.update(user);
            await saveUser.save();

            if (!saveUser) {
                return res.status(500).json({ message: 'something went wrong' });
            }

            scheduleBirthdayNotification(saveUser);
        });

        return res.status(201).json({ message: 'User created', user });
    } catch (err) {
        return res.status(500).json({ message: 'something went wrong' });
    }
});

async function scheduleBirthdayNotification(user) {
    let tmpUser = await models.Notification.findOne({
        where: {
            userId: user.id
        }
    });

    if (tmpUser == null) {
        tmpUser = user;
    }

    const currentYear = moment().year();
    const localTz = moment.tz(tmpUser.birthday, tmpUser.location).set({ hour: 9, minute: 0, second: 0, milisecond: 0 });
    const serverTz = moment.tz.guess();
    const convertedTz = localTz.clone().tz(serverTz);
    convertedTz.set('year', currentYear);
    localTz.set('year', currentYear);

    if (moment().diff(convertedTz, 'days') > 0) {
        convertedTz.add(1, 'years');
        localTz.add(1, 'years');
    }

    const message = `Happy birthday ${tmpUser.firstName} ${tmpUser.lastName}!!`;
    const notification = { message, userId: tmpUser.id, scheduleLocal: localTz.format('YYYY-MM-DD HH:mm:ss'), scheduleServer: convertedTz.format('YYYY-MM-DD HH:mm:ss'), status: 'scheduled' };
    await models.Notification.create(notification);
}

module.exports = router;