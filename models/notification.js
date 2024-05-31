'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE'
      })
    }
  }
  Notification.init({
    userId: DataTypes.INTEGER,
    message: DataTypes.STRING,
    scheduleLocal: DataTypes.DATE,
    scheduleServer: DataTypes.DATE,
    status: DataTypes.ENUM('scheduled', 'sent', 'failed'),
    sentAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};