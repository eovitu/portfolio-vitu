/**
 * The site's sound: a drone whose pitch falls as the reader approaches the
 * horizon, plus a short whoosh on the intro's absorb and expel.
 *
 * Synthesised with Web Audio rather than shipped as files. The direction asked
 * for light assets preloaded without blocking; two oscillators and a noise
 * burst are zero bytes over the wire, decode instantly, and the drone's pitch
 * has to be a continuous function of scroll anyway — which a sample cannot do
 * without pitch-shifting artefacts.
 *
 * Muted by default and never started without a user gesture: the AudioContext
 * is not even constructed until the reader turns it on, so autoplay policy is
 * satisfied by construction rather than by catching an exception.
 */

const KEY = 'singularity:sound';

interface Engine {
  ctx: AudioContext;
  master: GainNode;
  drone: OscillatorNode;
  sub: OscillatorNode;
  droneGain: GainNode;
  noise: AudioBuffer;
}

let engine: Engine | null = null;
let enabled = false;

export function soundEnabled(): boolean {
  return enabled;
}

export function readStoredPreference(): boolean {
  try {
    return sessionStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
}

function build(): Engine {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctor();

  const master = ctx.createGain();
  // Deliberately very low. This is meant to be felt at the edge of hearing,
  // not listened to.
  master.gain.value = 0;
  master.connect(ctx.destination);

  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.5;
  droneGain.connect(master);

  const drone = ctx.createOscillator();
  drone.type = 'sine';
  drone.frequency.value = 58;
  drone.connect(droneGain);
  drone.start();

  // A second oscillator a hair off unison: the beating between them is what
  // keeps a pure sine from sounding like a test tone.
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = 58.7;
  const subGain = ctx.createGain();
  subGain.gain.value = 0.6;
  sub.connect(subGain);
  subGain.connect(droneGain);
  sub.start();

  // One second of noise, reused for every whoosh.
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  return { ctx, master, drone, sub, droneGain, noise };
}

export function setSound(on: boolean): void {
  enabled = on;
  try {
    sessionStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // Storage disabled — the preference simply does not persist.
  }
  if (on && !engine) engine = build();
  if (!engine) return;
  if (on) void engine.ctx.resume();
  const now = engine.ctx.currentTime;
  engine.master.gain.cancelScheduledValues(now);
  engine.master.gain.setTargetAtTime(on ? 0.045 : 0, now, 0.4);
  if (!on) window.setTimeout(() => void engine?.ctx.suspend(), 1200);
}

/**
 * Pitch as a function of distance to the horizon.
 *
 * Falling, not rising: light climbing out of the well loses energy, and the
 * drone is the site's one audible statement of the same idea the redshift
 * makes visually.
 */
export function setHorizon(progress: number): void {
  if (!engine || !enabled) return;
  const now = engine.ctx.currentTime;
  const f = 58 - progress * 26;
  engine.drone.frequency.setTargetAtTime(f, now, 0.5);
  engine.sub.frequency.setTargetAtTime(f * 1.012, now, 0.5);
}

/** Short filtered noise burst — the absorb and the expel. */
export function whoosh(direction: 'in' | 'out'): void {
  if (!engine || !enabled) return;
  const { ctx, noise, master } = engine;
  const src = ctx.createBufferSource();
  src.buffer = noise;

  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 1.4;

  const gain = ctx.createGain();
  const now = ctx.currentTime;
  const dur = 0.75;

  // Sweeping down reads as falling in; sweeping up reads as being thrown out.
  const [from, to] = direction === 'in' ? [1400, 180] : [220, 1600];
  band.frequency.setValueAtTime(from, now);
  band.frequency.exponentialRampToValueAtTime(to, now + dur);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  src.connect(band);
  band.connect(gain);
  gain.connect(master);
  src.start(now);
  src.stop(now + dur);
}

export function disposeAudio(): void {
  if (!engine) return;
  void engine.ctx.close();
  engine = null;
  enabled = false;
}
