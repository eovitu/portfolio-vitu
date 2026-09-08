import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { useConversation } from './ConversationProvider';
import * as S from './ConversationHub.styles';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

/**
 * The one TALK TO ME, used by the footer, the desktop header and the mobile
 * menu. Wherever it appears it opens the same drawer and hands its own node
 * over as the element focus must return to.
 *
 * A caller may still pass `onClick`, the mobile menu closes itself there,
 * and calling `preventDefault` in it suppresses the open.
 */
export const TalkToMeButton = forwardRef<HTMLButtonElement, Props>(function TalkToMeButton(
  { onClick, ...props },
  ref,
) {
  const { isOpen, open } = useConversation();
  const localRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    open(localRef.current);
  };

  return (
    <S.Trigger
      ref={localRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      onClick={handleClick}
      {...props}
    >
      Talk to me <ArrowUpRight aria-hidden="true" weight="regular" />
    </S.Trigger>
  );
});
