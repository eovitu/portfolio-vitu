import { useCallback, useRef, useState, type MouseEvent } from 'react';
import styled from 'styled-components';
import { nav } from '../../lib/content';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';
import { MobileMenu } from './MobileMenu';

const Bar = styled.header`
  position: fixed;
  inset: 0 0 auto 0;
  z-index: ${({ theme }) => theme.z.nav};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  min-height: 68px;
  padding: 14px ${({ theme }) => theme.space.gutter};
  color: ${({ theme }) => theme.colors.text};
  background: linear-gradient(to bottom, rgba(8, 8, 10, 0.88), rgba(8, 8, 10, 0));
  font: 400 11px/1 ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.15em;
  text-transform: uppercase;

  ${({ theme }) => theme.media.mobile} {
    padding: 12px 20px;
  }
`;

const Brand = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const DesktopNav = styled.nav`
  display: flex;
  align-items: center;
  gap: clamp(16px, 2vw, 30px);

  a {
    padding: 10px 0;
    color: ${({ theme }) => theme.colors.textMuted};
  }
  a:hover,
  a:focus-visible {
    color: ${({ theme }) => theme.colors.text};
  }
  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

const MenuButton = styled.button`
  display: none;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 10px 0 10px 16px;
  font: inherit;
  letter-spacing: inherit;
  ${({ theme }) => theme.media.mobile} {
    display: inline-flex;
  }
`;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { scrollTo } = useSmoothScroll();

  const navigate = useCallback(
    (href: string) => {
      if (href === '#top') {
        scrollTo(0);
        return;
      }
      const target = document.querySelector<HTMLElement>(href);
      if (target) scrollTo(target);
    },
    [scrollTo],
  );

  const onAnchor = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (window.location.pathname !== '/') return;
    event.preventDefault();
    navigate(href);
  };

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  return (
    <>
      <Bar data-nav>
        <Brand href="/#top" onClick={(event) => onAnchor(event, '#top')}>
          {nav.brand}
        </Brand>
        <DesktopNav aria-label="Primary navigation">
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={`/${link.href}`}
              onClick={(event) => onAnchor(event, link.href)}
            >
              {link.label}
            </a>
          ))}
        </DesktopNav>
        <MenuButton
          ref={menuButtonRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          MENU
        </MenuButton>
      </Bar>
      <MobileMenu open={menuOpen} onClose={closeMenu} onNavigate={navigate} />
    </>
  );
}
