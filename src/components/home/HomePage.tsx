import { projects } from '../../lib/content';
import { hrefForCase } from '../../lib/routes';
import * as S from './HomePage.styles';

const capabilities = [
  {
    title: 'Backend Systems',
    body: 'Domain models, APIs and persistence shaped around product behavior instead of framework defaults.',
    stack: 'Java · Spring Boot · PostgreSQL · REST',
  },
  {
    title: 'Product Engineering',
    body: 'From ambiguous product flows to explicit states, contracts and implementation decisions.',
    stack: 'System design · Product flows · Delivery',
  },
  {
    title: 'Interface Architecture',
    body: 'Typed React interfaces with accessible states, clear ownership and maintainable motion boundaries.',
    stack: 'TypeScript · React · Next.js · Design systems',
  },
  {
    title: '3D & Motion',
    body: 'Real-time visual systems used when they clarify the experience — with a measured performance budget.',
    stack: 'Three.js · R3F · GSAP · GLSL',
  },
] as const;

export function HomePage() {
  return (
    <>
      <S.Hero id="top" aria-labelledby="hero-title">
        <S.HeroGrid>
          <div>
            <S.Kicker>Backend Developer · Product Engineer</S.Kicker>
            <S.HeroTitle id="hero-title" data-route-heading tabIndex={-1}>
              <span>Reliable</span>
              <span>systems.</span>
              <span>Expressive</span>
              <span>products.</span>
            </S.HeroTitle>
          </div>
          <S.HeroAside>
            <S.HeroCopy>
              I build digital products from backend architecture to the interface people
              actually use.
            </S.HeroCopy>
            <S.Actions>
              <S.Action $primary href="#work">
                View selected work
              </S.Action>
              <S.Action href="mailto:eovitu7@gmail.com">Start a conversation</S.Action>
            </S.Actions>
          </S.HeroAside>
        </S.HeroGrid>
      </S.Hero>

      <S.Section id="work" aria-labelledby="work-title">
        <S.SectionInner>
          <S.SectionHead>
            <div>
              <S.Kicker>Selected work</S.Kicker>
              <h2 id="work-title">Products with a system behind them.</h2>
            </div>
            <p>
              Three projects across platform architecture, local commerce and connected
              care. Each case shows the decisions behind the surface.
            </p>
          </S.SectionHead>
          <S.ProjectList>
            {projects.map((project) => (
              <S.Project key={project.slug} data-project={project.slug}>
                <S.MediaFrame data-project-media>
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
                </S.MediaFrame>
                <S.ProjectCopy>
                  <S.Kicker>{project.eyebrow}</S.Kicker>
                  <h3>{project.name}</h3>
                  <p>{project.summary}</p>
                  <S.Ownership>
                    {project.ownership.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </S.Ownership>
                  <S.Meta>
                    <div>
                      <dt>Role</dt>
                      <dd>{project.role}</dd>
                    </div>
                    <div>
                      <dt>Stack</dt>
                      <dd>{project.tech}</dd>
                    </div>
                  </S.Meta>
                  <S.Actions>
                    <S.Action
                      $primary
                      href={hrefForCase(project.slug)}
                      data-project-link
                      data-transition-project={project.slug}
                    >
                      View case study
                    </S.Action>
                    {project.actions.map((action) => (
                      <S.Action
                        key={action.href}
                        href={action.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {action.label}
                      </S.Action>
                    ))}
                  </S.Actions>
                </S.ProjectCopy>
              </S.Project>
            ))}
          </S.ProjectList>
        </S.SectionInner>
      </S.Section>

      <S.Profile id="profile" aria-labelledby="profile-title">
        <S.SectionInner>
          <S.SectionHead>
            <div>
              <S.Kicker>Engineering profile</S.Kicker>
              <h2 id="profile-title">Depth where the product needs it.</h2>
            </div>
            <p>
              Backend is the center of gravity. Product thinking, interface architecture and
              real-time visuals extend the same engineering discipline.
            </p>
          </S.SectionHead>
          <S.CapabilityGrid>
            {capabilities.map((item) => (
              <S.Capability key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <small>{item.stack}</small>
              </S.Capability>
            ))}
          </S.CapabilityGrid>
        </S.SectionInner>
      </S.Profile>

      <S.Section id="about" aria-labelledby="about-title">
        <S.SectionInner>
          <S.AboutGrid>
            <img
              src="/victor-2010.jpg"
              width="720"
              height="900"
              alt="Victor Hugo as a child at a playground"
            />
            <div>
              <S.Kicker>About</S.Kicker>
              <h2 id="about-title">Curiosity became a way of building.</h2>
              <p>
                I am Victor Hugo, a backend developer in São Paulo working across system
                architecture, product decisions and expressive interfaces. I care about the
                invisible structure that keeps a product reliable — and the visible details
                that make it understandable.
              </p>
              <p>
                I work remotely and welcome conversations with teams and clients worldwide.
              </p>
            </div>
          </S.AboutGrid>
        </S.SectionInner>
      </S.Section>

      <S.Contact id="contact" aria-labelledby="contact-title">
        <S.SectionInner>
          <S.Kicker>Available worldwide</S.Kicker>
          <S.ContactTitle id="contact-title">
            Build something people can trust.
          </S.ContactTitle>
          <S.ContactGrid>
            <p>
              Open to backend, product engineering and creative development opportunities.
              <br />
              <a href="mailto:eovitu7@gmail.com">eovitu7@gmail.com</a>
            </p>
            <nav aria-label="Contact links">
              <a href="mailto:eovitu7@gmail.com">Email ↗</a>
              <a href="https://github.com/eovitu" target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            </nav>
          </S.ContactGrid>
        </S.SectionInner>
      </S.Contact>
    </>
  );
}
