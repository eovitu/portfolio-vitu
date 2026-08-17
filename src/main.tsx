import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {
  consumeSnapshot,
  initReloadSnapshot,
  isReloadNavigation,
} from './lib/reloadSnapshot';
import { destroyGhosts, mountGhosts } from './lib/ghosts';
import { installAudit, markFirstUsefulFrame } from './lib/introAudit';
import { prefersReducedMotion } from './lib/prefersReducedMotion';

/**
 * Everything here runs BEFORE the first React render, on purpose.
 *
 * The whole point of the reload choreography is that the reader never sees a
 * seam. If the ghosts of the previous screen were mounted from a React effect
 * they would arrive a frame or two after the hero has already painted — and
 * the reader would see the page jump to the top and *then* pretend it hadn't.
 * Painting them first makes the very first frame look like nothing happened.
 */
initReloadSnapshot();
installAudit();

const snapshot = prefersReducedMotion()
  ? null
  : isReloadNavigation()
    ? consumeSnapshot()
    : null;
const layer = snapshot ? mountGhosts(snapshot) : null;

if (layer) {
  document.documentElement.classList.add('warp-staging');
  markFirstUsefulFrame('reload', 1, layer.fragments.length, layer.fidelity);

  /**
   * Failsafe. If the intro never runs — a thrown effect, a hot reload, an
   * unsupported browser — the reader must not be left staring at a frozen
   * screenshot of where they were with the real page hidden underneath.
   */
  window.setTimeout(() => {
    if (document.documentElement.classList.contains('warp-staging')) {
      document.documentElement.classList.remove('warp-staging');
      destroyGhosts();
    }
  }, 4000);
} else {
  markFirstUsefulFrame(prefersReducedMotion() ? 'reduced' : 'first-visit', 0, 0);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
