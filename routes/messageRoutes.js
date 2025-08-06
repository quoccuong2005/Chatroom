const express = require('express');
const router = express.Router();

const MessageController = require('../controllers/MessageController');

// GET /api/messages - Lấy messages của room
router.get('/', MessageController.getMessages);

// POST /api/messages - Tạo message mới  
router.post('/', MessageController.createMessage);

// POST /api/messages/system - Tạo system message
router.post('/system', MessageController.createSystemMessage);

// DELETE /api/messages/clear - Xóa tất cả messages (for testing)
router.delete('/clear', MessageController.clearMessages);

module.exports = router;