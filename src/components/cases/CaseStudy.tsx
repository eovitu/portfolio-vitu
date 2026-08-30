import type { Project } from '../../lib/content';
import { projects } from '../../lib/content';
import { hrefForCase } from '../../lib/routes';
import * as S from './CaseStudy.styles';

export function CaseStudy({ project }: { project: Project }) {
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(index + projects.length - 1) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <S.Page id="case-content">
      <S.Hero>
        <S.Width>
          <S.Back href="/#work">← Selected work</S.Back>
          <S.Eyebrow>{project.eyebrow}</S.Eyebrow>
          <S.Title>{project.name}</S.Title>
          <S.Thesis>
            <p>{project.summary}</p>
            <dl>
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{project.tech}</dd>
              </div>
            </dl>
          </S.Thesis>
        </S.Width>
      </S.Hero>

      <S.Media>
        <video
          muted
          playsInline
          controls
          preload="metadata"
          poster={project.media.poster}
          width={project.media.width}
          height={project.media.height}
          aria-label={project.media.alt}
        >
          <source src={project.media.video} type="video/mp4" />
        </video>
      </S.Media>

      <S.Body>
        <S.Sections>
          {project.sections.map((section) => (
            <S.Section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </S.Section>
          ))}
        </S.Sections>
        <S.Outcome>
          <span>Outcome</span>
          <p>{project.outcome}</p>
        </S.Outcome>
      </S.Body>

      <S.Nav aria-label="Case study navigation">
        <a href={hrefForCase(previous.slug)}>
          <small>Previous case</small>
          <strong>{previous.name}</strong>
        </a>
        <a href={hrefForCase(next.slug)}>
          <small>Next case</small>
          <strong>{next.name}</strong>
        </a>
      </S.Nav>
    </S.Page>
  );
}
