import styled from 'styled-components';
import { footer } from '../../lib/content';

const Bar = styled.footer`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 18px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.16em;
  color: ${({ theme }) => theme.colors.textGhost};
`;

/** The closing transmission line — part of the contact composition. */
export function Footer() {
  return (
    <Bar data-warp>
      {footer.items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </Bar>
  );
}
