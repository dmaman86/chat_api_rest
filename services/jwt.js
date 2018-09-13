'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../config');

exports.createToken = function(user){
    var payload = {
      sub: user._id,
      name: user.name,
      surname: user.last_name,
      email: user.email,
      phone: user.phone,
      saveDate: user.saveDate,
      role: user.role,
      iat: moment().unix(),
      exp: moment().add(30, 'days').unix()
    };

    return jwt.encode(payload, config.SECRET_TOKEN);
};