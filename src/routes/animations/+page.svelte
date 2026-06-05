<script lang="ts">
  import { onMount } from 'svelte';

  type Manifest = {
    fps: number;
    frames: number;
    variants: { name: string; w: number; h: number; file: string }[];
  };
  type VariantData = { w: number; h: number; frames: string[][] };

  let manifest = $state<Manifest | null>(null);
  let animations = $state<(VariantData & { name: string })[]>([]);
  let currentFrame = $state(0);
  let fontSize = $state(10);
  let reduceMotion = false;

  onMount(() => {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer: ReturnType<typeof setInterval> | undefined;

    (async () => {
      const res = await fetch(`/animation/manifest.json`);
      manifest = await res.json();

      if (manifest) {
        const loaded = await Promise.all(
            manifest.variants.map(async (v) => {
              const r = await fetch(`/animation/${ v.file }`);
              const data = await r.json();
              return { ...data, name: v.name };
            }),
        );
        animations = loaded;

        if (!reduceMotion) {
          timer = setInterval(() => {
            currentFrame = (currentFrame + 1);
          }, 1000 / (manifest.fps || 5));
        }
      }
    })();

    return () => {
      if (timer) clearInterval(timer);
    };
  });
</script>

<svelte:head>
    <title>Animations</title>
</svelte:head>

<div class="explorer">
    <div class="toolbar">
        <h2 class="toolbar-title">Animation Explorer</h2>
        <div class="toolbar-control">
            <label for="font-size" class="toolbar-label">Font Size: {fontSize}px</label>
            <input id="font-size" type="range" min="2" max="32" bind:value={fontSize} class="font-slider" />
        </div>
    </div>

    {#if animations.length === 0}
        <div class="loading">Loading animations...</div>
    {:else}
        <div class="anim-list">
            {#each animations as anim}
                <div class="anim-card">
                    <div class="anim-meta">
                        <h3 class="anim-name">{anim.name}</h3>
                        <div class="anim-stats">
                            <span>Grid: {anim.w}x{anim.h}</span>
                            <span>Frames: {anim.frames.length}</span>
                        </div>
                    </div>

                    <div class="anim-stage">
                        <div class="anim-frame">
                            <pre class="ascii"
                                 style="font-size: {fontSize}px;">{anim.frames[currentFrame % anim.frames.length].join('\n')}</pre>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
  .explorer {
    @apply flex flex-col gap-12 max-w-full;
  }

  .toolbar {
    @apply sticky top-0 z-40 bg-base-dark/90 backdrop-blur-md p-6 rounded-2xl border border-base-cream/10 flex flex-col gap-4;
  }

  .toolbar-title {
    @apply text-3xl font-bold font-serif italic text-accent-gold;
  }

  .toolbar-control {
    @apply flex items-center gap-4;
  }

  .toolbar-label {
    @apply text-sm font-semibold uppercase tracking-widest text-base-cream/60;
  }

  .font-slider {
    @apply flex-1 accent-accent-gold;
  }

  .loading {
    @apply text-base-cream/40 animate-pulse font-mono;
  }

  .anim-list {
    @apply flex flex-col gap-24;
  }

  .anim-card {
    @apply flex flex-col gap-4;
  }

  .anim-meta {
    @apply flex flex-col gap-1 border-b border-base-cream/10 pb-2;
  }

  .anim-name {
    @apply text-xl font-bold tracking-widest text-base-cream uppercase;
  }

  .anim-stats {
    @apply flex gap-4 text-xs font-mono text-base-cream/50;
  }

  .anim-stage {
    @apply flex justify-center w-full;
  }

  .anim-frame {
    @apply rounded-xl border border-base-cream/10 inline-flex items-center justify-center overflow-hidden shadow-2xl;
    background: #121e21;
  }

  .ascii {
    margin: 0;
    font-family: 'Courier New', Courier, monospace;
    line-height: 1;
    white-space: pre;
    user-select: none;
    color: theme('colors.accent-gold');
    text-shadow: 0 0 8px rgba(209, 172, 0, 0.45);
  }
</style>
