const User = require("../models/User")

class UserController {
    // Check if user is logged in via cookie
    static async checkLogin(req, res) {
        try {
            const token = req.cookies.tokenUser;

            if (!token) {
                return res.status(200).json({
                    success: false,
                    message: "No token found",
                    isLoggedIn: false
                });
            }

            const user = await User.findOne({ tokenUser: token });

            if (!user) {
                return res.status(200).json({
                    success: false,
                    message: "Invalid token",
                    isLoggedIn: false
                });
            }

            res.status(200).json({
                success: true,
                message: "User is logged in",
                isLoggedIn: true,
                user: {
                    id: user._id,
                    name: user.name,
                    status: user.status,
                    joinedAt: user.joinedAt
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error checking login",
                isLoggedIn: false,
                error: error.message
            });
        }
    }
    // Get all users
    static async getAllUsers(req, res) {
        try {
            const users = await User.find({}).select('name password tokenUser joinedAt status socketId');
            res.status(200).json({
                success: true,
                data: users
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching users",
                error: error.message
            });
        }
    }

    // Render home page
    static async renderHomePage(req, res) {
        try {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error rendering page"
            });
        }
    }

    // Create new user (for testing)
    static async createUser(req, res) {
        try {
            const { username, password } = req.body;
            console.log("Received data:", { username, password });

            // Kiểm tra user đã tồn tại chưa
            const existingUser = await User.findOne({ name: username, password: password });

            if (existingUser) {
                return res.status(200).json({
                    success: true,
                    message: "User already exists",
                    data: {
                        id: existingUser._id,
                        name: existingUser.name,
                        status: existingUser.status,
                        joinedAt: existingUser.joinedAt
                    }
                });
            }

            const newUser = new User({
                name: username,
                password: password,
                joinedAt: new Date(),
                status: 'online'
            });

            await newUser.save();

            // Set cookie với thời hạn 7 ngày
            res.cookie("tokenUser", newUser.tokenUser, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
                secure: false // Set true nếu dùng HTTPS
            });

            res.status(201).json({
                success: true,
                message: "User created successfully",
                data: {
                    id: newUser._id,
                    name: newUser.name,
                    password: newUser.password,
                    tokenUser: newUser.tokenUser,
                    status: newUser.status,
                    joinedAt: newUser.joinedAt
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating user",
                error: error.message
            });
        }
    }

    // Logout user  
    static async logout(req, res) {
        try {
            // Clear cookie
            res.clearCookie("tokenUser");

            res.status(200).json({
                success: true,
                message: "Logged out successfully"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error during logout",
                error: error.message
            });
        }
    }
}

module.exports = UserController;