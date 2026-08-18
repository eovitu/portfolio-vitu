/**
 * Which register the page is in — dark or light — as one global fact.
 *
 * The site's chrome (the header, the distance HUD, the WORK chapter label)
 * is fixed or pinned, so it floats over whatever section happens to be under
 * it. That was survivable while exactly one section was light and it sat below
 * the fold of the header; it stops being survivable the moment a second light
 * surface exists, and the failure is not subtle — light grey type on bone.
 *
 * So the register is published on the root element and the chrome reads it in
 * CSS. Claims are counted rather than set, because two light surfaces can
 * legitimately overlap during a transition and the first one to leave must not
 * take the register with it.
 */

const claims = new Set<string>();

function apply(): void {
  const root = document.documentElement;
  if (claims.size > 0) root.dataset.register = 'light';
  else delete root.dataset.register;
}

export function claimLight(id: string): void {
  if (claims.has(id)) return;
  claims.add(id);
  apply();
}

export function releaseLight(id: string): void {
  if (!claims.delete(id)) return;
  apply();
}

/** Set or clear one claim from a boolean — the shape every caller wants. */
export function setLight(id: string, on: boolean): void {
  if (on) claimLight(id);
  else releaseLight(id);
}

/** Escape hatch for teardown: a hot reload must not leave a stale claim. */
export function clearRegister(): void {
  claims.clear();
  apply();
}
