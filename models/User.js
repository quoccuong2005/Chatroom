const mongoose = require("mongoose");
const generateRandomString = require("../helper/generate")
const userSchema = new mongoose.Schema({
    name: String,
    password: String,
    tokenUser: {
        type: String,
        default: generateRandomString(20)
    },
    joinedAt: Date,
    socketId: String,
    status: String

},
);
const User = mongoose.model('User', userSchema, 'Users');
module.exports = User;