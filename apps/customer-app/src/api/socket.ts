import { io } from 'socket.io-client';
import { customerEnv } from '../constants/env';

export const customerSocket = io(customerEnv.socketUrl, {
  autoConnect: false,
  transports: ['websocket']
});
