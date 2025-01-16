import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Game: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [player, setPlayer] = useState("");
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    const name = searchParams.get("name") || "";
    const roomId = searchParams.get("roomId") || "";
    socket.emit("joinRoom", { name, roomId });

    socket.on("playerAssignment", (player: string) => {
      setPlayer(player);
    });

    socket.on("boardUpdate", (newBoard: string[], nextPlayer: string) => {
      setBoard(newBoard);
      setCurrentPlayer(nextPlayer);
    });

    socket.on("gameEnd", ({ winner, board }: { winner: string | null; board: string[] }) => {
      setBoard(board);
      setWinner(winner);
    });

    return () => {
      socket.disconnect();
    };
  }, [searchParams]);

  const handleCellClick = (index: number) => {
    if (!board[index] && player === currentPlayer && !winner) {
      const newBoard = [...board];
      newBoard[index] = player;
      socket.emit("playMove", { newBoard, roomId: searchParams.get("roomId") });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Tic Tac Toe</h1>
      {winner ? (
        <div className="mb-4 text-center">
          {winner === null ? (
            <p className="text-xl font-bold text-gray-700">It's a draw!</p>
          ) : (
            <p className="text-xl font-bold text-green-600">
              Player {winner} wins!
            </p>
          )}
          <button
            onClick={() => {
              setBoard(Array(9).fill(null));
              setWinner(null);
            }}
            className="mt-4 p-2 bg-blue-500 text-white rounded"
          >
            Restart Game
          </button>
        </div>
      ) : (
        <>
          <p className="mb-4">
            You are: <span className="font-bold">{player}</span>
          </p>
          <div className="grid grid-cols-3 gap-4">
            {board.map((cell, index) => (
              <div
                key={index}
                onClick={() => handleCellClick(index)}
                className="w-20 h-20 flex items-center justify-center bg-white border rounded text-2xl font-bold"
              >
                {cell}
              </div>
            ))}
          </div>
          <p className="mt-4">Current Player: {currentPlayer}</p>
        </>
      )}
    </div>
  );
};

export default Game;
