import styled from 'styled-components';
import { useLanguage } from '../providers/LanguageProvider';

const Journey = styled.section`
  min-height: 100svh;
  padding: 108px clamp(20px, 5vw, 80px);
  background: #e99569;
  color: #302218;
  > header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 32px;
  }
  h2 {
    margin: 0;
    font-size: clamp(46px, 5vw, 80px);
    line-height: 0.95;
    letter-spacing: -0.065em;
    font-weight: 500;
  }
  header p {
    margin: auto 0 0;
    max-width: 36ch;
    font-size: 20px;
    line-height: 1.5;
  }
  ol {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0 28px;
  }
  li {
    scroll-margin-top: 108px;
    padding: 24px 0;
    border-top: 1px solid #9f654a;
  }
  li > span {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 12px;
  }
  h3 {
    margin: 30px 0 20px;
    font-size: clamp(28px, 2.3vw, 36px);
    line-height: 1.06;
    letter-spacing: -0.04em;
    font-weight: 500;
    max-width: 15ch;
  }
  li p {
    max-width: 46ch;
    margin: 0;
    font-size: 17px;
    line-height: 1.6;
  }
  @media (max-width: 700px) {
    > header,
    ol {
      grid-template-columns: 1fr;
    }
    li {
      min-height: calc(100svh - 108px);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
`;

export default function EmploymentJourney() {
  const { content } = useLanguage();
  const copy = content.ui.employment;
  return (
    <Journey data-scroll-boundary aria-labelledby="journey-title">
      <header>
        <h2 id="journey-title">
          {copy.title[0]}
          <br />
          {copy.title[1]}
        </h2>
        <p>{copy.intro}</p>
      </header>
      <ol>
        {copy.decisions.map(([title, body], index) => (
          <li key={title}>
            <span>{String(index + 1).padStart(2, '0')} / 06</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>
    </Journey>
  );
}
