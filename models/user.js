const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email : {
        type : String,
        required : true
    }
})
//passport-local mongoose will add a username, hash and salt field to store the 
//username, hashed password and the salt value
//It will also add various methods(refer passport-local-mongoose in npmjs) like authenticate which can be used in your controllers/routes for authentication

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);