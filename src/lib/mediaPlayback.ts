interface PlaybackMedia {
  readonly paused: boolean;
  play(): Promise<void>;
  pause(): void;
}
interface PlaybackContext {
  visible: boolean;
  active: boolean;
  documentVisible: boolean;
  reducedMotion: boolean;
}

/** Attach only when eligible; cancel late play promises when eligibility changes. */
export function createMediaPlayback(media: PlaybackMedia, attach: () => void) {
  let attached = false;
  let generation = 0;
  let pending = false;
  let manualPause = false;
  let blocked = false;
  let context: PlaybackContext = {
    visible: false,
    active: true,
    documentVisible: true,
    reducedMotion: false,
  };
  const eligible = () => context.visible && context.active && context.documentVisible;
  const suspend = () => {
    generation++;
    pending = false;
    media.pause();
  };
  const play = async () => {
    if (!attached) {
      attach();
      attached = true;
    }
    const request = ++generation;
    pending = true;
    try {
      await media.play();
      if (request !== generation && (!eligible() || manualPause || blocked)) media.pause();
    } catch (error) {
      if (request === generation) {
        blocked = true;
        throw error;
      }
    } finally {
      if (request === generation) pending = false;
    }
  };
  return {
    async update(next: PlaybackContext) {
      context = next;
      if (!context.visible || !context.active) manualPause = false;
      if (!eligible()) {
        suspend();
        return;
      }
      if (!context.reducedMotion && !manualPause && !blocked && media.paused && !pending)
        await play();
    },
    async toggle() {
      if (!eligible()) return;
      if (!media.paused || pending) {
        manualPause = true;
        suspend();
        return;
      }
      manualPause = false;
      blocked = false;
      await play();
    },
    suspend,
    failed() {
      blocked = true;
      attached = false;
      suspend();
    },
  };
}
