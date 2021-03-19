const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const {formatMessage } = require("./utils/messages");
const { format } = require("path");
const { userJoin, getCurrentUser, userLeave, getUsers, getCurrentUserByName } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const admin = "admin";

//The socketio middlewares:
io.on("connection", (socket) => {
  console.log("New user connected!");
  socket.on("joinRoom", ({ username }) => {
    console.log("in joinroom");
    const user = userJoin(socket.id, username);
    socket.join(user.room);
    socket.emit("message", formatMessage(admin, "Welcome to Accord!"));

    socket.broadcast.emit(
      "message",
      formatMessage(admin, `${user.username} has joined the chat!`)
    );

    //Sending out users info
    io.emit('users', getUsers());
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if(user) {
      io.emit("message", formatMessage(admin, user.username + " has left the chat!"));
      io.emit('users', getUsers());
    }
    
  });

  //Private messages
  socket.on("privateMessage", ({msg, sender, reciever}) => {
    const recipient = getCurrentUserByName(reciever);
    const senderName = getCurrentUser(sender);
    console.log("sendername: "+senderName.username);
    io.to(recipient.id).emit("privateMessage", formatMessage(senderName.username, msg));
  })

  //Listen for the chat message (basically catch the emission)
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    console.log(user);
    io.emit("message", formatMessage(user.username, msg));
  });
});

const PORT = 3000 || process.env.PORT;

var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
server.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});
