import React, { useContext, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const [email, setEmail] = useState("");
  const [roomID, setRoomID] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("room:join", { email, roomID });
  };

  const handleJoinRoom = (data) => {
    const { roomID } = data;
    navigate(`/room/${roomID}`);
  };
  useEffect(() => {
    socket.on("room:join", handleJoinRoom);

    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="roomID:">Room ID:</label>
        <input
          type="text"
          id="roomId"
          value={roomID}
          onChange={(e) => setRoomID(e.target.value)}
        />
        <button>Join</button>
      </form>
    </div>
  );
};

export default Lobby;
