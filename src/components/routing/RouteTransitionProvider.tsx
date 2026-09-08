/* eslint-disable react-refresh/only-export-components -- provider and hook form one public boundary */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ProjectSlug } from '../../lib/content';
import { gsap } from '../../lib/gsap';
import { applyMetadata } from '../../lib/metadata';
import { prefersReducedMotion } from '../../lib/prefersReducedMotion';
import { isSameRoute, resolveRoute, type Route } from '../../lib/routes';
import { normalizeHistoryState } from '../../motion/historyState';
import {
  scrollTargetFor,
  shouldFallbackToDocumentNavigation,
} from '../../motion/routeIntent';
import { resetTransientSceneSignals, setSceneTarget } from '../../motion/sceneSignals';
import { coreOrigin } from '../../lib/warpTargets';
import {
  createTransitionMachine,
  type TransitionMachine,
  type TransitionPhase,
} from '../../motion/routeTransitionMachine';
import {
  useInternalNavigation,
  type NavigationContext,
} from '../../hooks/useInternalNavigation';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';
import { RouteTransitionOverlay } from './RouteTransitionOverlay';
import { SharedMediaLayer, type SharedMediaHandle } from './SharedMediaLayer';

interface RouteTransitionApi {
  route: Route;
  phase: TransitionPhase;
  navigate: (href: string, context: NavigationContext) => Promise<void>;
  /**
   * The route wrapper's `AnimatePresence` calls this when the outgoing scene
   * has finished its exit and the incoming one has been mounted. It is the
   * master clock of the swap: nothing that needs the new DOM may run before
   * it. See `waitForRouteMount` below.
   */
  notifyRouteMounted: () => void;
  /**
   * Subscribe to the swap instant itself.
   *
   * Listeners are called synchronously from the destination scene ref, which is the
   * one moment the outgoing scene is gone and the incoming one has not
   * painted. Anything that must change between two routes without ever being
   * seen half-applied, the page surface, above all, belongs here rather
   * than in an effect that runs a commit too early or a frame too late.
   */
  onRouteMounted: (listener: () => void) => () => void;
}

const RouteTransitionContext = createContext<RouteTransitionApi | null>(null);

export function useRouteTransition(): RouteTransitionApi {
  const value = useContext(RouteTransitionContext);
  if (!value)
    throw new Error('useRouteTransition must be used inside RouteTransitionProvider');
  return value;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
}

function waitForSelector(
  selector: string | null,
  signal: AbortSignal,
  timeoutMs = 760,
): Promise<void> {
  if (!selector || document.querySelector(selector) || signal.aborted)
    return Promise.resolve();

  return new Promise((resolve) => {
    let raf = 0;
    let timeout = 0;
    const finish = () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      signal.removeEventListener('abort', finish);
      resolve();
    };
    const poll = () => {
      if (document.querySelector(selector)) finish();
      else raf = window.requestAnimationFrame(poll);
    };
    signal.addEventListener('abort', finish, { once: true });
    timeout = window.setTimeout(finish, timeoutMs);
    poll();
  });
}

/**
 * Wait for the route wrapper to report that the swap has actually happened.
 *
 * `register` hands the resolver to the provider so the destination scene ref can call
 * it. The timeout is a fail-safe, not the mechanism: if the presence layer is
 * ever skipped (no exit animation to run, an interrupted tree) the transition
 * still has to finish rather than hang behind a full-screen overlay.
 */
function waitForRouteMount(
  register: (resolve: () => void) => void,
  signal: AbortSignal,
  timeoutMs = 1400,
): Promise<void> {
  if (signal.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    let timeout = 0;
    const finish = () => {
      window.clearTimeout(timeout);
      signal.removeEventListener('abort', finish);
      register(() => {});
      resolve();
    };
    signal.addEventListener('abort', finish, { once: true });
    timeout = window.setTimeout(finish, timeoutMs);
    register(finish);
  });
}

/**
 * A GSAP tween as a promise that always settles.
 *
 * Two ways a tween can end without completing: the caller aborts the
 * transition, or GSAP kills it because another tween claimed the same target
 * with `overwrite: true`. The second one is silent, and it is what turned a
 * route change into a four-second stall followed by a full document load. An
 * animation the reader is waiting behind must resolve on every exit.
 */
function tween(
  target: gsap.TweenTarget,
  vars: gsap.TweenVars,
  signal: AbortSignal,
): Promise<void> {
  if (signal.aborted) return Promise.reject(new Error('transition aborted'));
  return new Promise((resolve, reject) => {
    let settled = false;
    let animation: gsap.core.Tween | null = null;

    const onAbort = () => {
      if (settled) return;
      settled = true;
      animation?.kill();
      reject(new Error('transition aborted'));
    };
    const done = () => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', onAbort);
      resolve();
    };

    signal.addEventListener('abort', onAbort, { once: true });
    animation = gsap.to(target, { ...vars, onComplete: done, onInterrupt: done });
  });
}

function focusRouteTarget(route: Route, hash: string, projectSlug?: ProjectSlug): void {
  let target: HTMLElement | null = null;
  if (hash) target = document.querySelector<HTMLElement>(hash);
  if (!target && route.kind === 'case') {
    target = document.querySelector<HTMLElement>('[data-route-heading]');
  }
  if (!target && projectSlug) {
    target = document.querySelector<HTMLElement>(
      `[data-project="${projectSlug}"] [data-project-link]`,
    );
  }
  if (!target) target = document.querySelector<HTMLElement>('#hero-title');
  if (!target) return;
  if (!target.matches('a,button,input,select,textarea,[tabindex]')) target.tabIndex = -1;
  target.focus({ preventScroll: true });
}

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => resolveRoute(window.location.pathname));
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const routeRef = useRef(route);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sharedMediaRef = useRef<SharedMediaHandle>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const activeHrefRef = useRef('');
  const activePromiseRef = useRef<Promise<void> | null>(null);
  const intentId = useRef(0);
  const machineRef = useRef<TransitionMachine | null>(null);
  const routeMountedRef = useRef<(() => void) | null>(null);
  const swapListeners = useRef(new Set<() => void>());
  const { scrollTo, scrollToImmediate, smooth, stop, start } = useSmoothScroll();

  /** Resolved by the destination scene ref, after its DOM is committed. */
  const notifyRouteMounted = useCallback(() => {
    // Synchronously, before anything can paint the new scene.
    swapListeners.current.forEach((listener) => listener());
    const resolve = routeMountedRef.current;
    routeMountedRef.current = null;
    resolve?.();
  }, []);

  const onRouteMounted = useCallback((listener: () => void) => {
    swapListeners.current.add(listener);
    return () => {
      swapListeners.current.delete(listener);
    };
  }, []);

  routeRef.current = route;

  const restoreInterface = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    activeHrefRef.current = '';
    routeMountedRef.current = null;
    const overlay = overlayRef.current;
    if (overlay) gsap.set(overlay, { clearProps: 'display,transform,transformOrigin' });
    sharedMediaRef.current?.clear();
    resetTransientSceneSignals();
    document.documentElement.removeAttribute('data-transition-phase');
    start();
  }, [start]);

  if (!machineRef.current) {
    machineRef.current = createTransitionMachine({
      onPhase: setPhase,
      restore: restoreInterface,
      timeoutMs: 4200,
    });
  }

  const navigate = useCallback(
    async (href: string, context: NavigationContext): Promise<void> => {
      const url = new URL(href, window.location.href);
      const targetRoute = resolveRoute(url.pathname);
      const currentRoute = routeRef.current;
      const targetHref = `${url.pathname}${url.hash}`;

      if (activePromiseRef.current) {
        if (activeHrefRef.current === targetHref) return activePromiseRef.current;
        controllerRef.current?.abort('superseded');
        machineRef.current?.cancel('superseded');
        await activePromiseRef.current.catch(() => undefined);
      }

      if (isSameRoute(targetRoute, currentRoute)) {
        const currentHref = `${window.location.pathname}${window.location.hash}`;
        if (context.cause !== 'popstate' && targetHref !== currentHref) {
          history.replaceState(
            { path: window.location.pathname, scrollY: window.scrollY },
            '',
            window.location.href,
          );
          history.pushState({ path: url.pathname }, '', targetHref);
        }
        const target = scrollTargetFor({
          from: currentRoute,
          to: targetRoute,
          cause: context.cause,
          hash: url.hash,
          savedScrollY: context.savedScrollY,
        });
        if (target.kind === 'top') scrollToImmediate(0);
        if (target.kind === 'saved') scrollToImmediate(target.value);
        if (target.kind === 'selector') {
          const element = document.querySelector<HTMLElement>(target.value);
          if (element) scrollTo(element, context.cause === 'popstate' ? 0 : 1.65);
        }
        focusRouteTarget(targetRoute, url.hash);
        return;
      }

      const machine = machineRef.current!;
      const controller = new AbortController();
      controllerRef.current = controller;
      activeHrefRef.current = targetHref;
      const projectSlug =
        context.projectSlug ??
        (currentRoute.kind === 'case'
          ? currentRoute.slug
          : targetRoute.kind === 'case'
            ? targetRoute.slug
            : undefined);
      const machineRun = machine.begin({ id: ++intentId.current });

      /**
       * Reduced motion keeps the whole route machine, the phases, the
       * occlusion, the focus move, and removes only the movement.
       *
       * The reader still gets an occluded swap rather than a jump cut, but
       * nothing travels: no press, no media flying across the viewport, no
       * curtain sweeping the screen. The same preference read the rest of the
       * site already uses; there is no second mechanism here.
       */
      const reduced = prefersReducedMotion();
      const beat = (seconds: number) => (reduced ? 0 : seconds);

      const run = (async () => {
        const overlay = overlayRef.current;
        if (!overlay) throw new Error('transition overlay unavailable');
        stop();
        const sourceMedia = reduced
          ? null
          : currentRoute.kind === 'case'
            ? document.querySelector<HTMLElement>('[data-case-media]')
            : (context.trigger
                ?.closest<HTMLElement>('[data-project]')
                ?.querySelector<HTMLElement>('[data-project-media]') ?? null);
        sharedMediaRef.current?.capture(sourceMedia, controller.signal);
        document.documentElement.dataset.transitionPhase = 'anticipating';
        if (context.cause !== 'popstate') {
          history.replaceState(
            { path: window.location.pathname, scrollY: window.scrollY },
            '',
            window.location.href,
          );
        }

        // The singularity is the stable spatial anchor for every route. The
        // clicked card still travels through SharedMediaLayer, but the black
        // hole itself must never jump to the button that initiated the route.
        const origin = coreOrigin();
        overlay.style.setProperty('--transition-x', `${origin.x}px`);
        overlay.style.setProperty('--transition-y', `${origin.y}px`);
        gsap.set(overlay, { display: 'block', scaleY: 0, transformOrigin: '50% 100%' });
        /*
         * The trigger's press is NOT animated here.
         *
         * `useMagneticElements` already owns `scale` on every `a` and
         * `button`, and it writes with `overwrite: true`. A second tween on
         * the same node was being killed the moment the magnetic pointerup
         * rendered, silently, taking the transition's promise with it. One
         * node, one author: the press belongs to the magnetic layer, which
         * responds on pointerdown and is therefore faster anyway.
         */

        machine.advance('occluding');
        document.documentElement.dataset.transitionPhase = 'occluding';
        await tween(
          overlay,
          { scaleY: 1, duration: beat(0.28), ease: 'power3.in' },
          controller.signal,
        );

        machine.advance('swapping');
        document.documentElement.dataset.transitionPhase = 'swapping';
        if (context.cause !== 'popstate') {
          history.pushState({ path: url.pathname }, '', targetHref);
        }
        const mounted = waitForRouteMount((resolve) => {
          routeMountedRef.current = resolve;
        }, controller.signal);
        setRoute(targetRoute);
        routeRef.current = targetRoute;
        applyMetadata(targetRoute);
        // The exit owns this stretch. Scroll targeting, the shared-media
        // handoff and the reveal all read the destination DOM, and none of
        // them may run while the outgoing scene is still on screen.
        await mounted;
        await nextFrame();

        const target = scrollTargetFor({
          from: currentRoute,
          to: targetRoute,
          cause: context.cause,
          hash: url.hash,
          projectSlug,
          savedScrollY: context.savedScrollY,
        });
        if (target.kind === 'top') scrollToImmediate(0);
        if (target.kind === 'saved') scrollToImmediate(target.value);
        if (target.kind === 'selector') {
          const element = document.querySelector<HTMLElement>(target.value);
          if (element) scrollToImmediate(element);
        }

        const destinationSelector =
          targetRoute.kind === 'case'
            ? '[data-case-media]'
            : projectSlug
              ? `[data-project="${projectSlug}"] [data-project-media]`
              : null;
        await waitForSelector(destinationSelector, controller.signal);
        const destinationMedia = destinationSelector
          ? document.querySelector<HTMLElement>(destinationSelector)
          : null;
        await sharedMediaRef.current?.animateTo(destinationMedia, controller.signal);

        machine.advance('revealing');
        document.documentElement.dataset.transitionPhase = 'revealing';
        gsap.set(overlay, { transformOrigin: '50% 0%' });
        await tween(
          overlay,
          { scaleY: 0, duration: beat(0.42), ease: 'power3.out' },
          controller.signal,
        );
        machine.complete();
        await machineRun;
        focusRouteTarget(
          targetRoute,
          url.hash,
          targetRoute.kind === 'home' ? projectSlug : undefined,
        );
      })();

      const lifecycle = (async () => {
        try {
          await run;
        } catch (error) {
          const failureReason =
            typeof controller.signal.reason === 'string'
              ? controller.signal.reason
              : error instanceof Error
                ? error.message
                : undefined;
          if (machine.phase() !== 'idle') {
            machine.cancel(error instanceof Error ? error.message : 'transition failed');
          }
          await machineRun.catch(() => undefined);
          if (context.cause === 'popstate') {
            setRoute(resolveRoute(window.location.pathname));
          } else if (shouldFallbackToDocumentNavigation(context.cause, failureReason)) {
            window.location.assign(targetHref);
          }
          throw error;
        } finally {
          restoreInterface();
          activePromiseRef.current = null;
        }
      })();
      activePromiseRef.current = lifecycle;
      await lifecycle;
    },
    [restoreInterface, scrollTo, scrollToImmediate, stop],
  );

  useInternalNavigation(navigate);

  useEffect(() => {
    const progressByPhase: Record<TransitionPhase, number> = {
      idle: 0,
      anticipating: 0.18,
      occluding: 0.52,
      swapping: 0.76,
      revealing: 1,
    };
    setSceneTarget({
      // The scene knows two worlds. A missing page is read as home: it is
      // where the reader is being sent back to.
      route: route.kind === 'case' ? 'case' : 'home',
      projectTheme: route.kind === 'case' ? route.slug : null,
      transitionProgress: progressByPhase[phase],
      energy: phase === 'idle' ? 0 : 0.7,
      flare: phase === 'occluding' || phase === 'revealing' ? 0.75 : 0,
    });
  }, [phase, route]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    let secondFrame = 0;
    const restoreInitialHash = () => {
      secondFrame = window.requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>(hash);
        if (!target) return;
        focusRouteTarget(routeRef.current, hash);
        scrollToImmediate(target);
      });
    };
    let firstFrame = 0;
    let settleTimer = 0;
    const scheduleRestore = () => {
      settleTimer = window.setTimeout(() => {
        firstFrame = window.requestAnimationFrame(restoreInitialHash);
      }, 0);
    };
    if (document.readyState === 'complete') scheduleRestore();
    else window.addEventListener('load', scheduleRestore, { once: true });
    return () => {
      window.removeEventListener('load', scheduleRestore);
      window.clearTimeout(settleTimer);
      if (firstFrame) window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [scrollToImmediate, smooth]);

  useEffect(() => {
    applyMetadata(routeRef.current);
    const existing = normalizeHistoryState(history.state);
    history.replaceState(
      existing ?? { path: window.location.pathname, scrollY: window.scrollY },
      '',
      window.location.href,
    );
    const onPopState = (event: PopStateEvent) => {
      const state = normalizeHistoryState(event.state);
      void navigate(window.location.href, {
        cause: 'popstate',
        savedScrollY: state?.scrollY,
      }).catch(() => undefined);
    };
    let pendingFrame = 0;
    const saveScrollPosition = () => {
      if (pendingFrame) return;
      pendingFrame = window.requestAnimationFrame(() => {
        pendingFrame = 0;
        const state = normalizeHistoryState(history.state);
        history.replaceState(
          { path: state?.path ?? window.location.pathname, scrollY: window.scrollY },
          '',
          window.location.href,
        );
      });
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('scroll', saveScrollPosition, { passive: true });
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('scroll', saveScrollPosition);
      if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
    };
  }, [navigate]);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      machineRef.current?.cancel('provider unmounted');
      restoreInterface();
    },
    [restoreInterface],
  );

  return (
    <RouteTransitionContext.Provider
      value={{ route, phase, navigate, notifyRouteMounted, onRouteMounted }}
    >
      {children}
      <RouteTransitionOverlay ref={overlayRef} />
      <SharedMediaLayer ref={sharedMediaRef} />
    </RouteTransitionContext.Provider>
  );
}
