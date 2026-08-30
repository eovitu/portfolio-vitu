import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene } from './Scene';
import { useAnimationFrame } from '../hooks/useSmoothScroll';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CAMERA, QUALITY, RENDERER, detectTier } from './renderQuality';
import { installRenderProbe } from '../lib/introAudit';
import { stage, updateStage } from '../lib/stagePresence';

/**
 * How present the object has to be before it earns a full-rate render.
 *
 * Below this the veil is at its cap and the object itself contributes nothing
 * to the composite — but the starfield still does. `lib/stagePresence` is
 * explicit that the field is the site's constant and survives every section,
 * so this is a *cadence* reduction and never a stop: the stars keep drifting,
 * they just do it at half rate where nothing else is on screen.
 */
const ABSENT = 0.02;
/**
 * Ceiling on the cadence while the object is absent, in ms (~30fps).
 *
 * A time interval alone would be the wrong rule: it only ever skips a frame on
 * a machine already running faster than 30fps, which is not the machine with
 * the problem. So the skip is also expressed in frames — at most one skipped
 * in a row — and the two together mean a fast machine settles at 30fps while a
 * struggling one gets half the canvas work in the sections where the object
 * contributes nothing. Never two frames in a row, so the starfield's drift
 * stays continuous rather than stepping.
 */
const ABSENT_INTERVAL = 33;

/**
 * Drives R3F from the application's single frame loop instead of letting the
 * renderer start its own requestAnimationFrame.
 *
 * The gate used to be an IntersectionObserver on the wrapper — which is
 * `position: fixed; inset: 0`, so it intersects the viewport permanently and
 * the render never actually stopped anywhere. Measured, the scene issued its
 * full 37 draw calls per frame in every section, including ABOUT and SKILLS
 * where the veil sits at 0.97 and the object is invisible.
 *
 * The honest gate is the object's own presence, which `lib/stagePresence`
 * already computes from scroll. `updateStage` is pure arithmetic over cached
 * bounds and is idempotent, so calling it here to decide costs nothing and
 * leaves `Scene` as the single authority on where the object actually is.
 */
function FrameDriver({ active, reduced }: { active: boolean; reduced: boolean }) {
  const advance = useThree((s) => s.advance);
  const last = useRef(0);
  const skipped = useRef(false);

  useAnimationFrame((time) => {
    // Under reduced motion the scene is static: a few frames a second is
    // enough to cover resizes, and costs almost nothing.
    if (reduced && time - last.current < 250) return;
    if (!reduced) {
      updateStage(window.scrollY);
      if (
        stage().presence < ABSENT &&
        (!skipped.current || time - last.current < ABSENT_INTERVAL)
      ) {
        skipped.current = true;
        return;
      }
    }
    skipped.current = false;
    last.current = time;
    advance(time / 1000);
  }, active);

  return null;
}

export default function SingularityCanvas({
  className,
  onReady,
}: {
  className?: string;
  onReady?: () => void;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion();
  const tier = useMemo(detectTier, []);
  const settings = QUALITY[tier];

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className={className} aria-hidden="true">
      <Canvas
        frameloop="never"
        dpr={settings.dpr}
        gl={{
          antialias: settings.antialias,
          alpha: true,
          powerPreference: 'high-performance',
          // The hero composites over a near-black page; a non-premultiplied
          // buffer keeps the disc's soft edges from fringing against it.
          premultipliedAlpha: true,
        }}
        camera={{
          fov: CAMERA.fov,
          near: CAMERA.near,
          far: CAMERA.far,
          position: [0, 0, CAMERA.distance],
        }}
        onCreated={({ gl, scene, camera }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = RENDERER.exposure;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          installRenderProbe({ gl, scene, camera });
          onReady?.();
        }}
      >
        <FrameDriver active={visible} reduced={reduced} />
        <Scene reduced={reduced} tier={tier} />
      </Canvas>
    </div>
  );
}
