import { useLayoutEffect } from 'react';
import { gsap } from '../lib/gsap';
import { requestRefresh } from '../lib/refreshGate';
import { EASE, HERO, INTRO } from '../lib/motion';
import { prefersReducedMotion } from '../lib/prefersReducedMotion';
import { veil } from '../lib/veil';
import { setActive as setFieldActive } from '../lib/gravityField';
import { heroSignal, resetHeroSignal } from '../three/heroSignal';
import { getGhostLayer, type GhostFragment, type GhostLayer } from '../lib/ghosts';
import { elapsedSinceFirstFrame, markEnd, sampleCamera } from '../lib/introAudit';
import {
  coreOrigin,
  dropNested,
  isOnScreen,
  offsetToCore,
  WARP,
  type Point,
} from '../lib/warpTargets';

interface Options {
  /** Called when the intro takes the screen — used to hold the scroll. */
  onLock?: () => void;
  /** Called once it has settled and control returns to the reader. */
  onRelease?: () => void;
}

/**
 * Warp targets that only exist for the reload choreography.
 *
 * A block like the hero's InfoGrid owns a first-visit entrance of its own (its
 * `[data-line]` children rise out of their masks). On a reload there is no such
 * entrance to protect, so the whole block is expelled as one piece — but on a
 * first visit it must be left entirely alone, or the two systems write the same
 * transform.
 */
const RELOAD_ONLY = '[data-warp-mode="reload"]';

/** Copy that simply arrives, rather than being thrown out of the core. */
const STAGED = ['[data-nav]', '[data-nav-item]', '[data-meta]', '[data-line]'].join(',');

/** The name is the site's signature: it is expelled whether it is on screen or not. */
const NAME = '[data-letter]';

/**
 * How much of the reader's old scroll altitude the camera actually travels, in
 * screen pixels.
 *
 * A literal 1:1 translation of 6500px would throw the ghosts off screen long
 * before the core could reach them. What has to read is *the ascent*, not its
 * true magnitude — so it is compressed and clamped to something the eye can
 * follow inside the budget.
 */
function travelDistance(fromScrollY: number): number {
  return Math.min(Math.max(fromScrollY * 0.18, 40), window.innerHeight * 0.5);
}

/**
 * Give every fragment its own curved path into the core.
 *
 * A straight line to a single point is what made the previous phase read as a
 * block sliding under the copy. The trajectory here is a quadratic Bézier: it
 * leaves sideways, bows, and only aligns with the core near the end — and the
 * control point is derived per fragment, so no two fragments share a path.
 */
function flightPath(fragment: GhostFragment, origin: Point, index: number) {
  const end = {
    x: (origin.x - fragment.center.x) * INTRO.absorb.pull,
    y: (origin.y - fragment.center.y) * INTRO.absorb.pull,
  };
  const length = Math.hypot(end.x, end.y) || 1;
  // Perpendicular to the flight, alternating side so the swarm splays instead
  // of all bowing the same way.
  const side = index % 2 ? 1 : -1;
  const bow = length * INTRO.reload.fall.curve * side;
  const control = {
    x: end.x / 2 + (-end.y / length) * bow,
    y: end.y / 2 + (end.x / length) * bow,
  };
  return { end, control };
}

/**
 * The singularity intro.
 *
 * Three modes, decided by what the previous page left behind:
 *
 * - **First visit** — the core appears and *expels* the name: the letters
 *   emerge from inside it and are thrown out to their places.
 * - **Staged reload** — a ghost layer (mounted before React rendered, from the
 *   snapshot taken on `pagehide`) is standing in for the screen the reader was
 *   looking at. It is dragged into the core along curved, individually-timed
 *   paths while the camera travels back up to the hero; the core holds what it
 *   has taken for a beat, then expels the real hero.
 * - **Reduced motion** — everything is simply placed in its finished state.
 *
 * A reload with no usable snapshot is deliberately indistinguishable from a
 * first visit: there is nothing to swallow, so nothing is faked.
 */
export function useSingularityIntro(
  ready: boolean,
  { onLock, onRelease }: Options = {},
): void {
  useLayoutEffect(() => {
    if (!ready) return;

    const reduce = prefersReducedMotion();
    const ghosts: GhostLayer | null = reduce ? null : getGhostLayer();
    const isReload = !!ghosts;

    const releaseStaging = () => {
      document.documentElement.classList.remove('warp-staging');
    };

    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>('[data-name-line]');
      const letters = gsap.utils.toArray<HTMLElement>(NAME);

      const settleStaged = () => {
        // NOT `clearProps` — these offsets come from CSS (`translateY(110%)`),
        // so clearing the inline transform would leave the copy hidden inside
        // its mask. Explicit zeros write an inline transform that wins.
        gsap.set(STAGED, { opacity: 1, y: 0, yPercent: 0 });
      };

      /**
       * Order is the whole trick of the STAGED / warp precedence: on a reload
       * the staged copy is put into its resting state FIRST, before anything is
       * measured, so the header is not found off screen and skipped.
       */
      if (isReload) settleStaged();

      const allWarp = dropNested(
        gsap.utils
          .toArray<HTMLElement>(WARP)
          // First visit: reload-only blocks keep their own staged entrance.
          .filter((el) => isReload || !el.matches(RELOAD_ONLY)),
      );
      const visible = allWarp.filter(isOnScreen);

      if (reduce || (!isReload && !visible.length)) {
        settleStaged();
        gsap.set(allWarp, { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 });
        gsap.set(letters, { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 });
        gsap.set('[data-gl]', { opacity: 1 });
        resetHeroSignal();
        ghosts?.destroy();
        releaseStaging();
        markEnd();
        return;
      }

      /**
       * Everything the intro will NOT touch has to be put into its finished
       * state right now — some warp targets carry a CSS resting offset (the
       * hero letters sit at `translateY(115%)` inside their mask) and would
       * otherwise stay hidden there forever.
       */
      const offscreen = allWarp.filter((el) => !visible.includes(el));
      if (offscreen.length) {
        gsap.set(offscreen, { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 });
      }

      /** The name is expelled from EVERY intro, on screen or not. */
      const expelled = visible.concat(letters.filter((el) => !visible.includes(el)));

      /**
       * Masks must be open while letters travel: they start far outside their
       * own line box and would be clipped away. Restored once the name lands.
       */
      gsap.set(lines, { overflow: 'visible' });

      // Measure from the settled layout, before any intro transform.
      gsap.set(expelled, { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 });
      const origin = coreOrigin();
      const outbound = expelled.map((el) => offsetToCore(el, origin, INTRO.expel.spread));

      /**
       * ── BUDGET ─────────────────────────────────────────────────────────
       *
       * The ceiling is measured from the first *painted* frame, so whatever
       * the mount gate already spent comes out of the same envelope. Every
       * phase survives; the give in the system is, in order: the expel
       * stagger, and then a uniform `timeScale` that plays the whole
       * choreography slightly faster rather than dropping any of it.
       */
      const { reload } = INTRO;
      const spent = isReload ? elapsedSinceFirstFrame() : 0;
      const available = Math.max(1.4, reload.target - spent);

      const absorbEnd = isReload
        ? reload.travel.at +
          Math.max(reload.travel.duration, reload.fall.spread + reload.fall.duration)
        : 0;
      const expelAt = isReload ? absorbEnd + reload.possession : 0.5;
      const expelDuration = isReload ? reload.expel.duration : INTRO.expel.duration;
      const expelStagger = isReload
        ? Math.max(
            0.008,
            Math.min(
              reload.expel.stagger,
              (available - expelAt - expelDuration) / Math.max(1, expelled.length - 1),
            ),
          )
        : INTRO.expel.stagger;
      /** The moment the last expelled element lands: the end of the sequence. */
      const expelEnd =
        expelAt + expelDuration + expelStagger * Math.max(0, expelled.length - 1);
      const compress = isReload && expelEnd > available ? expelEnd / available : 1;

      /**
       * The sequence is over when the last element *lands*, not when the
       * timeline runs out.
       *
       * The core keeps coasting for another beat or so after that (the energy
       * bleed-off below), which is deliberate — but the reader must not be
       * locked out of the page for it, and it must not be billed to the 3.2s
       * budget either. Both the release and the clock stop here.
       */
      let landed = false;
      const land = () => {
        if (landed) return;
        landed = true;
        // Masks close only now: the letters are back at y: 0, so nothing
        // still in flight can be clipped away by them.
        gsap.set(lines, { overflow: 'hidden' });
        ghosts?.destroy();
        releaseStaging();
        veil.override = -1;
        /**
         * Hand the hero's scrubbed exit back its authority: `useHeroExit`
         * caches state that an intro can leave stale.
         */
        requestRefresh('intro:landed');
        markEnd();
        /**
         * Only now does the gravitational field take over the glyphs. It is
         * inert for the whole intro on purpose: the expulsion owns the letters
         * until it is finished, and a field pulling on them mid-flight would
         * be a third writer competing with the timeline.
         */
        setFieldActive(true);
        onRelease?.();
      };

      const tl = gsap.timeline({
        defaults: { ease: EASE },
        onStart: () => onLock?.(),
        // Belt and braces: if the landing callback is ever skipped (a seek, a
        // revert mid-flight) the page must still be handed back.
        onComplete: land,
      });

      if (isReload && ghosts) {
        // The phenomenon is already there on a reload — it must not be fading
        // up while it is supposed to be swallowing the page.
        gsap.set('[data-gl]', { opacity: 1 });

        /**
         * The object is the destination of the journey, so it cannot be the
         * thing that is painted out. The veil is off for the WHOLE intro and
         * only handed back to the scroll once the hero has landed — and since
         * every load now ends at the top, its resting value there is 0 anyway.
         */
        veil.override = 0;

        /**
         * Put the real composition into its pre-expulsion state and only THEN
         * drop the staging class. The order matters: released first, the hero
         * would flash behind the ghosts for a frame.
         */
        gsap.set(expelled, {
          x: (i: number) => outbound[i].x,
          y: (i: number) => outbound[i].y,
          scale: INTRO.expel.scale,
          opacity: 0,
        });
        releaseStaging();

        /**
         * ── CAMERA + ABSORB, ONE MOVEMENT ───────────────────────────────
         *
         * These are deliberately not two tweens on two objects. The travel
         * used to live on the ghost layer's own transform, and that was wrong
         * in a way that only measurement caught: the layer's translation
         * dragged the *destination* with it, so from CONTACT — where the
         * travel is longest — matter was being swallowed ~400px above the
         * object rather than into it. The core is the one thing on screen that
         * must not move.
         *
         * So the ascent is folded into every fragment's own path, weighted by
         * how far gravity has already claimed it: at rest a fragment rides the
         * camera completely, and by the time it reaches the horizon the camera
         * term has decayed to nothing and it lands exactly on the core. One
         * render pass writes both, which is also why this is a single master
         * tween rather than one tween per fragment.
         */
        const distance = travelDistance(ghosts.fromScrollY);
        const cameraEase = gsap.parseEase(reload.travel.ease);
        const fallEase = gsap.parseEase(reload.fall.ease);

        // Farthest first: gravity reaches the outside of the frame before it
        // reaches what is already near the core.
        const ordered = ghosts.fragments
          .map((f, i) => ({ f, i }))
          .sort((a, b) => b.f.distance - a.f.distance);
        const span = Math.max(1, ordered.length - 1);

        /**
         * The last few fragments in are not simply deleted at the horizon.
         *
         * A beat of possession that is literally an empty screen is the dead
         * black frame this choreography exists to avoid — it is what the
         * previous phase had to remove. So the matter that arrives last stays
         * visible *as* the thing the core is holding: a collapsing point of
         * light at the singularity, which fades out only as the expulsion
         * starts. The beat is kept, the empty frame is not.
         */
        const HELD = 4;
        const heldFrom = Math.max(0, ordered.length - HELD);

        const flights = ordered.map(({ f, i }, rank) => ({
          f,
          held: rank >= heldFrom,
          delay: (rank / span) * reload.fall.spread,
          spin: (i % 2 ? 1 : -1) * reload.fall.spin,
          ...flightPath(f, origin, i),
        }));

        const absorbWindow = Math.max(
          reload.travel.duration,
          reload.fall.spread + reload.fall.duration,
        );
        const master = { u: 0 };
        tl.to(
          master,
          {
            u: 1,
            duration: absorbWindow,
            ease: 'none',
            onUpdate: () => {
              const elapsed = master.u * absorbWindow;
              const cp = cameraEase(
                Math.min(1, Math.max(0, elapsed / reload.travel.duration)),
              );
              // Altitude in scroll pixels: starts where the reader was, ends
              // at the hero. Monotonic by construction.
              sampleCamera(ghosts.fromScrollY * (1 - cp));

              for (const fl of flights) {
                const raw = Math.min(
                  1,
                  Math.max(0, (elapsed - fl.delay) / reload.fall.duration),
                );
                const t = fallEase(raw);
                const inv = 1 - t;
                // Quadratic Bézier to the core…
                const bx = 2 * inv * t * fl.control.x + t * t * fl.end.x;
                const by = 2 * inv * t * fl.control.y + t * t * fl.end.y;
                // …plus the ascent, which decays as gravity takes over so the
                // landing point stays pinned to the object.
                const cy = -distance * cp * (1 - t);
                const scale = 1 + (reload.fall.scale - 1) * t;
                const el = fl.f.el;
                el.style.transform = `translate3d(${bx.toFixed(2)}px, ${(by + cy).toFixed(2)}px, 0) rotate(${(fl.spin * t).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
                // Holds its substance for most of the fall, then goes out at
                // the horizon — matter consumed, not a cross-fade.
                const fade = Math.max(0, 1 - t * t * t * 1.35);
                if (fl.held) el.style.opacity = String(Math.max(0.4, fade));
                else if (raw >= 1) el.style.display = 'none';
                else el.style.opacity = String(fade);
              }
            },
          },
          reload.travel.at,
        );

        // The held remnant: still at the core, collapsing, handed over to the
        // expulsion rather than cut.
        for (const fl of flights) {
          if (!fl.held) continue;
          tl.to(
            fl.f.el,
            {
              opacity: 0,
              scale: 0.02,
              duration: reload.possession + 0.12,
              ease: 'power2.in',
              onComplete: () => {
                fl.f.el.style.display = 'none';
              },
            },
            absorbEnd,
          );
        }

        tl.to(
          heroSignal,
          {
            energy: INTRO.signal.absorb.energy,
            swell: INTRO.signal.absorb.swell,
            flare: INTRO.signal.absorb.flare,
            duration: reload.fall.spread + reload.fall.duration,
            ease: 'power2.in',
          },
          reload.travel.at,
        )
          // It swallows, then eases off — under the expulsion, not before it.
          .to(
            heroSignal,
            {
              energy: 0.12,
              swell: 0,
              flare: 0.1,
              duration: reload.possession,
              ease: 'power2.out',
            },
            absorbEnd,
          )
          // Nothing of the theatre survives the ingestion — but only once the
          // held remnant has finished collapsing, or the beat of possession
          // would be cut out from under it.
          .call(() => ghosts.destroy(), undefined, expelAt + 0.15);
      } else {
        // First visit: the core is the first thing on screen. It is what
        // everything else comes out of.
        releaseStaging();
        tl.to(
          '[data-gl]',
          { opacity: 1, duration: HERO.canvas.duration, ease: HERO.canvas.ease },
          HERO.canvas.at,
        );
        gsap.set(expelled, {
          x: (i: number) => outbound[i].x,
          y: (i: number) => outbound[i].y,
          scale: INTRO.expel.scale,
          opacity: 0,
        });
      }

      // ── EXPEL ────────────────────────────────────────────────────────────
      // Matter thrown clear of the core: each element leaves at its own
      // moment, decelerating hard (expo.out) into place — mass, not a fade.
      tl.to(
        heroSignal,
        {
          energy: INTRO.signal.expel.energy,
          swell: INTRO.signal.expel.swell,
          flare: INTRO.signal.expel.flare,
          duration: 0.4,
          ease: 'power2.out',
        },
        expelAt,
      )
        .fromTo(
          expelled,
          {
            x: (i: number) => outbound[i].x,
            y: (i: number) => outbound[i].y,
            scale: INTRO.expel.scale,
            rotate: (i: number) => (i % 2 ? INTRO.expel.tilt : -INTRO.expel.tilt),
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            opacity: 1,
            duration: expelDuration,
            ease: INTRO.expel.ease,
            stagger: expelStagger,
            // Critical: a `fromTo` renders its "from" state at *creation*, not
            // at its timeline position. Left on, it would blank the page on
            // frame one.
            immediateRender: false,
          },
          expelAt,
        )
        // Energy bleeds off slowly, so the object keeps coasting after the
        // copy has landed instead of stopping with it.
        .to(
          heroSignal,
          {
            energy: 0,
            swell: 0,
            flare: 0,
            duration: INTRO.signal.settle,
            ease: 'power2.out',
          },
          '<0.25',
        )
        .call(land, undefined, expelEnd);

      // Whatever the mount gate cost, the whole sequence still fits.
      if (compress > 1) tl.timeScale(compress);

      if (!isReload) {
        // The rest of the composition arrives around the name.
        tl.to('[data-nav]', { y: 0, duration: HERO.nav.duration }, expelAt)
          // NOTE: the resting position of these elements comes from a CSS
          // `translateY(110%)`. GSAP parses that into `y` in *pixels*, not
          // into `yPercent` — tweening `yPercent` would silently do nothing.
          .to(
            '[data-meta]',
            { y: '0%', duration: HERO.meta.duration, stagger: HERO.meta.stagger },
            expelAt,
          )
          .to(
            '[data-nav-item]',
            {
              opacity: 1,
              duration: HERO.navItems.duration,
              stagger: HERO.navItems.stagger,
            },
            '<0.35',
          )
          .to(
            '[data-line]',
            { y: '0%', duration: HERO.lines.duration, stagger: HERO.lines.stagger },
            '<0.2',
          );
      }
    });

    return () => {
      ctx.revert();
      // Never leave the veil frozen on an override the timeline no longer owns.
      veil.override = -1;
      resetHeroSignal();
      getGhostLayer()?.destroy();
      releaseStaging();
    };
  }, [ready, onLock, onRelease]);
}
