const owners = new WeakMap<object, () => void>();

/** A stale effect cleanup cannot restore styles over a newer fragment owner. */
export function claimArrivalTargets(targets: object[], cleanup: () => void): () => void {
  targets.forEach((target) => owners.get(target)?.());
  let active = true;
  const release = () => {
    if (!active) return;
    active = false;
    cleanup();
    targets.forEach((target) => {
      if (owners.get(target) === release) owners.delete(target);
    });
  };
  targets.forEach((target) => owners.set(target, release));
  return release;
}
