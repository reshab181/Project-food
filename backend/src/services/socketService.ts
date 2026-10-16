import { Server } from 'socket.io';

let io: Server | null = null;

export const registerSocketServer = (instance: Server) => {
  io = instance;
};

export const socketService = {
  emitToAll(event: string, payload: unknown) {
    io?.emit(event, payload);
  },
  emitToRoom(room: string, event: string, payload: unknown) {
    io?.to(room).emit(event, payload);
  }
};
