import { useEffect, type RefObject } from 'react';
import { useSmoothScroll } from '../components/providers/SmoothScrollProvider';

/**
 * The behaviour every modal surface on this site shares.
 *
 * The conversation drawer worked this out first: lock the document without a
 * layout shift, hand Lenis its own lock so the two scroll owners do not fight,
 * move focus in, keep Tab inside, close on Escape, and give focus back to
 * whatever opened it. The mobile menu is the same dialog with different
 * contents, so it uses the same implementation rather than a second one that
 * drifts.
 *
 * The one thing this adds to the original is `inert` on the rest of the
 * document. A key handler can only trap the keys it sees; it cannot stop a
 * screen reader's virtual cursor or a browser's own find-in-page from walking
 * into the page behind the dialog.
 */
const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DialogSurfaceOptions {
  open: boolean;
  /** The dialog itself. Focus is kept inside it. */
  panelRef: RefObject<HTMLElement>;
  /** What receives focus when the dialog opens. */
  initialFocusRef: RefObject<HTMLElement>;
  onClose: () => void;
  /**
   * What receives focus when it closes. Usually the control that opened it,
   * which for the conversation drawer is a different button each time, so the
   * ref is mutable rather than bound to one node.
   */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

export function useDialogSurface({
  open,
  panelRef,
  initialFocusRef,
  onClose,
  returnFocusRef,
}: DialogSurfaceOptions): void {
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    // Captured now: by cleanup time the ref may already point elsewhere.
    const returnTo = returnFocusRef?.current ?? null;
    const background = document.getElementById('root');
    const backgroundWasInert = background?.hasAttribute('inert') ?? false;

    document.body.style.overflow = 'hidden';
    stop();
    if (background && !backgroundWasInert) background.setAttribute('inert', '');
    const focusFrame = window.requestAnimationFrame(() => initialFocusRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      // Focus can also be outside the panel entirely, the browser may have
      // left it on the body after the trigger was removed.
      if (!panelRef.current.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      if (background && !backgroundWasInert) background.removeAttribute('inert');
      start();
      // After `inert` is gone, or the focus lands on an inert element and the
      // browser drops it to the body instead.
      window.requestAnimationFrame(() => returnTo?.focus({ preventScroll: true }));
    };
  }, [open, onClose, panelRef, initialFocusRef, returnFocusRef, start, stop]);
}
