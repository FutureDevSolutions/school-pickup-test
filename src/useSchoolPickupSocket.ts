import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getSocketUrl } from './config';
import type { SchoolPickupEntry } from './api';

type QueuePayload = {
  device_id?: string;
  row_count?: number;
  display_minutes?: number;
  entries?: SchoolPickupEntry[];
};

/**
 * Listen for live board updates for a kiosk device_id.
 * Joins the same socket room the TV uses.
 */
export function useSchoolPickupSocket(
  deviceId: string,
  onQueue: (entries: SchoolPickupEntry[], meta?: QueuePayload) => void,
) {
  const [connected, setConnected] = useState(false);
  const onQueueRef = useRef(onQueue);
  onQueueRef.current = onQueue;

  useEffect(() => {
    const id = deviceId.trim();
    if (!id) {
      setConnected(false);
      return;
    }

    const socket: Socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    const handleUpdate = (payload: QueuePayload) => {
      if (payload?.device_id && payload.device_id !== id) return;
      onQueueRef.current(
        Array.isArray(payload?.entries) ? payload.entries : [],
        payload,
      );
    };

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('device:join', id);
      socket.emit('schoolPickup:queue:request', { device_id: id });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('schoolPickup:queue:update', handleUpdate);

    return () => {
      socket.off('schoolPickup:queue:update', handleUpdate);
      socket.disconnect();
      setConnected(false);
    };
  }, [deviceId]);

  return { connected };
}
