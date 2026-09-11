import styled from 'styled-components';
import { useLanguage } from '../providers/LanguageProvider';

const Bar = styled.footer`
  width: min(100%, 1500px);
  margin: 0 auto;
  padding: 28px ${({ theme }) => theme.space.gutter} 34px;
  display: grid;
  gap: 28px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.textGhost};
  border-top: 1px solid ${({ theme }) => theme.colors.line};

  ${({ theme }) => theme.media.mobile} {
    padding: 24px 20px 30px;
    display: grid;
    gap: 10px;
  }
`;

const Transmission = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px 18px;
`;

/** The closing transmission line, part of the contact composition. */
export function Footer() {
  const { content } = useLanguage();
  return (
    <Bar data-warp data-gravity-section>
      <Transmission>
        {content.footer.items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </Transmission>
    </Bar>
  );
}
