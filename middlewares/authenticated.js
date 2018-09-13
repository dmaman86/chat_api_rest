'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../config');

exports.ensureAuth = function(req, res, next){

    if(!req.headers.authorization){
        return res.status(403).send({
            message: 'La peticion no tiene la cabecera de autenticacion'
        });
    }

    //esto limpia el token
    var token = req.headers.authorization.replace(/['"]+/g, '');
    try{
        var payload = jwt.decode(token, config.SECRET_TOKEN);

        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                message: 'El token ha expirado'
            });
        }
    }catch(ex){
        return res.status(404).send({
            message: 'El token no es valido'
        });
    }
    
    req.user = payload;
    
    next();
}