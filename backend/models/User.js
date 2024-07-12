const mongoose = require('mongoose');
const {Schema, model}  = mongoose;

const UserSchema = new Schema({
    firstname : {type: String , required:true , minlength:4 },
    email : {type: String , requried:true,unique:true},
    password : {type:String , required:true,minlength:8},
})

const UserModel = model('User',UserSchema);

module.exports = UserModel;