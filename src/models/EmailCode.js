const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection.js');

const EmailCode = sequelize.define('emailCode', {
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  }

});

module.exports = EmailCode;