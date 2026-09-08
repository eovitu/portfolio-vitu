import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const surface = read('./useDialogSurface.ts');
const menu = read('../components/navigation/MobileMenu.tsx');
const header = read('../components/navigation/Header.tsx');
const hub = read('../components/conversation/ConversationHub.tsx');

test('there is exactly one modal dialog implementation', () => {
  for (const source of [menu, hub]) {
    assert.match(source, /useDialogSurface\(\{/);
    // No second trap, no second scroll lock, no second Escape handler.
    assert.doesNotMatch(source, /key === 'Tab'/);
    assert.doesNotMatch(source, /key === 'Escape'/);
    assert.doesNotMatch(source, /document\.body\.style\.overflow/);
  }
});

test('the trap holds Tab, Shift+Tab and focus that escaped the panel', () => {
  assert.match(surface, /event\.shiftKey && document\.activeElement === first/);
  assert.match(surface, /!event\.shiftKey && document\.activeElement === last/);
  assert.match(surface, /!panelRef\.current\.contains\(document\.activeElement\)/);
  assert.match(surface, /event\.preventDefault\(\)/);
});

test('the background is inert while a dialog is open, and only then', () => {
  assert.match(surface, /background\.setAttribute\('inert', ''\)/);
  assert.match(surface, /background\.removeAttribute\('inert'\)/);
  // A dialog inside the inert subtree would make itself unreachable.
  assert.match(menu, /createPortal\(/);
  assert.match(hub, /createPortal\(/);
});

test('focus returns to the control that opened the dialog', () => {
  assert.match(surface, /const returnTo = returnFocusRef\?\.current \?\? null/);
  assert.match(surface, /returnTo\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(header, /triggerRef=\{menuButtonRef\}/);
  assert.match(header, /aria-expanded=\{menuOpen\}/);
  assert.match(menu, /aria-modal="true"/);
  assert.match(menu, /role="dialog"/);
  // The header no longer restores focus itself: one owner.
  assert.doesNotMatch(header, /menuButtonRef\.current\?\.focus/);
});

test('the scroll lock is restored to what it was, not to a guess', () => {
  assert.match(surface, /const previousOverflow = document\.body\.style\.overflow/);
  assert.match(surface, /document\.body\.style\.overflow = previousOverflow/);
  // Lenis keeps its own reference-counted lock rather than a second one.
  assert.match(surface, /stop\(\)/);
  assert.match(surface, /start\(\)/);
});

test('mobile links own navigation before the closing menu can unmount them', () => {
  assert.match(menu, /event\.preventDefault\(\)/);
  assert.match(menu, /navigate\(event\.currentTarget\.href/);
  assert.doesNotMatch(menu, /data-transition-cause="hash"\s+onClick=\{onClose\}/);
});

test('the mobile surface stays mounted for both entrance and exit motion', () => {
  assert.match(menu, /<AnimatePresence initial=\{false\}>/);
  assert.match(menu, /initial="closed"/);
  assert.match(menu, /animate="open"/);
  assert.match(menu, /exit="closed"/);
});

test('a mobile link releases the scroll lock before it navigates', () => {
  // `useDialogSurface`'s own cleanup releases the lock too, but only once
  // React commits the `onClose()` state update, a tick or two after the
  // click handler already returned. Lenis's `start()` resets any in-flight
  // scroll animation as a side effect, so if that release lands after
  // `navigate()` has armed the smooth-scroll to a section, it kills it in
  // flight, silently: the URL changes, the menu closes, the page never
  // moves. `start()` has to run before `navigate()`, in the same handler.
  assert.match(menu, /const \{ start \} = useSmoothScroll\(\);/);
  assert.match(menu, /start\(\);\s*onClose\(\);\s*void navigate\(/);
});
