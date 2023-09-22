import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

const SocketProvider = (props) => {
  const socket = useMemo(() => io("localhost:8001"), []);
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
