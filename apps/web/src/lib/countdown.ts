'use client';

import { useEffect, useState } from 'react';

/**
 * Milliseconds left until a server deadline. Only server time counts: the offset between the
 * server's clock (from `serverTime`) and this device's clock is applied to every tick.
 */
export function useRemainingMs(expiresAt: string | null, serverTime: string): number | null {
  const [offset] = useState(() => new Date(serverTime).getTime() - Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [expiresAt]);
  if (!expiresAt) return null;
  return Math.max(0, new Date(expiresAt).getTime() - (now + offset));
}
