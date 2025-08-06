// Load environment variables
require('dotenv').config()

const express = require("express")
const path = require("path")
const cookieParser = require('cookie-parser')

const database = require("./config/database")
database.connect()

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

const server = require("http").createServer(app);

const io = require("socket.io")(server)

app.use(express.static(path.join(__dirname, "/public")))

// Import routes
const userRoutes = require('./routes/userRoutes')
const messageRoutes = require('./routes/messageRoutes')

// Use routes
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)

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

const PORT = process.env.PORT
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})