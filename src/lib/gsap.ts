import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Single registration point. Importing gsap from anywhere else in the app is
 * fine, but plugins are registered here once so no module has to guess.
 */
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
