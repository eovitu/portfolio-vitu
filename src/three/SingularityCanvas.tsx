import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene } from './Scene';
import { useAnimationFrame } from '../components/providers/SmoothScrollProvider';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CAMERA, QUALITY, RENDERER, detectTier } from './renderQuality';
import { installRenderProbe } from '../lib/introAudit';

/**
 * Drives R3F from the application's single frame loop instead of letting the
 * renderer start its own requestAnimationFrame. Rendering stops entirely when
 * the hero is off screen.
 */
function FrameDriver({ active, reduced }: { active: boolean; reduced: boolean }) {
  const advance = useThree((s) => s.advance);
  const last = useRef(0);

  useAnimationFrame((time) => {
    // Under reduced motion the scene is static: a few frames a second is
    // enough to cover resizes, and costs almost nothing.
    if (reduced && time - last.current < 250) return;
    last.current = time;
    advance(time / 1000);
  }, active);

  return null;
}

export default function SingularityCanvas({ className }: { className?: string }) {
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
        }}
      >
        <FrameDriver active={visible} reduced={reduced} />
        <Scene reduced={reduced} tier={tier} />
      </Canvas>
    </div>
  );
}
