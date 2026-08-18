import { useRef } from 'react';
import styled from 'styled-components';
import { useAnimationFrame } from '../providers/SmoothScrollProvider';
import { START_RS, horizonProgress, horizonRs, timeDilation } from '../../lib/horizon';

/**
 * Distance to the event horizon — the site's permanent instrument.
 *
 * This replaces the reading-progress bar outright rather than sitting beside
 * it: two progress systems on one page is two answers to the same question.
 * The bar's file is gone.
 *
 * The metric is real, not decorative. It reads in Schwarzschild radii (Rs),
 * the natural unit for "how close is this to the horizon": 12.00 Rs at the top
 * of the hero, 0.00 Rs at the end of CONTACT, where the page collapses into
 * the object. It falls monotonically with document progress, so the number is
 * always answering the reader's actual position.
 *
 * Form is a vertical rule with a travelling tick and a numeric readout — a
 * ruler measures distance, which a horizontal completion bar does not. It
 * lives on the right margin, in the accent, and is the one place on the page
 * where gold is unconditional: it is the concept made literal.
 */

/* Distance, dilation and progress all come from `lib/horizon`, so the HUD, the
   scroll's weight and the redshift can never disagree about where the reader
   is. */

const Frame = styled.div`
  position: fixed;
  right: 22px;
  top: 50%;
  transform: translateY(-50%);
  z-index: ${({ theme }) => theme.z.progress};
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  ${({ theme }) => theme.media.mobile} {
    right: 10px;
    gap: 8px;
  }
`;

const Readout = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.type.monoSm};
  letter-spacing: 0.16em;
  color: var(--chrome-accent);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

/** Time-dilation readout. Hidden near the top, where the rate is still 1. */
const Rate = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 8px;
  letter-spacing: 0.16em;
  color: var(--chrome-accent-muted);
  font-variant-numeric: tabular-nums;
  opacity: 0;
  transition: opacity 0.5s ease;
  white-space: nowrap;
`;

const Caption = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 8px;
  letter-spacing: 0.3em;
  color: var(--chrome-trace);
  writing-mode: vertical-rl;

  ${({ theme }) => theme.media.mobile} {
    display: none;
  }
`;

const Rule = styled.div`
  position: relative;
  width: 1px;
  height: 34vh;
  min-height: 180px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--chrome-line) 12%,
    var(--chrome-line) 88%,
    transparent
  );
`;

/** The travelling mark. Gold, 14px, the only thing on the rule that moves. */
const Tick = styled.div`
  position: absolute;
  left: -4px;
  top: 0;
  width: 9px;
  height: 1px;
  background: var(--chrome-accent);
  will-change: transform;
`;

/** Everything above the tick is distance already fallen through. */
const Fallen = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  background: var(--chrome-accent-muted);
  will-change: height;
`;

export function Hud() {
  const readout = useRef<HTMLDivElement>(null);
  const tick = useRef<HTMLDivElement>(null);
  const fallen = useRef<HTMLDivElement>(null);
  const rule = useRef<HTMLDivElement>(null);
  const rate = useRef<HTMLDivElement>(null);
  const last = useRef(-1);

  useAnimationFrame(() => {
    const p = horizonProgress();
    // Quantised to the displayed precision: below this the DOM write is a
    // no-op and the whole instrument costs nothing while the page is still.
    const rounded = Math.round(p * 10000);
    if (rounded === last.current) return;
    last.current = rounded;

    if (readout.current) {
      readout.current.textContent = `${horizonRs().toFixed(2)} Rs`;
    }
    /**
     * The instrument reports the dilation as well as the distance.
     *
     * The scroll going heavy is a felt effect with no explanation attached;
     * without a readout the reader can only conclude the page is janky. The
     * rate is shown as the observer's clock running slow — which is what is
     * actually happening to the scroll.
     */
    if (rate.current) {
      const d = timeDilation();
      rate.current.textContent = `Δt ×${d.toFixed(2)}`;
      rate.current.style.opacity = d > 1.04 ? '1' : '0';
    }
    const h = rule.current?.clientHeight ?? 0;
    if (tick.current) tick.current.style.transform = `translateY(${(p * h).toFixed(1)}px)`;
    if (fallen.current) fallen.current.style.height = `${(p * h).toFixed(1)}px`;
  });

  return (
    <Frame data-hud aria-hidden="true">
      <Readout ref={readout}>{START_RS.toFixed(2)} Rs</Readout>
      <Rule ref={rule}>
        <Fallen ref={fallen} />
        <Tick ref={tick} />
      </Rule>
      <Rate ref={rate} />
      <Caption>EVENT HORIZON</Caption>
    </Frame>
  );
}
