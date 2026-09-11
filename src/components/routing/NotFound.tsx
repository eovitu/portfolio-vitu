import { useEffect, useRef } from 'react';
import { useRouteScrollRefresh } from '../../hooks/useRouteScrollRefresh';
import { hrefForCase } from '../../lib/routes';
import { prefersReducedMotion } from '../../lib/prefersReducedMotion';
import { setSceneTarget } from '../../motion/sceneSignals';
import * as S from './NotFound.styles';
import { useLanguage } from '../providers/LanguageProvider';

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
  const { content } = useLanguage();
  const { projects } = content;
  const copy = content.ui.notFound;
  const heldRef = useRef<HTMLElement>(null);
  useRouteScrollRefresh();

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
          {copy.title}
        </S.Title>
        <S.Body>
          <p>
            {copy.beforePath} <S.Path>{path}</S.Path>. {copy.afterPath}
          </p>
          <p>{copy.survived}</p>
        </S.Body>
        <S.Actions>
          <S.Action $primary href="/" data-transition-cause="brand">
            {copy.back}
          </S.Action>
          <S.Action href="/#work" data-transition-cause="hash">
            {copy.work}
          </S.Action>
        </S.Actions>
        <S.Cases aria-label={copy.cases}>
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
