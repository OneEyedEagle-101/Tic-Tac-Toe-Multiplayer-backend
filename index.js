const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
app.use(cors());
const port = process.env.PORT;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let hash = new Map();

io.on("connection", (socket) => {
  let gameObject = {
    roomId: "",
    player1Name: "",
    player2Name: "",
    gameArray: [ "\u00A0",
      "\u00A0",
      "\u00A0",
      "\u00A0",
      "\u00A0",
      "\u00A0",
      "\u00A0",
      "\u00A0",
      "\u00A0"],
    player1Sign: "",
    player2Sign: "",
    player1Turn: false,
    player2Turn: false,
    player1socketId: "",
    player2socketId: "",
    isPlayer1winner: false,
    isPlayer2winner: false,
  };

  socket.on("create-room", async (name) => {
    gameObject.player1Name = name;
    gameObject.player1socketId = socket.id;
    socket.join(socket.id.substring(1, 6));
    gameObject.roomId = socket.id.substring(1, 6);
    let roomId = gameObject.roomId;
    console.log(roomId);
    hash.set(gameObject.roomId, gameObject);
    const sign = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
    if (sign == 1) {
      hash.get(roomId).player1Sign = "X";
      hash.get(roomId).player2Sign = "O";
    } else {
      hash.get(roomId).player2Sign = "X";
      hash.get(roomId).player1Sign = "O";
    }
    const firstToPlay = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
    if (firstToPlay == 1) {
      hash.get(roomId).player1Turn = true;
    } else {
      hash.get(roomId).player2Turn = true;
    }
    console.log(hash.get(roomId));
    io.to(socket.id).emit("room-created", gameObject);
  });

  socket.on("joining-room", async ({ username, roomId }) => {
    if ((await io.in(roomId).fetchSockets()).length == 1) {
      socket.join(roomId);
      hash.get(roomId).player2Name = username;
      hash.get(roomId).player2socketId = socket.id;
      socket.to(roomId).emit("user-joined", hash.get(roomId));
      io.to(socket.id).emit("joining-status", hash.get(roomId));
    } else {
      console.log(false);
      io.to(socket.id).emit("joining-status", "error");
    }
  });

  socket.on("game-started", (roomId) => {
    console.log(roomId);
    console.log(hash.get(roomId));
    socket.emit("getfirst-object", hash.get(roomId));
  });

  socket.on("played", ({ gameArr, roomId }) => {
    hash.get(roomId).gameArray = gameArr;
    if (
      (hash.get(roomId).gameArray[0] == "X" &&
        hash.get(roomId).gameArray[1] == "X" &&
        hash.get(roomId).gameArray[2] == "X") ||
      (hash.get(roomId).gameArray[3] == "X" &&
        hash.get(roomId).gameArray[4] == "X" &&
        hash.get(roomId).gameArray[5] == "X") ||
      (hash.get(roomId).gameArray[6] == "X" &&
        hash.get(roomId).gameArray[7] == "X" &&
        hash.get(roomId).gameArray[8] == "X") ||
      (hash.get(roomId).gameArray[0] == "X" &&
        hash.get(roomId).gameArray[3] == "X" &&
        hash.get(roomId).gameArray[6] == "X") ||
      (hash.get(roomId).gameArray[1] == "X" &&
        hash.get(roomId).gameArray[4] == "X" &&
        hash.get(roomId).gameArray[7] == "X") ||
      (hash.get(roomId).gameArray[2] == "X" &&
        hash.get(roomId).gameArray[5] == "X" &&
        hash.get(roomId).gameArray[8] == "X") ||
      (hash.get(roomId).gameArray[0] == "X" &&
        hash.get(roomId).gameArray[4] == "X" &&
        hash.get(roomId).gameArray[8] == "X") ||
      (hash.get(roomId).gameArray[2] == "X" &&
        hash.get(roomId).gameArray[4] == "X" &&
        hash.get(roomId).gameArray[6] == "X")
    ) {
      if (hash.get(roomId).player1Sign == "X") {
        hash.get(roomId).isPlayer1winner = true;
      } else {
        hash.get(roomId).isPlayer2winner = true;
      }
    } else if (
      (hash.get(roomId).gameArray[0] == "O" &&
        hash.get(roomId).gameArray[1] == "O" &&
        hash.get(roomId).gameArray[2] == "O") ||
      (hash.get(roomId).gameArray[3] == "O" &&
        hash.get(roomId).gameArray[4] == "O" &&
        hash.get(roomId).gameArray[5] == "O") ||
      (hash.get(roomId).gameArray[6] == "O" &&
        hash.get(roomId).gameArray[7] == "O" &&
        hash.get(roomId).gameArray[8] == "O") ||
      (hash.get(roomId).gameArray[0] == "O" &&
        hash.get(roomId).gameArray[3] == "O" &&
        hash.get(roomId).gameArray[6] == "O") ||
      (hash.get(roomId).gameArray[1] == "O" &&
        hash.get(roomId).gameArray[4] == "O" &&
        hash.get(roomId).gameArray[7] == "O") ||
      (hash.get(roomId).gameArray[2] == "O" &&
        hash.get(roomId).gameArray[5] == "O" &&
        hash.get(roomId).gameArray[8] == "O") ||
      (hash.get(roomId).gameArray[0] == "O" &&
        hash.get(roomId).gameArray[4] == "O" &&
        hash.get(roomId).gameArray[8] == "O") ||
      (hash.get(roomId).gameArray[2] == "O" &&
        hash.get(roomId).gameArray[4] == "O" &&
        hash.get(roomId).gameArray[6] == "O")
    ) {
      if (hash.get(roomId).player1Sign == "O") {
        hash.get(roomId).isPlayer1winner = true;
      } else {
        hash.get(roomId).isPlayer2winner = true;
      }
    }
    if (hash.get(roomId).player1Turn) {
      hash.get(roomId).player1Turn = false;
      hash.get(roomId).player2Turn = true;
    } else if (hash.get(roomId).player2Turn) {
      hash.get(roomId).player2Turn = false;
      hash.get(roomId).player1Turn = true;
    }
    console.log(hash.get(roomId));
    io.to(roomId).emit("played", hash.get(roomId));
  });

  //socket.to(gameObject.roomId).emit("starting-game");
});

server.listen(port, () => {
  console.info("Server started on ${port}");
});
