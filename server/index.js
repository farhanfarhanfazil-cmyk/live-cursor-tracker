const express = require("express");
const http = require("http");
const { Server } = require("socket.io");


const app = express();
const server = http.createServer(app);
const users = {};
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("user-joined", (data) => {
        users[socket.id] = {
            username: data.username,
            color: data.color,
            status: "active"
        };
        io.emit("users-update", users);
    });

    socket.on("cursor-move", (data) => {
        const user = users[socket.id];
        if (!user) return;

        socket.broadcast.emit("cursor-update", {
            id: socket.id,
            x: data.x,
            y: data.y,
            color: user.color,
            username: user.username
        });
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("users-update", users);

        io.emit("user-disconnected", socket.id);
        console.log("User disconnected:", socket.id);
    });
    socket.on("status-update", (status) => {
    if (!users[socket.id]) return;

    users[socket.id].status = status;

    // Broadcast updated presence
    io.emit("users-update", users);
});

});


server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
