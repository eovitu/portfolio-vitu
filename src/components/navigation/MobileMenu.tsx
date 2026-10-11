import { flushSync } from 'react-dom';
import { isEligibleInternalClick } from '../../motion/routeIntent';
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from 'react';
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
const ProjectsButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 44px;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--ink);
  font-family: inherit;
  font-size: clamp(38px, min(15vw, 9dvh), 74px);
  line-height: 0.95;
  letter-spacing: -0.05em;
  text-align: left;
  cursor: pointer;
  &:hover,
  &:focus-visible {
    color: var(--accent);
  }
  span {
    font-size: 0.65em;
    letter-spacing: 0;
  }
`;
const ProjectLinks = styled(motion.ul)`
  display: grid;
  gap: 8px;
  list-style: none;
  padding: 0 0 0 14px;
  border-left: 1px solid var(--border);
  margin: 0;
  overflow: hidden;
  a {
    display: flex;
    align-items: center;
    min-height: 48px;
    padding: 6px 0;
    font-size: 18px;
    line-height: 1.3;
    color: var(--ink-muted);
    transition:
      color 150ms ease,
      transform 150ms ease;
  }
  a:hover,
  a:focus-visible {
    color: var(--accent);
    transform: translateX(4px);
  }
  a:active {
    transform: translateX(2px);
  }
  @media (prefers-reduced-motion: reduce) {
    a {
      transition: none;
    }
    a:hover,
    a:focus-visible,
    a:active {
      transform: none;
    }
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
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const [readyProjects, setReadyProjects] = useState<string[]>([]);
  useLayoutEffect(() => {
    if (!open) {
      setProjectsExpanded(false);
      setReadyProjects([]);
    }
  }, [open]);
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

  const projectMotion: Variants = {
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: reduced ? 0 : 0.22,
        when: 'afterChildren',
        staggerChildren: reduced ? 0 : 0.035,
        staggerDirection: -1,
      },
      transitionEnd: { visibility: 'hidden' },
    },
    open: {
      height: 'auto',
      opacity: 1,
      visibility: 'visible',
      transition: {
        duration: reduced ? 0 : 0.28,
        when: 'beforeChildren',
        staggerChildren: reduced ? 0 : 0.045,
      },
    },
  };
  const handleNavigation = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!isEligibleInternalClick(event, event.currentTarget, window.location.origin))
        return;

      event.preventDefault();
      const trigger = event.currentTarget;
      const href = trigger.href;
      start();
      flushSync(onClose);
      // Dialog cleanup restores focus on the next frame. Navigate afterward,
      // so its destination focus wins even for same-route section links.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          void navigate(href, { cause: 'hash', trigger }).catch(() => undefined);
        }),
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
  if (typeof document === 'undefined') return null;
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
              <div key={link.href}>
                {link.href === '#work' ? (
                  <>
                    <ProjectsButton
                      type="button"
                      variants={linkMotion}
                      aria-expanded={projectsExpanded}
                      aria-controls="mobile-project-links"
                      onClick={() => {
                        setReadyProjects([]);
                        setProjectsExpanded((expanded) => !expanded);
                      }}
                    >
                      {link.label}
                      <span aria-hidden="true">{projectsExpanded ? '−' : '+'}</span>
                    </ProjectsButton>
                    <ProjectLinks
                      id="mobile-project-links"
                      aria-label={link.label}
                      aria-hidden={!projectsExpanded}
                      variants={projectMotion}
                      initial="closed"
                      animate={projectsExpanded ? 'open' : 'closed'}
                    >
                      {content.projects.map((project) => (
                        <motion.li
                          key={project.slug}
                          variants={linkMotion}
                          onAnimationComplete={(definition) => {
                            if (definition === 'open' && projectsExpanded) {
                              setReadyProjects((ready) =>
                                ready.includes(project.slug)
                                  ? ready
                                  : [...ready, project.slug],
                              );
                            }
                          }}
                        >
                          <a
                            href={
                              projectsExpanded && readyProjects.includes(project.slug)
                                ? `/#work-${project.slug}`
                                : undefined
                            }
                            tabIndex={
                              projectsExpanded && readyProjects.includes(project.slug)
                                ? 0
                                : -1
                            }
                            onClick={handleNavigation}
                          >
                            {project.name}
                          </a>
                        </motion.li>
                      ))}
                    </ProjectLinks>
                  </>
                ) : (
                  <MenuLink
                    href={`/${link.href}`}
                    variants={linkMotion}
                    onClick={handleNavigation}
                  >
                    {link.label}
                  </MenuLink>
                )}
              </div>
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
