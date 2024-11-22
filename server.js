// Servidor WebSocket HTTPS

const { createServer } = require('http');
const { Server } = require('socket.io');
// const { io } = require('socket.io')(server); // Asegúrate de tener configurado Socket.io con tu servidor
const { PrismaClient } = require('@prisma/client');
// const prisma = require('./prismaClient'); // Asegúrate de importar tu cliente Prisma
const next = require('next');

const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, { cors: { origin: '' } });

  // Escuchar nuevas conexiones WebSocket
  io.on('connection', (socket) => {
    console.log('Usuario conectado: ' + socket.id);

    // Enviar eventos a los clientes cuando se agrega una nueva visita
    socket.on('new-visit', async (visitData) => {
      try {
        // Aquí podrías guardar la nueva visita en la base de datos
        const newVisit = await prisma.visit.create({
          data: {
            date: new Date(visitData.date), // Suponiendo que 'date' es una cadena en tu evento
            description: visitData.description || "Descripción por defecto",
            orderId: visitData.orderId,
            workerId: visitData.workerId,
            clientId: visitData.clientId,
          },
        });

        // Emitir evento a todos los clientes conectados
        io.emit('new-visit', newVisit); // Enviar la nueva visita a todos los clientes conectados
      } catch (error) {
        console.error('Error al crear nueva visita:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
    });
  });

  // Iniciar servidor
  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
