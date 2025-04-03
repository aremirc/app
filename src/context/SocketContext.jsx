"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

// El componente SocketProvider será el encargado de manejar la conexión
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null); // Usamos un ref para evitar crear varias conexiones

  useEffect(() => {
    // Solo crear la conexión si no existe
    if (socketRef.current) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"; // URL del WebSocket

    // Crear la conexión WebSocket con reconexión automática
    socketRef.current = io(socketUrl, {
      reconnection: true, // Habilitar reconexión automática
      reconnectionAttempts: 5, // Intentos de reconexión
      reconnectionDelay: 1000, // Retraso entre intentos de reconexión
      reconnectionDelayMax: 5000, // Retraso máximo entre intentos
      timeout: 10000, // Tiempo máximo de espera para establecer la conexión
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Error de conexión:", err);
    });

    socketRef.current.on("connect", () => {
      // console.log("Conectado a WebSocket");
    });

    // Cuando la conexión se pierde, tratamos de reconectar
    socketRef.current.on("disconnect", () => {
      // console.log("Desconectado del WebSocket");
    });

    setSocket(socketRef.current);

    return () => {
      // Desconectar solo si la conexión no está siendo usada en otro lugar
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Conexión WebSocket cerrada");
      }
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

// Custom hook para usar el socket en cualquier componente
export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket debe ser utilizado dentro de un SocketProvider");
  }
  return socket;
};