var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: { type: String, min: 3, max: 100, required: true },
    username: { type: String, min: 3, required: true, unique: true },
    email: {type: String, min: 3, required: true, unique: true },
    password: { type: String, min: 8, required: true},
    isEmailVerify: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);