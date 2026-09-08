/* eslint-disable react-refresh/only-export-components -- provider and hook form one public boundary */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ConversationHub } from './ConversationHub';

/**
 * One conversation, opened from anywhere.
 *
 * The drawer used to be rendered by the same component that rendered its
 * button, and that component only existed in the footer, so the header's and
 * the mobile menu's TALK TO ME were buttons with nothing behind them. The
 * state lives here instead: one drawer, mounted once, and any number of
 * triggers pointing at it.
 *
 * `open` takes the element that asked, because that is where focus has to
 * return when the drawer closes, and it is not always the same button.
 */
interface ConversationApi {
  isOpen: boolean;
  open: (trigger: HTMLElement | null) => void;
  close: () => void;
}

const ConversationContext = createContext<ConversationApi | null>(null);

export function useConversation(): ConversationApi {
  const value = useContext(ConversationContext);
  if (!value) {
    throw new Error('useConversation must be used inside ConversationProvider');
  }
  return value;
}

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((trigger: HTMLElement | null) => {
    triggerRef.current = trigger;
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const api = useMemo<ConversationApi>(
    () => ({ isOpen, open, close }),
    [isOpen, open, close],
  );

  return (
    <ConversationContext.Provider value={api}>
      {children}
      <ConversationHub open={isOpen} onClose={close} triggerRef={triggerRef} />
    </ConversationContext.Provider>
  );
}
