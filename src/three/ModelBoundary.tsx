import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  /** Names the guarded layer in the console warning. Defaults to the model. */
  label?: string;
}

/**
 * If the singularity fails to build, the throw must not take the page down
 * with it — the page simply renders without the 3D layer.
 *
 * The object is generated in code now rather than loaded from a GLB, so the
 * failure modes have changed (a shader that will not compile, a WebGL context
 * that will not allocate) but the guarantee has not: degrade to "no 3D", never
 * to a blank page.
 *
 * It guards two levels, because the failures arrive at two levels. Inside the
 * canvas it catches a scene that will not build. Around the canvas it catches
 * the two failures no in-scene boundary can see: `new THREE.WebGLRenderer()`
 * throwing "Error creating WebGL context." from the layout effect that
 * configures the R3F root, and the lazy 3D chunk failing to load at all.
 */
export class ModelBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn(`[singularity] ${this.props.label ?? 'model'} could not be loaded`, error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
