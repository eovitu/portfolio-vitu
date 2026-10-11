/** Snapshot media must remain a root-relative image on the current origin. */
export function localMediaSource(source: unknown, origin: string): string | undefined {
  if (
    typeof source !== 'string' ||
    !source.startsWith('/') ||
    source.startsWith('//') ||
    [...source].some(
      (character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127,
    ) ||
    /[\\?#]|%(?:5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(source)
  )
    return undefined;
  try {
    const base = new URL(origin);
    const url = new URL(source, base);
    if (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.origin === base.origin &&
      !url.pathname.startsWith('//') &&
      /\.(webp|png|jpe?g|avif)$/i.test(url.pathname)
    )
      return url.pathname;
  } catch {
    // Malformed input is never used to create an image request.
  }
  return undefined;
}
