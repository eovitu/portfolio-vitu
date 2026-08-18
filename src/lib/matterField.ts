/**
 * Generative matter for the project plates.
 *
 * The real captures do not exist yet, and an empty rectangle waiting for one
 * is the single biggest reason the dark sections read as unfinished rather
 * than as spare. These fields give each plate actual matter — a body of light
 * with temperature, structure and slow motion — graded per orbit so the three
 * panels do not look like each other.
 *
 * Cost is controlled by resolution rather than by throttling alone: the field
 * is computed into a ~15k-pixel backing store and scaled up by the compositor,
 * so a frame costs the same whether the plate is 300px or 900px wide. The
 * upscale is the point rather than a compromise — bilinear smoothing is what
 * turns three octaves of lattice noise into plasma.
 *
 * When the real captures arrive these become the ground the photograph sits
 * on: keep the canvas, drop an <img> above it, and the plate keeps its body in
 * whatever margin the picture does not cover.
 */

export type FieldKind = 0 | 1 | 2;

/** Deterministic hash lattice — no Math.random, so every reload is identical. */
function hash(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Bilinear value noise on an integer lattice. */
function noise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return (a + (b - a) * xf) * (1 - yf) + (c + (d - c) * xf) * yf;
}

/**
 * Three octaves, each advected at its own rate.
 *
 * Layers moving together read as a texture being dragged; layers moving at
 * different rates read as something turning over inside itself, which is what
 * makes a slow field feel like matter rather than like wallpaper.
 */
function fbm(x: number, y: number, t: number, seed: number): number {
  return (
    noise(x, y + t * 0.35, seed) * 0.56 +
    noise(x * 2.1 + t * 0.22, y * 2.1, seed + 17) * 0.28 +
    noise(x * 4.3, y * 4.3 - t * 0.5, seed + 41) * 0.16
  );
}

/**
 * Palette stops per orbit, low energy to high.
 *
 * Straight sRGB interpolation is adequate here: the ramps are short and every
 * stop was chosen by eye against the page, not converted from a formula.
 */
const RAMP: Record<FieldKind, [number, number, number][]> = {
  // 0 — near the horizon. Matter already lit by the disc: gold at the core,
  // falling through burnt orange into a warm black.
  0: [
    [7, 6, 6],
    [34, 21, 11],
    [92, 55, 20],
    [186, 130, 61],
    [236, 208, 160],
  ],
  // 1 — stable orbit. No hue at all: silver under an even sweep, so the middle
  // panel is the neutral rest point between the two extremes.
  1: [
    [10, 10, 12],
    [26, 26, 30],
    [56, 56, 63],
    [104, 104, 113],
    [172, 172, 182],
  ],
  // 2 — far and cold. Mostly void, and what light there is runs blue: matter
  // this far out has not been touched by the horizon yet.
  2: [
    [5, 6, 9],
    [11, 16, 26],
    [26, 40, 64],
    [58, 88, 128],
    [150, 184, 224],
  ],
};

function ramp(kind: FieldKind, t: number, out: number[]): void {
  const stops = RAMP[kind];
  const u = Math.max(0, Math.min(0.9999, t)) * (stops.length - 1);
  const i = u | 0;
  const f = u - i;
  const a = stops[i];
  const b = stops[i + 1];
  out[0] = a[0] + (b[0] - a[0]) * f;
  out[1] = a[1] + (b[1] - a[1]) * f;
  out[2] = a[2] + (b[2] - a[2]) * f;
}

/**
 * Where the light comes from, per orbit.
 *
 * Not decoration — the panel's position stated in light. Near the horizon the
 * source sits off the bottom-left corner, because the whole site's light comes
 * from one place. In stable orbit it is even and frontal, a studio. Far out
 * there is no source at all: a cold rim at the top-right, and void.
 */
function energy(kind: FieldKind, u: number, v: number): number {
  if (kind === 0) {
    const dx = u - 0.12;
    const dy = v - 1.06;
    return Math.max(0, 1.12 - Math.sqrt(dx * dx + dy * dy) * 1.32);
  }
  if (kind === 1) {
    const dx = (u - 0.5) * 1.15;
    const dy = (v - 0.42) * 1.5;
    return Math.max(0, 0.92 - Math.sqrt(dx * dx + dy * dy) * 0.86);
  }
  const dx = (u - 1.02) * 1.05;
  const dy = (v + 0.16) * 1.2;
  return Math.max(0, 0.72 - Math.sqrt(dx * dx + dy * dy) * 0.78);
}

/** Contrast curve per orbit: crushed and hot near, flat in the middle, sparse
 *  and dim far out. */
const GAIN: Record<FieldKind, [number, number]> = {
  0: [1.62, 1.16],
  1: [1.5, 0.86],
  2: [2.35, 0.86],
};

/**
 * How much of the value is turbulence and how much is the light source.
 *
 * Near the horizon the balance tips towards the noise: the first pass was
 * energy-dominated and produced a clean gradient with a soft white blob in it,
 * which reads as a lens flare rather than as matter under stress. Far out the
 * balance tips the other way, because turbulence is exactly what cold matter
 * does not have.
 */
const MIX: Record<FieldKind, [number, number]> = {
  0: [0.84, 0.66],
  1: [0.9, 0.62],
  2: [0.5, 0.95],
};

export interface Field {
  /** Draw one frame. `t` is seconds; the field is a pure function of it. */
  draw: (t: number) => void;
  /** Size the backing store to the plate's aspect ratio. */
  fit: (aspect: number) => void;
}

/**
 * Pixels of work per frame, independent of the plate's size on screen.
 *
 * 15k was the first pass and it was too few: a 700px-wide plate multiplies
 * each sample by roughly six, and past that ratio the interpolation stops
 * reading as plasma and starts reading as a blurred photograph. 33k keeps the
 * softness while letting the third octave survive the upscale — measured at
 * ~0.35ms per redraw, which at 12fps is under 5% of one frame.
 */
const BUDGET = 33000;

export function createField(
  canvas: HTMLCanvasElement,
  kind: FieldKind,
  budget: number = BUDGET,
): Field | null {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return null;

  let w = 0;
  let h = 0;
  let image: ImageData | null = null;
  const rgb = [0, 0, 0];
  const seed = 1337 + kind * 911;

  /**
   * Fixed star lattice for orbit 2 — positions never move, only brightness.
   * Asking the noise to resolve stars would need an order of magnitude more
   * pixels; writing 46 of them into the buffer costs nothing and they inherit
   * the same upscale, so they bloom instead of resolving as hard dots.
   */
  const stars: [number, number, number][] = [];
  if (kind === 2) {
    for (let i = 0; i < 46; i++) {
      stars.push([hash(i, 3, seed), hash(i, 7, seed + 5), hash(i, 11, seed + 9)]);
    }
  }

  const fit = (aspect: number) => {
    const nw = Math.max(48, Math.round(Math.sqrt(budget * aspect)));
    const nh = Math.max(48, Math.round(nw / aspect));
    if (nw === w && nh === h) return;
    w = nw;
    h = nh;
    canvas.width = w;
    canvas.height = h;
    image = ctx.createImageData(w, h);
  };

  const draw = (t: number) => {
    if (!image) return;
    const data = image.data;
    const [gamma, gain] = GAIN[kind];
    const [mixN, mixE] = MIX[kind];
    /* Slow on purpose. The field has to be alive without ever becoming motion
       the reader has to watch — a field you notice moving is a screensaver. */
    const time = t * 0.09;

    for (let y = 0; y < h; y++) {
      const v = y / h;
      for (let x = 0; x < w; x++) {
        const u = x / w;
        const n = fbm(u * 3.1, v * 3.1, time, seed);
        const e = energy(kind, u, v);
        let value = Math.pow(n * mixN + e * mixE, gamma) * gain;
        if (value > 1) value = 1;
        ramp(kind, value, rgb);
        const i = (y * w + x) << 2;
        data[i] = rgb[0];
        data[i + 1] = rgb[1];
        data[i + 2] = rgb[2];
        data[i + 3] = 255;
      }
    }

    if (kind === 2) {
      for (let i = 0; i < stars.length; i++) {
        const [sx, sy, phase] = stars[i];
        const x = (sx * w) | 0;
        const y = (sy * h) | 0;
        const b = 0.45 + 0.55 * Math.sin(t * (0.5 + phase) + phase * 9);
        const j = (y * w + x) << 2;
        const lift = 90 + 150 * b;
        data[j] = Math.min(255, data[j] + lift * 0.82);
        data[j + 1] = Math.min(255, data[j + 1] + lift * 0.9);
        data[j + 2] = Math.min(255, data[j + 2] + lift);
      }
    }

    ctx.putImageData(image, 0, 0);
  };

  return { draw, fit };
}
