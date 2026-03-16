import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(onEvent) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const base = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://localhost:8080';
    const s = io(base, { transports: ['websocket'] });
    setSocket(s);

    s.on('connect', () => onEvent?.('socket:connect'));
    s.on('disconnect', () => onEvent?.('socket:disconnect'));
    s.on('agent:update', (payload) => onEvent?.('agent:update', payload));
    s.on('agents:snapshot', (payload) => onEvent?.('agents:snapshot', payload));
    s.on('workflow:snapshot', (payload) => onEvent?.('workflow:snapshot', payload));
    s.on('workflow:details', (payload) => onEvent?.('workflow:details', payload));

    return () => s.disconnect();
  }, [onEvent]);

  return socket;
}
