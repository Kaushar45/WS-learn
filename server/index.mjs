import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const clients = {};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User Connected");
  console.log(socket.id);

  socket.on("info", (data) => {
    console.log(data);
    if (!data.userId) {
      return;
    }
    clients[data.userId] = { socketId: socket.id, userName: data.userName };
    console.log(clients);
  });
  socket.on("message", (data) => {
    console.log(data);

    if (!clients[data.toUserId] || clients[data.toUserId].socketId) {
      return;
    }
    io.to(clients[data.toUserId].socketId).emit("message", {
      fromUserId: data.fromUserId,
      fromUserName: data.fromUserName,
      message: data.message,
    });
  });
  socket.on("disconnect", (info) => {
    console.log("user has left");
    console.log(info);
  });
});

app.get("/", (req, res, next) => {
  res.send("send");
});

httpServer.listen(5000, (e) => {
  if (e) {
    return console.log(e);
  }
  console.log("server started on 5000");
});
