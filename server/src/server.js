import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { ENV } from './config/env.js';
import { initializeSockets } from './sockets/socketHandler.js';
import { prisma } from './config/prisma.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

initializeSockets(io);

server.listen(ENV.PORT, () => {
  console.log(`[connectCampus] Server listening on http://localhost:${ENV.PORT}`);
  console.log(`[connectCampus] Environment: ${ENV.NODE_ENV}`);
  console.log(`[connectCampus] Socket.IO real-time engine active`);
});

async function gracefulShutdown(signal) {
  console.log(`\n[connectCampus] Received ${signal}. Closing server gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[connectCampus] Prisma disconnected. Process exiting.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
