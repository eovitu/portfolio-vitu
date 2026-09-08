import styled from 'styled-components';

const decisions = [
  [
    'Two doors, not one funnel',
    'Workers and households arrive for opposite reasons. Splitting them at the first tap meant building two products instead of one compromise.',
  ],
  [
    'A form that matches the job',
    'Social name, available shifts, last employer as a reference. Every field maps to something a household actually asks before hiring, and nothing that it doesn’t.',
  ],
  [
    'When the GPS says no',
    'Location permission gets denied constantly. A postal-code fallback keeps the search alive instead of ending the session there.',
  ],
  [
    'The whole listing, up front',
    'Schedule, duties, requirements, benefits, rate. Holding back the pay until later wastes the time of the person who needs the work most.',
  ],
  [
    'One tap, with the rule stated',
    'Applying is a single confirmation, and that screen says plainly when the household gets to see your data.',
  ],
  [
    'Something to come back to',
    'Applications you can track. The product’s job doesn’t end at the apply button.',
  ],
] as const;

const Journey = styled.section`
  padding: clamp(64px, 8vw, 120px) clamp(20px, 5vw, 80px);
  background: #e99569;
  color: #302218;
  > header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 64px;
  }
  h2 {
    margin: 0;
    font-size: clamp(46px, 7vw, 112px);
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 56px;
  }
  li {
    padding: 34px 0 44px;
    border-top: 1px solid #9f654a;
  }
  li > span {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 12px;
  }
  h3 {
    margin: 30px 0 20px;
    font-size: clamp(28px, 3vw, 46px);
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
  }
`;

export default function EmploymentJourney() {
  return (
    <Journey aria-labelledby="journey-title">
      <header>
        <h2 id="journey-title">
          Every tap.
          <br />A decision.
        </h2>
        <p>
          Six moments that shape the journey from looking for work to following an
          application.
        </p>
      </header>
      <ol>
        {decisions.map(([title, body], index) => (
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
