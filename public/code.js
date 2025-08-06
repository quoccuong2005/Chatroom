const app = document.querySelector(".app");
const socket = io();

let uname;

// Check login status when page loads
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/users/check-login');
        const result = await response.json();

        if (result.success && result.isLoggedIn) {
            // User đã đăng nhập - chuyển thẳng vào chat
            uname = result.user.name;
            app.querySelector(".join-screen").classList.remove("active");
            app.querySelector(".chat-screen").classList.add("active");

            // Load messages từ database
            await loadMessages('general');

            // Emit socket event để join chat
            socket.emit("newuser", uname);

            showToast(`Welcome back, ${uname}!`, 'success');
            renderMessage("update", `${uname} has returned to the chat`);

            console.log("Auto-logged in:", result.user);
        } else {
            // Chưa đăng nhập - hiển thị join screen
            app.querySelector(".join-screen").classList.add("active");
            app.querySelector(".chat-screen").classList.remove("active");
        }
    } catch (error) {
        console.error("Error checking login:", error);
        // Nếu có lỗi, hiển thị join screen
        app.querySelector(".join-screen").classList.add("active");
        app.querySelector(".chat-screen").classList.remove("active");
    }
});

// Hàm load messages từ database
const loadMessages = async (room = 'general') => {
    try {
        const response = await fetch(`/api/messages?room=${room}&limit=50`);
        const result = await response.json();

        if (result.success) {
            const messageContainer = app.querySelector(".chat-screen .messages");
            messageContainer.innerHTML = ''; // Clear current messages

            result.data.forEach(msg => {
                if (msg.messageType === 'system') {
                    renderMessage("update", msg.content);
                } else if (msg.sender === uname) {
                    renderMessage("my", {
                        username: msg.sender,
                        text: msg.content
                    });
                } else {
                    renderMessage("other", {
                        username: msg.sender,
                        text: msg.content
                    });
                }
            });

            console.log(`Loaded ${result.data.length} messages from database`);
        }
    } catch (error) {
        console.error("Error loading messages:", error);
    }
};
const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
    `;

    document.body.appendChild(toast);

    // Hiển thị toast
    setTimeout(() => toast.style.opacity = '1', 100);

    // Ẩn và xóa toast sau 3 giây
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
};

app.querySelector(".join-screen #join-user").addEventListener("click", async (e) => {
    let username = app.querySelector(".join-screen #username").value;
    let password = app.querySelector(".join-screen #password").value;

    if (username.length == 0) {
        showToast("Please enter a username!", 'error');
        return;
    }

    if (password.length == 0) {
        showToast("Please enter a password!", 'error');
        return;
    }

    try {
        // Tạo user trong database trước
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            // Nếu tạo user thành công hoặc user đã tồn tại
            socket.emit("newuser", username);
            uname = username;
            app.querySelector(".join-screen").classList.remove("active");
            app.querySelector(".chat-screen").classList.add("active");

            // Load messages từ database
            await loadMessages('general');

            // Hiển thị thông báo cho user
            if (result.message === "User already exists") {
                // Thông báo user đã tồn tại
                showToast(`Welcome back, ${username}!`, 'info');

                // Lưu system message
                try {
                    await fetch('/api/messages/system', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: `${username} has rejoined the chat`,
                            room: 'general'
                        })
                    });
                } catch (error) {
                    console.error("Error saving system message:", error);
                }

                renderMessage("update", `${username} has rejoined the chat`);
                console.log("User already exists:", result.data);
            } else {
                // Thông báo user mới
                showToast(`Welcome ${username}! Account created successfully.`, 'success');

                // Lưu system message
                try {
                    await fetch('/api/messages/system', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: `${username} joined the chat for the first time`,
                            room: 'general'
                        })
                    });
                } catch (error) {
                    console.error("Error saving system message:", error);
                }

                renderMessage("update", `${username} joined the chat for the first time`);
                console.log("New user created:", result.data);
            }
        } else {
            // Nếu có lỗi từ API
            showToast(`Error: ${result.message}`, 'error');
            console.error("API Error:", result);
        }
    } catch (error) {
        console.error("Network/API Error:", error);

        // Hiển thị thông báo lỗi cho user
        showToast(`Connection error! Joining in offline mode.`, 'error');

        // Vẫn cho phép join chat (fallback mode)
        socket.emit("newuser", username);
        uname = username;
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");

        // Thông báo trong chat
        renderMessage("update", `${username} joined (offline mode - database unavailable)`);
    }
})
app.querySelector(".chat-screen #send-message").addEventListener("click", async (e) => {
    let message = app.querySelector(".chat-screen #message-input").value;
    if (message.length == 0) {
        return;
    }

    try {
        // Lưu message vào database
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: uname,
                text: message,
                room: 'general'
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log("Message saved to database:", result.data);
        }
    } catch (error) {
        console.error("Error saving message:", error);
    }

    // Hiển thị message ngay lập tức
    renderMessage("my", {
        username: uname,
        text: message
    });

    // Gửi qua Socket.IO
    socket.emit("chat", {
        username: uname,
        text: message
    });

    app.querySelector(".chat-screen #message-input").value = "";
})

app.querySelector(".chat-screen #exit-chat").addEventListener("click", async (e) => {
    try {
        // Xóa cookie token
        await fetch('/api/users/logout', { method: 'POST' });

        socket.emit("exituser", uname);
        showToast("Logged out successfully!", 'info');

        // Reload trang để về join screen
        setTimeout(() => {
            window.location.href = window.location.href;
        }, 1000);

    } catch (error) {
        console.error("Logout error:", error);
        socket.emit("exituser", uname);
        window.location.href = window.location.href;
    }
})

socket.on("update", (update) => {
    renderMessage("update", update);
})
socket.on("chat", (message) => {
    renderMessage("other", message);
})

const renderMessage = (type, message) => {
    let messageContainer = app.querySelector(".chat-screen .messages");
    if (type == "my") {
        let el = document.createElement("div");
        el.setAttribute("class", "message my-message");
        el.innerHTML = `
        <div>
            <span class="username">You</span>
            <span class="text">${message.text}</span>
        </div>
        `
        messageContainer.appendChild(el);
    } else if (type == "other") {
        let el = document.createElement("div");
        el.setAttribute("class", "message other-message");
        el.innerHTML = `
        <div>
            <span class="username">${message.username}</span>
            <span class="text">${message.text}</span>
        </div>
        `
        messageContainer.appendChild(el);
    }
    else if (type == "update") {
        let el = document.createElement("div");
        el.setAttribute("class", "update");
        el.innerText = message;
        messageContainer.appendChild(el);
    }
    // Scroll chat to end
    messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;

}