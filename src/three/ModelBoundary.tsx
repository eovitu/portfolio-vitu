import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

/**
 * If the singularity fails to build, the throw must not take the page down
 * with it — the hero simply renders without the 3D layer.
 *
 * The object is generated in code now rather than loaded from a GLB, so the
 * failure modes have changed (a shader that will not compile, a WebGL context
 * that will not allocate) but the guarantee has not: degrade to "no 3D", never
 * to a blank page.
 */
export class ModelBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[singularity] model could not be loaded', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
