import 'styled-components';
import type { Theme } from './theme';

declare module 'styled-components' {
  // Declaration merging: the interface has to be empty, because its entire job
  // is to widen styled-components' DefaultTheme with our own Theme.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends Theme {}
}
