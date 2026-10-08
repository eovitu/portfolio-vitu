import assert from 'node:assert/strict';
import test from 'node:test';
import { observeInitialHash } from './initialHash.ts';
import { resolveChapterTarget } from './chapterTarget.ts';

test('native initial fourth hash waits for lazy route mount after document load', () => {
  let mounted = false,
    loaded = false,
    mount,
    load,
    frames = [],
    scroll,
    focused;
  const chapters = Array.from({ length: 4 }, () => ({ offsetTop: 0, offsetParent: null }));
  const run = {
    dataset: { enhanced: 'true' },
    offsetTop: 1000,
    offsetHeight: 5000,
    offsetParent: null,
    querySelectorAll: () => chapters,
  };
  const article = chapters[3];
  article.closest = () => run;
  const root = { getElementById: () => (mounted ? article : null) };
  const cleanup = observeInitialHash({
    isMounted: () => mounted,
    isDocumentReady: () => loaded,
    onMounted: (fn) => {
      mount = fn;
      return () => {
        mount = null;
      };
    },
    onDocumentReady: (fn) => {
      load = fn;
      return () => {
        load = null;
      };
    },
    requestFrame: (fn) => {
      frames.push(fn);
      return frames.length;
    },
    cancelFrame: () => {},
    resolve: () => resolveChapterTarget('#work-doces-da-pati', root, 1000),
    restore: (target) => {
      scroll = target.position;
      focused = target.element;
    },
  });
  loaded = true;
  load();
  assert.equal(frames.length, 0);
  mounted = true;
  mount();
  frames.shift()();
  frames.shift()();
  assert.equal(scroll, 4500);
  assert.equal(focused, article);
  mount();
  assert.equal(frames.length, 0);
  cleanup();
  assert.equal(mount, null);
  assert.equal(load, null);
});

test('already mounted initial hash restores only after document is ready', () => {
  let loaded = false,
    load,
    frames = [],
    result;
  const cleanup = observeInitialHash({
    isMounted: () => true,
    isDocumentReady: () => loaded,
    onMounted: () => () => {},
    onDocumentReady: (fn) => {
      load = fn;
      return () => {};
    },
    requestFrame: (fn) => {
      frames.push(fn);
      return frames.length;
    },
    cancelFrame: () => {},
    resolve: () => 42,
    restore: (target) => {
      result = target;
    },
  });
  assert.equal(frames.length, 0);
  loaded = true;
  load();
  frames.shift()();
  frames.shift()();
  assert.equal(result, 42);
  cleanup();
});
