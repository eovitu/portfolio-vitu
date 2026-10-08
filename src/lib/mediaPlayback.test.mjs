import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMediaPlayback } from './mediaPlayback.ts';
const eligible = {
  visible: true,
  active: true,
  documentVisible: true,
  reducedMotion: false,
};
function fixture() {
  let attachments = 0,
    plays = 0,
    pauses = 0;
  const media = {
    paused: true,
    async play() {
      plays++;
      media.paused = false;
    },
    pause() {
      pauses++;
      media.paused = true;
    },
  };
  return {
    media,
    policy: createMediaPlayback(media, () => attachments++),
    counts: () => ({ attachments, plays, pauses }),
  };
}
test('only visible active media attaches, hidden document suspends and returning resumes', async () => {
  const f = fixture();
  await f.policy.update({ ...eligible, visible: false });
  await f.policy.update({ ...eligible, active: false });
  await f.policy.update({ ...eligible, documentVisible: false });
  assert.equal(f.counts().attachments, 0);
  await f.policy.update(eligible);
  assert.equal(f.counts().plays, 1);
  await f.policy.update({ ...eligible, documentVisible: false });
  assert.equal(f.media.paused, true);
  await f.policy.update(eligible);
  assert.equal(f.counts().plays, 2);
});
test('manual pause survives visibility events while section is active, resets on departure', async () => {
  const f = fixture();
  await f.policy.update(eligible);
  await f.policy.toggle();
  await f.policy.update({ ...eligible, documentVisible: false });
  await f.policy.update(eligible);
  assert.equal(f.counts().plays, 1);
  await f.policy.update({ ...eligible, active: false });
  await f.policy.update(eligible);
  assert.equal(f.counts().plays, 2);
});
test('reduced motion starts at poster and explicit toggle plays', async () => {
  const f = fixture();
  await f.policy.update({ ...eligible, reducedMotion: true });
  assert.equal(f.counts().attachments, 0);
  await f.policy.toggle();
  assert.equal(f.counts().plays, 1);
});
test('blocked autoplay never loops and explicit error retry reattaches', async () => {
  const f = fixture();
  f.media.play = async () => {
    throw Error('blocked');
  };
  await assert.rejects(f.policy.update(eligible));
  await f.policy.update(eligible);
  assert.equal(f.counts().attachments, 1);
  f.policy.failed();
  f.media.play = async () => {
    f.media.paused = false;
  };
  await f.policy.update(eligible);
  assert.equal(f.counts().attachments, 1);
  await f.policy.toggle();
  assert.equal(f.counts().attachments, 2);
});
test('late play resolution and abort cannot restart hidden media', async () => {
  const f = fixture();
  let resolve;
  f.media.play = () =>
    new Promise((done) => {
      resolve = done;
    });
  const pending = f.policy.update(eligible);
  await f.policy.update({ ...eligible, visible: false });
  resolve();
  await pending;
  assert.equal(f.media.paused, true);
});
test('manual pause cancels a pending play even before media reports playing', async () => {
  const f = fixture();
  let reject;
  f.media.play = () =>
    new Promise((_, fail) => {
      reject = fail;
    });
  const pending = f.policy.update(eligible);
  await f.policy.toggle();
  reject(new DOMException('cancelled', 'AbortError'));
  await pending;
  await f.policy.update(eligible);
  assert.equal(f.counts().attachments, 1);
  assert.equal(f.media.paused, true);
});

test('late cancelled request cannot pause a newer eligible playback', async () => {
  const f = fixture();
  let resolve;
  f.media.play = () =>
    new Promise((done) => {
      resolve = done;
    });
  const old = f.policy.update(eligible);
  await f.policy.update({ ...eligible, visible: false });
  f.media.play = async () => {
    f.media.paused = false;
  };
  await f.policy.update(eligible);
  resolve();
  await old;
  assert.equal(f.media.paused, false);
});
