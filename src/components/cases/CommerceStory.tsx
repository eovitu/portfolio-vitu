import styled from 'styled-components';
import { useLanguage } from '../providers/LanguageProvider';

const Story = styled.section`
  padding: clamp(64px, 9vw, 140px) clamp(20px, 5vw, 80px);
  background: #3b2318;
  color: #f2e9de;

  > header {
    display: grid;
    grid-template-columns: minmax(0, 0.7fr) minmax(0, 1.3fr);
    gap: clamp(28px, 6vw, 96px);
    align-items: end;
    margin-bottom: clamp(56px, 8vw, 112px);
  }

  small,
  li span {
    font: 400 12px/1.5 ${({ theme }) => theme.fonts.mono};
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2 {
    max-width: 15ch;
    margin: 0;
    font-size: clamp(44px, 6vw, 96px);
    line-height: 0.96;
    letter-spacing: -0.06em;
    font-weight: 500;
  }

  header p,
  footer {
    max-width: 52ch;
    font-size: 18px;
    line-height: 1.6;
  }

  ol {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin: 0;
    padding: 0;
    list-style: none;
    border-block: 1px solid #7a4428;
  }

  li {
    min-height: 270px;
    padding: 28px clamp(18px, 2.5vw, 36px);
    border-inline-start: 1px solid #7a4428;
  }

  li:first-child {
    border-inline-start: 0;
  }

  h3 {
    margin: 76px 0 18px;
    font-size: clamp(26px, 3vw, 42px);
    line-height: 1;
    letter-spacing: -0.045em;
    font-weight: 500;
  }

  li p {
    margin: 0;
    color: #d8c9bd;
    line-height: 1.55;
  }

  footer {
    margin-top: 36px;
    color: #d98c8c;
  }

  @media (max-width: 850px) {
    > header,
    ol {
      grid-template-columns: 1fr;
    }

    li,
    li:first-child {
      min-height: auto;
      border-inline-start: 0;
      border-block-start: 1px solid #7a4428;
    }

    li:first-child {
      border-block-start: 0;
    }

    h3 {
      margin-top: 36px;
    }
  }
`;

export default function CommerceStory() {
  const { content } = useLanguage();
  const copy = content.ui.commerce;

  return (
    <Story aria-labelledby="commerce-title">
      <header>
        <div>
          <small>{copy.kicker}</small>
          <h2 id="commerce-title">{copy.title}</h2>
        </div>
        <p>{copy.intro}</p>
      </header>
      <ol>
        {copy.steps.map(([title, body], index) => (
          <li key={title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>
      <footer>{copy.note}</footer>
    </Story>
  );
}
