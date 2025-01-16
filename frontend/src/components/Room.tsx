// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Room: React.FC = () => {
//   const [name, setName] = useState("");
//   const [roomId, setRoomId] = useState("");
//   const navigate = useNavigate();

//   const createRoom = () => {
//     const newRoomId = Math.random().toString(36).substr(2, 9);
//     setRoomId(newRoomId);
//   };

//   const joinRoom = () => {
//     if (name && roomId) {
//       navigate(`/game?name=${name}&roomId=${roomId}`);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen ">
//       <h1 className="text-2xl font-bold mb-4">Tic Tac Toe</h1>
//       <input
//         type="text"
//         placeholder="Your Name"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         className="mb-4 p-2 border rounded"
//       />
//       {roomId ? (
//         <div className="mb-4">
//           <p className="mb-2">Room ID: {roomId}</p>
//           <button
//             onClick={() => navigator.clipboard.writeText(roomId)}
//             className="p-2 bg-blue-500 text-white rounded"
//           >
//             Copy Room ID
//           </button>
//         </div>
//       ) : (
//         <button
//           onClick={createRoom}
//           className="mb-4 p-2 bg-green-500 text-white rounded"
//         >
//           Create Room
//         </button>
//       )}
//       <input
//         type="text"
//         placeholder="Room ID"
//         value={roomId}
//         onChange={(e) => setRoomId(e.target.value)}
//         className="mb-4 p-2 border rounded"
//       />
//       <button
//         onClick={joinRoom}
//         className="p-2 bg-blue-500 text-white rounded"
//       >
//         Join Room
//       </button>
//     </div>
//   );
// };

// export default Room;






























import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy } from 'lucide-react';
import { socket } from '../socket';

export const Room: React.FC = () => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const navigate = useNavigate();

  const createRoom = () => {
    if (!name) return;
    socket.emit('createRoom', { name }, (response: { roomId: string }) => {
      setCreatedRoomId(response.roomId);
    });
  };

  const joinRoom = () => {
    if (!name || !roomId) return;
    socket.emit('joinRoom', { name, roomId }, (response: { success: boolean }) => {
      if (response.success) {
        navigate(`/game/${roomId}`);
      }
    });
  };

  const copyRoomId = () => {
    if (createdRoomId) {
      navigator.clipboard.writeText(createdRoomId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">Tic Tac Toe</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>

          {!createdRoomId ? (
            <div className="space-y-4">
              <button
                onClick={createRoom}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Room
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room ID
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter room ID"
                />
              </div>

              <button
                onClick={joinRoom}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Join Room
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">Room ID:</p>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 p-2 bg-white rounded border">
                    {createdRoomId}
                  </code>
                  <button
                    onClick={copyRoomId}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => navigate(`/game/${createdRoomId}`)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Join Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};