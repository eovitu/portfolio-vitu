import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { nav } from '../../lib/content';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.z.nav + 1};
  display: grid;
  grid-template-rows: auto 1fr;
  background: rgba(8, 8, 10, 0.98);
  padding: 18px 20px 32px;
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
  font: inherit;
  letter-spacing: inherit;
`;

const Links = styled.nav`
  align-self: center;
  display: grid;
  gap: 18px;

  a {
    font-size: clamp(42px, 15vw, 74px);
    line-height: 0.95;
    letter-spacing: -0.05em;
  }
`;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Overlay id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu">
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
    </Overlay>
  );
}
