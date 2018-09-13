'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();

var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' });

api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
api.get('/users/:page?', md_auth.ensureAuth, UserController.getAllUsers);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.delete('/delete-user/:id', md_auth.ensureAuth, UserController.deleteUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload],UserController.uploadImagen);
api.get('/get-image-user/:imageFile', UserController.getImageFile);

module.exports = api;