import type { Project } from '../../lib/content';
import { lazy, Suspense } from 'react';
import { ArrowLeft, ArrowUpRight } from '@phosphor-icons/react';
import { PROJECT_THEMES } from '../../motion/projectThemes';
import { useRouteScrollRefresh } from '../../hooks/useRouteScrollRefresh';
import { hrefForCase } from '../../lib/routes';
import { CaseMedia } from './CaseMedia';
import * as S from './CaseStudy.styles';
import { useLanguage } from '../providers/LanguageProvider';

const EmploymentJourney = lazy(() => import('./EmploymentJourney'));
const CommerceStory = lazy(() => import('./CommerceStory'));
const IntegrationStory = lazy(() => import('./IntegrationStory'));

export function CaseStudy({ project }: { project: Project }) {
  const { content } = useLanguage();
  const { projects } = content;
  const copy = content.ui.caseStudy;
  // A case study enters and leaves through the same gravitational field as the
  // home page. Without this it was the one route that faded generically.
  useRouteScrollRefresh();
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(index + projects.length - 1) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <S.Page id="case-content" data-layout={PROJECT_THEMES[project.slug].layout}>
      <S.Hero data-warp data-gravity-section>
        <S.Width>
          <S.Back
            href="/"
            data-transition-project={project.slug}
            data-transition-cause="brand"
          >
            <ArrowLeft aria-hidden="true" weight="regular" /> {copy.back}
          </S.Back>
          <S.Eyebrow>
            {project.eyebrow} <span>{project.status}</span>
          </S.Eyebrow>
          <S.Title data-route-heading tabIndex={-1}>
            {project.name}
          </S.Title>
          <S.Thesis>
            <p>{project.summary}</p>
            <dl>
              {project.context ? (
                <div>
                  <dt>{copy.context}</dt>
                  <dd>{project.context}</dd>
                </div>
              ) : null}
              <div>
                <dt>{copy.role}</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>{copy.year}</dt>
                <dd>{project.year}</dd>
              </div>
              <div>
                <dt>{copy.stack}</dt>
                <dd>{project.tech}</dd>
              </div>
            </dl>
          </S.Thesis>
        </S.Width>
      </S.Hero>

      <CaseMedia project={project} />

      <Suspense fallback={<S.Loading role="status">{copy.loading}</S.Loading>}>
        {project.slug === 'emprega-co' ? <EmploymentJourney /> : null}
        {project.slug === 'doces-da-pati' ? <CommerceStory /> : null}
        {project.slug === 'helppet' ? <IntegrationStory /> : null}
      </Suspense>

      <S.Body data-gravity-section>
        <S.Sections>
          {project.sections.map((section) => (
            <S.Section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </S.Section>
          ))}
        </S.Sections>
        <S.Outcome>
          <span>{copy.outcome}</span>
          <p>{project.outcome}</p>
        </S.Outcome>
        {project.actions.length ? (
          <S.ExternalActions>
            {project.actions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {action.label} <ArrowUpRight aria-hidden="true" weight="regular" />
              </a>
            ))}
          </S.ExternalActions>
        ) : null}
      </S.Body>

      <S.Nav aria-label={copy.navigation} data-gravity-section>
        <a
          href={hrefForCase(previous.slug)}
          data-transition-project={previous.slug}
          data-transition-cause="previous"
        >
          <small>{copy.previous}</small>
          <strong>{previous.name}</strong>
        </a>
        <a
          href={hrefForCase(next.slug)}
          data-transition-project={next.slug}
          data-transition-cause="next"
        >
          <small>{copy.next}</small>
          <strong>{next.name}</strong>
        </a>
      </S.Nav>
    </S.Page>
  );
}
