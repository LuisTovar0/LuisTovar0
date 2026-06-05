<script module lang="ts">
  type Manifest = {
    fps: number;
    frames: number;
    variants: { name: string; w: number; h: number; file: string }[];
  };
  type VariantData = { w: number; h: number; frames: string[][] };

  // Module-scoped so they survive component remounts (e.g. navigating to/from the
  // /animations route, where this background layer isn't rendered). Keeping the
  // manifest and parsed variant data here means we never re-fetch them.
  let manifest: Manifest | null = null;
  const cache = new Map<string, VariantData>();
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  // Roughly the character size we want on screen; variants are chosen so the
  // fill font lands near this, keeping characters about this size everywhere.
  const TARGET_PX = 13;

  let frames = $state<string[][]>([]);
  let currentFrame = $state(0);
  let fontPx = $state(TARGET_PX);

  let probe = $state<HTMLPreElement>();

  let cwRatio = 0.6; // char width / font-size
  let lhRatio = 1.0; // line height / font-size
  let loadedFile = '';
  let reduceMotion = false;

  function measureChar() {
    if (!probe) return;
    cwRatio = probe.offsetWidth / 10 / 100;
    lhRatio = probe.offsetHeight / 2 / 100;
  }

  // All variants are square. The square is sized to the shorter side of the
  // viewport (so it sits flush against the right edge in landscape or the bottom
  // edge in portrait, see CSS), and we pick the tier whose fitting font is
  // nearest TARGET_PX so characters stay about the same size everywhere.
  function choose() {
    if (!manifest) return null;
    const side = Math.min(window.innerWidth, window.innerHeight);

    let best = null as null | { v: Manifest['variants'][number]; font: number };
    for (const v of manifest.variants) {
      // Font size that fits this square grid inside a side x side box.
      const font = Math.min(side / (v.w * cwRatio), side / (v.h * lhRatio));
      if (!best || Math.abs(font - TARGET_PX) < Math.abs(best.font - TARGET_PX)) {
        best = { v, font };
      }
    }
    return best;
  }

  async function apply() {
    const pick = choose();
    if (!pick) return;
    fontPx = pick.font;
    if (pick.v.file === loadedFile) return;
    loadedFile = pick.v.file;
    console.log('[StlAnimation] Switched variant to:', pick.v.file, 'font size:', fontPx.toFixed(2));

    let data = cache.get(pick.v.file);
    if (!data) {
      try {
        const res = await fetch(`/animation/${ pick.v.file }`);
        if (!res.ok) {
          loadedFile = '';
          return;
        }
        data = (await res.json()) as VariantData;
        cache.set(pick.v.file, data);
      } catch {
        loadedFile = '';
        return;
      }
    }
    if (data && loadedFile === pick.v.file) {
      frames = data.frames;
      currentFrame = currentFrame % frames.length;
    }
  }

  onMount(() => {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer: ReturnType<typeof setInterval> | undefined;

    (async () => {
      try {
        if (!manifest) {
          const res = await fetch(`/animation/manifest.json`);
          if (!res.ok) return;
          manifest = (await res.json()) as Manifest;
        }
        measureChar();
        await apply();
        if (!reduceMotion) {
          timer = setInterval(() => {
            if (frames.length) currentFrame = (currentFrame + 1) % frames.length;
          }, 1000 / (manifest.fps || 5));
        }
      } catch {
        // animation is decorative; swallow fetch errors silently
      }
    })();

    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        measureChar();
        apply();
      });
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (timer) clearInterval(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  });
</script>

<div class="anim-wrap">
    <pre bind:this={probe} class="ascii probe" aria-hidden="true">0000000000{'\n'}0000000000</pre>
    {#if frames.length}
        <pre class="ascii" style="font-size: {fontPx}px;">{frames[currentFrame % frames.length].join('\n')}</pre>
    {/if}
</div>

<style>
    .anim-wrap {
        position: absolute;
        inset: 0;
        display: flex;
        overflow: hidden;
    }

    /* Horizontal viewport: square sits flush against the right, vertically centered. */
    @media (orientation: landscape) {
        .anim-wrap {
            align-items: center;
            justify-content: flex-end;
        }
    }

    /* Vertical viewport: square sits flush against the bottom, horizontally centered. */
    @media (orientation: portrait) {
        .anim-wrap {
            align-items: flex-end;
            justify-content: center;
        }
    }

    .ascii {
        margin: 0;
        font-family: 'Courier New', Courier, monospace;
        line-height: 1;
        white-space: pre;
        user-select: none;
        color: var(--color-accent, #d1ac00);
        text-shadow: 0 0 8px var(--glow-secondary, rgba(209, 172, 0, 0.45));
        transition: color 0.5s cubic-bezier(0.16, 1, 0.3, 1), text-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .probe {
        position: absolute;
        visibility: hidden;
        pointer-events: none;
        top: 0;
        left: 0;
        font-size: 100px;
    }
</style>
