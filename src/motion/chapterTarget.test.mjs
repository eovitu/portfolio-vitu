import { scrollTargetFor } from './routeIntent.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveChapterTarget } from './chapterTarget.ts';
const chapters = Array.from({ length: 4 }, (_, i) => ({
  offsetTop: 400 + i * 500,
  offsetParent: null,
}));
const run = {
  dataset: { enhanced: 'true' },
  offsetTop: 1000,
  offsetHeight: 5000,
  offsetParent: null,
  querySelectorAll: () => chapters,
};
const chapter = chapters[3];
chapter.closest = () => run;
const root = { querySelector: () => chapter, getElementById: () => chapter };
test('fourth chapter resolves its sticky band after home mounts', () => {
  assert.deepEqual(resolveChapterTarget('#work-torneio-pebolim', root, 1000), {
    element: chapter,
    position: 4500,
  });
});
test('mobile and reduced layout resolve real article with header clearance', () => {
  run.dataset.enhanced = 'false';
  assert.equal(resolveChapterTarget('#work-torneio-pebolim', root, 844).position, 1792);
  run.dataset.enhanced = 'true';
});
test('invalid hash is safe', () => {
  assert.equal(resolveChapterTarget('#[', root, 900), null);
  assert.equal(
    resolveChapterTarget('#work-missing', { getElementById: () => null }, 900),
    null,
  );
});

test('case to home resolves the same chapter target after destination mounts', () => {
  const target = scrollTargetFor({
    from: { kind: 'case', slug: 'torneio-pebolim' },
    to: { kind: 'home' },
  });
  assert.equal(resolveChapterTarget(target.value, root, 1000).position, 4500);
});
test('404 to home chapter hash uses the mounted chapter', () => {
  const target = scrollTargetFor({
    from: { kind: 'not-found' },
    to: { kind: 'home' },
    hash: '#work-torneio-pebolim',
  });
  assert.equal(resolveChapterTarget(target.value, root, 1000).position, 4500);
});

test('entrance transforms do not alter chapter layout targeting', () => {
  run.getBoundingClientRect = () => ({ top: -9999, height: 1 });
  run.offsetParent = { offsetTop: 200, offsetParent: null };
  assert.equal(resolveChapterTarget('#work-torneio-pebolim', root, 1000).position, 4700);
  run.offsetParent = null;
});
