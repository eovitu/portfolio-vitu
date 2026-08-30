# Fluid Visual Overhaul — Design Specification

## Outcome

The portfolio should feel like a premium experimental product: visually
distinctive, restrained, fast and continuous. The procedural singularity
remains the signature. Every other effect must either strengthen hierarchy,
explain gravity or improve orientation; otherwise it is simplified or removed.

Success is perceptual as well as technical:

- leaving project 03 and returning to the singularity does not stutter;
- the custom cursor never jumps while interacting with Skills;
- the transition from “FROM HERE ON” to “LET'S BUILD SOMETHING” feels continuous;
- mobile and touch layouts contain only relevant, usable controls;
- the visual system feels calmer, more deliberate and more expensive;
- no duplicate RAF, WebGL context, persistent listener or orphaned animation exists.

## Evidence from the Current Architecture

### Confirmed

- There is one persistent R3F Canvas with `frameloop="never"`; the scene is not
  intentionally remounted between sections.
- `updateStage(window.scrollY)` currently runs in both `FrameDriver` and
  `Scene.useFrame`, duplicating stage work and splitting ownership.
- The Canvas keeps rendering the star field at roughly 12 FPS while the object
  is absent.
- Lenis deliberately increases duration and reduces wheel/touch multipliers as
  CONTACT approaches. This creates input latency in the exact transition the
  user reports as lag.
- The gravity field considers the projected core active even when stage
  presence is effectively zero. Cursor behavior can therefore be influenced by
  an object that is visually absent.
- Cursor trail nodes begin at `-9999, -9999`; they are not seeded at the first
  real pointer position.
- Skills runs persistent CSS emission animations on every spectral line after
  entering the viewport.
- CONTACT combines reveal animations, parallax, the collapse timeline, stage
  return, redshift, HUD updates and altered Lenis behavior in the same span.

### To Measure Before Changing

- Long tasks and frame time at the final WORK pin release.
- ScrollTrigger count and refresh activity across WORK, Skills and CONTACT.
- R3F draw calls and frame cadence while present, absent and returning.
- Layout reads and React commits during CONTACT entry.
- Pointer, projected core and cursor transform values while hovering Skills.

## Direction

### Visual language

Use large editorial type, black space, thin structural rules and a single warm
accent. Reduce the number of simultaneous visual signals. Section identity
comes from composition, register and pacing rather than new effects.

- Preserve the singularity, project case-study surfaces and light ABOUT register.
- Remove continuous flicker/breathing that does not convey state.
- Reduce global scroll skew and avoid deforming body copy.
- Keep entrances short, directional and interruptible.
- Prefer one strong movement at a transition over several competing movements.
- Maintain absolute black around the singularity.

### Motion hierarchy

1. Navigation and direct manipulation respond immediately.
2. Section transitions guide attention with one dominant movement.
3. Ambient motion is subtle, low-frequency and paused when not visible.
4. Reduced-motion and touch receive complete compositions without hover dependencies.

## Architecture

### Single stage authority

`stagePresence.ts` remains the source of truth, but exactly one frame callback
updates it. R3F consumers only read the published state. Presence gains an
explicit activity classification so render cadence, gravity and visual opacity
cannot disagree.

The Canvas remains mounted to avoid WebGL context reconstruction. The heavy
bundle is preloaded after critical content readiness, not at the transition
where it becomes visible. Geometry and materials continue to be built once and
disposed once.

### Render scheduling

- Full cadence only while the object or an interactive 3D response is visible.
- A low-cost static star field replaces unnecessary full scene updates in
  absent sections when measurements justify it.
- Hidden documents stop rendering completely.
- No independent RAF is introduced.
- Renderer, scene and listener teardown remain explicit and testable.

### Cursor and gravity

Gravity activation is derived from effective stage presence, not only camera
projection. The cursor and trail are seeded from the first valid pointer event.
When the stage becomes inactive, attraction, stretch and trail alpha converge
to identity without retaining stale coordinates.

Skills uses pointer/focus state only for its own active line. Touch uses tap and
focus behavior; no hover-only state is required to understand the section.

### CONTACT transition

Uniform Lenis response replaces simulated time dilation. The HUD may continue
to communicate distance, but it cannot alter input latency.

CONTACT receives one coordinated timeline. Reveal and collapse phases do not
compete over the same transform. Layout measurements occur on refresh or entry,
not continuously. The singularity return begins early enough to be visually
ready before the closing statement, with no asset creation at the boundary.

## Responsive Behavior Matrix

### Desktop with fine pointer

- Custom cursor enabled and stable.
- Horizontal WORK chapter enabled on sufficient width and height.
- Full HUD retained when it does not overlap content.
- Subtle hover states permitted.

### Tablet and touch laptop

- No custom cursor or hover-only affordances.
- WORK uses the vertical flow when horizontal space or viewport height is inadequate.
- HUD is reduced to the numeric distance or removed when it overlaps actions.

### Mobile portrait

- Vertical project flow, no pinning.
- Compact header and no redundant fixed controls.
- Sound control hidden unless sound has been explicitly activated.
- Skills uses readable grouped content with optional tap selection.
- 3D uses the low tier and never blocks primary content.

### Mobile landscape and short viewports

- Height-sensitive breakpoints override desktop-like widths.
- Hero and fixed chrome shrink or reposition to preserve content and touch targets.
- No element relies on `100vh` without accounting for dynamic viewport height.

## Future Project Video

The project media surface accepts an optional video source with poster, muted
autoplay, loop and `playsInline`. The existing procedural surface remains the
fallback. Video loading is deferred until near the relevant project and disabled
under reduced motion or constrained data preferences. No unfinished video is
added in this change.

## Verification

### Automated

- Unit tests for stage activity, quality selection and cursor initialization logic.
- `npm test`
- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

### Browser

- Record frame timing across project 03 → WORK exit → Skills.
- Record frame timing across “FROM HERE ON” → CONTACT.
- Confirm one Canvas, one WebGL context and one shared animation ticker.
- Count ScrollTriggers/listeners before and after navigation cycles.
- Exercise Skills hover repeatedly and inspect cursor transforms.
- Validate 390×844, tablet, desktop, short desktop and mobile landscape.
- Validate touch behavior, keyboard focus, reduced motion and horizontal overflow.
- Inspect console and network errors.

## Delivery

Work continues on `codex/v1-launch` and updates the existing pull request. Each
root-cause fix remains reviewable through Conventional Commits. The branch is
not merged into `main` automatically.
