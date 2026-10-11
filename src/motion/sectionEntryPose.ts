import { fragmentPose } from './sectionChoreography.ts';
import { SECTION_MOTION_STRENGTH } from './tokens.ts';

/** The reload identity, softened for reading and reinforced for an explicit arrival. */
export function sectionEntryPose(
  section: string,
  index: number,
  center: { x: number; y: number },
  viewport: { w: number; h: number },
  arrival = false,
) {
  const pose = fragmentPose(section, index, center, viewport);
  const strength = arrival
    ? SECTION_MOTION_STRENGTH.arrival
    : SECTION_MOTION_STRENGTH.scroll;
  return {
    x: pose.x * strength,
    y: pose.y * strength,
    scale: 1 + (pose.scale - 1) * strength,
    rotation: pose.rotate * strength,
  };
}
