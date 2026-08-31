export type TransitionPhase =
  'idle' | 'anticipating' | 'occluding' | 'swapping' | 'revealing';

export interface TransitionIntentIdentity {
  id: number;
}

interface TransitionMachineCallbacks {
  onPhase?: (phase: TransitionPhase) => void;
  restore?: () => void;
  timeoutMs?: number;
}

export interface TransitionMachine {
  phase: () => TransitionPhase;
  begin: (intent: TransitionIntentIdentity) => Promise<void>;
  advance: (next: TransitionPhase) => void;
  complete: () => void;
  cancel: (reason: string) => void;
}

const NEXT: Partial<Record<TransitionPhase, TransitionPhase>> = {
  anticipating: 'occluding',
  occluding: 'swapping',
  swapping: 'revealing',
  revealing: 'idle',
};

export function createTransitionMachine(
  callbacks: TransitionMachineCallbacks = {},
): TransitionMachine {
  let current: TransitionPhase = 'idle';
  let activeId: number | null = null;
  let activePromise: Promise<void> | null = null;
  let resolveActive: (() => void) | null = null;
  let rejectActive: ((error: Error) => void) | null = null;
  let timer: number | ReturnType<typeof setTimeout> | null = null;
  let restored = false;

  const emit = (phase: TransitionPhase) => {
    current = phase;
    callbacks.onPhase?.(phase);
  };

  const restoreOnce = () => {
    if (restored) return;
    restored = true;
    callbacks.restore?.();
  };

  const clear = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    activeId = null;
    activePromise = null;
    resolveActive = null;
    rejectActive = null;
  };

  const settle = (error?: Error) => {
    if (current !== 'idle') emit('idle');
    const resolve = resolveActive;
    const reject = rejectActive;
    restoreOnce();
    clear();
    if (error) reject?.(error);
    else resolve?.();
  };

  return {
    phase: () => current,
    begin(intent) {
      if (activePromise) {
        if (activeId === intent.id) return activePromise;
        return Promise.reject(new Error('transition busy'));
      }

      activeId = intent.id;
      restored = false;
      activePromise = new Promise<void>((resolve, reject) => {
        resolveActive = resolve;
        rejectActive = reject;
      });
      emit('anticipating');
      timer = setTimeout(
        () => settle(new Error('transition timeout')),
        callbacks.timeoutMs ?? 2400,
      );
      return activePromise;
    },
    advance(next) {
      if (NEXT[current] !== next) {
        throw new Error(`Invalid transition: ${current} -> ${next}`);
      }
      emit(next);
    },
    complete() {
      if (current !== 'revealing') {
        throw new Error(`Invalid completion from ${current}`);
      }
      settle();
    },
    cancel(reason) {
      if (!activePromise) return;
      settle(new Error(reason));
    },
  };
}
