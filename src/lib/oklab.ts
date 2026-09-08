/**
 * Perceptual colour interpolation, in about forty lines.
 *
 * Lerping two saturated colours in sRGB walks the shortest line through the
 * cube, and that line passes near the grey axis: terracotta to green in RGB
 * spends its middle third as olive mud. Oklab is laid out so that a straight
 * line between two colours keeps the lightness and the chroma the eye
 * actually perceives, which is the whole reason the accent transition reads
 * as a temperature change rather than as a colour dying and being reborn.
 *
 * No dependency: three has no Oklab, and this is smaller than adding one.
 */

export interface Oklab {
  L: number;
  a: number;
  b: number;
}

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const toSrgb = (c: number) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

/** Linear-light sRGB triplet (0..1) to Oklab. */
export function linearToOklab(r: number, g: number, b: number): Oklab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/** `#rrggbb` to Oklab. Parsed once per colour, never per frame. */
export function hexToOklab(hex: string): Oklab {
  const n = parseInt(hex.slice(1), 16);
  return linearToOklab(
    toLinear(((n >> 16) & 255) / 255),
    toLinear(((n >> 8) & 255) / 255),
    toLinear((n & 255) / 255),
  );
}

/** Writes into `out` so a per-frame caller allocates nothing. */
export function mixOklab(from: Oklab, to: Oklab, t: number, out: Oklab): Oklab {
  out.L = from.L + (to.L - from.L) * t;
  out.a = from.a + (to.a - from.a) * t;
  out.b = from.b + (to.b - from.b) * t;
  return out;
}

/**
 * Gamma-encoded sRGB (0..1), written into `out` so a per-frame caller
 * allocates nothing. `out` must have length 3.
 */
export function oklabToSrgb(c: Oklab, out: number[]): number[] {
  const l = (c.L + 0.3963377774 * c.a + 0.2158037573 * c.b) ** 3;
  const m = (c.L - 0.1055613458 * c.a - 0.0638541728 * c.b) ** 3;
  const s = (c.L - 0.0894841775 * c.a - 1.291485548 * c.b) ** 3;
  const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  out[0] = toSrgb(clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s));
  out[1] = toSrgb(clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s));
  out[2] = toSrgb(clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s));
  return out;
}
