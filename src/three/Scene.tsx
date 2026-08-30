import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DustField } from './DustField';
import { ModelBoundary } from './ModelBoundary';
import { SingularityModel } from './SingularityModel';
import { CAMERA, QUALITY, type QualityTier } from './renderQuality';
import { setCoreScreen, setCoreWorld, setEnergy } from '../lib/gravityField';
import { measureStage, stage, updateStage } from '../lib/stagePresence';
import { heroSignal } from './heroSignal';

/**
 * Reused every frame — the rig is the field's producer and runs inside the
 * render loop, so it must not allocate.
 */
const projected = new THREE.Vector3();

interface Props {
  reduced: boolean;
  tier: QualityTier;
}

/**
 * World units the object travels vertically across the *entire* page — the
 * only movement the composition allows. Roughly a sixth of the visible frustum
 * height: enough to feel like the camera is easing around it, far too little
 * to read as the object wandering.
 */
const SCROLL_DRIFT = 0.34;

/**
 * Scene rig: framing, scroll response, and the single pointer listener.
 *
 * There are no lights and no environment map here, and that is not an
 * omission. Every material in the object is a `MeshBasicMaterial` with
 * additive blending — it emits, it is not lit. The previous rig's studio
 * lighting and PMREM environment existed to shade a PBR bake that no longer
 * exists; they would now cost frames and change nothing on screen.
 *
 * Rotation belongs to the object itself (`singularityScene`), so this rig
 * touches position only — the two never write the same property.
 */
export function Scene({ reduced, tier }: Props) {
  const root = useRef<THREE.Group>(null);
  /** Damped inside the object; this is only the raw target. */
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  const { camera } = useThree();
  const settings = QUALITY[tier];

  useEffect(() => {
    camera.position.set(0, 0, CAMERA.distance);
  }, [camera]);

  useEffect(() => {
    if (reduced) return;
    // Scaled exactly as in the approved prototype, so the damping in
    // `singularityScene` produces the same feel.
    const onPointerMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 0.5;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 0.28;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [reduced]);

  useEffect(() => {
    // Progress through the *whole document*, 0 → 1. Using viewport-heights
    // instead would make the drift depend on how tall the page happens to be.
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };
    const remeasure = () => {
      // Section boundaries, measured once per layout change — never per frame.
      measureStage();
      onScroll();
    };
    remeasure();
    // The pin spacer only exists after ScrollTrigger has built it, and it is
    // what gives WORK its true scrolled length.
    const settle = window.setTimeout(remeasure, 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', remeasure);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', remeasure);
    };
  }, []);

  const frame = settings.frame;

  useFrame(() => {
    const node = root.current;
    if (!node) return;
    /**
     * The object holds its place. Scale and horizontal position are constant:
     * the scroll-driven scale-down and sideways travel are what used to make it
     * read as drifting around the page.
     */
    /**
     * Presence drives placement now, not just the veil.
     *
     * The object leaves the frame for WORK, SKILLS and ABOUT and returns for
     * the collapse — as a move, never as a `display: none`. Scale and offset
     * come from `lib/stagePresence`; the rig only applies them, so there is
     * still exactly one authority on where the object is.
     */
    updateStage(window.scrollY);
    const st = stage();
    node.position.x = frame.x + st.offsetX;
    node.position.y = frame.y - scroll.current * SCROLL_DRIFT + st.offsetY;
    node.scale.setScalar(st.scale);

    /**
     * Publish the core's screen position for `lib/gravityField`.
     *
     * This rig is the only place that holds both the object's world transform
     * and the camera, so it is the only honest source. Projecting here once a
     * frame means the letters, the cursor and the starfield all read the same
     * number instead of each re-deriving it and drifting apart.
     */
    setCoreWorld(node.position.x, node.position.y, node.position.z);
    projected.copy(node.position).project(camera);
    const w = window.innerWidth;
    const h = window.innerHeight;
    setCoreScreen(
      (projected.x * 0.5 + 0.5) * w,
      (-projected.y * 0.5 + 0.5) * h,
      projected.z < 1,
    );
    setEnergy(heroSignal.energy);
  });

  const dust = useMemo(() => !reduced, [reduced]);

  return (
    <>
      <group ref={root}>
        {/* A build failure degrades to "no 3D", never to a blank page. */}
        <ModelBoundary fallback={null}>
          <SingularityModel
            idle={!reduced}
            targetSize={settings.targetSize}
            pointerRef={pointer}
            detail={settings.detail}
          />
        </ModelBoundary>
      </group>

      <DustField pointerRef={pointer} idle={dust} />
    </>
  );
}
