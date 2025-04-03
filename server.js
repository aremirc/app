const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const prisma = require('./src/lib/prisma'); // Asegúrate de tener configurado Prisma correctamente
const dotenv = require('dotenv'); // Asegúrate de que dotenv esté cargando las variables de entorno

dotenv.config(); // Cargar variables de entorno

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Preparar el servidor Next.js
app.prepare().then(() => {
  // Crear servidor HTTP personalizado
  const server = createServer((req, res) => {
    // Maneja todas las solicitudes de Next.js
    handle(req, res);
  });

  // Crear instancia de Socket.io
  const io = new Server(server, {
    cors: {
      origin: dev ? '*' : ['https://mi-app.com'], // Ajustar el origen en producción
      methods: ['GET', 'POST'],
    },
  });

  // Manejo de conexiones WebSocket
  io.on('connection', (socket) => {
    console.log('Usuario conectado: ' + socket.id);

    // Manejar la desconexión del cliente
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
    });
  });

  // Iniciar servidor en el puerto 3000
  server.listen(3000, async (err) => {
    if (err) throw err;
    console.log('> Ready on port 3000');

    // Desconectar la base de datos cuando el servidor se cierre
    process.on('SIGINT', async () => {
      console.log('Desconectando Prisma...');
      await prisma.$disconnect();
      process.exit(0);
    });
  });
});
