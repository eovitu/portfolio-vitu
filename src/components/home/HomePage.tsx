import { useRef } from 'react';
import {
  ArrowBendDownRight,
  ArrowDownRight,
  ArrowUpRight,
  Code,
  Command,
  FlowArrow,
  Sparkle,
} from '@phosphor-icons/react';
import { useHomeMotion } from '../../hooks/useHomeMotion';
import { useReloadColorReveal } from '../../hooks/useReloadColorReveal';
import { useAnimationFrame } from '../providers/SmoothScrollProvider';
import { stage } from '../../lib/stagePresence';
import { coreOrigin } from '../../lib/warpTargets';
import { SelectedWorkTheater } from './SelectedWorkTheater';
import { Footer } from '../layout/Footer';
import { useEditorialMotion } from '../../hooks/useEditorialMotion';
import * as S from './HomePage.styles';
import { useLanguage } from '../providers/LanguageProvider';

/**
 * The heading, twice.
 *
 * `HERO_TITLE_TEXT` is what a screen reader announces: one intact string, in a
 * visually hidden span. The split below it is decoration and is `aria-hidden`,
 * because a heading spelled out one glyph per element is announced one glyph at
 * a time. The two must stay in sync, they are the same sentence.
 */
const capabilities = [
  {
    icon: Code,
    stack: 'Java · Spring Boot · PostgreSQL · REST',
  },
  {
    icon: FlowArrow,
    stack: 'System design · Product flows · Delivery',
  },
  {
    icon: Command,
    stack: 'TypeScript · React · Next.js · Design systems',
  },
  {
    icon: Sparkle,
    stack: 'Three.js · R3F · GSAP · GLSL',
  },
] as const;

export function HomePage() {
  const { content } = useLanguage();
  const { home } = content.ui;
  const heroRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);
  const profileRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  useEditorialMotion(profileRef, aboutRef);
  useHomeMotion(heroRef);
  useReloadColorReveal(profileRef, '#243cce');
  useReloadColorReveal(aboutRef, '#f2b7a3');
  useAnimationFrame(() => {
    const el = contactRef.current;
    if (!el) return;
    const presence = stage().presence;
    const collapse = Math.max(0, Math.min(1, (presence - 0.82) / 0.63));
    el.style.setProperty('--contact-collapse', collapse.toFixed(3));
    if (presence < 0.75) return;
    const origin = coreOrigin();
    const words = el.querySelectorAll<HTMLElement>('[data-contact-word]');
    const vectors = Array.from(words, (word) => {
      const previousX = Number(word.dataset.consumeX ?? 0);
      const previousY = Number(word.dataset.consumeY ?? 0);
      const rect = word.getBoundingClientRect();
      const naturalCenterX = rect.left + rect.width / 2 - previousX * collapse;
      const naturalCenterY = rect.top + rect.height / 2 - previousY * collapse;
      return {
        word,
        consumeX: origin.x - naturalCenterX,
        consumeY: origin.y - naturalCenterY,
      };
    });

    // Keep layout reads and style writes in separate phases. Interleaving them
    // forces synchronous reflow for every word during the collapse.
    vectors.forEach(({ word, consumeX, consumeY }) => {
      word.dataset.consumeX = consumeX.toFixed(2);
      word.dataset.consumeY = consumeY.toFixed(2);
      word.style.setProperty('--consume-x', `${consumeX.toFixed(2)}px`);
      word.style.setProperty('--consume-y', `${consumeY.toFixed(2)}px`);
    });
  });

  return (
    <>
      <S.Hero id="top" ref={heroRef} aria-labelledby="hero-title" data-gravity-section>
        <S.HeroNote href="#about">
          Victor Hugo
          <span>
            {home.hero.note} <ArrowDownRight aria-hidden="true" weight="regular" />
          </span>
        </S.HeroNote>
        <S.HeroGrid>
          {/*
            `data-warp` sits on the title wrapper only, not on the whole
            grid. It used to sit on `S.HeroGrid`, which also wraps
            `S.HeroAside` below, the copy and the "View selected work" /
            "Start a conversation" CTAs. The first-visit entry sequence
            collapses every `[data-warp]` element to `scale: 0` and holds it
            there through the gather phase before releasing it, roughly 1 to
            1.5 seconds. With the CTAs inside that same node, their hit area
            was genuinely zero for that whole window even though they read
            as fully opaque, `opacity` is an element's own CSS property and
            does not reflect an ancestor's transform, so a first-time reader
            clicking the moment the button looked ready would just miss it.
            Scoping the attribute to the title keeps its gather-and-release
            entrance and frees the CTAs to be clickable from first paint.
          */}
          <div data-warp>
            <S.Kicker>{home.hero.kicker}</S.Kicker>
            {/* `id`, `data-route-heading` and `tabIndex` are the route
                transition director's focus target. They stay. */}
            <S.HeroTitle id="hero-title" data-route-heading tabIndex={-1}>
              <span className="visually-hidden">{home.hero.title}</span>
              <S.HeroLines aria-hidden="true">
                {home.hero.lines.map((word) => (
                  <S.HeroWord key={word} data-hero-word>
                    {Array.from(word).map((glyph, index) => (
                      <S.HeroGlyph
                        key={`${word}-${index}`}
                        data-hero-glyph
                        data-space={glyph === ' ' || undefined}
                      >
                        {glyph}
                      </S.HeroGlyph>
                    ))}
                  </S.HeroWord>
                ))}
              </S.HeroLines>
            </S.HeroTitle>
          </div>
          <S.HeroAside data-hero-fade>
            <ArrowBendDownRight aria-hidden="true" size={60} weight="regular" />
            <S.HeroCopy>
              {home.hero.copy}
            </S.HeroCopy>
            <S.Actions>
              <S.Action $primary href="#work">
                {home.hero.workCta} <ArrowUpRight aria-hidden="true" />
              </S.Action>
              <S.Action href="mailto:eovitu7@gmail.com">
                {home.hero.contactCta} <ArrowUpRight aria-hidden="true" />
              </S.Action>
            </S.Actions>
          </S.HeroAside>
        </S.HeroGrid>
      </S.Hero>

      <SelectedWorkTheater />

      <S.Profile
        ref={profileRef}
        id="profile"
        aria-labelledby="profile-title"
        data-gravity-section
      >
        <S.SectionInner>
          <S.SectionHead>
            <div>
              <S.Kicker>{home.profile.kicker}</S.Kicker>
              <h2 id="profile-title" data-skew>
                {home.profile.title[0]}
                <br />
                {home.profile.title[1]}
              </h2>
            </div>
            <p>
              {home.profile.intro}
            </p>
          </S.SectionHead>
          <S.CapabilityGrid>
            {capabilities.map((item, index) => (
              <S.Capability key={item.stack}>
                <item.icon aria-hidden="true" weight="regular" />
                <h3>{home.profile.capabilities[index][0]}</h3>
                <p>{home.profile.capabilities[index][1]}</p>
                <small>{home.profile.capabilities[index][2]}</small>
              </S.Capability>
            ))}
          </S.CapabilityGrid>
        </S.SectionInner>
      </S.Profile>

      <S.About ref={aboutRef} id="about" aria-labelledby="about-title" data-gravity-section>
        <S.SectionInner>
          <S.AboutGrid>
            <figure>
              <img
                src="/victor-2010.jpg"
                width="720"
                height="900"
                alt={home.about.imageAlt}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{home.about.caption}</figcaption>
            </figure>
            <div>
              <S.Kicker>{home.about.kicker}</S.Kicker>
              <h2 id="about-title" data-skew>
                {home.about.title[0]}
                <br />
                {home.about.title[1]}
              </h2>
              <p>{home.about.body[0]}</p>
              <p>{home.about.body[1]}</p>
            </div>
          </S.AboutGrid>
        </S.SectionInner>
      </S.About>

      <S.Contact
        id="contact"
        ref={contactRef}
        aria-labelledby="contact-title"
        data-gravity-section
      >
        <S.SectionInner>
          <S.Kicker>{home.contact.kicker}</S.Kicker>
          <S.ContactTitle id="contact-title" data-skew data-warp>
            {home.contact.words.map((word) => (
              <S.ContactWord key={word} data-contact-word>
                {word}
              </S.ContactWord>
            ))}
          </S.ContactTitle>
          <S.ContactEmail href="mailto:eovitu7@gmail.com" data-contact-survivor>
            eovitu7@gmail.com <ArrowUpRight aria-hidden="true" weight="regular" />
          </S.ContactEmail>
        </S.SectionInner>
      </S.Contact>
      <Footer />
    </>
  );
}
