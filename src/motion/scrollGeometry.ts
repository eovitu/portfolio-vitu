/** Layout invalidation never writes dimensions or scroll, avoiding observer feedback. */
export function observeScrollGeometry(cancel: () => void): () => void {
  const resize = new ResizeObserver(cancel);
  const observe = () => {
    resize.disconnect();
    resize.observe(document.body);
    document
      .querySelectorAll(
        '[data-scroll-boundary], [data-theater-run], [data-theater-chapter]',
      )
      .forEach((element) => resize.observe(element));
  };
  const mutation = new MutationObserver(() => {
    cancel();
    observe();
  });
  observe();
  mutation.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['data-enhanced'],
  });
  window.addEventListener('resize', cancel);
  return () => {
    window.removeEventListener('resize', cancel);
    resize.disconnect();
    mutation.disconnect();
  };
}
