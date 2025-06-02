const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')
const cors = require('cors')  // Importamos el paquete de CORS
const prisma = require('./src/lib/prisma') // Asegúrate de tener configurado Prisma correctamente

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Preparar el servidor Next.js
app.prepare().then(() => {
  // Crear servidor HTTP personalizado
  const server = createServer((req, res) => {
    // Habilitar CORS para solicitudes HTTP
    cors({
      origin: (origin, callback) => {
        // Si no estamos en desarrollo, validamos el origen de la solicitud
        if (dev || origin === undefined || origin === req.headers.origin) {
          // Permite la solicitud si es de la misma URL o cualquier origen en desarrollo
          callback(null, true)
        } else {
          // Si el origen no es válido, se rechaza
          callback(new Error('Origen no permitido'), false)
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,  // Permite cookies con las solicitudes
    })(req, res, () => {
      // Procesar la solicitud de Next.js
      handle(req, res)
    })
  })

  // Crear instancia de Socket.io
  const io = new Server(server, {
    cors: {
      origin: (dev ? '*' : (origin, callback) => {
        // Validación de CORS para WebSocket
        if (origin === undefined || origin === req.headers.origin || dev) {
          callback(null, true)
        } else {
          callback(new Error('Origen no permitido'), false)
        }
      }),
      methods: ['GET', 'POST'],
      credentials: true,  // Permite el envío de cookies si `withCredentials` está habilitado en el cliente
    },
  })

  // 🚨 MIDDLEWARE GLOBAL para autenticación WebSocket
  // io.use((socket, next) => {
  //   const cookies = socket.handshake.headers.cookie
  //   console.log('[Socket.io Auth] Cookies recibidas:', cookies)

  //   // Aquí puedes parsear y validar tu sesión, token, JWT, etc.
  //   if (cookies && cookies.includes('auth_token=')) {
  //     // ✅ Autorizado
  //     return next()
  //   }

  //   console.warn('[Socket.io Auth] Conexión rechazada. No autorizado.')
  //   return next(new Error('No autorizado'))
  // })

  // Manejo de conexiones WebSocket
  io.on('connection', (socket) => {
    console.log('Usuario conectado: ' + socket.id)

    // Acceder a las cookies en la conexión WebSocket
    // const cookies = socket.request.headers.cookie  // Accede a las cookies del socket
    // console.log('Cookies recibidas en WebSocket:', cookies)

    // socket.on('message', (msg) => {
    //   console.log('Mensaje del cliente: ', msg)
    //   socket.emit('response', 'Mensaje recibido en el servidor')
    // })

    // Manejar la desconexión del cliente
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id)
    })
  })

  const PORT = process.env.PORT || 3000

  // Iniciar servidor en el puerto 3000
  server.listen(PORT, async (err) => {
    if (err) throw err
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`)

    // Desconectar la base de datos cuando el servidor se cierre
    process.on('SIGINT', async () => {
      console.log('🛑 Desconectando Prisma...')
      await prisma.$disconnect()
      process.exit(0)
    })
  })
})
