import { Server } from "socket.io";
import { NextResponse } from "next/server";  // Importar NextResponse
import prisma from "@/lib/prisma"; // Suponiendo que tienes un cliente Prisma

// Responder con un mensaje cuando se hace una solicitud GET a esta ruta
export function GET(req) {
  return new NextResponse("Servidor WebSocket en funcionamiento", {
    status: 200,
  });
}

// Manejar la solicitud POST para configurar WebSocket
export async function POST(req) {
  // Verificar el token JWT
  const user = await verifyJWT(req);
  if (user instanceof Response) {
    return user; // Si hay un error con el token, devolver respuesta de error
  }

  const io = new Server(req.socket.server, {
    path: "/api/socket", // Definir el path del WebSocket
  });

  io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);

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

  // Terminar la respuesta HTTP (porque WebSocket se maneja de manera diferente)
  return new NextResponse(null, { status: 200 });
}
