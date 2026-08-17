import * as S from './Chat.styles';

export interface ChatMessage {
  id: string;
  from: 'user' | 'bot';
  text: string;
}

interface Props {
  messages: ChatMessage[];
  pending: boolean;
}

/** Typography-only thread — no bubbles, no avatars, per the design note. */
export function ChatMessages({ messages, pending }: Props) {
  if (!messages.length && !pending) return null;

  return (
    <S.Thread aria-live="polite">
      {messages.map((message) => (
        <S.Message key={message.id} $from={message.from}>
          <small>{message.from === 'user' ? 'VOCÊ' : 'VITU'}</small>
          <p>{message.text}</p>
        </S.Message>
      ))}
      {pending && (
        <S.Message $from="bot">
          <small>VITU</small>
          <p aria-label="Digitando">···</p>
        </S.Message>
      )}
    </S.Thread>
  );
}
