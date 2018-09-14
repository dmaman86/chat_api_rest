var moment = require('moment');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

function saveUser( req, res ) {
    var params = req.body;
    var user = new User();

    if( params.name 
        && params.last_name 
        && params.email 
        && params.password 
        && params.phone ){

        user.name = params.name;
        user.last_name = params.last_name;
        user.email = params.email;
        user.password = params.password;
        user.phone = params.phone;
        // user.saveDate = moment().format('LLLL');
        user.saveDate = moment().unix();
        user.role = 'USER';
        user.image = 'user.png';
        user.country = params.country;

        User.find( {email: user.email} ).exec( ( err, users ) => {
            if ( err ) return res.status(500).send({
                message: `Error to save user ${ err }`
            });

            if ( users && users.length >= 1) {
                return res.status(400).send({
                    message: 'User exist'
                });
            }
            else {
                // cifrar contrasenia y guardar datos
                bcrypt.hash(params.password, null, null, (err, hash) =>{
                    user.password = hash;

                    user.save((err, userStored) => {
                        if(err) return res.status(500).send({
                            message: `Error to save user: ${err}`
                        });

                        if(userStored){
                            res.status(200).send({ user: userStored });
                        }
                        else{
                            res.status(404).send({
                                message: 'Can`t save a user'
                            })
                        }
                    })
                })
            }
        });
    } else {
        res.status(200).send({
            message: 'Please fill all data'
        });
    }
}

function loginUser(req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if ( err ) return res.status(500).send({
            message: `Error in request login: ${ err }`
        });

        if( user ) {
            bcrypt.compare(password, user.password, (err, check) => {
                if(check){
                    //devolver datos de usuario
                    if(params.gettoken){
                        //generar y devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                        //devolver datos usuario
                        user.password = undefined;//para no devolver el password
                        return res.status(200).send( { user })
                    }
                    
                }
                else{
                    return res.status(404).send({message: `El usuario no se puede identificar: ${ err }`});
                }
            });
        }
        else{
            return res.status(404).send({message: 'El usuario no se puede identificar'});
        }
    });
}

function getAllUsers(req, res){

}

function getUser(req, res){
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if(err) return res.status(500).send({message: `Error en la peticion: ${ err }`});

        if(!user) return res.status(404).send({message: 'El usuario no existe'});

        return res.status(200).send({user: user});
    });
}

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({
            message: 'You cant update this user'
        });
    }

    if ( update.password.length > 0 ) {
        bcrypt.hash( update.password, null, null, (err, hash) => {
            update.password = hash;
            User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
                if(err){
                    return res.status(500).send({
                        message: `Error in request update ${ err }`
                    });
                }
        
                if(!userUpdated){
                    return res.status(404).send({
                        message: 'Something wrong, this update faild'
                    });
                }
                userUpdated.password = undefined;
                return res.status(200).send({ user: userUpdated });
            });
        });
    } else{
        getDataUser( userId ).then( (value) => {
            update.password = value.password;
            User.findByIdAndUpdate( userId, update, { new: true }, (err, userUpdated) => {
                if(err){
                    return res.status(500).send({
                        message: `Error in request update ${ err }`
                    });
                }
        
                if(!userUpdated){
                    return res.status(404).send({
                        message: 'Something wrong, this update faild'
                    });
                }
                userUpdated.password = undefined;
                return res.status(200).send({ user: userUpdated });
            });
        });
    }
}

async function getDataUser( userId ) {
    var temp = await User.findById(userId, (err, user) => {
        if(err) return hangleError(err);
        
        return user;
    });

    return temp;
}

function deleteUser(req, res){

}

//subir archivos de imagen/avatar de usuario
function uploadImagen(req, res){

    var userId = req.params.id;

    if(req.files){
        var file_path = req.files.image.path;

        /*si fuera en windows tendria que ser asi:
        var file_split = file_path.split('\\');
        esto es porque el fichero en mac/linux la direcion es de otra manera */
        //var file_split = file_path.split('/'); this is for linux/mac os
        var file_split = file_path.split('\\');
        console.log("Line 197 " + file_split);

        var file_name = file_split[2];
        console.log("Line 200 " + file_name);

        var ext_split = file_name.split('\.');
        console.log("Line 203 " + ext_split);
        var file_ext = ext_split[1];

        if(userId != req.user.sub){
            return removeFilesofUploads(res, file_path, 'No tienes permiso para actualizar los datos del usuario');
        }

        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            //actualizar documento de usuario logeado
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true}, (err, userUpdated) => {
                if(err) return res.status(500).send({message: `Error en la peticion: ${ err }`});

                if(!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });

                return res.status(200).send({ user: userUpdated });
            })
        }
        else{
            return removeFilesofUploads(res, file_path, 'Extension no es valida');
        }

    }
    else{
        return res.status(200).send({
            message: 'No se han subido imagenes'
        });
    }
}

function removeFilesofUploads(res, file_path, message){
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    });
}

function getImageFile(req, res){

    var image_file = req.params.imageFile;
    var path_file = './uploads/users/' + image_file;

    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        }
        else{
            res.status(200).send({
                message: 'No existe la imagen'
            });
        }
    });

}

module.exports = {
    saveUser,
    loginUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    uploadImagen,
    getImageFile
}