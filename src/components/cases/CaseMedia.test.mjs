import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const raw = read('./CaseMedia.tsx');
// Prose about the native control bar is worth keeping; assertions about what
// the element actually carries run against code with the comments removed.
const media = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const study = read('./CaseStudy.tsx');
const styles = read('./CaseStudy.styles.ts');

test('the film carries our controls, never the browser chrome', () => {
  // Assert against the <video> element itself rather than the whole file:
  // our own bar is legitimately named `data-case-controls`.
  const videoTag = media.slice(media.indexOf('<video'), media.indexOf('</video>'));
  assert.ok(videoTag.length > 0);
  assert.doesNotMatch(videoTag, /\bcontrols\b/);
  assert.match(media, /aria-label=\{playing \? copy\.pause : copy\.play\}/);
  assert.match(media, /aria-label=\{copy\.seek\}/);
  assert.match(media, /aria-label=\{muted \? copy\.unmute : copy\.mute\}/);
  assert.match(media, /aria-valuetext=/);
});

test('keyboard reaches play, seek and mute', () => {
  assert.match(media, /event\.key === ' ' \|\| event\.key === 'k'/);
  assert.match(media, /event\.key === 'ArrowRight'/);
  assert.match(media, /event\.key === 'ArrowLeft'/);
  assert.match(media, /event\.key === 'm' \|\| event\.key === 'M'/);
  // The seek slider keeps the arrows while it is focused.
  assert.match(media, /tagName === 'INPUT'\) return;/);
});

test('off screen it pauses, and never restarts itself', () => {
  assert.match(media, /IntersectionObserver/);
  assert.match(media, /if \(!entry\.isIntersecting\) videoRef\.current\?\.pause\(\)/);
  assert.match(media, /observer\.disconnect\(\)/);
  // No resume branch: nothing calls play() from the observer.
  assert.doesNotMatch(media, /isIntersecting\) [^\n]*play\(\)/);
});

test('the transition contract on the media survives the rewrite', () => {
  assert.match(media, /data-case-media/);
  assert.match(media, /data-project-poster/);
  assert.match(media, /data-warp/);
  assert.match(media, /layoutId=\{`project-media-\$\{project\.slug\}`\}/);
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
