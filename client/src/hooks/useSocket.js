import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(onEvent) {
  const socketRef = useRef(null);

  useEffect(() => {
    const base = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://localhost:8080';
    socketRef.current = io(base, { transports: ['websocket'] });

    socketRef.current.on('agent:update', (payload) => onEvent?.('agent:update', payload));
    socketRef.current.on('agents:snapshot', (payload) => onEvent?.('agents:snapshot', payload));

    return () => socketRef.current?.disconnect();
  }, [onEvent]);

  return socketRef.current;
}
