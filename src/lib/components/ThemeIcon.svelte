<script lang="ts">
  interface Props {
    className?: string;
  }

  let { className = "" }: Props = $props();

  // A single SVG can't tween between two mask images, so the sun and moon are
  // one shape that morphs: the disc stays, a shadow circle slides across to
  // carve the crescent, and the rays retract. Each instance needs its own
  // mask id so multiple toggles never collide.
  const maskId = `theme-icon-cutout-${ (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) }`;
</script>

<svg class="theme-icon {className}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <!-- The shadow that bites the crescent. Larger than the disc so the inner
             edge is a graceful flat arc, not a deep notch. Parked up-right for the
             sun (no overlap → full disc); slid over the disc for the moon. -->
        <circle class="cutout" cx="16" cy="9" r="6" fill="black" />
    </mask>

    <!-- Sun rays: retract and spin away as the moon takes over. -->
    <g class="rays" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="12" y1="0.8" x2="12" y2="3.2" />
        <line x1="12" y1="20.8" x2="12" y2="23.2" />
        <line x1="0.8" y1="12" x2="3.2" y2="12" />
        <line x1="20.8" y1="12" x2="23.2" y2="12" />
        <line x1="3.9" y1="3.9" x2="5.6" y2="5.6" />
        <line x1="18.4" y1="18.4" x2="20.1" y2="20.1" />
        <line x1="3.9" y1="20.1" x2="5.6" y2="18.4" />
        <line x1="18.4" y1="5.6" x2="20.1" y2="3.9" />
    </g>

    <!-- The disc: same size as sun and moon; the shadow carves the crescent. -->
    <circle class="disc" cx="12" cy="12" r="6" fill="currentColor" mask="url(#{maskId})" />
</svg>

<style lang="scss">
  .theme-icon {
    /* Inherits the button's color (cream at rest, gold on hover/focus). */
    color: currentColor;
    overflow: visible;
  }

  .cutout,
  .rays,
  .disc {
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    transform-box: fill-box;
    transform-origin: center;
  }

  /* The icon's state is driven entirely by the `.light` class on <html>, which
     app.html's inline script sets *before first paint*. That makes the symbol
     correct on the very first frame with no JS, so there's no hydration swap
     (the old reactive `isLight` prop only resolved after hydration, which is
     what caused the moon→sun flicker on a light-mode load).

     Default (dark page) = moon: the shadow sits over the disc carving the
     crescent, the disc is full size, and the rays are retracted. */
  .disc {
    transform: scale(1);
    transition: transform 0.55s var(--ease-out-expo);
  }

  .cutout {
    transform: translate(0, 0);
    transition: transform 0.55s var(--ease-out-expo);
  }

  .rays {
    opacity: 0;
    transform: rotate(-45deg) scale(0.4);
    transition: transform 0.45s var(--ease-out-expo),
    opacity 0.35s var(--ease-out-expo);
  }

  /* Light page = sun: park the shadow off the disc (full disc shows), bloom the
     rays, and shrink the disc a touch so the sun's footprint matches the moon's
     (the full circle reads a little large without the crescent's bite). */
  :global(html.light) {
    .disc {
      transform: scale(0.66);
    }

    .cutout {
      transform: translate(8px, -8px);
    }

    .rays {
      opacity: 1;
      transform: scale(0.7);
    }
  }

  /* State stays correct without the tween: instant swap, no animation. */
  @media (prefers-reduced-motion: reduce) {
    .cutout,
    .rays,
    .disc {
      transition: none;
    }
  }
</style>
