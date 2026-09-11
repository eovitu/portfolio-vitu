import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react';
import { ArrowLeft, ArrowUpRight } from '@phosphor-icons/react';
import { createPortal } from 'react-dom';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { type ChatPrompt } from '../../lib/content';
import { answerConversationQuestion } from '../../lib/conversation';
import { useDialogSurface } from '../../hooks/useDialogSurface';
import * as S from './ConversationHub.styles';
import { useLanguage } from '../providers/LanguageProvider';

interface Message {
  id: number;
  role: 'visitor' | 'vitu';
  text: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Whichever TALK TO ME opened the drawer. Focus goes back to it. */
  triggerRef: RefObject<HTMLElement | null>;
}

/**
 * The drawer, and only the drawer.
 *
 * It used to own its own trigger button, which is why only the footer's TALK
 * TO ME did anything: the header's and the mobile menu's were unrelated
 * buttons rendered from a different component. There is one drawer on the
 * page now, mounted once, and every trigger opens that one.
 */
export function ConversationHub({ open, onClose, triggerRef }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const answerTimerRef = useRef(0);
  const messageIdRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const { locale, content } = useLanguage();
  const { chat, ui } = content;

  const close = onClose;

  // The dialog contract, scroll lock, inert background, focus trap, Escape,
  // focus restoration, lives in one hook shared with the mobile menu.
  useDialogSurface({
    open,
    panelRef,
    initialFocusRef: closeRef,
    onClose: close,
    returnFocusRef: triggerRef,
  });

  const appendExchange = useCallback(
    (question: string, answer: string) => {
      if (pending) return;
      setMessages((current) => [
        ...current,
        { id: ++messageIdRef.current, role: 'visitor', text: question },
      ]);
      setPending(true);
      answerTimerRef.current = window.setTimeout(
        () => {
          setMessages((current) => [
            ...current,
            { id: ++messageIdRef.current, role: 'vitu', text: answer },
          ]);
          setPending(false);
        },
        reducedMotion ? 0 : 420,
      );
    },
    [pending, reducedMotion],
  );

  const choosePrompt = (prompt: ChatPrompt) => {
    appendExchange(prompt.question, prompt.answer);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim().slice(0, 240);
    if (!question || pending) return;
    const result = answerConversationQuestion(question, chat);
    appendExchange(question, result.answer);
    setInput('');
  };

  useEffect(
    () => () => {
      window.clearTimeout(answerTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    setInput('');
    setMessages([]);
    setPending(false);
    window.clearTimeout(answerTimerRef.current);
  }, [locale]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      transcriptRef.current?.scrollTo({
        top: transcriptRef.current.scrollHeight,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages, open, pending, reducedMotion]);

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {open ? (
            <S.Layer>
              <S.Backdrop
                type="button"
                aria-label={ui.conversation.close}
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.28 }}
              />
              <S.Panel
                ref={panelRef}
                data-lenis-prevent
                role="dialog"
                aria-modal="true"
                aria-labelledby="conversation-title"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{
                  duration: reducedMotion ? 0 : 0.48,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <S.Top>
                  <span>{chat.title}</span>
                  <S.Close ref={closeRef} type="button" onClick={close}>
                    <ArrowLeft aria-hidden="true" weight="regular" /> {chat.close}
                  </S.Close>
                </S.Top>

                <S.Intro>
                  <h2 id="conversation-title">{ui.conversation.heading}</h2>
                  <p>{chat.intro}</p>
                </S.Intro>

                <S.Prompts aria-label={ui.conversation.suggested}>
                  {chat.prompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      type="button"
                      disabled={pending}
                      onClick={() => choosePrompt(prompt)}
                    >
                      {prompt.question}
                      <ArrowUpRight aria-hidden="true" weight="regular" />
                    </button>
                  ))}
                </S.Prompts>

                <S.Transcript ref={transcriptRef} aria-live="polite" aria-busy={pending}>
                  {messages.length === 0 ? (
                    <S.Empty>{ui.conversation.empty}</S.Empty>
                  ) : null}
                  {messages.map((message) => (
                    <S.Message
                      key={message.id}
                      $visitor={message.role === 'visitor'}
                      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <small>
                        {message.role === 'visitor'
                          ? ui.conversation.you
                          : ui.conversation.curated}
                      </small>
                      <p>{message.text}</p>
                    </S.Message>
                  ))}
                  <AnimatePresence>
                    {pending ? (
                      <S.Typing
                        role="status"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.8, repeat: Infinity }}
                      >
                        {ui.conversation.receiving}
                      </S.Typing>
                    ) : null}
                  </AnimatePresence>
                </S.Transcript>

                <S.Composer onSubmit={submit}>
                  <S.VisuallyHidden as="label" htmlFor="conversation-question">
                    {ui.conversation.ask}
                  </S.VisuallyHidden>
                  <input
                    id="conversation-question"
                    name="conversation-question"
                    value={input}
                    maxLength={240}
                    autoComplete="off"
                    placeholder={chat.inputPlaceholder}
                    onChange={(event) => setInput(event.target.value)}
                  />
                  <button type="submit" disabled={!input.trim() || pending}>
                    {ui.conversation.send}{' '}
                    <ArrowUpRight aria-hidden="true" weight="regular" />
                  </button>
                  <S.Meta>
                    {chat.note} · <a href="mailto:eovitu7@gmail.com">eovitu7@gmail.com</a>
                  </S.Meta>
                </S.Composer>
              </S.Panel>
            </S.Layer>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
