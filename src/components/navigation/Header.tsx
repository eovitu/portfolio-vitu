import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styled from 'styled-components';
import { nav } from '../../lib/content';
import { MobileMenu } from './MobileMenu';
import { TalkToMeButton } from '../conversation/TalkToMeButton';

const Bar = styled.header`
  position: fixed;
  inset: 0 0 auto 0;
  z-index: ${({ theme }) => theme.z.nav};
  padding: 16px ${({ theme }) => theme.space.gutter};
  pointer-events: none;
  @media (max-width: 560px) {
    padding: 10px 12px;
  }
`;

const Inner = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  min-height: 76px;
  padding: 10px 22px;
  max-width: 1500px;
  margin: 0 auto;
  pointer-events: auto;
  /*
   * Legible over anything, without knowing what it is over.
   *
   * The bar has to hold on the dark home, on the cream case, and over a
   * bright video passing underneath it, and it must keep holding when a
   * fourth surface arrives. So it does not branch on the route: it paints the
   * active surface behind itself, at an opacity that survives whatever the
   * page puts under it, and takes its ink from the same token pair. Nothing
   * here reads a slug.
   */
  color: var(--ink);
  isolation: isolate;
  font: 400 14px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.08em;
  text-transform: uppercase;

  @media (max-width: 900px) {
    min-height: 60px;
    padding: 8px 16px;
  }
`;

const Backdrop = styled.span`
  position: absolute;
  inset: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 100px;
  z-index: -1;
`;

const BrandPosition = styled.div`
  display: flex;
`;
const TalkPosition = styled.div`
  display: flex;
  @media (max-width: 900px) {
    display: none;
  }
`;

const Brand = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  min-height: 48px;
  font: 500 32px/1 ${({ theme }) => theme.fonts.sans};
  text-transform: lowercase;
  letter-spacing: -0.065em;
  span {
    color: var(--accent);
  }
`;

const DesktopNav = styled.nav`
  display: flex;
  align-items: center;
  gap: clamp(16px, 2vw, 30px);

  a {
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    padding: 10px 0;
    color: var(--ink-muted);
  }
  a:hover,
  a:focus-visible {
    color: var(--ink);
  }
  @media (max-width: 900px) {
    display: none;
  }
`;

const MenuButton = styled.button`
  display: none;
  border: 0;
  background: transparent;
  color: inherit;
  align-items: center;
  justify-content: center;
  padding: 12px;
  min-width: 76px;
  min-height: 48px;
  font: inherit;
  letter-spacing: inherit;
  @media (max-width: 900px) {
    display: inline-flex;
  }
`;

const DesktopTalk = styled(TalkToMeButton)`
  border-radius: 100px;
  min-height: 48px;
  @media (max-width: 900px) {
    display: none;
  }
`;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner || reduced) return;
    // Entry owns the outer bar; scroll exclusively owns this inner transform.
    const ctx = gsap.context(() => {
      const inset = () => Math.max(0, (inner.clientWidth - 900) / 2);
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { start: 0, end: 260, scrub: true, invalidateOnRefresh: true },
        })
        .to(inner, { y: -6 }, 0)
        .to(
          inner.querySelector('[data-nav-backdrop]'),
          { scaleX: () => Math.min(1, 900 / inner.clientWidth) },
          0,
        )
        .to(inner.querySelector('[data-brand-position]'), { x: inset }, 0)
        .to(inner.querySelector('[data-talk-position]'), { x: () => -inset() }, 0);
    }, inner);
    return () => ctx.revert();
  }, [reduced]);

  // Focus restoration belongs to the dialog, which knows when it is actually
  // gone and when the background has stopped being inert.
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      {/* `data-nav` and `data-nav-item` are the entry sequence's only hold on
          this component: it reveals the bar and staggers its items as the
          expulsion clears. The hidden state is set from JavaScript and never in
          CSS, so navigation stays visible when scripts do not run. */}
      <Bar data-nav>
        <Inner ref={innerRef}>
          <Backdrop aria-hidden="true" data-nav-backdrop />
          <BrandPosition data-brand-position>
            <Brand
              href="/#top"
              aria-label={nav.brand}
              data-transition-cause="brand"
              data-nav-item
            >
              vitu<span>*</span>
            </Brand>
          </BrandPosition>
          <DesktopNav aria-label="Primary navigation">
            {nav.links.map((link) => (
              <a
                key={link.href}
                href={`/${link.href}`}
                data-transition-cause="hash"
                data-nav-item
              >
                {link.label}
              </a>
            ))}
          </DesktopNav>
          <TalkPosition data-talk-position>
            <DesktopTalk aria-label="Talk to me" />
          </TalkPosition>
          <MenuButton
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            data-nav-item
            onClick={() => setMenuOpen(true)}
          >
            MENU
          </MenuButton>
        </Inner>
      </Bar>
      <MobileMenu open={menuOpen} onClose={closeMenu} triggerRef={menuButtonRef} />
    </>
  );
}
