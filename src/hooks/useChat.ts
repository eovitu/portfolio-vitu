import { useCallback, useEffect, useState } from 'react';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

/**
 * Owns the open/closed state of the GET TO KNOW ME panel and the scroll lock.
 *
 * The lock goes through Lenis (`stop`/`start`) instead of `overflow: hidden`
 * on the body: no layout shift, no lost scroll position, and ScrollTrigger's
 * measurements stay valid, so nothing has to be refreshed when it closes.
 */
export function useChat() {
  const [open, setOpen] = useState(false);
  const { stop, start } = useSmoothScroll();

  const openChat = useCallback(() => setOpen(true), []);
  const closeChat = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open) stop();
    else start();
    return () => start();
  }, [open, stop, start]);

  return { open, openChat, closeChat };
}
