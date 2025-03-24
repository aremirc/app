const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const prisma = require('./src/lib/prisma'); // Asegúrate de tener configurado Prisma correctamente

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
      origin: '*', // Permite conexiones desde cualquier origen (ajustar según sea necesario)
      methods: ['GET', 'POST'],
    },
  });

  // Manejo de conexiones WebSocket
  io.on('connection', (socket) => {
    console.log('Usuario conectado: ' + socket.id);

    // Evento de nueva visita
    socket.on('new-visit', async (visitData) => {
      try {
        // Guardar la nueva visita en la base de datos usando Prisma
        const newVisit = await prisma.visit.create({
          data: {
            date: new Date(visitData.date),
            description: visitData.description || 'Descripción por defecto',
            orderId: visitData.orderId,
            workerId: visitData.workerId,
            clientId: visitData.clientId,
          },
        });

        // Emitir el evento a todos los clientes conectados
        io.emit('new-visit', newVisit);
      } catch (error) {
        console.error('Error al crear nueva visita:', error);
        socket.emit('error', { message: 'Hubo un error al crear la visita' });
      }
    });

    // Manejar la desconexión del cliente
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
    });
  });

  // Iniciar servidor en el puerto 3000
  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
