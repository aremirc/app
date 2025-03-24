import { useSocket } from "@/context/SocketContext";
import { useEffect, useState } from "react";

const ConnectionStatus = () => {
  const socket = useSocket();
  const [status, setStatus] = useState("Desconectado");

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setStatus("Conectado");
    });

    socket.on("disconnect", () => {
      setStatus("Desconectado");
    });

    socket.on("reconnect_attempt", () => {
      setStatus("Reconectando...");
    });

    socket.on("connect_error", () => {
      setStatus("Error de conexión");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reconnect_attempt");
      socket.off("connect_error");
    };
  }, [socket]);

  return <p>Estado de la conexión: {status}</p>;
};

export default ConnectionStatus;
