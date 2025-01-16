import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Room: React.FC = () => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
  };

  const joinRoom = () => {
    if (name && roomId) {
      navigate(`/game?name=${name}&roomId=${roomId}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Tic Tac Toe</h1>
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      {roomId ? (
        <div className="mb-4">
          <p className="mb-2">Room ID: {roomId}</p>
          <button
            onClick={() => navigator.clipboard.writeText(roomId)}
            className="p-2 bg-blue-500 text-white rounded"
          >
            Copy Room ID
          </button>
        </div>
      ) : (
        <button
          onClick={createRoom}
          className="mb-4 p-2 bg-green-500 text-white rounded"
        >
          Create Room
        </button>
      )}
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      <button
        onClick={joinRoom}
        className="p-2 bg-blue-500 text-white rounded"
      >
        Join Room
      </button>
    </div>
  );
};

export default Room;













