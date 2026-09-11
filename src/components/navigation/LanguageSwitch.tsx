import styled from 'styled-components';
import { useLanguage } from '../providers/LanguageProvider';

const Group = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--border);
  border-radius: 100px;

  button {
    min-width: 44px;
    min-height: 42px;
    padding: 8px 10px;
    border: 0;
    border-radius: 100px;
    color: var(--ink-muted);
    background: transparent;
    font: inherit;
    letter-spacing: inherit;
    transition:
      color 180ms ease,
      background 180ms ease,
      transform 180ms ease;
  }

  button[aria-pressed='true'] {
    color: var(--surface);
    background: var(--ink);
  }

  button:hover,
  button:focus-visible {
    color: var(--accent);
  }

  button[aria-pressed='true']:hover,
  button[aria-pressed='true']:focus-visible {
    color: var(--surface);
  }

  button:active {
    transform: scale(0.96);
  }
`;

export function LanguageSwitch() {
  const { locale, setLocale, content } = useLanguage();
  const { ui } = content;

  return (
    <Group role="group" aria-label={ui.locale.label}>
      <button
        type="button"
        aria-label={ui.locale.portuguese}
        aria-pressed={locale === 'pt'}
        onClick={() => setLocale('pt')}
      >
        PT
      </button>
      <button
        type="button"
        aria-label={ui.locale.english}
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </Group>
  );
}
