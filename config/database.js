const { Sequelize } = require('sequelize');
require('dotenv').config({ override: true });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        underscored: true,
        timezone: '+07:00'
    }
);

module.exports = sequelize;
