import { useEffect, useRef } from 'react';
import { useSectionGravity } from '../../hooks/useSectionGravity';
import { projects } from '../../lib/content';
import { hrefForCase } from '../../lib/routes';
import { prefersReducedMotion } from '../../lib/prefersReducedMotion';
import { setSceneTarget } from '../../motion/sceneSignals';
import * as S from './NotFound.styles';

/**
 * The one page where the singularity is the subject.
 *
 * Everywhere else the object is the setting: it sits behind the work and the
 * reader is meant to look past it. Here the reader asked for something that
 * is not there, and the site has an honest and specific answer for that,
 * the thing at the centre of every other page took it. So the page states
 * what was lost, in the same typography as the rest of the site, and points
 * at the two places worth going instead.
 *
 * It is not a joke at the reader's expense. The path they typed is printed
 * back verbatim, because the most useful thing a missing page can do is show
 * exactly what it looked for.
 */
export function NotFound({ path }: { path: string }) {
  const heldRef = useRef<HTMLElement>(null);
  useSectionGravity();

  /**
   * The object flares while the reader is here.
   *
   * Every other route hands the scene a project or a transition; this one
   * hands it the only state that means "something was consumed". Cleared on
   * the way out so the next route starts from neutral.
   */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    setSceneTarget({ energy: 0.55, flare: 0.35 });
    return () => setSceneTarget({ energy: 0, flare: 0 });
  }, []);

  return (
    <S.Page id="case-content" ref={heldRef} data-gravity-section>
      <S.Inner data-warp>
        <S.Code aria-hidden="true">404</S.Code>
        <S.Title data-route-heading tabIndex={-1}>
          The singularity got there first.
        </S.Title>
        <S.Body>
          <p>
            There is no page at <S.Path>{path}</S.Path>. Either it never existed or it has
            already crossed the horizon, from out here the two look identical.
          </p>
          <p>Everything that survived is one link away.</p>
        </S.Body>
        <S.Actions>
          <S.Action $primary href="/" data-transition-cause="brand">
            Back to the start
          </S.Action>
          <S.Action href="/#work" data-transition-cause="hash">
            See the work
          </S.Action>
        </S.Actions>
        <S.Cases aria-label="Case studies">
          {projects.map((project) => (
            <a
              key={project.slug}
              href={hrefForCase(project.slug)}
              data-transition-project={project.slug}
            >
              <span>{project.n}</span>
              <strong>{project.name}</strong>
              <small>{project.eyebrow}</small>
            </a>
          ))}
        </S.Cases>
      </S.Inner>
    </S.Page>
  );
}
