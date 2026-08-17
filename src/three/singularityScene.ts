/**
 * The singularity, built in code.
 *
 * WHY THIS IS NOT A GLB ANY MORE
 * The object was never a sculpted mesh — it is generated, and the generator is
 * what carries the look. glTF cannot represent the three things that make it
 * work, so the exported asset was a flattened corpse of this file:
 *
 *  1. `AdditiveBlending`. glTF has OPAQUE / MASK / BLEND and nothing else, so
 *     every additive surface came back as normal alpha blending. Additive
 *     stacks *light*; normal blending stacks *paint* — that single substitution
 *     is what made the object read as a flat grey decal.
 *  2. HDR vertex colours. The photon ring reaches luminance ~2.7 and the lensed
 *     ribbons ~3.1; glTF clamps COLOR_0 to 1.0. Everything that was supposed to
 *     blow out to white was truncated to plain white.
 *  3. The billboarded lens group. Each frame the lensing rig is re-aimed at the
 *     camera, which is what wraps the halo around the silhouette. A bake
 *     freezes it at the exporter's angle, so the halo stopped closing over the
 *     pole — that was never a depth-sort problem.
 *
 * There is also an `onBeforeCompile` core mask that glTF has no concept of.
 * Re-exporting could not have fixed any of this; the generator had to come
 * across. Nothing here is re-tuned — constants are transcribed from the
 * approved prototype, including the `1337` seed, so the object is identical
 * and deterministic.
 *
 * The one thing NOT carried over is the prototype's `model.position` offset:
 * the site frames the object with its own long lens (see `renderQuality`), and
 * placement is owned there.
 */

import * as THREE from 'three';

/**
 * Range of motion — the one part of this file the direction reopened.
 *
 * The prototype's rotation values were authored against a camera the mouse
 * could orbit; the orbit supplied the sense of life. The hero's camera is
 * fixed, so all that survived was a subtle spin that reads as stationary under
 * static observation. These two numbers scale amplitude only.
 *
 * What they deliberately do NOT touch: colour, material, blending, tone
 * mapping, geometry, or the structure of the movement. No axis is added, and
 * the differential gradient is preserved by construction — `matter` is a
 * single multiplier over per-shell spins that already descend outward
 * (0.085 inner > 0.05 mid > 0.028 outer), so the interior stays faster than
 * the exterior at every intensity.
 *
 * The `lens` group (photon ring and the `lensed_*` ribbons) is absent here on
 * purpose. It is billboarded, never spun: it is the geometry of bent light,
 * not orbiting matter, and rotating it would be physically wrong.
 */
export const MOTION = {
  /** Multiplier over every matter spin: shells, core, strands, accents. */
  matter: 2.9,
  /** Whole-model yaw period in ms. Lower is faster. Prototype was 46000. */
  yawPeriodMs: 18000,
};

/**
 * Published for the verification harness so intensity variants can be captured
 * without three rebuilds. Read every frame, so a write takes effect live.
 * Gated on the same opt-in flag as the renderer probe — absent in a normal
 * session, and never read by application code.
 */
try {
  if (typeof window !== 'undefined' && sessionStorage.getItem('singularity:record')) {
    (window as unknown as { __MOTION?: typeof MOTION }).__MOTION = MOTION;
  }
} catch {
  // Storage disabled — the hook is a verification affordance, nothing more.
}

export interface SingularityScene {
  /** The model root. Caller owns placement, scale and framing. */
  group: THREE.Group;
  /** Advance one frame. `now` is milliseconds, `dt` seconds. */
  update: (
    dt: number,
    now: number,
    camera: THREE.Camera,
    pointer: { x: number; y: number },
    signal: { energy: number; swell: number; flare: number },
  ) => void;
  dispose: () => void;
  stats: { vertices: number; triangles: number; meshes: number; buildMs: number };
}

/** Reused every frame: the prototype allocated a Quaternion per tick. */
const scratchQuat = new THREE.Quaternion();

/**
 * The prototype's viewing elevation, reproduced as a model tilt.
 *
 * In the prototype the disc reads as an open ellipse with visible filaments —
 * but not because the model is tilted. It is because the stage's auto-framed
 * camera sits on `(1, 0.20, 1.25).normalize()`, i.e. 7.12° above the disc
 * plane. The site's camera is deliberately dead-on at `(0, 0, 6)`, and porting
 * the tick verbatim under that camera put the disc exactly edge-on: a razor
 * line with none of the turbulence visible.
 *
 * Rather than move the site's camera (the long lens and its framing are a
 * settled decision), the same relative geometry is restored by tilting the
 * model by that exact angle. Nothing about the object is re-tuned — this is
 * the prototype's own viewing angle, expressed on the other side of the
 * relationship.
 */
const VIEW_ELEVATION = Math.asin(0.2 / Math.hypot(1, 0.2, 1.25));

export function buildSingularity(): SingularityScene {
  const t0 = performance.now();

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const model = new THREE.Group();
  model.name = 'BlackHole';

  /* ---------- materials (5 named) ---------- */
  const mVoid = new THREE.MeshBasicMaterial({ name: 'event_horizon', color: 0x000000 });
  const mMatter = new THREE.MeshBasicMaterial({
    name: 'accreting_matter',
    color: 0xffffff,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mStrand = new THREE.MeshBasicMaterial({
    name: 'energy_strand',
    color: 0xb2b7c2,
    vertexColors: true,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const mViolet = new THREE.MeshBasicMaterial({
    name: 'accent_violet',
    color: 0x8a72e0,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  materials.push(mVoid, mMatter, mStrand, mViolet);

  /* nothing may add light inside the horizon's screen-space disc — mask these
     materials against the core in view space so no fragment lands on the void */
  const coreMaskU = {
    uCoreView: { value: new THREE.Vector3() },
    uCoreR: { value: 0.88 },
  };
  function maskCore(mat: THREE.Material) {
    mat.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, coreMaskU);
      s.vertexShader =
        'varying vec3 vViewP;\n' +
        s.vertexShader.replace(
          '#include <fog_vertex>',
          '#include <fog_vertex>\n vViewP = mvPosition.xyz;',
        );
      s.fragmentShader =
        'uniform vec3 uCoreView;\nuniform float uCoreR;\nvarying vec3 vViewP;\n' +
        s.fragmentShader.replace(
          '#include <dithering_fragment>',
          ' float d = length(cross(uCoreView, normalize(vViewP)));\n' +
            ' gl_FragColor.a *= smoothstep(uCoreR, uCoreR * 1.28, d);\n' +
            ' if (gl_FragColor.a <= 0.001) discard;\n#include <dithering_fragment>',
        );
    };
    mat.needsUpdate = true;
    return mat;
  }
  maskCore(mStrand);
  maskCore(mViolet);

  let seed = 1337;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const noise = (a: number, r: number, k: number) =>
    0.55 * Math.sin(a * 3.13 + r * k) +
    0.28 * Math.sin(a * 7.71 - r * k * 1.7 + 1.3) +
    0.17 * Math.sin(a * 13.37 + r * k * 2.6 + 2.1);

  /* fractal turbulence — filaments and density cells, no straight bands */
  function fbm(a: number, r: number, k: number) {
    let v = 0;
    let amp = 0.5;
    let fa = 1;
    for (let o = 0; o < 5; o++) {
      v +=
        amp *
        Math.sin(a * 5.3 * fa + r * k * 1.9 * fa + o * 2.17) *
        Math.cos(r * k * 2.7 * fa - a * 2.1 * fa + o * 1.31);
      amp *= 0.52;
      fa *= 2.03;
    }
    return v; // ~[-1,1]
  }
  function turb(a: number, r: number, k: number) {
    const f = fbm(a, r, k);
    const filament = Math.pow(
      Math.abs(Math.sin(a * 17 + 6.5 * fbm(a * 0.4, r, k * 0.7) + r * 3.1)),
      0.55,
    );
    return Math.max(0, Math.min(1, 0.3 + 0.55 * (0.5 + 0.5 * f) + 0.45 * filament - 0.3));
  }

  /* ---------- event horizon: an absorbing void, no texture ---------- */
  const coreGeo = new THREE.SphereGeometry(0.88, 256, 160);
  coreGeo.computeVertexNormals();
  geometries.push(coreGeo);
  const core = new THREE.Mesh(coreGeo, mVoid);
  core.name = 'core_event_horizon';
  core.castShadow = false;
  core.receiveShadow = false;
  model.add(core);

  /* ---------- accreting matter: three continuous sheets, not rings ----------
     one welded annulus per shell so the disc reads as matter; the shells exist
     only so the interior can orbit faster than the exterior.               */
  interface SheetOpts {
    k: number;
    phase: number;
    lift: number;
    gain: number;
  }
  function sheet(r0: number, r1: number, rings: number, segs: number, opts: SheetOpts) {
    const g = new THREE.BufferGeometry();
    const pos: number[] = [];
    const col: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= rings; i++) {
      const t = i / rings;
      const r = r0 + (r1 - r0) * Math.pow(t, 1.35);
      const gt = (r - 1.02) / 2.4; // global falloff coordinate
      for (let j = 0; j <= segs; j++) {
        const a = (j / segs) * Math.PI * 2;
        const n = noise(a, r, opts.k);
        // gravitational warp — the plane is bent, never flat, never tilted much
        const y =
          (0.055 * Math.sin(2 * a + opts.phase) + 0.02 * n) * Math.pow(gt + 0.1, 1.6) +
          opts.lift;
        const squeeze = 1 + 0.03 * Math.sin(2 * a + opts.phase * 0.6);
        pos.push(Math.cos(a) * r * squeeze, y, Math.sin(a) * r * squeeze);

        // luminance: hot near the horizon, dissolving outward, streaked, asymmetric
        const fall = Math.pow(1 - Math.min(gt, 1), 1.35);
        const ss = (e0: number, e1: number, x: number) => {
          const u = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
          return u * u * (3 - 2 * u);
        };
        const edge = ss(0, 0.05, t) * (1 - ss(0.55, 1, t));
        const asym = 0.86 + 0.18 * Math.cos(a - 0.7); // one flank slightly denser
        const cell = turb(a, r, opts.k * 2.2);
        const streak = 0.14 + 1.15 * Math.pow(cell, 1.5);
        const gap = Math.max(0, 0.1 + 0.9 * (0.5 + 0.5 * fbm(a * 1.6, r, opts.k * 3.1)));
        let L = fall * asym * streak * (0.2 + 0.8 * Math.pow(gap, 1.6)) * edge * opts.gain;
        L = Math.max(0, Math.min(1, L));
        // temperature: yellow-white plasma at the horizon, blue-white as it cools
        const hot = Math.pow(1 - Math.min(gt, 1), 1.9);
        const cold = Math.pow(Math.min(gt, 1), 1.1);
        const violet = Math.max(0, gt - 0.34) * 1.5 * (0.35 + 0.65 * gap);
        const rC = 1 + 0.42 * hot - 0.12 * cold - 0.3 * violet;
        const gC = 1 + 0.14 * hot - 0.02 * cold - 0.55 * violet;
        const bC = 1 - 0.52 * hot + 0.22 * cold + 0.5 * violet;
        col.push(L * rC, L * gC, L * bC, Math.min(1, L * 1.5));
      }
    }
    for (let i = 0; i < rings; i++)
      for (let j = 0; j < segs; j++) {
        const a0 = i * (segs + 1) + j;
        const b0 = a0 + segs + 1;
        idx.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1);
      }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
    g.setIndex(idx);
    g.computeVertexNormals();
    geometries.push(g);
    return new THREE.Mesh(g, mMatter);
  }

  const shells: THREE.Mesh[] = [];
  const shellSpec: [string, number, number, number, number, SheetOpts, number][] = [
    [
      'disc_inner_matter',
      1.02,
      1.85,
      26,
      220,
      { k: 2.4, phase: 0.0, lift: 0.0, gain: 4.2 },
      0.085,
    ],
    [
      'disc_mid_matter',
      1.55,
      2.6,
      26,
      200,
      { k: 1.7, phase: 1.4, lift: 0.01, gain: 2.9 },
      0.05,
    ],
    [
      'disc_outer_matter',
      2.2,
      3.05,
      22,
      180,
      { k: 1.1, phase: 2.9, lift: -0.014, gain: 1.9 },
      0.028,
    ],
  ];
  for (const [name, r0, r1, ri, se, o, spin] of shellSpec) {
    const m = sheet(r0, r1, ri, se, o);
    m.name = name;
    m.userData.spin = spin; // differential rotation
    shells.push(m);
    model.add(m);
  }

  /* ---------- lensing, billboarded to the viewer ----------
     The photon ring and the lensed far side always frame the silhouette from the
     observer's side, the way bent light actually behaves — this is what keeps the
     object reading as a black hole and not a sphere with rings.               */
  const lens = new THREE.Group();
  lens.name = 'gravitational_lensing';

  function ribbon(
    R: number,
    thick: number,
    a0: number,
    a1: number,
    gainEnds: number,
    name: string,
    mat?: THREE.Material,
  ) {
    const g = new THREE.BufferGeometry();
    const N = 140;
    const rows = [-1, -0.32, 0.32, 1];
    const rowL = [0, 1, 1, 0];
    const pos: number[] = [];
    const col: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const ang = a0 + (a1 - a0) * u;
      const fade = Math.pow(Math.sin(Math.PI * u), 1.35);
      const w = thick * (0.4 + 0.6 * fade);
      const cx = Math.cos(ang);
      const cy = Math.sin(ang);
      for (let k = 0; k < rows.length; k++) {
        const rr = R + rows[k] * w;
        pos.push(cx * rr, cy * rr, 0);
        const L = gainEnds * (0.06 + 0.94 * fade) * rowL[k];
        col.push(L, L, L * 1.03, Math.pow(fade, 1.5) * (0.05 + 0.95 * rowL[k]));
      }
      if (i < N)
        for (let k = 0; k < rows.length - 1; k++) {
          const o = i * rows.length + k;
          const p = o + rows.length;
          idx.push(o, p, o + 1, o + 1, p, p + 1);
        }
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
    g.setIndex(idx);
    geometries.push(g);
    const m = new THREE.Mesh(g, mat || mMatter);
    m.name = name;
    return m;
  }

  /* photon ring — a hairline of light, unevenly bright, fading under the void */
  const photon = (() => {
    const g = new THREE.BufferGeometry();
    const N = 320;
    const r0 = 0.8815;
    const r1 = 0.8925;
    const pos: number[] = [];
    const col: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const ang = (i / N) * Math.PI * 2;
      for (const r of [r0, r1]) pos.push(Math.cos(ang) * r, Math.sin(ang) * r, 0);
      const up = 0.5 + 0.5 * Math.sin(ang + 0.35); // brightest above, dying below
      const L = 0.22 + 2.5 * Math.pow(up, 1.9);
      const A = 0.1 + 0.9 * Math.pow(up, 1.5);
      for (let k = 0; k < 2; k++) col.push(L * 1.02, L * 0.97, L * 0.9, A);
      if (i < N) {
        const o = i * 2;
        idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
      }
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
    g.setIndex(idx);
    geometries.push(g);
    const m = new THREE.Mesh(g, mMatter);
    m.name = 'photon_ring';
    return m;
  })();
  lens.add(photon);

  /* the far side of the disc, bent OVER the pole, and its counterpart bent UNDER:
     together they close the halo around the silhouette */
  lens.add(ribbon(1.015, 0.052, 0.16, Math.PI - 0.16, 3.1, 'lensed_far_side_over'));
  lens.add(
    ribbon(1.01, 0.042, Math.PI + 0.16, Math.PI * 2 - 0.16, 2.1, 'lensed_far_side_under'),
  );
  lens.add(ribbon(1.075, 0.045, 0.55, Math.PI - 0.55, 1.6, 'lensed_secondary_over'));
  lens.add(
    ribbon(1.068, 0.038, Math.PI + 0.6, Math.PI * 2 - 0.6, 1.1, 'lensed_secondary_under'),
  );

  /* soft bloom — additive gradient sprites, no hard outline */
  function glowTex(stops: [number, string][]) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d')!;
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    for (const [p, col] of stops) g.addColorStop(p, col);
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    textures.push(t);
    return t;
  }
  const mBloom = new THREE.MeshBasicMaterial({
    name: 'bloom_halo',
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    map: glowTex([
      [0, 'rgba(255,246,228,0.00)'],
      [0.34, 'rgba(255,240,214,0.00)'],
      [0.44, 'rgba(255,238,206,0.55)'],
      [0.52, 'rgba(226,232,255,0.22)'],
      [0.72, 'rgba(180,168,235,0.06)'],
      [1, 'rgba(0,0,0,0)'],
    ]),
  });
  materials.push(mBloom);
  const bloomGeo = new THREE.PlaneGeometry(4.6, 4.6);
  geometries.push(bloomGeo);
  const ringBloom = new THREE.Mesh(bloomGeo, mBloom);
  ringBloom.name = 'photon_ring_bloom';
  lens.add(ringBloom);
  model.add(lens);

  /* Doppler beaming — fixed in space, not carried around by the orbit: the flank
     turning toward the camera blows out warm-white, the receding flank stays dim */
  const doppler = new THREE.Group();
  doppler.name = 'doppler_beaming';
  const mBeam = new THREE.MeshBasicMaterial({
    name: 'doppler_beam',
    color: 0xffcf92,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  materials.push(mBeam);
  (
    [
      [1.16, 0.15, 1.35],
      [1.52, 0.19, 1.0],
      [1.98, 0.21, 0.62],
      [2.46, 0.19, 0.32],
    ] as [number, number, number][]
  ).forEach(([R, w, g], i) =>
    doppler.add(ribbon(R, w, -1.15, 1.15, g, 'beam_' + i, mBeam)),
  );
  doppler.rotation.x = -Math.PI / 2;
  model.add(doppler);

  /* ---------- three strands of matter spiralling inward, tapered to nothing ---------- */
  const strands = new THREE.Group();
  strands.name = 'energy_strands';
  for (let i = 0; i < 3; i++) {
    const a0 = rnd() * Math.PI * 2;
    const rA = 2.45 + rnd() * 0.5;
    const rB = 1.22 + rnd() * 0.22; // strong radial travel
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= 16; s++) {
      const u = s / 16;
      const r = rA + (rB - rA) * Math.pow(u, 0.85);
      const ang = a0 + u * 2.4;
      pts.push(new THREE.Vector3(Math.cos(ang) * r, (0.5 - u) * 0.1, Math.sin(ang) * r));
    }
    const geo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(pts),
      80,
      0.007,
      6,
      false,
    );
    const p = geo.attributes.position;
    const n = 80 + 1;
    const ring = 7;
    const cols: number[] = [];
    for (let s = 0; s < n; s++) {
      const taper = Math.pow(Math.sin(Math.PI * (s / (n - 1))), 1.4);
      for (let k = 0; k < ring; k++) {
        const id = s * ring + k;
        const x = p.getX(id);
        const y = p.getY(id);
        const z = p.getZ(id);
        const r = Math.hypot(x, z);
        const f = r ? (r - (1 - taper) * 0.0) / r : 1;
        p.setXYZ(id, x * f, y, z * f);
        cols.push(1, 1, 1.04, taper); // dissolve to nothing at both tips
      }
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 4));
    geometries.push(geo);
    const t = new THREE.Mesh(geo, mStrand);
    t.name = 'strand_' + i;
    strands.add(t);
  }
  model.add(strands);

  const accents = new THREE.Group();
  accents.name = 'violet_accents';
  for (let i = 0; i < 3; i++)
    accents.add(
      ribbon(
        2.34 + i * 0.36,
        0.034,
        0.5 + i * 2.1,
        0.5 + i * 2.1 + 2.35,
        1.0,
        'violet_accent_' + i,
        mViolet,
      ),
    );
  accents.rotation.x = -Math.PI / 2;
  model.add(accents);

  model.rotation.z = THREE.MathUtils.degToRad(3.5);

  /**
   * The disc is emissive geometry seen from every angle — per-object culling
   * makes bands pop in and out at the edges of the frame.
   */
  model.traverse((o) => {
    o.frustumCulled = false;
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    }
  });

  /* ---------- motion: differential orbit, breathing, damped pointer ---------- */
  const cur = { x: 0, y: 0 };

  const update: SingularityScene['update'] = (dt, now, camera, pointer, signal) => {
    // Differential rotation, plus whatever angular energy the intro injects.
    const boost = 1 + signal.energy * 2.4;
    for (const s of shells)
      s.rotation.y += s.userData.spin * dt * 6 * MOTION.matter * boost;
    core.rotation.y += 0.06 * dt * MOTION.matter;

    cur.x += (pointer.x - cur.x) * 0.035;
    cur.y += (pointer.y - cur.y) * 0.035;

    /**
     * Absolute position, not an increment — and the one channel the pointer
     * also writes. Speeding it up therefore means shortening the period, which
     * leaves the damped pointer term untouched; multiplying the whole
     * expression would have scaled the pointer response with it.
     */
    model.rotation.y = cur.x + now / MOTION.yawPeriodMs;
    model.rotation.x = VIEW_ELEVATION + cur.y * 0.6 + Math.sin(now / 5200) * 0.012;
    strands.rotation.y += 0.04 * dt * 6 * MOTION.matter * boost;
    accents.rotation.y += 0.028 * dt * 6 * MOTION.matter * boost;

    // The core's screen-space disc, in view space, so nothing lights the void.
    coreMaskU.uCoreView.value
      .setFromMatrixPosition(core.matrixWorld)
      .applyMatrix4(camera.matrixWorldInverse);

    // Billboard: the lensing rig always faces the observer. This is what makes
    // the halo close over the silhouette instead of sitting beside it.
    lens.quaternion.copy(camera.quaternion);
    lens.quaternion.premultiply(model.getWorldQuaternion(scratchQuat).invert());

    /**
     * Breathing is the resting state; `heroSignal.flare` is the transient laid
     * on top of it — the two compose, neither replaces the other.
     */
    const flare = signal.flare;
    mBloom.opacity = 0.62 + 0.16 * Math.sin(now / 2700) + flare * 0.55;
    mBeam.opacity = 0.8 + 0.12 * Math.sin(now / 1900) + flare * 0.4;
    mMatter.opacity = 0.9 + 0.1 * Math.sin(now / 3100) + flare * 0.35;
  };

  let vertices = 0;
  let triangles = 0;
  let meshes = 0;
  model.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshes += 1;
    vertices += mesh.geometry.attributes.position.count;
    const index = mesh.geometry.index;
    triangles += index ? index.count / 3 : mesh.geometry.attributes.position.count / 3;
  });

  return {
    group: model,
    update,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
    stats: {
      vertices,
      triangles,
      meshes,
      buildMs: Math.round((performance.now() - t0) * 10) / 10,
    },
  };
}
