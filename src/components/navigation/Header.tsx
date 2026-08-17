import { useRef, type MouseEvent } from 'react';
import styled from 'styled-components';
import { nav } from '../../lib/content';
import { useSmoothScroll, useAnimationFrame } from '../providers/SmoothScrollProvider';
import { EASE_CSS } from '../../lib/motion';

const Bar = styled.header`
  position: fixed;
  inset: 0 0 auto 0;
  z-index: ${({ theme }) => theme.z.nav};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: ${({ theme }) => theme.space.navY} ${({ theme }) => theme.space.gutter};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.mono};
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textDim};
  transform: translateY(-110%);
  background: rgba(8, 8, 10, 0);
  backdrop-filter: blur(10px);
  transition: background 0.5s ease;

  ${({ theme }) => theme.media.mobile} {
    padding: 14px 20px;
    gap: 12px;
  }
`;

const Brand = styled.a`
  display: flex;
  gap: 10px;
  align-items: center;
  opacity: 0;
  white-space: nowrap;

  span {
    width: 5px;
    height: 5px;
    background: ${({ theme }) => theme.colors.accent};
    border-radius: 50%;
    animation: blink 3.5s ease-in-out infinite;
  }

  ${({ theme }) => theme.media.mobile} {
    font-size: 10px;
  }
`;

const Links = styled.nav`
  display: flex;
  gap: 24px;
  align-items: center;

  ${({ theme }) => theme.media.mobile} {
    gap: 14px;
  }
`;

const NavLink = styled.a`
  opacity: 0;

  ${({ theme }) => theme.media.mobile} {
    /* At 375px the brand + three anchors + CTA cannot coexist without
       clipping the CTA. The anchors are dropped rather than shrunk: the
       sections are reached by scrolling, and the CTA is the design's primary
       action. The skip link still exposes the same targets to keyboards. */
    display: none;
  }
`;

const ChatTrigger = styled.button`
  opacity: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font: inherit;
  letter-spacing: 0.16em;
  padding: 9px 16px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    border-color 0.35s ease,
    color 0.35s ease,
    transform 0.4s ${EASE_CSS};

  &:hover,
  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.text};
  }

  ${({ theme }) => theme.media.mobile} {
    padding: 8px 12px;
    font-size: 10px;
  }
`;

interface Props {
  onOpenChat: () => void;
  chatOpen: boolean;
}

/**
 * Fixed header. It slides in from the hero timeline (which targets
 * `[data-nav]` / `[data-nav-item]`), and its background opacity is driven
 * imperatively from the frame loop past half a viewport of scroll.
 */
export function Header({ onOpenChat, chatOpen }: Props) {
  const barRef = useRef<HTMLElement>(null);
  const solid = useRef(false);
  const { scrollTo } = useSmoothScroll();

  useAnimationFrame(() => {
    const el = barRef.current;
    if (!el) return;
    const next = window.scrollY > window.innerHeight * 0.5;
    if (next === solid.current) return;
    solid.current = next;
    el.style.background = next ? 'rgba(8,8,10,0.78)' : 'rgba(8,8,10,0)';
  });

  const onAnchorClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const el = document.querySelector<HTMLElement>(href);
    if (!el) return;
    event.preventDefault();
    scrollTo(el);
  };

  return (
    // The bar itself is the warp target, not its links: past half a viewport it
    // paints a translucent background and a backdrop blur, so swallowing only
    // the children would leave that strip floating. `reload` mode keeps the
    // first-visit slide-in (`[data-nav]` / `[data-nav-item]`) untouched.
    <Bar ref={barRef} data-nav data-warp data-warp-mode="reload">
      <Brand href="#top" data-nav-item onClick={(e) => onAnchorClick(e, '#top')}>
        <span aria-hidden="true" />
        {nav.brand}
      </Brand>

      <Links aria-label="Navegação principal">
        {nav.links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            data-nav-item
            onClick={(e) => onAnchorClick(e, link.href)}
          >
            {link.label}
          </NavLink>
        ))}
        <ChatTrigger
          type="button"
          data-nav-item
          onClick={onOpenChat}
          aria-haspopup="dialog"
          aria-expanded={chatOpen}
        >
          {nav.cta}
        </ChatTrigger>
      </Links>
    </Bar>
  );
}
