import { forwardRef } from 'react';
import * as S from './RouteTransitionOverlay.styles';

export const RouteTransitionOverlay = forwardRef<HTMLDivElement>(function Overlay(
  _props,
  ref,
) {
  return (
    <S.Overlay ref={ref} aria-hidden="true" data-route-transition-overlay>
      <S.Core />
    </S.Overlay>
  );
});
