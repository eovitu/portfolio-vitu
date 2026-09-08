type SceneMode = 'poster' | 'economy' | 'full';

interface ScenePolicyInput {
  webgl: boolean;
  coarse: boolean;
  width: number;
  saveData: boolean;
}

export function sceneMode(input: ScenePolicyInput): SceneMode {
  if (!input.webgl) return 'poster';
  return input.coarse || input.width < 860 || input.saveData ? 'economy' : 'full';
}

export function shouldRenderScene(input: {
  visible: boolean;
  documentVisible: boolean;
  reducedMotion: boolean;
}): boolean {
  return input.visible && input.documentVisible && !input.reducedMotion;
}
