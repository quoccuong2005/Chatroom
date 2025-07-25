const app = document.querySelector(".app");
const socket = io();

let uname;

app.querySelector(".join-screen #join-user").addEventListener("click", (e) => {
    let username = app.querySelector(".join-screen #username").value;
    if (username.length == 0) {
        return;
    }
    socket.emit("newuser", username);
    uname = username;
    app.querySelector(".join-screen").classList.remove("active");
    app.querySelector(".chat-screen").classList.add("active");
})
app.querySelector(".chat-screen #send-message").addEventListener("click", (e) => {
    let message = app.querySelector(".chat-screen #message-input").value;
    if (message.length == 0) {
        return;
    }
    renderMessage("my", {
        username: uname,
        text: message
    });
    socket.emit("chat", {
        username: uname,
        text: message
    });
    app.querySelector(".chat-screen #message-input").value = "";
})

app.querySelector(".chat-screen #exit-chat").addEventListener("click", (e) => {
    socket.emit("exituser", uname);
    window.location.href = window.location.href;
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