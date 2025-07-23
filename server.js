const express = require("express")
const path = require("path")

const app = express()
const server = require("http").createServer(app);

const io = require("socket.io")(server)

app.use(express.static(path.join(__dirname, "/public")))

// Route cho trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

io.on("connection", (socket => {
    socket.on("newuser", (username) => {
        socket.broadcast.emit("update", username + " has joined the chat")
    })
    socket.on("exituser", (username) => {
        socket.broadcast.emit("update", username + " has left the chat")
    })
    socket.on("chat", (message) => {
        socket.broadcast.emit("chat", message)
    })
}))

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})