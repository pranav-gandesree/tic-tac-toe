// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000");

// const Game: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const [board, setBoard] = useState(Array(9).fill(null));
//   const [currentPlayer, setCurrentPlayer] = useState("X");
//   const [player, setPlayer] = useState("");
//   const [winner, setWinner] = useState<string | null>(null);

//   useEffect(() => {
//     const name = searchParams.get("name") || "";
//     const roomId = searchParams.get("roomId") || "";
//     socket.emit("joinRoom", { name, roomId });

//     socket.on("playerAssignment", (symbol) => {
//         setCurrentPlayer(symbol);
//       });

//     socket.on("boardUpdate", (newBoard: string[], nextPlayer: string) => {
//       setBoard(newBoard);
//       setCurrentPlayer(nextPlayer);
//     });

//     socket.on("gameEnd", ({ winner, board }: { winner: string | null; board: string[] }) => {
//       setBoard(board);
//       setWinner(winner);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [searchParams]);

//   const handleCellClick = (index: number) => {
//     if (!board[index] && player === currentPlayer && !winner) {
//       const newBoard = [...board];
//       newBoard[index] = player;
//       socket.emit("playMove", { newBoard, roomId: searchParams.get("roomId") });
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen">
//       <h1 className="text-2xl font-bold mb-4">Tic Tac Toe</h1>
//       {winner ? (
//         <div className="mb-4 text-center">
//           {winner === null ? (
//             <p className="text-xl font-bold text-gray-700">It's a draw!</p>
//           ) : (
//             <p className="text-xl font-bold text-green-600">
//               Player {winner} wins!
//             </p>
//           )}
//           <button
//             onClick={() => {
//               setBoard(Array(9).fill(null));
//               setWinner(null);
//             }}
//             className="mt-4 p-2 bg-blue-500 text-white rounded"
//           >
//             Restart Game
//           </button>
//         </div>
//       ) : (
//         <>
//           <p className="mb-4">
//             You are: <span className="font-bold">{player}</span>
//           </p>
//           <div className="grid grid-cols-3 gap-4">
//             {board.map((cell, index) => (
//               <div
//                 key={index}
//                 onClick={() => handleCellClick(index)}
//                 className="w-20 h-20 flex items-center justify-center bg-white border rounded text-2xl font-bold"
//               >
//                 {cell}
//               </div>
//             ))}
//           </div>
//           <p className="mt-4">Current Player: {currentPlayer}</p>
//         </>
//       )}
//     </div>
//   );
// };

// export default Game;
























import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import type { Room } from '../types/game';

export const Game: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string>(socket.id || '');

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    socket.emit('getRoomState', { roomId }, (response: Room) => {
      setRoom(response);
    });

    socket.on('gameUpdate', (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    socket.on('playerDisconnected', () => {
      navigate('/');
    });

    return () => {
      socket.off('gameUpdate');
      socket.off('playerDisconnected');
    };
  }, [roomId, navigate]);

  const handleCellClick = (index: number) => {
    if (!room || !playerId) return;
    if (room.winner || room.board[index] || room.currentTurn !== playerId) return;

    socket.emit('makeMove', { roomId, index });
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  const currentPlayer = room.players.find(p => p.id === playerId);
  const opponent = room.players.find(p => p.id !== playerId);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg">
              <span className="font-medium">You:</span> {currentPlayer?.name} ({currentPlayer?.symbol})
            </div>
            <div className="text-lg">
              <span className="font-medium">Opponent:</span> {opponent?.name || 'Waiting...'} ({opponent?.symbol})
            </div>
          </div>
          
          {room.winner ? (
            <div className="text-center text-xl font-bold text-green-600">
              {room.winner === playerId ? 'You won!' : 'Opponent won!'}
            </div>
          ) : (
            <div className="text-center text-lg">
              {room.currentTurn === playerId ? 'Your turn' : "Opponent's turn"}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-8">
          {room.board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!!cell || !!room.winner}
              className={`
                h-24 bg-gray-50 rounded-lg text-4xl font-bold
                ${!cell && !room.winner ? 'hover:bg-gray-100' : ''}
                ${cell === 'X' ? 'text-blue-600' : 'text-red-600'}
              `}
            >
              {cell}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
        >
          Leave Game
        </button>
      </div>
    </div>
  );
};


















