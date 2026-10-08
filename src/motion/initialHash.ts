/** Event-driven initial anchor restoration. Route mount may arrive after window load. */
export function observeInitialHash<T>(options: {
  isMounted: () => boolean;
  isDocumentReady: () => boolean;
  onMounted: (listener: () => void) => () => void;
  onDocumentReady: (listener: () => void) => () => void;
  requestFrame: (listener: () => void) => number;
  cancelFrame: (frame: number) => void;
  resolve: () => T | null;
  restore: (target: T) => void;
}): () => void {
  let frame = 0;
  let restored = false;
  const schedule = () => {
    if (restored || !options.isMounted() || !options.isDocumentReady()) return;
    options.cancelFrame(frame);
    frame = options.requestFrame(() => {
      frame = options.requestFrame(() => {
        const target = options.resolve();
        if (target === null) return;
        restored = true;
        options.restore(target);
      });
    });
  };
  const unsubscribeMount = options.onMounted(schedule);
  const unsubscribeReady = options.onDocumentReady(schedule);
  schedule();
  return () => {
    options.cancelFrame(frame);
    unsubscribeMount();
    unsubscribeReady();
  };
}
