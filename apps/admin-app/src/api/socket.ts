import { io } from 'socket.io-client';
import { adminEnv } from '../constants/env';

export const adminSocket = io(adminEnv.socketUrl, {
  autoConnect: false,
  transports: ['websocket']
});
