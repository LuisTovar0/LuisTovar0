import { linear } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

/**
 * Locale-swap transitions. When a piece of text changes language, the old wording
 * softens out and the new wording resolves in — a gentle dissolve in place, no
 * drift, echoing the soft text-shadow glow the type already sits behind.
 *
 * Paired via `{#key text}` (see Swap.svelte): the outgoing and incoming runs are
 * stacked as absolute layers. They MUST share the same `delay` and `duration` and
 * use LINEAR opacity, so `opacity_out + opacity_in === 1` at every frame — a
 * constant-luminance crossfade. Easing the opacity (or desyncing the two) makes
 * the pair dip below full brightness mid-swap, which on the glowing link text
 * reads as a hard flicker. The blur is kept tiny for the same reason.
 *
 * Keying on the resolved text (not the locale) means words that read the same in
 * two languages never animate — only the ones that actually change do.
 */

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Transition = (node: Element, params?: { delay?: number }) => TransitionConfig;

const DURATION = 300;
const BLUR = 4; // px at full out-of-focus; the dissolve's visible "refocus"

/** New wording: sharpens into focus in place. `delay` staggers lists. */
export const swapIn: Transition = (_node, { delay = 0 } = {}) => {
    if (prefersReducedMotion()) {
        return { delay, duration: DURATION, easing: linear, css: (t) => `opacity:${t}` };
    }
    return {
        delay,
        duration: DURATION,
        easing: linear,
        css: (t, u) => `opacity:${t};filter:blur(${u * BLUR}px)`
    };
};

/** Old wording: softens out of focus in place, complementary to the incoming run. */
export const swapOut: Transition = (_node, { delay = 0 } = {}) => {
    if (prefersReducedMotion()) {
        return { delay, duration: DURATION, easing: linear, css: (t) => `opacity:${t}` };
    }
    return {
        delay,
        duration: DURATION,
        easing: linear,
        css: (t, u) => `opacity:${t};filter:blur(${u * BLUR}px)`
    };
};
