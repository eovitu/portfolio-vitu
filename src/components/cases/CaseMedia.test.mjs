import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const raw = read('./CaseMedia.tsx');
const wrapper = raw;
const media = read('../home/MediaPlayback.tsx');
const study = read('./CaseStudy.tsx');
const styles = read('./CaseStudy.styles.ts');

test('film uses click and keyboard controls, with fullscreen as the only permanent button', () => {
  const videoTag = media.match(/<video[\s\S]*?\/>/)?.[0] ?? '';
  assert.doesNotMatch(videoTag, /\bcontrols\b/);
  assert.match(media, /onClick=\{toggle\}/);
  assert.match(media, /event.key === 'Enter'/);
  assert.match(media, /event.key === ' '/);
  assert.match(media, /aria-describedby=/);
  assert.doesNotMatch(media, /<S.Seek|copy.seek|copy.mute/);
  assert.match(media, /requestFullscreen/);
});

test('offscreen and document visibility are reconciled through shared eligibility', () => {
  assert.match(media, /IntersectionObserver/);
  assert.match(media, /entry.isIntersecting && entry.intersectionRatio >= 0.15/);
  assert.match(media, /contextRef.current.documentVisible = !document.hidden/);
  assert.match(media, /observer\?\.disconnect\(\)/);
});

test('the transition contract on the media survives the rewrite', () => {
  assert.match(wrapper, /data-case-media/);
  assert.match(media, /data-project-poster/);
  assert.match(wrapper, /data-warp/);
  assert.match(wrapper, /layoutId=\{`project-media-\$\{project\.slug\}`\}/);
});

test('the case header identifies the project', () => {
  assert.match(study, /<dt>\{copy\.role\}<\/dt>/);
  assert.match(study, /<dt>\{copy\.year\}<\/dt>/);
  assert.match(study, /<dt>\{copy\.stack\}<\/dt>/);
  // Client is rendered only when it is known, never invented.
  assert.match(study, /project\.context \?/);
  assert.match(study, /<dt>\{copy\.context\}<\/dt>/);
  // The controls float inside the media; no extra frame is introduced.
  assert.doesNotMatch(styles, /export const Controls[\s\S]{0,400}?border: 1px/);
});

test('fullscreen fits the full film without the editorial frame', () => {
  for (const selector of ['&&:fullscreen', '&&:-webkit-full-screen']) {
    const block = styles.slice(styles.indexOf(selector), styles.indexOf(selector) + 420);
    assert.ok(styles.includes(selector));
    assert.match(block, /object-fit: contain/);
    assert.match(block, /background: #000/);
    assert.match(block, /rotate: 0/);
    assert.match(block, /margin: 0/);
    assert.match(block, /border-radius: 0/);
    assert.match(block, /box-shadow: none/);
  }
});

test('a rejected autoplay after prior playback exposes the poster until playback succeeds', () => {
  const expression = media.match(/opacity: ([^}]+) \}\}/)?.[1];
  assert.ok(expression, 'video opacity expression is present');
  const opacity = new Function('started', 'error', 'blocked', `return (${expression});`);
  assert.equal(opacity(false, false, false), 0, 'initial poster');
  assert.equal(opacity(true, false, false), 1, 'successful playback');
  assert.equal(opacity(true, false, true), 0, 'blocked replay returns to poster');
  assert.equal(opacity(true, true, false), 0, 'media failure returns to poster');
  assert.equal(opacity(true, false, false), 1, 'successful manual retry displays video');
});
