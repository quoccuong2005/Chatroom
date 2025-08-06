const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');

// GET /api/users/check-login - Check login status
router.get('/check-login', UserController.checkLogin);

// POST /api/users/logout - Logout user
router.post('/logout', UserController.logout);

// GET /api/users - Get all users
router.get('/', UserController.getAllUsers);

// POST /api/users - Create new user (for testing)
router.post('/', UserController.createUser);

module.exports = router;