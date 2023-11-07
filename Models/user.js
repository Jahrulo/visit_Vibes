// setting up the users model using the passport local mongoose 

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// plug in passportlocalongoose to the schema
UserSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model('User', UserSchema);