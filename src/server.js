// ==============================================================
// Global Config

import express from "express";
import { Server } from "socket.io";
import http from "http";
import { on } from "events";

const PORT = process.env.PORT || 5000;
const app = express();

const zt = (arg) => {
  console.log("Test::::::::::::::::::::::::::::::::::::::::::");
  console.log(arg);
};

// ==============================================================
// Express Config

app.set("views", __dirname + "/views");
app.set("view engine", "pug");
app.use("/static", express.static("dist"));

// ==============================================================
// Controller

const handleGetChat = (req, res, next) => {
  return res.render("chat");
};

const handlehome = (req, res, next) => {
  return res.render("home");
};

// ==============================================================
// Routing

app.get("/", handlehome);
app.get("/chat", handleGetChat);
app.get("/*", (req, res) => {
  res.redirect("/");
});

// ==============================================================
// Server Opening

const handleServerListen = () => {
  console.log(`🤔 Server listening port ${PORT}`);
};

const httpServer = app.listen(PORT, handleServerListen);
const io = new Server(httpServer);

// ==============================================================
// SocketIO

io.on("connection", (socket) => {
  console.log("connected");
  socket.on("enter__room", (roomName) => {
    zt("enter room heard");
    socket.join(roomName);
    socket.to(roomName).emit("receiver__came");
    zt("receiver came fired");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

// io.on("connection", (socket) => {
//   const createdRooms = () => {
//     let roomArray = [];
//     const ids = io.sockets.adapter.sids;
//     const rooms = io.sockets.adapter.rooms.forEach((v, k) => {
//       if (ids.has(k) === false) {
//         roomArray.push(k);
//       }
//     });
//     return roomArray;
//   };

//   socket.on("Set_Nickname", (nickname, done) => {
//     socket["nickname"] = nickname;
//     done(nickname, createdRooms());
//   });

//   socket.on("Enter_Room", (room, done) => {
//     const isNew = !createdRooms().includes(room);
//     socket.join(room);
//     if (isNew) {
//       io.emit("Update_Room", createdRooms());
//     }
//     socket.to(room).emit("Add_Alert", socket.nickname, "entered the room");
//     done(room);
//   });

//   socket.on("Send_Message", (msg, room, done) => {
//     done("You", msg);
//     socket.to(room).emit("Add_Message", socket.nickname, msg);
//   });

//   socket.on("disconnecting", () => {
//     socket.rooms.forEach((room) => {
//       socket.to(room).emit("Add_Alert", socket.nickname, "left the room");
//     });
//   });

//   socket.on("Change_Nickname", (newNickname, done) => {
//     socket.nickname = newNickname;
//     done(newNickname);
//   });

//   socket.on("Exit_Room", (room, done) => {
//     socket.leave(room);
//     socket.to(room).emit("Add_Alert", socket.nickname, "left the room");
//     const isEmpty = !io.sockets.adapter.rooms.has(room);
//     if (isEmpty) {
//       io.emit("Update_Room", createdRooms());
//     }
//     done(socket.nickname, createdRooms());
//   });
// });
