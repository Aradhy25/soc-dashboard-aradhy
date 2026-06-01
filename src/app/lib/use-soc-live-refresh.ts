import { useEffect, useRef } from 'react';

import { useSocSocket } from './realtime';

export function useSocLiveRefresh(refresh: () => void, throttleMs = 600) {
  const socket = useSocSocket();
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!socket) return;

    let timer: number | null = null;
    const schedule = () => {
      if (timer !== null) return;
      timer = window.setTimeout(() => {
        timer = null;
        refreshRef.current();
      }, throttleMs);
    };

    socket.on('soc:update', schedule);
    return () => {
      socket.off('soc:update', schedule);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [socket, throttleMs]);
}

