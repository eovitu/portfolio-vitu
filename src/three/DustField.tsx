import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { colors } from '../styles/theme';
import { getCoreWorld } from '../lib/gravityField';
import { heroSignal } from './heroSignal';

import { stage, stageVeil } from '../lib/stagePresence';

/** Reused every frame — the dust runs inside the render loop. */
const coreView = new THREE.Vector3();

/** Composited brightness the field aims to hold in every section. */
const FIELD_VISIBLE = 0.3;

interface Props {
  pointerRef: MutableRefObject<{ x: number; y: number }>;
  idle: boolean;
}

/**
 * The ambient dust halo around the singularity — a single Points draw call.
 * Density, radius range, flattening, colour and size are taken from the
 * design source; the field fades in over the first seconds and fades out as
 * the hero scrolls away.
 */
export function DustField({ pointerRef, idle }: Props) {
  const points = useRef<THREE.Points>(null);

  const count = useMemo(
    () => (typeof window !== 'undefined' && window.innerWidth < 800 ? 350 : 1300),
    [],
  );

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 3 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.32;
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  /**
   * Gravitational lensing of the background field — third consumer of
   * `lib/gravityField`.
   *
   * Light passing near a black hole is bent around it, so a starfield behind
   * one does not render straight. The bend happens in the vertex shader via
   * `onBeforeCompile`: no full-screen pass, nothing added to the scene, and no
   * per-frame CPU work over the point cloud. `singularityScene` is untouched —
   * this is the dust, a separate object.
   *
   * It is a screen-plane approximation, deliberately: points are rotated
   * around the core in view space with a falloff of 1/(1+kr²), and pulled
   * slightly inward as they go. Real lensing is a light-path integral, but at
   * this scale the visible signature is exactly this — the field appears to
   * swirl and crowd near the silhouette.
   *
   * Known limitation, not worked around: point sprites cannot be elongated
   * individually. The field bends, but each star stays round. Tangential
   * streaking would require replacing the Points with camera-facing quads.
   */
  const uniforms = useMemo(
    () => ({ uCoreView: { value: new THREE.Vector3() }, uLens: { value: 0 } }),
    [],
  );

  const material = useMemo(() => {
    const m = new THREE.PointsMaterial({
      // `colors.dust`, not `colors.accent`: the dust is scene particulate and
      // stays near-achromatic. Inheriting the accent would tint the field.
      color: new THREE.Color(colors.dust),
      size: 0.017,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uCoreView = uniforms.uCoreView;
      shader.uniforms.uLens = uniforms.uLens;
      shader.vertexShader =
        'uniform vec3 uCoreView;\nuniform float uLens;\n' +
        shader.vertexShader.replace(
          '#include <project_vertex>',
          `
          vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
          vec2 d = mvPosition.xy - uCoreView.xy;
          float r = length( d );
          float infl = uLens / ( 1.0 + r * r * 5.5 );
          float a = infl * 1.8;
          float cs = cos( a );
          float sn = sin( a );
          vec2 bent = vec2( d.x * cs - d.y * sn, d.x * sn + d.y * cs );
          bent *= 1.0 - infl * 0.5;
          mvPosition.xy = uCoreView.xy + bent;
          gl_Position = projectionMatrix * mvPosition;
          `,
        );
    };
    return m;
  }, [uniforms]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state) => {
    const node = points.current;
    if (!node) return;
    const t = state.clock.getElapsedTime();
    if (idle) node.rotation.y = t * 0.011;
    node.rotation.x = pointerRef.current.y * 0.09;
    /**
     * The starfield is the site's constant — it is what holds the page
     * together as one place while the object itself enters and leaves.
     *
     * That means it has to survive the veil, and the veil is a black DOM layer
     * painted over this canvas: at the 0.97 the veil reaches through SKILLS,
     * a naively-faded field would be gone. So the opacity is pre-divided by
     * what the veil is about to take away, holding the *composited* result
     * roughly constant instead of the source value.
     */
    const v = Math.min(0.97, stageVeil());
    const target = FIELD_VISIBLE / Math.max(0.06, 1 - v);
    material.opacity = Math.min(1, target) * Math.min(1, t / 2.6);

    // Core into view space for the lens. Reuses a module-scope vector; the
    // camera's inverse world matrix is already up to date this frame.
    const cw = getCoreWorld();
    coreView.set(cw.x, cw.y, cw.z).applyMatrix4(state.camera.matrixWorldInverse);
    uniforms.uCoreView.value.copy(coreView);
    // The bend rides the same pulse the rest of the field does, and fades out
    // with the dust as the hero leaves — no lensing over the WORK copy.
    // Lensing tracks how present the object actually is: no bend where there
    // is nothing to bend around.
    uniforms.uLens.value = (0.5 + heroSignal.energy * 0.9) * Math.min(1, stage().presence);
  });

  return <points ref={points} geometry={geometry} material={material} />;
}
