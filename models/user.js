'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
    name: String,
    last_name: String,
    email: String,
    password: String,
    phone: String,
    saveDate: String,
    role: String,
    image: String,
    country: String
})

module.exports = mongoose.model('User', UserSchema);