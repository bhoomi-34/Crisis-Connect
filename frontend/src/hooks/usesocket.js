import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(token, role, onNewCrisis) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket']
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      if (role === 'volunteer') {
        socketRef.current.emit('join_volunteer', { token });
      }
    });

    if (role === 'volunteer' && onNewCrisis) {
      socketRef.current.on('new_crisis', (crisis) => {
        onNewCrisis(crisis);
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  return socketRef;
}