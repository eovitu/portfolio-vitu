import { useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { nav } from '../../lib/content';
import { useDialogSurface } from '../../hooks/useDialogSurface';
import { TalkToMeButton } from '../conversation/TalkToMeButton';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.z.nav + 1};
  display: grid;
  grid-template-rows: auto minmax(min-content, 1fr) auto;
  gap: 28px;
  overflow-y: auto;
  overscroll-behavior: contain;
  --surface: #08080a;
  --ink: #e9e7e2;
  --ink-muted: #b7b7ae;
  --accent: #d7ef92;
  --border: #53534d;
  color: var(--ink);
  background:
    radial-gradient(circle at 82% 8%, rgba(214, 159, 81, 0.18), transparent 28%), #08080a;
  padding: max(18px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right))
    max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
  animation: menu-arrive 160ms cubic-bezier(0.16, 1, 0.3, 1) both;

  @keyframes menu-arrive {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font: 400 12px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.14em;
`;

const Close = styled.button`
  border: 0;
  background: transparent;
  color: inherit;
  padding: 10px;
  min-width: 48px;
  min-height: 48px;
  font: inherit;
  letter-spacing: inherit;
  transition:
    transform 180ms ease,
    color 180ms ease;

  &:hover {
    transform: translateY(-2px);
    color: ${({ theme }) => theme.colors.accent};
  }
  &:active {
    transform: scale(0.96);
  }
`;

const Links = styled.nav`
  align-self: center;
  display: grid;
  gap: 18px;
  a {
    display: block;
    font-size: clamp(38px, min(15vw, 9dvh), 74px);
    min-height: 44px;
    line-height: 0.95;
    letter-spacing: -0.05em;
    color: var(--ink);
    &:hover,
    &:focus-visible {
      color: var(--accent);
    }
  }
`;
const MenuTalk = styled(TalkToMeButton)`
  justify-self: start;
  align-self: end;
  margin-bottom: 8px;
`;

interface Props {
  open: boolean;
  onClose: () => void;
  /** The control that opened the menu. Focus goes back to it on close. */
  triggerRef?: RefObject<HTMLElement>;
}

export function MobileMenu({ open, onClose, triggerRef }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Same dialog contract as the conversation drawer, same implementation.
  useDialogSurface({
    open,
    panelRef,
    initialFocusRef: closeRef,
    onClose,
    returnFocusRef: triggerRef,
  });

  if (!open) return null;

  /*
   * Rendered into `document.body`, not into the header.
   *
   * `useDialogSurface` marks `#root` inert while a dialog is open; a menu that
   * lived inside it would make itself unreachable. This is also what the
   * conversation drawer does, for the same reason.
   */
  return createPortal(
    <Overlay
      ref={panelRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
    >
      <Top>
        <span>VITU</span>
        <Close ref={closeRef} type="button" onClick={onClose}>
          CLOSE
        </Close>
      </Top>
      <Links aria-label="Mobile navigation">
        {nav.links.map((link) => (
          <a
            key={link.href}
            href={`/${link.href}`}
            data-transition-cause="hash"
            onClick={onClose}
          >
            {link.label}
          </a>
        ))}
      </Links>
      {/* Closes the menu and opens the drawer in one commit: React runs the
          menu's teardown before the drawer's effect, so the scroll lock and
          the inert background hand over rather than fight. */}
      <MenuTalk aria-label="Talk to me" onClick={onClose} />
    </Overlay>,
    document.body,
  );
}
