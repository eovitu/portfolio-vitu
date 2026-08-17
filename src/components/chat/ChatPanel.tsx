import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import * as S from './Chat.styles';
import { ChatMessages, type ChatMessage } from './ChatMessages';
import { askMock } from '../../lib/chatMock';
import { chat } from '../../lib/content';

interface Props {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * GET TO KNOW ME panel.
 *
 * Accessibility: it is a real modal dialog — labelled, focus-trapped, closed
 * on Escape and on backdrop click, and focus returns to whatever opened it.
 * Page scroll is locked through Lenis (see ChatWidget) rather than by mutating
 * body styles, so nothing jumps when it opens.
 */
export function ChatPanel({ open, onClose }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState('');
  const titleId = useId();

  const send = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setMessages((prev) => [...prev, { id, from: 'user', text: trimmed }]);
    setPending(true);
    const answer = await askMock(trimmed);
    setPending(false);
    setMessages((prev) => [...prev, { id: `${id}-a`, from: 'bot', text: answer }]);
  }, []);

  // Keep the newest message in view *inside the panel* — never via
  // scrollIntoView, which would also scroll the (locked) page behind it.
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [messages.length, pending]);

  // The `inert` attribute has no React 18 typing, so it is set imperatively.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (open) panel.removeAttribute('inert');
    else panel.setAttribute('inert', '');
  }, [open]);

  // Focus management + focus trap, active only while open.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const previous = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 120);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [open, onClose]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(draft);
    setDraft('');
  };

  return (
    <S.Root $open={open}>
      <S.Backdrop $open={open} onClick={onClose} aria-hidden="true" />
      <S.Panel
        ref={panelRef}
        $open={open}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <S.Head>
          <h2 id={titleId}>{chat.title}</h2>
          <S.Close type="button" onClick={onClose}>
            {chat.close}
          </S.Close>
        </S.Head>

        <S.Body ref={bodyRef}>
          <S.Intro>{chat.intro}</S.Intro>

          <S.Prompts>
            {chat.prompts.map((prompt) => (
              <S.Prompt key={prompt} type="button" onClick={() => void send(prompt)}>
                {prompt}
              </S.Prompt>
            ))}
          </S.Prompts>

          <ChatMessages messages={messages} pending={pending} />

          <S.Note>{chat.note}</S.Note>
        </S.Body>

        <S.Form onSubmit={onSubmit}>
          <span aria-hidden="true">›</span>
          <label className="visually-hidden" htmlFor="chat-input">
            {chat.inputPlaceholder}
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={chat.inputPlaceholder}
            autoComplete="off"
          />
        </S.Form>
      </S.Panel>
    </S.Root>
  );
}
