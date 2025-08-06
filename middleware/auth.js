const User = require('../models/User');

const checkAuth = async (req, res, next) => {
    try {
        const token = req.cookies.tokenUser;

        if (token) {
            const user = await User.findOne({ tokenUser: token });
            if (user) {
                req.user = user;
                return next();
            }
        }

        // Nếu không có token hoặc token không hợp lệ
        req.user = null;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = checkAuth;
