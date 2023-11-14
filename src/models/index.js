const EmailCode = require('../models/EmailCode');
const User = require('./User');

User.hasOne(EmailCode);
EmailCode.belongsTo(User);