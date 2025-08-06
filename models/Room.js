const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    name: String,
    joinedAt: Date,
    socketId: String,
    status: String

});
const Room = mongoose.model('Room', roomSchema, 'Rooms');
module.exports = Room;  
