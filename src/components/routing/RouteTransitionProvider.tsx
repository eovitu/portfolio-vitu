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
import { isSameRoute, resolveRoute, type Route } from '../../lib/routes';
import { normalizeHistoryState } from '../../motion/historyState';
import { scrollTargetFor } from '../../motion/routeIntent';
import { resetTransientSceneSignals, setSceneTarget } from '../../motion/sceneSignals';
import {
  createTransitionMachine,
  type TransitionMachine,
  type TransitionPhase,
} from '../../motion/routeTransitionMachine';
import { useInternalNavigation, type NavigationContext } from '../../hooks/useInternalNavigation';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';
import { RouteTransitionOverlay } from './RouteTransitionOverlay';
import { SharedMediaLayer, type SharedMediaHandle } from './SharedMediaLayer';

interface RouteTransitionApi {
  route: Route;
  phase: TransitionPhase;
  navigate: (href: string, context: NavigationContext) => Promise<void>;
}

const RouteTransitionContext = createContext<RouteTransitionApi | null>(null);

export function useRouteTransition(): RouteTransitionApi {
  const value = useContext(RouteTransitionContext);
  if (!value) throw new Error('useRouteTransition must be used inside RouteTransitionProvider');
  return value;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
}

function tween(
  target: gsap.TweenTarget,
  vars: gsap.TweenVars,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const animation = gsap.to(target, { ...vars, onComplete: resolve });
    signal.addEventListener(
      'abort',
      () => {
        animation.kill();
        reject(new Error('transition aborted'));
      },
      { once: true },
    );
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
  const { scrollToImmediate, smooth, stop, start } = useSmoothScroll();

  routeRef.current = route;

  const restoreInterface = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    activeHrefRef.current = '';
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
      timeoutMs: 2400,
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
        controllerRef.current?.abort();
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
          if (element) scrollToImmediate(element);
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
        (currentRoute.kind === 'case' ? currentRoute.slug : targetRoute.kind === 'case' ? targetRoute.slug : undefined);
      const machineRun = machine.begin({ id: ++intentId.current });

      const run = (async () => {
        const overlay = overlayRef.current;
        if (!overlay) throw new Error('transition overlay unavailable');
        stop();
        const sourceMedia =
          currentRoute.kind === 'case'
            ? document.querySelector<HTMLElement>('[data-case-media]')
            : context.trigger
                ?.closest<HTMLElement>('[data-project]')
                ?.querySelector<HTMLElement>('[data-project-media]') ?? null;
        sharedMediaRef.current?.capture(sourceMedia, controller.signal);
        document.documentElement.dataset.transitionPhase = 'anticipating';
        if (context.cause !== 'popstate') {
          history.replaceState(
            { path: window.location.pathname, scrollY: window.scrollY },
            '',
            window.location.href,
          );
        }

        const origin = context.trigger?.getBoundingClientRect();
        overlay.style.setProperty(
          '--transition-x',
          `${origin ? origin.left + origin.width / 2 : window.innerWidth / 2}px`,
        );
        overlay.style.setProperty(
          '--transition-y',
          `${origin ? origin.top + origin.height / 2 : window.innerHeight / 2}px`,
        );
        gsap.set(overlay, { display: 'block', scaleY: 0, transformOrigin: '50% 100%' });
        if (context.trigger) {
          await tween(context.trigger, { scale: 0.97, duration: 0.12, ease: 'power2.out' }, controller.signal);
          gsap.set(context.trigger, { clearProps: 'transform' });
        }

        machine.advance('occluding');
        document.documentElement.dataset.transitionPhase = 'occluding';
        await tween(overlay, { scaleY: 1, duration: 0.28, ease: 'power3.in' }, controller.signal);

        machine.advance('swapping');
        document.documentElement.dataset.transitionPhase = 'swapping';
        if (context.cause !== 'popstate') {
          history.pushState({ path: url.pathname }, '', targetHref);
        }
        setRoute(targetRoute);
        routeRef.current = targetRoute;
        applyMetadata(targetRoute);
        await nextFrame();
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

        const destinationMedia =
          targetRoute.kind === 'case'
            ? document.querySelector<HTMLElement>('[data-case-media]')
            : projectSlug
              ? document.querySelector<HTMLElement>(
                  `[data-project="${projectSlug}"] [data-project-media]`,
                )
              : null;
        await sharedMediaRef.current?.animateTo(destinationMedia, controller.signal);

        machine.advance('revealing');
        document.documentElement.dataset.transitionPhase = 'revealing';
        gsap.set(overlay, { transformOrigin: '50% 0%' });
        await tween(overlay, { scaleY: 0, duration: 0.42, ease: 'power3.out' }, controller.signal);
        machine.complete();
        await machineRun;
        focusRouteTarget(targetRoute, url.hash, targetRoute.kind === 'home' ? projectSlug : undefined);
      })();

      const lifecycle = (async () => {
        try {
          await run;
        } catch (error) {
          if (machine.phase() !== 'idle') {
            machine.cancel(error instanceof Error ? error.message : 'transition failed');
          }
          await machineRun.catch(() => undefined);
          if (context.cause === 'popstate') {
            setRoute(resolveRoute(window.location.pathname));
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
    [restoreInterface, scrollToImmediate, stop],
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
      route: route.kind,
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
    <RouteTransitionContext.Provider value={{ route, phase, navigate }}>
      {children}
      <RouteTransitionOverlay ref={overlayRef} />
      <SharedMediaLayer ref={sharedMediaRef} />
    </RouteTransitionContext.Provider>
  );
}
