// import express, { Request, Response } from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";
// import { Room, Player } from './types';

// // Initialize the app
// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Allow all origins for simplicity
//     methods: ["GET", "POST"],
//   },
// });

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Data structures for rooms and games
// const rooms: Record<string, string[]> = {}; // Room ID -> Array of player names
// const games: Record<string, { board: string[]; currentPlayer: string }> = {}; // Room ID -> Game State

// // Utility function to check for a winner
// const checkWinner = (board: string[]): string | null => {
//   const winningCombinations = [
//     [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
//     [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
//     [0, 4, 8], [2, 4, 6],            // Diagonals
//   ];

//   for (const [a, b, c] of winningCombinations) {
//     if (board[a] && board[a] === board[b] && board[a] === board[c]) {
//       return board[a]; // Return the winner ("X" or "O")
//     }
//   }
//   return null;
// };

// // Utility function to check for a draw
// const isDraw = (board: string[]): boolean => {
//   return board.every((cell) => cell !== null);
// };

// // Socket.IO connection
// io.on("connection", (socket) => {
//   console.log("A user connected");

//   // Join a room
//   socket.on("joinRoom", ({ name, roomId }: { name: string; roomId: string }) => {
//     if (!rooms[roomId]) {
//       rooms[roomId] = [];
//     }

//     if (rooms[roomId].length >= 2) {
//       socket.emit("roomFull");
//       return;
//     }

//     rooms[roomId].push(name);
//     socket.join(roomId);

//     // Initialize game state if this is the first player
//     if (!games[roomId]) {
//       games[roomId] = {
//         board: Array(9).fill(null),
//         currentPlayer: "X",
//       };
//     }

//     // Assign "X" to the first player and "O" to the second
//     const playerSymbol = rooms[roomId].length === 1 ? "X" : "O";
//     socket.emit("playerAssignment", playerSymbol);

//     // Notify all players in the room
//     io.to(roomId).emit("roomUpdate", rooms[roomId]);
//   });

//   // Handle a move
//   socket.on("playMove", ({ index, roomId }: { index: number; roomId: string }) => {
//     const game = games[roomId];
//     if (!game) return;

//     // Validate the move
//     if (game.board[index] || game.currentPlayer !== (game.board.filter((cell) => cell).length % 2 === 0 ? "X" : "O")) {
//       return;
//     }

//     // Update the board and switch the player
//     game.board[index] = game.currentPlayer;
//     const winner = checkWinner(game.board);
//     const draw = isDraw(game.board);

//     if (winner) {
//       io.to(roomId).emit("gameEnd", { winner, board: game.board });
//       delete games[roomId]; // Reset the game after a win
//     } else if (draw) {
//       io.to(roomId).emit("gameEnd", { winner: null, board: game.board }); // Null for a draw
//       delete games[roomId]; // Reset the game after a draw
//     } else {
//       // Switch the player
//       game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";
//       io.to(roomId).emit("boardUpdate", { board: game.board, currentPlayer: game.currentPlayer });
//     }
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//     // Remove player from room and notify others
//     for (const roomId in rooms) {
//       const playerIndex = rooms[roomId].indexOf(socket.id);
//       if (playerIndex !== -1) {
//         rooms[roomId].splice(playerIndex, 1);
//         io.to(roomId).emit("roomUpdate", rooms[roomId]);

//         // Reset game if no players are left
//         if (rooms[roomId].length === 0) {
//           delete rooms[roomId];
//           delete games[roomId];
//         }
//         break;
//       }
//     }
//   });
// });

// // API Route for creating room IDs
// // app.post("/createRoom", (req: Request, res: Response) => {
// //   const roomId = Math.random().toString(36).substr(2, 9);
// //   rooms[roomId] = [];
// //   res.status(201).json({ roomId });
// // });

// // Server setup
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });













































import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Room, Player } from './types';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map<string, Room>();

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function checkWinner(board: string[]): string | null {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', ({ name }, callback) => {
    const roomId = generateRoomId();
    const room: Room = {
      id: roomId,
      players: [{
        id: socket.id,
        name,
        symbol: 'X'
      }],
      board: Array(9).fill(''),
      currentTurn: socket.id,
      winner: null
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    callback({ roomId });
  });

  socket.on('joinRoom', ({ name, roomId }, callback) => {
    const room = rooms.get(roomId);
    
    if (!room || room.players.length >= 2) {
      callback({ success: false });
      return;
    }

    room.players.push({
      id: socket.id,
      name,
      symbol: 'O'
    });

    socket.join(roomId);
    io.to(roomId).emit('gameUpdate', room);
    callback({ success: true });
  });

  socket.on('getRoomState', ({ roomId }, callback) => {
    const room = rooms.get(roomId);
    if (room) {
      callback(room);
    }
  });

  socket.on('makeMove', ({ roomId, index }) => {
    const room = rooms.get(roomId);
    if (!room || room.winner || room.board[index] || room.currentTurn !== socket.id) {
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    room.board[index] = player.symbol;
    room.winner = checkWinner(room.board);
    room.currentTurn = room.players.find(p => p.id !== socket.id)?.id || socket.id;

    io.to(roomId).emit('gameUpdate', room);
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      if (room.players.some(p => p.id === socket.id)) {
        io.to(roomId).emit('playerDisconnected');
        rooms.delete(roomId);
      }
    });
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});