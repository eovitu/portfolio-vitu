import { CaretDown } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../providers/LanguageProvider';

const Group = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 2px;
  button {
    min-width: 44px;
    min-height: 44px;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
  }
`;
const List = styled.ul`
  &[hidden] {
    display: none;
  }
  position: absolute;
  top: 100%;
  left: -18px;
  min-width: 240px;
  margin: 0;
  padding: 12px 18px;
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 12px 32px #0003;
  li a {
    display: flex;
    min-height: 44px;
    font-size: 12px;
  }
`;

export function WorkDisclosure({ label, href }: { label: string; href: string }) {
  const { content } = useLanguage();
  const [open, setOpen] = useState(false);
  const group = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!group.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return (
    <Group
      ref={group}
      data-nav-item
      onPointerEnter={(event) => {
        if (
          event.pointerType === 'mouse' &&
          matchMedia('(hover: hover) and (pointer: fine)').matches
        )
          setOpen(true);
      }}
      onPointerLeave={() => {
        if (!group.current?.contains(document.activeElement)) setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <a href={href} data-transition-cause="hash">
        {label}
      </a>
      <button
        ref={button}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls="work-project-links"
        onClick={() => setOpen(!open)}
      >
        <CaretDown aria-hidden="true" />
      </button>
      <List id="work-project-links" hidden={!open}>
        {content.projects.map((project) => (
          <li key={project.slug}>
            <a
              href={`/#work-${project.slug}`}
              data-transition-cause="hash"
              onClick={() => setOpen(false)}
            >
              {project.name}
            </a>
          </li>
        ))}
      </List>
    </Group>
  );
}
