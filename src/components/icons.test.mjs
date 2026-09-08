import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const visibleSources = [
  read('./home/HomePage.tsx'),
  read('./home/HomePage.styles.ts'),
  read('./home/SelectedWorkTheater.tsx'),
  read('./home/SelectedWorkTheater.styles.ts'),
  read('./cases/CaseStudy.tsx'),
  read('./conversation/ConversationHub.tsx'),
  read('./conversation/ConversationHub.styles.ts'),
  read('./conversation/TalkToMeButton.tsx'),
];

test('visible interface icons use SVG components instead of emoji-prone glyphs', () => {
  const source = visibleSources.join('\n');
  assert.match(source, /@phosphor-icons\/react/);
  assert.doesNotMatch(source, /[↗↳⌘✳←↘]/);
});
