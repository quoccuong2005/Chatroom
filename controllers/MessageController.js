const Message = require('../models/Message');
const User = require('../models/User');

class MessageController {
    // Lưu message mới
    static async createMessage(req, res) {
        try {
            const { username, text, room = 'general' } = req.body;

            // Tìm user để lấy ID
            const user = await User.findOne({ name: username });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Tạo message mới
            const newMessage = new Message({
                sender: user._id,
                room: room,
                content: text,
                messageType: 'text'
            });

            await newMessage.save();

            // Populate sender info để trả về
            await newMessage.populate('sender', 'name');

            res.status(201).json({
                success: true,
                message: "Message saved successfully",
                data: {
                    id: newMessage._id,
                    sender: newMessage.sender.name,
                    content: newMessage.content,
                    room: newMessage.room,
                    createdAt: newMessage.createdAt
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error saving message",
                error: error.message
            });
        }
    }

    // Lấy messages của room
    static async getMessages(req, res) {
        try {
            const { room = 'general' } = req.query;
            const limit = parseInt(req.query.limit) || 50;

            const messages = await Message.find({ room })
                .populate('sender', 'name')
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();

            // Reverse để tin nhắn cũ nhất ở trên
            messages.reverse();

            res.status(200).json({
                success: true,
                data: messages.map(msg => ({
                    id: msg._id,
                    sender: msg.sender ? msg.sender.name : 'System',
                    content: msg.content,
                    room: msg.room,
                    messageType: msg.messageType,
                    createdAt: msg.createdAt
                }))
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching messages",
                error: error.message
            });
        }
    }

    // Lưu system message (join/leave)
    static async createSystemMessage(req, res) {
        try {
            const { content, room = 'general' } = req.body;

            const systemMessage = new Message({
                sender: null, // System message không có sender
                room: room,
                content: content,
                messageType: 'system'
            });

            await systemMessage.save();

            res.status(201).json({
                success: true,
                message: "System message saved",
                data: {
                    id: systemMessage._id,
                    content: systemMessage.content,
                    room: systemMessage.room,
                    messageType: systemMessage.messageType,
                    createdAt: systemMessage.createdAt
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error saving system message",
                error: error.message
            });
        }
    }

    // Xóa tất cả messages (for testing)
    static async clearMessages(req, res) {
        try {
            await Message.deleteMany({});

            res.status(200).json({
                success: true,
                message: "All messages cleared successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error clearing messages",
                error: error.message
            });
        }
    }
}

module.exports = MessageController;