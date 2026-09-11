import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const provider = read('./ConversationProvider.tsx');
const trigger = read('./TalkToMeButton.tsx');
const hub = read('./ConversationHub.tsx');
const footer = read('../layout/Footer.tsx');
const header = read('../navigation/Header.tsx');
const menu = read('../navigation/MobileMenu.tsx');
const app = read('../../App.tsx');

test('one drawer, mounted once, opened from anywhere', () => {
  assert.match(app, /<ConversationProvider>/);
  assert.match(provider, /<ConversationHub open=\{isOpen\}/);
  // The drawer no longer renders its own trigger, that coupling is exactly
  // why only the footer's button did anything.
  assert.doesNotMatch(hub, /TalkToMeButton/);
  // Open/close is now the provider's, passed in rather than held here.
  assert.match(
    hub,
    /export function ConversationHub\(\{ open, onClose, triggerRef \}: Props\)/,
  );
  assert.match(hub, /const close = onClose;/);
  for (const source of [footer, header, menu]) {
    assert.doesNotMatch(source, /ConversationHub/);
  }
});

test('header and menu TALK TO ME open the drawer; footer has no repeated CTA', () => {
  for (const source of [footer, header, menu]) {
    assert.doesNotMatch(source, /window\.location\.href/);
    assert.doesNotMatch(source, /mailto/);
  }
  assert.doesNotMatch(footer, /TalkToMeButton|Have a project/);
  assert.match(header, /<DesktopTalk aria-label=\{ui\.talkToMe\} \/>/);
  assert.match(menu, /<MenuTalk aria-label=\{ui\.talkToMe\} onClick=\{onClose\} \/>/);
  assert.match(trigger, /open\(localRef\.current\)/);
});

test('the trigger hands over the node focus must return to', () => {
  assert.match(provider, /triggerRef\.current = trigger/);
  assert.match(provider, /triggerRef=\{triggerRef\}/);
  assert.match(trigger, /aria-haspopup="dialog"/);
  assert.match(trigger, /aria-expanded=\{isOpen\}/);
  // A caller may still veto the open, the mobile menu closes itself first.
  assert.match(trigger, /if \(event\.defaultPrevented\) return;/);
});
