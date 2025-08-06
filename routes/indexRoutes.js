const user = require("./userRoutes");
const message = require("./messageRoutes");
module.exports = app => {
    app.use("/user", user);
    app.use("/chat", message);

}