import { Server } from "socket.io"
import { NextResponse } from "next/server"  // Importar NextResponse

// Responder con un mensaje cuando se hace una solicitud GET a esta ruta
export function GET(req) {
  return new NextResponse("Servidor WebSocket en funcionamiento", {
    status: 200,
  })
}

// Manejar la solicitud POST para configurar WebSocket
export async function POST(req) {
  // Verificar el token JWT
  const user = await verifyJWT(req)
  if (user instanceof Response) {
    return user // Si hay un error con el token, devolver respuesta de error
  }

  // Verificar si WebSocket ya está inicializado
  if (!req.socket.server.io) {
    console.log('Inicializando socket.io...')

    const io = new Server(req.socket.server, {
      cors: {
        origin: process.env.NODE_ENV === 'development'
          ? '*'
          : `https://${req.headers.host}`, // Usar el host de la solicitud para producción
        methods: ['GET', 'POST'],
        credentials: true,
      },
    })

    io.on('connection', (socket) => {
      console.log('Nuevo usuario conectado: ' + socket.id)

      // Acceder a las cookies en la conexión WebSocket
      const cookies = socket.request.headers.cookie  // Accede a las cookies del socket
      console.log('Cookies recibidas en WebSocket:', cookies)

      socket.on('message', (msg) => {
        console.log('Mensaje recibido: ', msg)
        socket.emit('response', 'Mensaje recibido')
      })

      socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id)
      })
    })

    req.socket.server.io = io // Asignar el servidor de WebSocket al servidor HTTP
  }

  // Terminar la respuesta HTTP (porque WebSocket se maneja de manera diferente)
  return new NextResponse(null, { status: 200 })
}