import * as S from './Work.styles';
import { MatterField } from '../../layout/MatterField';
import { type Project } from '../../../lib/content';

/**
 * A single project panel. `data-p` marks the entrance-staggered items and
 * `data-panel-media` / `data-panel-image` the reveal + parallax targets — the
 * horizontal timeline picks them up by those hooks.
 */
export function ProjectPanel({ project, orbit }: { project: Project; orbit: S.Orbit }) {
  return (
    <S.Panel
      data-panel
      data-orbit={orbit}
      $orbit={orbit}
      aria-labelledby={`project-${project.n}`}
    >
      {/* Scenery, not content — hidden from the accessibility tree, since the
          same number is already announced by `S.Number` above the title. */}
      <S.Ghost data-ghost $orbit={orbit} aria-hidden="true">
        {project.n}
      </S.Ghost>

      <S.Body data-panel-body data-warp $orbit={orbit}>
        <S.Clip>
          <S.Number data-p="1" $orbit={orbit}>
            {project.n}
          </S.Number>
        </S.Clip>

        <S.TitleClip>
          <S.Title
            data-p="2"
            data-panel-title
            data-skew
            id={`project-${project.n}`}
            $orbit={orbit}
          >
            {project.name}
          </S.Title>
        </S.TitleClip>

        <S.Clip>
          <S.Desc data-p="3" $orbit={orbit}>
            {project.desc}
          </S.Desc>
        </S.Clip>

        <S.Meta data-p="4" $orbit={orbit}>
          <div>
            <dt>ROLE</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>STACK</dt>
            <dd>{project.tech}</dd>
          </div>
          <div>
            <dt>YEAR</dt>
            <dd>{project.year}</dd>
          </div>
        </S.Meta>

        <S.Highlights data-p="5" aria-label={`${project.name} highlights`}>
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </S.Highlights>

        <S.ProjectLinks data-p="6" aria-label={`${project.name} links`}>
          {project.links.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
          <span>{project.status}</span>
        </S.ProjectLinks>
      </S.Body>

      {/* The warp goes on the cell, never on `S.Media`: that element is a
          `[data-p]` target the pinned horizontal timeline scrubs, and two
          systems writing the same opacity would fight. Without the cell the
          plate simply sat still while the rest of the panel was swallowed. */}
      <S.MediaCell data-panel-cell data-warp $orbit={orbit}>
        <S.Media data-p="7" data-panel-media $orbit={orbit}>
          <S.MediaInner data-panel-image $orbit={orbit}>
            <MatterField kind={orbit} />
          </S.MediaInner>
          <S.MediaStamp $orbit={orbit}>{project.slot}</S.MediaStamp>
        </S.Media>
      </S.MediaCell>
    </S.Panel>
  );
}
