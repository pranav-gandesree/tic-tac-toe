// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import cors from "cors";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: "http://localhost:5173" },
// });

// const rooms: Record<string, { players: string[] }> = {};

// io.on("connection", (socket) => {
//   console.log("User connected");

//   socket.on("joinRoom", ({ name, roomId }) => {
//     if (!rooms[roomId]) {
//       rooms[roomId] = { players: [] };
//     }

//     const players = rooms[roomId].players;
//     if (players.length < 2) {
//       players.push(name);
//       socket.join(roomId);

//       const playerSymbol = players.length === 1 ? "X" : "O";
//       socket.emit("playerAssignment", playerSymbol);
//     }
//   });

//   socket.on("playMove", ({ newBoard, roomId }) => {
//     const nextPlayer = newBoard.filter((cell: any) => cell).length % 2 === 0 ? "X" : "O";
//     io.to(roomId).emit("boardUpdate", newBoard, nextPlayer);
//   });
// });

// server.listen(5000, () => console.log("Server running on http://localhost:5000"));






















import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

// Initialize the app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Data structures for rooms and games
const rooms: Record<string, string[]> = {}; // Room ID -> Array of player names
const games: Record<string, { board: string[]; currentPlayer: string }> = {}; // Room ID -> Game State

// Utility function to check for a winner
const checkWinner = (board: string[]): string | null => {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6],            // Diagonals
  ];

  for (const [a, b, c] of winningCombinations) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Return the winner ("X" or "O")
    }
  }
  return null;
};

// Utility function to check for a draw
const isDraw = (board: string[]): boolean => {
  return board.every((cell) => cell !== null);
};

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join a room
  socket.on("joinRoom", ({ name, roomId }: { name: string; roomId: string }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    if (rooms[roomId].length >= 2) {
      socket.emit("roomFull");
      return;
    }

    rooms[roomId].push(name);
    socket.join(roomId);

    // Initialize game state if this is the first player
    if (!games[roomId]) {
      games[roomId] = {
        board: Array(9).fill(null),
        currentPlayer: "X",
      };
    }

    // Assign "X" to the first player and "O" to the second
    const playerSymbol = rooms[roomId].length === 1 ? "X" : "O";
    socket.emit("playerAssignment", playerSymbol);

    // Notify all players in the room
    io.to(roomId).emit("roomUpdate", rooms[roomId]);
  });

  // Handle a move
  socket.on("playMove", ({ index, roomId }: { index: number; roomId: string }) => {
    const game = games[roomId];
    if (!game) return;

    // Validate the move
    if (game.board[index] || game.currentPlayer !== (game.board.filter((cell) => cell).length % 2 === 0 ? "X" : "O")) {
      return;
    }

    // Update the board and switch the player
    game.board[index] = game.currentPlayer;
    const winner = checkWinner(game.board);
    const draw = isDraw(game.board);

    if (winner) {
      io.to(roomId).emit("gameEnd", { winner, board: game.board });
      delete games[roomId]; // Reset the game after a win
    } else if (draw) {
      io.to(roomId).emit("gameEnd", { winner: null, board: game.board }); // Null for a draw
      delete games[roomId]; // Reset the game after a draw
    } else {
      // Switch the player
      game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";
      io.to(roomId).emit("boardUpdate", { board: game.board, currentPlayer: game.currentPlayer });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    // Remove player from room and notify others
    for (const roomId in rooms) {
      const playerIndex = rooms[roomId].indexOf(socket.id);
      if (playerIndex !== -1) {
        rooms[roomId].splice(playerIndex, 1);
        io.to(roomId).emit("roomUpdate", rooms[roomId]);

        // Reset game if no players are left
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
          delete games[roomId];
        }
        break;
      }
    }
  });
});

// API Route for creating room IDs
// app.post("/createRoom", (req: Request, res: Response) => {
//   const roomId = Math.random().toString(36).substr(2, 9);
//   rooms[roomId] = [];
//   res.status(201).json({ roomId });
// });

// Server setup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
