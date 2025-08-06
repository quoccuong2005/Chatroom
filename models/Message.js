const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return this.messageType !== 'system';
        }
    },
    room: {
        type: String,
        required: true,
        default: 'general'
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index cho performance
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema, 'Messages');
module.exports = Message;