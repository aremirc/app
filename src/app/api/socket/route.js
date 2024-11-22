// Configuración del servidor WebSocket

import { Server } from "socket.io";
import { createServer } from "http";
import prisma from "@/lib/prisma"; // Suponiendo que tienes un cliente Prisma

// Este archivo maneja la conexión del servidor WebSocket
export default function handler(req, res) {
  // Si es una solicitud HTTP normal, Next.js maneja la respuesta
  if (req.method === "GET") {
    res.status(200).send("Servidor WebSocket en funcionamiento");
    return;
  }

  // Si es una solicitud POST, establecemos WebSocket
  const server = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
  });

  const io = new Server(server, {
    path: "/api/socket", // Definir el path del WebSocket
  });

  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

    // Cuando se recibe un evento 'new-visit', se guarda en la base de datos
    socket.on("new-visit", async (visitData) => {
      try {
        const newVisit = await prisma.visit.create({
          data: {
            date: new Date(visitData.date),
            description: visitData.description || "Descripción por defecto",
            orderId: visitData.orderId,
            workerId: visitData.workerId,
            clientId: visitData.clientId,
          },
        });

        // Emitir evento a todos los clientes conectados
        io.emit("new-visit", newVisit);
      } catch (error) {
        console.error("Error al crear nueva visita:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Usuario desconectado:", socket.id);
    });
  });

  // Escuchar en el puerto 3000 o el puerto que uses para Next.js
  server.listen(3001, () => {
    console.log("Servidor WebSocket escuchando en el puerto 3001");
  });
}
