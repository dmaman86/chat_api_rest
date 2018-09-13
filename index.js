'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var config = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect( config.db, { useNewUrlParser: true }).then( () => {
    console.log('You are connect to DB');

    app.listen( config.port, () => {
        console.log(`Server is run in port ${ config.port }`);
    })
}).catch( err => console.log( err ));