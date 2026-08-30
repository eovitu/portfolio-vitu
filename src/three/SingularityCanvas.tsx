import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene } from './Scene';
import { useAnimationFrame } from '../hooks/useSmoothScroll';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CAMERA, QUALITY, RENDERER, detectTier } from './renderQuality';
import { installRenderProbe } from '../lib/introAudit';
import { stage, updateStage } from '../lib/stagePresence';
import { frameInterval, stageMode, type StageMode } from './stagePolicy';

/**
 * Drives R3F from the application's single frame loop instead of letting the
 * renderer start its own requestAnimationFrame.
 *
 * The gate used to be an IntersectionObserver on the wrapper, which is
 * `position: fixed; inset: 0`, so it intersects the viewport permanently and
 * the render never actually stopped anywhere. Measured, the scene issued its
 * full 37 draw calls per frame in every section, including ABOUT and SKILLS
 * where the veil sits at 0.97 and the object is invisible.
 *
 * The honest gates are document visibility and the object's own presence.
 * Ambient states render around 12fps and dormant states around 4fps; a mode
 * transition always renders immediately so the object never wakes one beat late.
 */
function FrameDriver({ active, reduced }: { active: boolean; reduced: boolean }) {
  const advance = useThree((s) => s.advance);
  const last = useRef(0);
  const previousMode = useRef<StageMode | null>(null);

  useAnimationFrame((time) => {
    updateStage(window.scrollY);
    const mode = stageMode(stage().presence);
    const interval = frameInterval(mode, reduced);
    const changed = mode !== previousMode.current;
    if (!changed && interval > 0 && time - last.current < interval) return;
    previousMode.current = mode;
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
  const [documentVisible, setDocumentVisible] = useState(() => !document.hidden);
  const reduced = useReducedMotion();
  const tier = useMemo(detectTier, []);
  const settings = QUALITY[tier];

  useEffect(() => {
    const onVisibilityChange = () => setDocumentVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return (
    <div className={className} aria-hidden="true">
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
        <FrameDriver active={documentVisible} reduced={reduced} />
        <Scene reduced={reduced} tier={tier} />
      </Canvas>
    </div>
  );
}
