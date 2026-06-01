import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { env } from './env';

type SocSocket = Socket | null;

const RealtimeContext = createContext<SocSocket>(null);

export function SocRealtimeProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<SocSocket>(null);

  const url = useMemo(() => env.wsUrl, []);

  useEffect(() => {
    const s = io(url, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    setSocket(s);
    return () => {
      setSocket(null);
      s.close();
    };
  }, [url]);

  return <RealtimeContext.Provider value={socket}>{children}</RealtimeContext.Provider>;
}

export function useSocSocket() {
  return useContext(RealtimeContext);
}

