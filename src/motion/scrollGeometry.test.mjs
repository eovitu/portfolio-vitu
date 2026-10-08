import assert from 'node:assert/strict';
import { test } from 'node:test';
import { observeScrollGeometry } from './scrollGeometry.ts';

test('viewport and content resize release an obsolete hold without moving scroll; cleanup detaches all observers', () => {
  const originals = Object.fromEntries(
    ['window', 'document', 'ResizeObserver', 'MutationObserver'].map((key) => [
      key,
      globalThis[key],
    ]),
  );
  const listeners = new Map();
  const body = {};
  const chapter = {};
  let resizeObserver;
  let mutationObserver;
  class Observer {
    constructor(callback) {
      this.callback = callback;
      this.targets = [];
      this.disconnected = false;
    }
    observe(target, options) {
      this.targets.push(target);
      this.options = options;
      this.disconnected = false;
    }
    disconnect() {
      this.targets = [];
      this.disconnected = true;
    }
  }
  globalThis.ResizeObserver = class extends Observer {
    constructor(callback) {
      super(callback);
      resizeObserver = this;
    }
  };
  globalThis.MutationObserver = class extends Observer {
    constructor(callback) {
      super(callback);
      mutationObserver = this;
    }
  };
  globalThis.window = {
    addEventListener: (type, callback) => listeners.set(type, callback),
    removeEventListener: (type, callback) => {
      if (listeners.get(type) === callback) listeners.delete(type);
    },
  };
  globalThis.document = { body, querySelectorAll: () => [chapter] };
  try {
    let heldBoundary = 5000;
    let currentScroll = 3200; // New limit is smaller than the old held position.
    let previousScroll = 5000;
    let lastWheel = 100;
    let wheelActive = true;
    const cleanup = observeScrollGeometry(() => {
      heldBoundary = null;
      previousScroll = currentScroll;
      lastWheel = -Infinity;
      wheelActive = false;
    });
    assert.deepEqual(resizeObserver.targets, [body, chapter]);
    for (const invalidate of [
      listeners.get('resize'),
      resizeObserver.callback,
      mutationObserver.callback,
    ]) {
      heldBoundary = 5000;
      wheelActive = true;
      invalidate();
      assert.equal(heldBoundary, null);
      assert.equal(previousScroll, 3200);
      assert.equal(currentScroll, 3200);
      assert.equal(lastWheel, -Infinity);
      assert.equal(wheelActive, false);
    }
    assert.deepEqual(mutationObserver.options.attributeFilter, ['data-enhanced']);
    cleanup();
    assert.equal(listeners.size, 0);
    assert.equal(resizeObserver.disconnected, true);
    assert.equal(mutationObserver.disconnected, true);
  } finally {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
});
