import { useCallback, useRef, type MouseEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import styled from 'styled-components';
import { useDialogSurface } from '../../hooks/useDialogSurface';
import { TalkToMeButton } from '../conversation/TalkToMeButton';
import { useRouteTransition } from '../routing/RouteTransitionProvider';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';
import { useLanguage } from '../providers/LanguageProvider';
import { LanguageSwitch } from './LanguageSwitch';

const Overlay = styled(motion.div)`
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
  transform-origin: 88% 5%;
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
`;

const MenuLink = styled(motion.a)`
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
`;
const MenuTalk = styled(TalkToMeButton)`
  justify-self: start;
`;

const Bottom = styled.div`
  align-self: end;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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
  const { navigate } = useRouteTransition();
  const { start } = useSmoothScroll();
  const reduced = useReducedMotion();
  const { content } = useLanguage();
  const { nav, ui } = content;

  const surfaceMotion: Variants = {
    closed: {
      opacity: 0,
      scale: reduced ? 1 : 0.985,
      transition: {
        duration: reduced ? 0 : 0.2,
        ease: [0.4, 0, 1, 1],
        when: 'afterChildren',
        staggerChildren: reduced ? 0 : 0.025,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: reduced ? 0 : 0.34,
        ease: [0.16, 1, 0.3, 1],
        when: 'beforeChildren',
        delayChildren: reduced ? 0 : 0.06,
        staggerChildren: reduced ? 0 : 0.045,
      },
    },
  };

  const linkMotion: Variants = {
    closed: {
      opacity: 0,
      y: reduced ? 0 : 18,
      transition: { duration: reduced ? 0 : 0.12, ease: [0.4, 0, 1, 1] },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const handleNavigation = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      const trigger = event.currentTarget;
      /*
       * Release the scroll lock synchronously, before the target is
       * requested.
       *
       * `useDialogSurface`'s own cleanup effect also releases it, via
       * `start()`, but only once React commits the `onClose()` state
       * update, a tick or two after this handler returns. Lenis's
       * `start()` resets ANY in-flight scroll animation as a side effect
       * (see its `internalStart` -> `reset`), so if the `navigate()` call
       * below has already armed the smooth-scroll to the section, that
       * later, delayed `start()` lands mid-flight and kills it, silently:
       * the URL changes, the menu closes, but the page never moves.
       *
       * Calling `start()` here first front-runs that: `scrollTo` then runs
       * against a lock that is already released, so nothing arrives
       * afterward to reset what it just armed. The lock is reference
       * counted, so the effect's own later `start()` call is a no-op by
       * then, not a second unlock.
       */
      start();
      onClose();
      void navigate(event.currentTarget.href, { cause: 'hash', trigger }).catch(
        () => undefined,
      );
    },
    [navigate, onClose, start],
  );

  // Same dialog contract as the conversation drawer, same implementation.
  useDialogSurface({
    open,
    panelRef,
    initialFocusRef: closeRef,
    onClose,
    returnFocusRef: triggerRef,
  });

  /*
   * Rendered into `document.body`, not into the header.
   *
   * `useDialogSurface` marks `#root` inert while a dialog is open; a menu that
   * lived inside it would make itself unreachable. This is also what the
   * conversation drawer does, for the same reason.
   */
  return createPortal(
    <AnimatePresence initial={false}>
      {open && (
        <Overlay
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={ui.menu.label}
          variants={surfaceMotion}
          initial="closed"
          animate="open"
          exit="closed"
        >
          <Top>
            <span>VITU</span>
            <Close ref={closeRef} type="button" onClick={onClose}>
              {ui.menu.close}
            </Close>
          </Top>
          <Links aria-label={ui.menu.navigation}>
            {nav.links.map((link) => (
              <MenuLink
                key={link.href}
                href={`/${link.href}`}
                variants={linkMotion}
                onClick={handleNavigation}
              >
                {link.label}
              </MenuLink>
            ))}
          </Links>
          {/* Closes the menu and opens the drawer in one commit: React runs the
              menu's teardown before the drawer's effect, so the scroll lock and
              the inert background hand over rather than fight. */}
          <Bottom>
            <MenuTalk aria-label={ui.talkToMe} onClick={onClose} />
            <LanguageSwitch />
          </Bottom>
        </Overlay>
      )}
    </AnimatePresence>,
    document.body,
  );
}
