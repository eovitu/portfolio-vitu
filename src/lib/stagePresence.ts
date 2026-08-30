/**
 * Where the object is allowed to be, section by section.
 *
 * Until now the singularity was a fixed layer behind the entire document. That
 * was right when it was the only image on the site, and wrong the moment the
 * sections needed worlds of their own: WORK, SKILLS and CONTACT all shared one
 * backdrop, so none of them could have an identity. The evidence is that ABOUT
 * — the only section the object is absent from — is the only one that reads as
 * a place.
 *
 * So presence becomes a function of position in the document:
 *
 *   hero      1.00  full presence, the composition it was framed for
 *   WORK      0.16  a small distant point; each panel owns its own background
 *   SKILLS    0.00  gone
 *   ABOUT     0.00  gone (the section is opaque over it as well)
 *   CONTACT   0 → 1.45  returns and grows until it dominates the collapse
 *
 * Nothing here uses `display: none`. Presence drives the veil, the scale and
 * the screen position, which are the three levers the direction allows, so
 * every exit and return is a move rather than a cut.
 *
 * Boundaries are measured once and re-measured on refresh — never per frame.
 */

interface Bounds {
  workTop: number;
  workBottom: number;
  aboutTop: number;
  contactTop: number;
  docEnd: number;
  vh: number;
  ready: boolean;
}

const bounds: Bounds = {
  workTop: 0,
  workBottom: 0,
  aboutTop: 0,
  contactTop: 0,
  docEnd: 1,
  vh: 1,
  ready: false,
};

/** Reused: this is read every frame by the rig and the veil. */
const state = { presence: 0, scale: 1, offsetX: 0, offsetY: 0 };

/**
 * Offset applied while the object is a distant point during WORK, in world
 * units. Pushes it up and left, clear of the panel copy and the media plate.
 */
const WORK_CORNER = { x: -1.05, y: 0.62 };

/** Upper bound for the closing shot; larger values turn into fill-rate cost. */
export const CONTACT_MAX_PRESENCE = 1.12;

export function measureStage(): void {
  if (typeof document === 'undefined') return;
  const work = document.querySelector<HTMLElement>('#work');
  const about = document.querySelector<HTMLElement>('#about');
  const contact = document.querySelector<HTMLElement>('#contact');
  if (!work || !about || !contact) return;

  // The pin spacer is what gives WORK its real scrolled length; without it the
  // chapter would appear to end where its markup ends.
  const spacer = work.closest('.pin-spacer') ?? work.querySelector('.pin-spacer');
  const workTop = work.getBoundingClientRect().top + window.scrollY;
  const workHeight =
    spacer instanceof HTMLElement ? spacer.offsetHeight : work.offsetHeight;

  bounds.workTop = workTop;
  bounds.workBottom = workTop + workHeight;
  bounds.aboutTop = about.getBoundingClientRect().top + window.scrollY;
  bounds.contactTop = contact.getBoundingClientRect().top + window.scrollY;
  bounds.docEnd = document.documentElement.scrollHeight - window.innerHeight;
  bounds.vh = window.innerHeight;
  bounds.ready = true;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Smoothstep: the exits and returns must ease, never step. */
const ease = (t: number) => t * t * (3 - 2 * t);

/** How present the object should be at a given scroll position. */
function presenceAt(y: number): number {
  if (!bounds.ready) return 1;
  const { workTop, workBottom, contactTop, docEnd, vh } = bounds;

  // Hero → WORK: fall from full presence to a distant point across the last
  // half viewport before the chapter pins.
  if (y < workTop) {
    const t = clamp01((y - (workTop - vh * 0.85)) / (vh * 0.85));
    return 1 - ease(t) * 0.84;
  }

  // Across the pinned chapter it stays a point.
  if (y < workBottom) return 0.16;

  // WORK → SKILLS/ABOUT: the point goes out entirely.
  const outEnd = workBottom + vh * 0.5;
  if (y < outEnd) return 0.16 * (1 - ease(clamp01((y - workBottom) / (vh * 0.5))));

  // Absent through SKILLS and ABOUT.
  if (y < contactTop - vh * 0.6) return 0;

  // CONTACT: returns and grows past full presence into the collapse.
  const span = Math.max(1, docEnd - (contactTop - vh * 0.6));
  return ease(clamp01((y - (contactTop - vh * 0.6)) / span)) * CONTACT_MAX_PRESENCE;
}

export function updateStage(y: number): void {
  const p = presenceAt(y);
  state.presence = p;
  /**
   * Scale is deliberately non-linear against presence: a distant point has to
   * actually look distant, so the low end compresses hard, while the collapse
   * end is allowed to overshoot the hero's framing.
   */
  state.scale = 0.22 + p * 0.78;
  // Slide to the corner exactly as far as the object has receded.
  const away = clamp01((1 - p) / 0.84);
  state.offsetX = WORK_CORNER.x * away;
  state.offsetY = WORK_CORNER.y * away;
}

export function stage(): Readonly<typeof state> {
  return state;
}

/**
 * The veil that corresponds to the current presence.
 *
 * Capped just short of 1: a fully opaque veil would also flatten the starfield,
 * which is now the site's constant and has to survive every section.
 */
export function stageVeil(): number {
  return Math.round(Math.min(0.97, clamp01(1 - state.presence)) * 100) / 100;
}
