import assert from 'node:assert/strict';
import test from 'node:test';
import { createTransitionMachine } from './routeTransitionMachine.ts';

test('moves through the only valid successful sequence', async () => {
  const phases = [];
  const machine = createTransitionMachine({
    onPhase: (phase) => phases.push(phase),
    restore: () => phases.push('restored'),
  });

  const run = machine.begin({ id: 1 });
  machine.advance('occluding');
  machine.advance('swapping');
  machine.advance('revealing');
  machine.complete();
  await run;

  assert.deepEqual(phases, [
    'anticipating',
    'occluding',
    'swapping',
    'revealing',
    'idle',
    'restored',
  ]);
});

test('deduplicates double click and restores exactly once after cancellation', async () => {
  let restores = 0;
  const machine = createTransitionMachine({ restore: () => restores++ });

  const first = machine.begin({ id: 7 });
  const duplicate = machine.begin({ id: 7 });
  assert.equal(first, duplicate);

  machine.cancel('superseded');
  await assert.rejects(first, /superseded/);
  assert.equal(machine.phase(), 'idle');
  assert.equal(restores, 1);
});

test('rejects invalid phase jumps without corrupting the active transition', async () => {
  const machine = createTransitionMachine();
  const run = machine.begin({ id: 3 });

  assert.throws(() => machine.advance('swapping'), /Invalid transition/);
  assert.equal(machine.phase(), 'anticipating');
  machine.cancel('test cleanup');
  await assert.rejects(run);
});

test('times out and returns to idle', async () => {
  let restores = 0;
  const machine = createTransitionMachine({ timeoutMs: 10, restore: () => restores++ });
  const run = machine.begin({ id: 9 });

  await assert.rejects(run, /timeout/);
  assert.equal(machine.phase(), 'idle');
  assert.equal(restores, 1);
});
