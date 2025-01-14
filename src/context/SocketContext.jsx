"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

// El componente SocketProvider será el encargado de manejar la conexión
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";  // URL de WebSocket desde la variable de entorno

    // Crear la conexión con el servidor WebSocket cuando se monte el componente
    const socketInstance = io(socketUrl);
    setSocket(socketInstance);

    // Limpiar la conexión cuando el componente se desmonte
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook para usar el socket en cualquier componente
export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket debe ser utilizado dentro de un SocketProvider");
  }
  return socket;
};
