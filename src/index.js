const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const host = "192.168.0.123";
const port = 5000;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Replace with your actual ngrok URL
    methods: ["GET", "POST"], // Optionally specify allowed methods
    credentials: true, // If you need credentials to be included in the request
  },
});

io.on("connection", (socket) => {
  console.log("New client connected: ", socket.id);

  // Join Room
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
  });

  // Handle offer
  socket.on("offer", (offer, roomId, userId) => {
    socket.broadcast.to(roomId).emit("offer", offer, userId);
  });

  // Handle answer
  socket.on("answer", (answer, roomId, userId) => {
    socket.broadcast.to(roomId).emit("answer", answer, userId);
  });

  // Handle ICE candidate
  socket.on("ice-candidate", (candidate, roomId, userId) => {
    socket.broadcast.to(roomId).emit("ice-candidate", candidate, userId);
  });

  // Handle chat message
  socket.on("send-message", (message, roomId) => {
    io.to(roomId).emit("receive-message", message);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to our Node.js application!");
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
