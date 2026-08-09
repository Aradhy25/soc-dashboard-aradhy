import { useEffect, useRef, useState } from 'react';

import { loadPreferences, type SocPreferences } from './preferences';
import { useSocSocket } from './realtime';

export function useSocLiveRefresh(refresh: () => void, throttleMs = 600) {
  const socket = useSocSocket();
  const refreshRef = useRef(refresh);
  const [prefs, setPrefs] = useState<SocPreferences>(() => loadPreferences());

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    const onPrefs = (event: Event) => {
      const detail = (event as CustomEvent<SocPreferences>).detail;
      if (detail) setPrefs(detail);
    };
    window.addEventListener('soc:preferences', onPrefs as EventListener);
    return () => window.removeEventListener('soc:preferences', onPrefs as EventListener);
  }, []);

  useEffect(() => {
    if (!socket || !prefs.autoRefresh) return;

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
  }, [socket, throttleMs, prefs.autoRefresh]);

  useEffect(() => {
    if (!prefs.autoRefresh) return;
    const intervalMs = Math.max(5, prefs.refreshIntervalSec) * 1000;
    const id = window.setInterval(() => refreshRef.current(), intervalMs);
    return () => window.clearInterval(id);
  }, [prefs.autoRefresh, prefs.refreshIntervalSec]);
}
