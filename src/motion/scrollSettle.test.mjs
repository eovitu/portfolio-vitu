import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  crossedBoundary,
  canReleaseBoundary,
  colorBoundaryTargets,
} from './scrollSettle.ts';
import { resolveChapterBoundary } from './chapterTarget.ts';
import { chapterIndexForProgress } from './theaterChapters.ts';

for (const viewportHeight of [390, 768, 900]) {
  test(`flow color ends at viewport bottom and stays free inside long panels (${viewportHeight}px)`, () => {
    const top = 1500;
    const bottom = 4500;
    const geometry = {
      edges: [top, bottom],
      stickyEdges: [],
      viewportHeight,
      maxScroll: 7000,
    };
    const forward = colorBoundaryTargets({ ...geometry, forward: true });
    assert.equal(
      crossedBoundary({
        ...input,
        from: bottom - viewportHeight - 10,
        to: bottom + 10,
        targets: forward,
      }),
      bottom - viewportHeight,
    );
    assert.equal(forward[1] + viewportHeight, bottom);
    assert.equal(
      crossedBoundary({
        ...input,
        from: top + 100,
        to: bottom - viewportHeight - 100,
        targets: forward,
      }),
      null,
    );
    const backward = colorBoundaryTargets({ ...geometry, forward: false });
    assert.equal(
      crossedBoundary({ ...input, from: top + 10, to: top - 10, targets: backward }),
      top,
    );
  });
}

test('unreachable edges are removed rather than clamped into a repeated footer hold', () => {
  for (const forward of [true, false]) {
    const targets = colorBoundaryTargets({
      edges: [0, 2000, 9000],
      stickyEdges: [],
      viewportHeight: 900,
      maxScroll: 3000,
      forward,
    });
    assert.ok(targets.every((target) => target > 0 && target < 3000));
    assert.equal(crossedBoundary({ ...input, from: 2500, to: 3000, targets }), null);
  }
  const component = readFileSync(
    new URL('../components/cases/CaseStudy.tsx', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(component, /<S\.Page\s+data-scroll-boundary/);
});

test('sticky holds retain the actual active color at shared ScrollTrigger band edges', () => {
  for (const viewportHeight of [768, 900]) {
    const chapters = Array.from({ length: 4 }, () => ({}));
    const run = {
      dataset: { enhanced: 'true' },
      offsetTop: 1500,
      offsetHeight: 5000,
      offsetParent: null,
      querySelectorAll: () => chapters,
    };
    chapters.forEach((chapter) => {
      chapter.closest = () => run;
    });
    const range = run.offsetHeight - viewportHeight;
    const stickyEdges = chapters
      .slice(1)
      .map((chapter) => resolveChapterBoundary(chapter, viewportHeight));
    for (const forward of [true, false]) {
      const targets = colorBoundaryTargets({
        edges: [],
        stickyEdges,
        viewportHeight,
        maxScroll: 8000,
        forward,
      });
      targets.forEach((target, index) => {
        assert.equal(
          chapterIndexForProgress((target - run.offsetTop) / range, 4),
          forward ? index : index + 1,
        );
      });
    }
  }
});
const input = {
  from: 500,
  to: 1400,
  targets: [1000, 2000],
  reduced: false,
  blocked: false,
};
test('stops at first crossed color edge in both directions even with oversized panels', () => {
  assert.equal(crossedBoundary(input), 1000);
  assert.equal(crossedBoundary({ ...input, from: 2400, to: 400 }), 2000);
  assert.equal(crossedBoundary({ ...input, from: 1100, to: 1900 }), null);
});
test('new gesture continues from aligned edge without retrapping the same edge', () => {
  assert.equal(crossedBoundary({ ...input, from: 1000, to: 1500 }), null);
  assert.equal(crossedBoundary({ ...input, from: 1000, to: 500 }), null);
  assert.equal(canReleaseBoundary({ now: 500, heldAt: 100, newGesture: false }), false);
  assert.equal(canReleaseBoundary({ now: 200, heldAt: 100, newGesture: true }), false);
  assert.equal(canReleaseBoundary({ now: 280, heldAt: 100, newGesture: true }), true);
});
test('reduced motion and explicit navigation suppress boundary stops', () => {
  assert.equal(crossedBoundary({ ...input, reduced: true }), null);
  assert.equal(crossedBoundary({ ...input, blocked: true }), null);
});

test('actual Lenis virtualScroll preserves ctrl-wheel native zoom even during a fresh hold', () => {
  const source = readFileSync(
    new URL('../components/providers/SmoothScrollProvider.tsx', import.meta.url),
    'utf8',
  );
  const callback = source
    .split('virtualScroll: ')[1]
    .split('\n        duration:')[0]
    .trim()
    .replace(/,$/, '');
  const run = new Function(
    'performance',
    'canReleaseBoundary',
    'GESTURE_GAP_MS',
    `
    let heldBoundary = 1000;
    let heldAt = 100;
    let lastWheel = 100;
    let wheelActive = true;
    const blocked = () => false;
    const callback = ${callback};
    let prevented = 0;
    const allowed = callback({ event: { type: 'wheel', ctrlKey: true, preventDefault: () => prevented++ } });
    return { allowed, prevented, heldBoundary, wheelActive, lastWheel };
  `,
  );
  assert.deepEqual(run({ now: () => 110 }, canReleaseBoundary, 140), {
    allowed: true,
    prevented: 0,
    heldBoundary: null,
    wheelActive: false,
    lastWheel: -Infinity,
  });
});
test('case Outcome declares the boundaries of its real contrasting background', () => {
  const component = readFileSync(
    new URL('../components/cases/CaseStudy.tsx', import.meta.url),
    'utf8',
  );
  const styles = readFileSync(
    new URL('../components/cases/CaseStudy.styles.ts', import.meta.url),
    'utf8',
  );
  assert.match(component, /<S\.Outcome data-scroll-boundary>/);
  const outcome = styles.split('export const Outcome =')[1].split('export const Nav =')[0];
  assert.match(outcome, /background: var\(--ink\)/);
  assert.match(outcome, /background: #e99569/);
  assert.match(outcome, /background: #c5edad/);
});
