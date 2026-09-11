import styled from 'styled-components';
import { useLanguage } from '../providers/LanguageProvider';

const Integration = styled.section`
  padding: clamp(64px, 9vw, 140px) clamp(20px, 5vw, 80px);
  background: #c5edad;
  color: #193825;
  h2 {
    max-width: 13ch;
    margin: 0 0 40px;
    font-size: clamp(48px, 8vw, 128px);
    line-height: 0.94;
    letter-spacing: -0.06em;
    font-weight: 500;
  }
  p {
    max-width: 58ch;
    font-size: 20px;
    line-height: 1.5;
  }
  ol {
    list-style: none;
    margin: 64px 0;
    padding: 0;
    display: flex;
    gap: 16px;
    align-items: center;
  }
  li {
    flex: 1;
    padding: 36px 20px;
    border: 1px solid #193825;
    border-radius: 100px;
    text-align: center;
    font-size: clamp(20px, 3vw, 40px);
    letter-spacing: -0.035em;
  }
  li:nth-child(2) {
    color: #c5edad;
    background: #193825;
  }
  small {
    display: block;
    font: 400 12px/1.6 ${({ theme }) => theme.fonts.mono};
  }
  @media (max-width: 600px) {
    ol {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
    li {
      padding: 22px;
    }
  }
`;

export default function IntegrationStory() {
  const { content } = useLanguage();
  const copy = content.ui.integration;
  return (
    <Integration aria-labelledby="integration-title">
      <h2 id="integration-title">{copy.title}</h2>
      <p>{copy.intro}</p>
      <ol aria-label={copy.areasLabel}>
        {copy.areas.map((area) => (
          <li key={area}>{area}</li>
        ))}
      </ol>
      <small>{copy.note}</small>
      <p>{copy.body}</p>
    </Integration>
  );
}
